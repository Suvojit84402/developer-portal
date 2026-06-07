# Developer Portal

An extensible API documentation and sandbox platform built for external developers. The portal demonstrates a registry-driven architecture where new APIs are added without modifying UI components.

## Prerequisites

- Node.js 20+
- npm 10+

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## Test User

1. Navigate to `/signup`
2. Create an account with any email/password (minimum 8 characters)
3. Sign in at `/login`

Credentials are stored locally in the browser for demo purposes.

## Auth Provider

This project uses a **custom JWT implementation** with the `jose` library:

- HS256 tokens signed with `VITE_JWT_SECRET`
- 15-minute access token expiry with silent refresh 60 seconds before expiration
- Session persistence via `localStorage`

This approach was chosen to keep the submission self-contained (no external auth service required) while demonstrating production-grade JWT lifecycle handling. In production, tokens would be issued by a backend auth service rather than the browser.

## Adding a New API

Adding a new API requires only registry changes:

1. Drop an OpenAPI 3.x spec at `src/apis/<api-name>/openapi.json`
2. Optionally add `docs.md` and `changelog.json`
3. Add one entry to `src/apis/api-registry.ts`

Example:

```typescript
import newApiSpec from './my-api/openapi.json';

{
  id: 'my-api',
  name: 'My API',
  version: '1.0.0',
  spec: newApiSpec,
  baseUrl: 'https://api.example.com/v1',
}
```

The sidebar, documentation pages, sandbox, changelog, and status views update automatically.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript check |
| `npm test` | Vitest unit tests |

## Bonus Features Implemented

- GitHub Actions CI pipeline
- Dark / light / system theme toggle
- Multi-environment URL switcher (Sandbox / Staging / Production)
- Session request history with HAR export

## Project Structure

```
src/
├── apis/              # API registry and OpenAPI specs
├── features/          # Feature modules (auth, docs, sandbox, etc.)
├── components/        # Shared UI primitives
└── lib/               # Spec parser, snippet generator, stores
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for design decisions.
