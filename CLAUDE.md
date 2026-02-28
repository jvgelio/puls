# PULS Project

Fitness tracking app with Strava integration.

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Drizzle ORM + PostgreSQL
- TailwindCSS 4 + shadcn/ui
- Bun (runtime + test runner)

## Commands
- `bun run dev` - Start dev server
- `bun run build` - Build for production
- `bun run lint` - Run ESLint
- `bun test` - Run tests (uses `bun:test`)
- `bun run db:generate` - Generate Drizzle migrations
- `bun run db:push` - Push schema to database
- `bun run db:studio` - Open Drizzle Studio
- `bun run trigger:dev` - Run Trigger.dev dev server (required for local webhook testing)
- `bun run trigger:deploy` - Deploy Trigger.dev tasks to production

## Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/lib/db/` - Database schema and client
- `src/lib/services/` - Business logic services
- `src/lib/strava/` - Strava API integration
- `src/lib/utils/` - Utility functions (formatters, calculations)
- `src/components/` - React components
- `src/trigger/` - Trigger.dev background job tasks

## Integrations
- **Strava webhook** → `src/app/api/webhook/strava/` → triggers `process-strava-activity` task
- **Telegram bot** → `src/app/api/webhook/telegram/` + `src/app/api/telegram/connect/`
  Users connect via `/start <code>` in the bot after generating a code in the app
- **OpenRouter** → AI feedback generation in `src/lib/services/ai.service.ts`

## Trigger.dev Tasks
Tasks live in `src/trigger/strava-feedback/`:
- `process-strava-activity` — triggered by Strava webhook; fetches activity, saves to DB, generates AI feedback, sends Telegram notification
- `send-telegram-notification` — sends activity summary + AI feedback to user's Telegram
- `backfill-missing-activities` — manually triggered to recover activities missed by the webhook (pass `{ userId, afterDate }`)

**Gotcha:** Strava access tokens expire in 6 hours. Tasks must always fetch the token from the DB and call `refreshAccessToken()` if `isTokenExpired()` returns true — never trust a token passed in the payload.

## Environment Variables
Required in `.env.local`:
- `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`
- `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_VERIFY_TOKEN`
- `OPENROUTER_API_KEY`
- `TRIGGER_SECRET_KEY`, `TRIGGER_PROJECT_ID`
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBHOOK_SECRET`

## Testing
- Test files co-located with source: `*.test.ts`
- Import from `bun:test`: `import { describe, expect, test } from "bun:test"`

## Code Style
- Locale: `pt-BR` for date/time formatting
- Date library: `date-fns`
