# Replit 배포 가이드

## 🚀 Replit에서 K-COAT Studio 배포하기

### 1. 환경변수 설정

Replit의 **Secrets** (Tools → Secrets) 탭에서 다음 환경변수를 설정하세요:

#### 필수 환경변수

```bash
# PostgreSQL 데이터베이스 (Replit PostgreSQL 사용)
DATABASE_URL=postgresql://username:password@host:port/database

# 세션 암호화 키 (랜덤 문자열 생성)
SESSION_SECRET=your-secure-random-string-here

# 백엔드 API URL (Replit 앱 URL)
VITE_API_URL=https://your-username-kcoat.replit.app

# Node 환경
NODE_ENV=production
```

#### 선택 환경변수

```bash
# CORS 허용 도메인
ALLOWED_ORIGINS=https://your-frontend-url.replit.app

# n8n 웹훅 URL (AI 생성 기능)
VITE_WEBHOOK_URL=https://your-n8n-webhook-url
```

---

## 📝 상세 설정 방법

### PostgreSQL 데이터베이스 설정

1. Replit에서 **PostgreSQL** 추가:
   - Tools → Database → Enable PostgreSQL
   - 자동으로 `DATABASE_URL`이 생성됩니다

2. 데이터베이스 테이블 자동 생성:
   - 서버가 시작되면 Drizzle ORM이 자동으로 테이블을 생성합니다
   - `users` 테이블과 `session` 테이블이 생성됩니다

### SESSION_SECRET 생성

다음 명령어로 랜덤 문자열을 생성하세요:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

또는 온라인 랜덤 문자열 생성기를 사용하세요.

### VITE_API_URL 설정

Replit 앱의 URL을 확인하고 설정하세요:

```bash
# 형식: https://[your-username]-[project-name].replit.app
VITE_API_URL=https://monkkim-kcoat.replit.app
```

---

## 🔧 문제 해결

### 회원가입/로그인이 안될 때

1. **환경변수 확인**:
   ```bash
   DATABASE_URL # PostgreSQL 연결 문자열
   SESSION_SECRET # 세션 암호화 키
   VITE_API_URL # 백엔드 API URL
   ```

2. **브라우저 콘솔 확인**:
   - F12 → Console 탭에서 에러 확인
   - Network 탭에서 API 요청 상태 확인

3. **CORS 에러 발생시**:
   - `ALLOWED_ORIGINS`에 프론트엔드 URL 추가
   - HTTPS 사용 확인 (Replit은 자동으로 HTTPS 제공)

### 데이터베이스 연결 실패

```bash
# Replit의 PostgreSQL URL 형식 확인
# postgresql://username:password@host:port/database

# Replit Shell에서 확인:
echo $DATABASE_URL
```

### 세션 쿠키가 저장 안될 때

- Replit은 HTTPS를 사용하므로 `secure: true` 설정이 작동합니다
- 브라우저에서 쿠키 설정 확인:
  - F12 → Application → Cookies
  - `sameSite: none`, `secure: true` 확인

---

## 🏗️ 빌드 및 배포

### 자동 배포 (Replit)

`.replit` 파일이 설정되어 있으므로 **Run** 버튼만 누르면 자동으로:

1. 의존성 설치 (`npm install`)
2. 프론트엔드 빌드 (`npm run build`)
3. 서버 시작

### 수동 빌드

```bash
# 1. 의존성 설치
npm install

# 2. 프론트엔드 빌드
npm run build

# 3. 서버 시작
npm run dev
```

---

## 🔐 보안 권장사항

1. **SESSION_SECRET 변경**: 기본값 대신 랜덤 문자열 사용
2. **DATABASE_URL 보호**: Replit Secrets에만 저장, 코드에 포함 금지
3. **HTTPS 사용**: Replit은 자동으로 HTTPS 제공
4. **비밀번호 재설정**: 이메일 발송 기능 구현 권장

---

## 📚 추가 리소스

- [Replit 문서](https://docs.replit.com/)
- [Drizzle ORM 문서](https://orm.drizzle.team/)
- [Express.js 세션 가이드](https://expressjs.com/en/resources/middleware/session.html)

---

## ❓ 자주 묻는 질문

### Q: 로컬에서는 작동하는데 Replit에서 안돼요
A: `VITE_API_URL` 환경변수를 Replit 앱 URL로 설정했는지 확인하세요.

### Q: 회원가입은 되는데 로그인이 안돼요
A: 세션 쿠키 문제일 수 있습니다. `SESSION_SECRET`이 설정되어 있는지 확인하세요.

### Q: "Database connection failed" 에러가 나요
A: `DATABASE_URL`이 올바르게 설정되었는지 확인하고, Replit PostgreSQL이 활성화되어 있는지 확인하세요.

### Q: CORS 에러가 발생해요
A: `ALLOWED_ORIGINS`에 프론트엔드 URL을 추가하거나, 서버 로그에서 실제 origin을 확인하세요.
