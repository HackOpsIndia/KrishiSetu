# KrishiSetu (कृषिसेतु) — Deployment & Environment Guide

**SIH 2026 Problem Statement:** SIH26132  
**Organization:** [HackOpsIndia](https://github.com/HackOpsIndia)  
**Repository:** [HackOpsIndia/KrishiSetu](https://github.com/HackOpsIndia/KrishiSetu)  

---

## 1. System Requirements & Stack Overview

- **Node.js:** v18.x or v20.x LTS
- **Package Manager:** npm v9+
- **Database:** PostgreSQL 14+ (or Supabase / Neon cloud Postgres)
- **Monorepo Engine:** Turborepo
- **Frontend Hosting:** Vercel / Netlify (Next.js 14+ SSR)
- **Backend Hosting:** Railway / Render / AWS ECS / Fly.io (NestJS Docker container)

---

## 2. Environment Variables Configuration

Copy `.env.example` to `.env` in the root and in the respective apps:

```bash
# Root
cp .env.example .env

# Backend (apps/api)
cp apps/api/.env.example apps/api/.env

# Frontend (apps/web)
cp apps/web/.env.example apps/web/.env.local
```

### Essential Variables

#### Root / Shared
```ini
NODE_ENV=production
PORT=4000
```

#### Backend (`apps/api/.env`)
```ini
DATABASE_URL="postgresql://user:password@hostname:5432/krishisetu?sslmode=require"
JWT_SECRET="generate-secure-jwt-secret-here-min-32-chars"
JWT_EXPIRATION="7d"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="https://api.krishisetu.hackops.in/api/auth/google/callback"

# Email / SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="notifications@hackops.in"
SMTP_PASS="your-app-specific-password"
SMTP_FROM='"KrishiSetu Support" <notifications@hackops.in>'

# Demo Mode Toggle
ENABLE_DEMO_BYPASS=false
```

#### Frontend (`apps/web/.env.local`)
```ini
NEXT_PUBLIC_API_URL="https://api.krishisetu.hackops.in"
NEXT_PUBLIC_APP_URL="https://krishisetu.hackops.in"
NEXT_PUBLIC_ENABLE_DEMO_ACCOUNTS=true
```

---

## 3. Local Development Build & Verification

```bash
# 1. Install all dependencies across workspace
npm install

# 2. Generate Prisma Client
npm run db:generate --workspace=@krishisetu/api

# 3. Seed deterministic canonical database
npm run db:seed --workspace=@krishisetu/api

# 4. Run full test suite (must pass 100%)
npm test

# 5. Production build check
npm run build
```

---

## 4. Production Cloud Deployment

### A. Database (Supabase / Neon)
1. Provision a PostgreSQL instance.
2. Run Prisma migrations:
   ```bash
   npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
   ```

### B. Backend (Railway / Render)
1. Connect repository `HackOpsIndia/KrishiSetu`.
2. Set Root Directory to `apps/api`.
3. Set Build Command: `npm install && npm run build`
4. Set Start Command: `node dist/main.js`
5. Inject environment variables securely in project settings.

### C. Frontend (Vercel)
1. Import repository `HackOpsIndia/KrishiSetu`.
2. Framework Preset: **Next.js**.
3. Root Directory: `apps/web`.
4. Inject `NEXT_PUBLIC_API_URL` pointing to live backend.
5. Deploy.
