# ncptsp-api

Backend NestJS cho **fb-traffic** (repo Next: `../NCPTSP/ncptsp`).

## Worker cron (Phase 1–3)

- `GET /api/health` — health check
- `GET /api/cron/sync` — mirror Next `src/app/api/cron/sync`
- `GET /api/cron/spu-summary` — mirror Next `src/app/api/cron/spu-summary` (`wait`, `ifchanged`, `check=1/2/3`, `video=inc|full`, `lines=refresh`)
- `GET /api/cron/videos` — mirror Next `src/app/api/cron/videos` (`wait=1`)

Tất cả cron: Bearer `CRON_SECRET`. Logic: bundle `@ncptsp/core` (`ncptsp/packages/ncptsp-core`).

Sau job, `bust`/`bustSoft` trong lib POST `APP_URL/api/internal/revalidate` (Next xoá cache). **GitHub Actions prod** gọi `WORKER_URL` (Nest). Next `/api/cron/*` trả 410 khi `CRON_ON_WORKER=1`.

## Chạy local

```bash
# 1. Bundle lib sync (hoặc `pnpm run build:core`)
pnpm run build:core
# hoặc từ ncptsp: cd ../NCPTSP/ncptsp && pnpm run build:core

# 2. Env
cp .env.example .env
# điền biến (copy từ ncptsp/.env.local) + APP_URL=http://localhost:3000

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

## Cutover prod

1. Deploy Next (webhook `/api/internal/revalidate`; `CRON_ON_WORKER` chưa bật).
2. Deploy Nest: `APP_URL` = Next, `WORKER_PUBLIC_URL` = Nest public, `CRON_SECRET` giống Vercel.
3. GitHub secret `WORKER_URL` = Nest (không `/` cuối). Merge workflow.
4. `workflow_dispatch` sync một lần — 202, sidebar Next cập nhật.
5. Vercel: `CRON_ON_WORKER=1`. `GET` Next `/api/cron/sync` → 410.

`vercel.json` không có `crons` — đừng thêm lại.

## Rollback

1. Vercel: xóa `CRON_ON_WORKER` (hoặc `=0`).
2. GitHub: `WORKER_URL` = `https://ncptsp.vercel.app` (hoặc revert 3 workflow về `APP_URL`).
3. Chạy tay workflow `sync` — 202 từ Next.
4. Dừng Nest cron nếu còn bị gọi tay (tránh double sync).

Cache không bust: `POST $APP_URL/api/internal/revalidate` với Bearer `CRON_SECRET` và `{"tags":["sync","spu-data"],"profile":"max"}`.

Không bật lại Vercel `crons` khi GitHub vẫn chạy.

## Port

Mặc định **3001** (Next dev thường 3000).
