# ncptsp-api

Backend NestJS cho **fb-traffic** (repo Next: `../NCPTSP/ncptsp`).

## Worker cron (Phase 1 + 2)

- `GET /api/health` — health check
- `GET /api/cron/sync` — mirror Next `src/app/api/cron/sync`
- `GET /api/cron/spu-summary` — mirror Next `src/app/api/cron/spu-summary` (`wait`, `ifchanged`, `check=1/2/3`, `video=inc|full`, `lines=refresh`)
- `GET /api/cron/videos` — mirror Next `src/app/api/cron/videos` (`wait=1`)

Tất cả cron: Bearer `CRON_SECRET`. Logic: bundle `@ncptsp/core` (`ncptsp/packages/ncptsp-core`).

**GitHub Actions prod** vẫn gọi `APP_URL` (Next/Vercel) — chưa chuyển worker đến hết Phase 3.

## Chạy local

```bash
# 1. Bundle lib sync (hoặc `pnpm run build:core`)
pnpm run build:core
# hoặc từ ncptsp: cd ../NCPTSP/ncptsp && pnpm run build:core

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

curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3001/api/cron/videos
curl -H "Authorization: Bearer $CRON_SECRET" \
  "http://localhost:3001/api/cron/spu-summary?ifchanged=1"
```

Production Next **chưa đổi** — chỉ chuyển GitHub Actions sang worker sau khi so sánh `sync_runs`.

## Port

Mặc định **3001** (Next dev thường 3000).