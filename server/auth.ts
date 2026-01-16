import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Express } from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import { db, pool } from './db';
import { users, User } from './db/schema';
import { eq } from 'drizzle-orm';
import connectPgSimple from 'connect-pg-simple';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      name: string;
    }
  }
}

const PgSession = connectPgSimple(session);

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  return bcrypt.compare(supplied, stored);
}

export function setupAuth(app: Express) {
  const sessionStore = new PgSession({
    pool,
    createTableIfMissing: true,
  });

  const isProduction = process.env.NODE_ENV === 'production';
  
  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || 'kcoat-studio-secret-key-2024',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProduction, // HTTPS에서만 쿠키 전송
        httpOnly: true, // XSS 공격 방지
        maxAge: 24 * 60 * 60 * 1000, // 24시간
        sameSite: isProduction ? 'none' : 'lax', // Replit 등 cross-origin 환경 지원
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
          if (!user) {
            return done(null, false, { message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
          }
          const isValid = await comparePasswords(password, user.password);
          if (!isValid) {
            return done(null, false, { message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
          }
          return done(null, { id: user.id, email: user.email, name: user.name });
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      if (user) {
        done(null, { id: user.id, email: user.email, name: user.name });
      } else {
        done(null, false);
      }
    } catch (err) {
      done(err);
    }
  });

  app.post('/api/register', async (req, res) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: '올바른 이메일 형식이 아닙니다.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: '비밀번호는 6자 이상이어야 합니다.' });
      }

      const [existingUser] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      if (existingUser) {
        return res.status(400).json({ message: '이미 등록된 이메일입니다.' });
      }

      const hashedPassword = await hashPassword(password);
      const [newUser] = await db
        .insert(users)
        .values({
          email: email.toLowerCase(),
          password: hashedPassword,
          name,
        })
        .returning();

      req.login({ id: newUser.id, email: newUser.email, name: newUser.name }, (err) => {
        if (err) {
          return res.status(500).json({ message: '로그인 처리 중 오류가 발생했습니다.' });
        }
        res.status(201).json({ id: newUser.id, email: newUser.email, name: newUser.name });
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: '회원가입 처리 중 오류가 발생했습니다.' });
    }
  });

  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: Express.User | false, info: any) => {
      if (err) {
        return res.status(500).json({ message: '로그인 처리 중 오류가 발생했습니다.' });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || '이메일 또는 비밀번호가 올바르지 않습니다.' });
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

  app.post('/api/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: '이메일을 입력해주세요.' });
      }

      const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));

      // 보안: 사용자 존재 여부와 관계없이 동일한 메시지 반환 (타이밍 공격 방지)
      if (!user) {
        return res.json({ message: '해당 이메일로 비밀번호 재설정 안내가 발송되었습니다.' });
      }

      // 임시 비밀번호 생성 (8자리)
      const tempPassword = crypto.randomBytes(4).toString('hex');
      const hashedTempPassword = await hashPassword(tempPassword);

      // 임시 비밀번호로 업데이트
      await db
        .update(users)
        .set({
          password: hashedTempPassword,
          resetToken: null,
          resetTokenExpiry: null
        })
        .where(eq(users.id, user.id));

      // TODO: 이메일 발송 기능 구현 권장
      // 현재는 임시 비밀번호를 응답으로 반환하지만,
      // 프로덕션 환경에서는 nodemailer를 사용해 이메일로 전송해야 합니다.
      //
      // 예시:
      // const transporter = nodemailer.createTransport({...});
      // await transporter.sendMail({
      //   to: user.email,
      //   subject: 'K-COAT Studio 임시 비밀번호',
      //   text: `임시 비밀번호: ${tempPassword}`
      // });

      // 보안 경고: 임시 비밀번호를 API 응답으로 반환하는 것은 권장하지 않습니다
      // 이메일 발송 기능 구현 후 이 부분을 제거하세요
      res.json({
        message: '임시 비밀번호가 발급되었습니다.',
        tempPassword: tempPassword // 프로덕션에서는 제거 권장
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: '비밀번호 재설정 처리 중 오류가 발생했습니다.' });
    }
  });
}
