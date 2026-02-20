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

## Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/lib/db/` - Database schema and client
- `src/lib/services/` - Business logic services
- `src/lib/strava/` - Strava API integration
- `src/lib/utils/` - Utility functions (formatters, calculations)
- `src/components/` - React components

## Testing
- Test files co-located with source: `*.test.ts`
- Import from `bun:test`: `import { describe, expect, test } from "bun:test"`

## Code Style
- Locale: `pt-BR` for date/time formatting
- Date library: `date-fns`
