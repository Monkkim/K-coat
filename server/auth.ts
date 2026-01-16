import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import * as storage from "./storage";
import { User } from "../shared/schema";

declare global {
  namespace Express {
    interface User extends Omit<import("../shared/schema").User, "password"> {}
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "kcoat-studio-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "사용자를 찾을 수 없습니다." });
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "비밀번호가 일치하지 않습니다." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        done(null, userWithoutPassword);
      } else {
        done(null, null);
      }
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      const { username, email, password, name } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: "모든 필드를 입력해주세요." });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "이미 사용 중인 아이디입니다." });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "이미 등록된 이메일입니다." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        name: name || username,
      });

      const { password: _, ...userWithoutPassword } = user;

      req.login(userWithoutPassword as any, (err) => {
        if (err) {
          return res.status(500).json({ message: "로그인 처리 중 오류가 발생했습니다." });
        }
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).json({ message: "회원가입 중 오류가 발생했습니다." });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "로그인 중 오류가 발생했습니다." });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "로그인에 실패했습니다." });
      }
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "로그인 처리 중 오류가 발생했습니다." });
        }
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "로그아웃 중 오류가 발생했습니다." });
      }
      res.status(200).json({ message: "로그아웃되었습니다." });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }
    res.json(req.user);
  });

  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(200).json({ message: "비밀번호 재설정 이메일이 전송되었습니다." });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000);

      await storage.updateUserResetToken(email, resetToken, resetTokenExpiry);

      res.status(200).json({ message: "비밀번호 재설정 이메일이 전송되었습니다." });
    } catch (err) {
      console.error("Forgot password error:", err);
      res.status(500).json({ message: "오류가 발생했습니다." });
    }
  });

  app.post("/api/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      const user = await storage.getUserByResetToken(token);
      if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        return res.status(400).json({ message: "유효하지 않거나 만료된 토큰입니다." });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUserPassword(user.id, hashedPassword);

      res.status(200).json({ message: "비밀번호가 변경되었습니다." });
    } catch (err) {
      console.error("Reset password error:", err);
      res.status(500).json({ message: "오류가 발생했습니다." });
    }
  });
}
