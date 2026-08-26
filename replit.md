# HRS Tech Security Dashboard

Access, attendance, visitor, credential, and security operations dashboard with a React desktop/web frontend and Java/PostgreSQL backend.

## Run & Operate

- `docker compose up -d postgres` — start PostgreSQL (port 5432)
- `mvn -f backend-java/pom.xml spring-boot:run` — run the Java API (port 8080)
- `pnpm --filter @workspace/hrs-tech-dashboard run dev` — run the React frontend
- `pnpm --filter @workspace/hrs-tech-dashboard run desktop:dev` — build and open the Windows/Electron shell
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Java API environment overrides: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `PORT`
- Frontend API override: `VITE_API_URL` (defaults to `http://localhost:8080` for browser and Electron)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Spring Boot 3.5 + Spring Data JPA
- DB: PostgreSQL 16
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `backend-java/` — Java REST API and JPA model
- `backend-java/src/main/resources/application.yml` — server and database configuration
- `docker-compose.yml` — local PostgreSQL service
- `artifacts/hrs-tech-dashboard/src/lib/users-api.ts` — frontend API adapter
- `artifacts/hrs-tech-dashboard/electron/` — Windows desktop shell

## Architecture decisions

- PostgreSQL is the source of truth for users; seed data is inserted only when the table is empty.
- The React app keeps a local fallback so the desktop shell remains launchable while the API is offline.
- `VITE_API_URL` allows the same frontend build to target localhost, a LAN server, or a hosted API.

## Product

User Management is backed by Java/PostgreSQL for listing, creating, and suspending users. Other dashboard modules remain prototype screens until their domain APIs are migrated.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Start PostgreSQL before the Java API; the API will not start without a reachable database.
- For Electron production builds, make the Java API reachable at `http://localhost:8080` or set `VITE_API_URL` before building.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
