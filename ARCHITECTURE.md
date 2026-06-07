# Architecture

## Design Goals

1. **Extensibility first** — all API-dependent UI reads from `API_REGISTRY`
2. **OpenAPI as source of truth** — no endpoint metadata hardcoded in JSX
3. **Feature-based modules** — each portal section is isolated under `src/features/`
4. **Shared primitives** — consistent badges, states, and layout patterns

## Registry Pattern

`src/apis/api-registry.ts` is the single integration point for new APIs. Each entry provides:

- OpenAPI spec (required)
- Base URL(s) for sandbox/staging/production
- Optional docs markdown, changelog, and SDK links

The docs engine parses specs via `parseSpec()` into a normalized `EndpointDef[]` model consumed by documentation and sandbox features.

## Data Flow

```
api-registry.ts → parseSpec() → EndpointDef[]
                              → DocsPage (parameter tables, schemas)
                              → SandboxPage (request builder, snippets)
```

## Auth

Custom JWT auth uses `jose` for signing/verification. Users are stored in `localStorage` for demo purposes. Protected routes (`/keys`, `/analytics`, `/history`) are wrapped in `AuthGuard`.

Silent refresh schedules token re-issuance before expiry to maintain session continuity across page reloads.

## State Management

| Concern | Tool |
|---|---|
| Server/async state | TanStack Query |
| API keys, theme, environment, request history | Zustand (+ persist where needed) |
| Auth session | React Context |

## Styling

Tailwind CSS v4 with CSS custom properties for theme tokens. HTTP method badges and status codes follow conventional color mapping throughout the app.

## Testing

Vitest covers the critical extensibility utilities:

- OpenAPI spec parsing
- Endpoint search
- Snippet generation

## Trade-offs

- **Client-side JWT**: acceptable for demo; production would use a backend issuer
- **Mocked analytics/status**: UI structure is production-ready; data layer can be swapped for real telemetry
- **localStorage persistence**: sufficient for take-home scope; would move to secure httpOnly cookies in production

## Future Improvements

- Backend API for key management and analytics
- Real health check polling for status page
- OpenAPI `$ref` resolver with full schema dereferencing
- Preview deployments in CI (Vercel/Netlify)
