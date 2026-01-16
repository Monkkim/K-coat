import { db } from "./db";
import { users, User, InsertUser } from "../shared/schema";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export const sessionStore = new PostgresSessionStore({
  conObject: {
    connectionString: process.env.DATABASE_URL,
  },
  createTableIfMissing: true,
});

export async function getUser(id: number): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.id, id));
  return result[0];
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.username, username));
  return result[0];
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.email, email));
  return result[0];
}

export async function createUser(data: InsertUser): Promise<User> {
  const result = await db.insert(users).values(data).returning();
  return result[0];
}

export async function updateUserResetToken(
  email: string,
  resetToken: string | null,
  resetTokenExpiry: Date | null
): Promise<User | undefined> {
  const result = await db
    .update(users)
    .set({ resetToken, resetTokenExpiry })
    .where(eq(users.email, email))
    .returning();
  return result[0];
}

export async function getUserByResetToken(token: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.resetToken, token));
  return result[0];
}

export async function updateUserPassword(id: number, password: string): Promise<User | undefined> {
  const result = await db
    .update(users)
    .set({ password, resetToken: null, resetTokenExpiry: null })
    .where(eq(users.id, id))
    .returning();
  return result[0];
}
