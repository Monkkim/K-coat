import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Express } from 'express';
import session from 'express-session';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { db, pool } from './db';
import { users, User } from './schema';
import { eq } from 'drizzle-orm';
import connectPg from 'connect-pg-simple';

declare global {
  namespace Express {
    interface User extends Omit<import('./schema').User, 'password'> {}
  }
}

const scryptAsync = promisify(scrypt);
const PostgresSessionStore = connectPg(session);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionStore = new PostgresSessionStore({ 
    pool, 
    createTableIfMissing: true 
  });

  app.set('trust proxy', 1);
  app.use(session({
    secret: process.env.SESSION_SECRET || 'kcoat-studio-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const [user] = await db.select().from(users).where(eq(users.username, username));
        if (!user) {
          return done(null, false, { message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        }
        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          return done(null, false, { message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        }
        const { password: _, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        done(null, userWithoutPassword);
      } else {
        done(null, null);
      }
    } catch (err) {
      done(err);
    }
  });

  app.post('/api/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;

      console.log('📝 회원가입 요청:', { username, email, passwordLength: password?.length });

      if (!username || !email || !password) {
        console.log('❌ 필드 누락');
        return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
      }

      console.log('🔍 중복 확인 중...');
      const [existingUser] = await db.select().from(users).where(eq(users.username, username));
      if (existingUser) {
        console.log('❌ 중복 아이디:', username);
        return res.status(400).json({ message: '이미 사용 중인 아이디입니다.' });
      }

      const [existingEmail] = await db.select().from(users).where(eq(users.email, email));
      if (existingEmail) {
        console.log('❌ 중복 이메일:', email);
        return res.status(400).json({ message: '이미 등록된 이메일입니다.' });
      }

      console.log('🔐 비밀번호 해싱 중...');
      const hashedPassword = await hashPassword(password);

      console.log('💾 데이터베이스 저장 중...');
      const [newUser] = await db.insert(users).values({
        username,
        email,
        password: hashedPassword,
      }).returning();

      console.log('✅ 회원가입 성공:', { id: newUser.id, username: newUser.username });

      const { password: _, ...userWithoutPassword } = newUser;

      req.login(userWithoutPassword as Express.User, (err) => {
        if (err) {
          console.error('❌ 세션 로그인 실패:', err);
          return res.status(500).json({ message: '로그인 처리 중 오류가 발생했습니다.' });
        }
        console.log('✅ 세션 로그인 완료');
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      console.error('❌ 회원가입 에러 상세:', err);
      console.error('에러 스택:', err instanceof Error ? err.stack : 'Unknown error');
      res.status(500).json({
        message: '회원가입 처리 중 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : String(err)) : undefined
      });
    }
  });

  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: Express.User | false, info: any) => {
      if (err) {
        return res.status(500).json({ message: '로그인 처리 중 오류가 발생했습니다.' });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || '로그인에 실패했습니다.' });
      }
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: '로그인 처리 중 오류가 발생했습니다.' });
        }
        res.json(user);
      });
    })(req, res, next);
  });

  app.post('/api/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: '로그아웃 처리 중 오류가 발생했습니다.' });
      }
      res.json({ message: '로그아웃되었습니다.' });
    });
  });

  app.get('/api/user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }
    res.json(req.user);
  });

  app.post('/api/reset-password-request', async (req, res) => {
    try {
      const { email } = req.body;
      const [user] = await db.select().from(users).where(eq(users.email, email));
      
      res.json({ message: '비밀번호 재설정 안내가 이메일로 전송되었습니다.' });
    } catch (err) {
      res.status(500).json({ message: '처리 중 오류가 발생했습니다.' });
    }
  });
}
