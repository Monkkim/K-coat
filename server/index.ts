import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupAuth } from './auth';
import { db, pool } from './db';
import { users } from './schema';
import { sql } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const PORT = isProd ? 5000 : 3001;

app.use(cors({
  origin: isProd ? true : ['http://localhost:5000', 'http://0.0.0.0:5000'],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

async function initDatabase() {
  try {
    console.log('📦 데이터베이스 초기화 시작...');

    // users 테이블 생성
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    console.log('✅ 데이터베이스 초기화 완료');

    // 테이블 확인
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    console.log('📊 현재 테이블:', result.rows.map(r => r.table_name).join(', '));

  } catch (err) {
    console.error('❌ 데이터베이스 초기화 실패:', err);
    throw err; // 에러를 던져서 서버 시작 중단
  }
}

setupAuth(app);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (isProd) {
  const distPath = path.resolve(__dirname, '../dist');
  app.use(express.static(distPath));
  
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      next();
    }
  });
}

initDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (${isProd ? 'production' : 'development'})`);
  });
});
