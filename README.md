# ncptsp-api

Backend NestJS cho **fb-traffic** (repo Next: `../NCPTSP/ncptsp`).

## Phase 1

- `GET /api/health` — health check
- `GET /api/cron/sync` — mirror Next `src/app/api/cron/sync` (Bearer `CRON_SECRET`)

Logic đồng bộ: bundle từ `@ncptsp/core` (`ncptsp/packages/ncptsp-core`).

## Chạy local

```bash
# 1. Bundle lib sync (hoặc `pnpm run build:core`)
cd ../NCPTSP/ncptsp/packages/ncptsp-core && node build.mjs && node build-auth.mjs

# 2. Env
cp .env.example .env
# điền biến (copy từ ncptsp/.env.local)

# 3. API
cd /path/to/BE_T6
pnpm install
pnpm run start:dev
```

Thử:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "http://localhost:3001/api/cron/sync?days=1&postDays=3&wait=1"
```

Production Next **chưa đổi** — chỉ chuyển GitHub Actions sang worker sau khi so sánh `sync_runs`.

## Port

Mặc định **3001** (Next dev thường 3000).