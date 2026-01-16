import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// 환경변수 체크
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL 환경변수가 설정되지 않았습니다!');
  console.error('Replit Secrets에서 DATABASE_URL을 설정해주세요.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// 연결 테스트
pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL 연결 성공');
});

export const db = drizzle(pool, { schema });
export { pool };
