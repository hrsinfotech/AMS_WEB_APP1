# HRS Tech Security Dashboard

HRS Tech Security Dashboard is a React web and Electron desktop application for access control, attendance, visitor, credential, and security operations. The current migrated workflow is User Management, backed by a Spring Boot API and PostgreSQL.

## Prerequisites

Install the following software before running the project on Windows:

- **Git** 2.40 or newer
- **Node.js** 20 LTS or newer
- **pnpm** 10 or newer (`corepack enable`, then `corepack prepare pnpm@latest --activate`)
- **Java JDK** 17 or newer (`java -version`)
- **Apache Maven** 3.9 or newer (`mvn -version`)
- **Docker Desktop** with Linux containers enabled, for PostgreSQL

Docker Desktop is only required for the included local PostgreSQL setup. A separately installed PostgreSQL 16+ server can be used instead.

## Quick Start on Windows

Open PowerShell in the repository root:

```powershell
git clone https://github.com/hrsinfotech/AMS_WEB_APP.git
cd AMS_WEB_APP
corepack enable
pnpm install
docker compose up -d postgres
mvn -f backend-java/pom.xml spring-boot:run
```

In a second PowerShell window, start the React frontend:

```powershell
pnpm --filter @workspace/hrs-tech-dashboard run dev
```

Open the dashboard at [http://localhost:5173](http://localhost:5173). The backend health check is available at [http://localhost:8080/api/healthz](http://localhost:8080/api/healthz).

## Desktop App on Windows

Build and open the Electron desktop shell after the backend and PostgreSQL are running:

```powershell
pnpm --filter @workspace/hrs-tech-dashboard run desktop:dev
```

Create a Windows installer:

```powershell
pnpm --filter @workspace/hrs-tech-dashboard run build:windows
```

The installer is created under `artifacts/hrs-tech-dashboard/release/`.

## Configuration

Copy `.env.example` to `.env` when custom values are needed. The defaults are suitable for the included Docker Compose database.

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:8080` | Java API URL used by React and Electron |
| `PORT` | `8080` | Spring Boot HTTP port |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/hrs_tech` | PostgreSQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | `hrs` | PostgreSQL username |
| `SPRING_DATASOURCE_PASSWORD` | `hrs` | PostgreSQL password |

## Project Structure

- `backend-java/` - Spring Boot REST API, JPA entities, and PostgreSQL integration
- `artifacts/hrs-tech-dashboard/` - React/Vite frontend and Electron desktop shell
- `docker-compose.yml` - local PostgreSQL 16 service and persistent volume
- `artifacts/hrs-tech-dashboard/src/lib/users-api.ts` - frontend API adapter
- `.env.example` - environment variable template

## API Endpoints

- `GET /api/healthz` - service health check
- `GET /api/users` - list users
- `POST /api/users` - create a user
- `PATCH /api/users/{id}/status` - activate or suspend a user

## Development Commands

```powershell
pnpm run typecheck
pnpm run build
mvn -f backend-java/pom.xml -DskipTests package
docker compose down
```

The database must be running before starting the Java API. The React frontend keeps a local fallback directory when the API is unavailable, but changes are persisted only when the backend and PostgreSQL are running.

## Current Scope

User Management is currently connected end to end to Java and PostgreSQL. The remaining dashboard modules are prototype screens and are ready for subsequent API migrations.
