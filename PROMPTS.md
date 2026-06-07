# AI Prompt Log

## Prompt Log

### Entry 001

**Tool:** Cursor (Claude)

**Goal:** Generate the full Developer Portal implementation plan from the take-home assignment specification.

**Prompt:** "Take-Home Assignment — Build a Developer Portal [full assignment text including extensibility requirements, auth, sandbox, analytics, status, changelog, bonus features, and evaluation rubric]"

**Outcome:** Used as the architectural blueprint — informed folder structure, tech stack choices, registry pattern, and phased implementation todos.

### Entry 002

**Tool:** Cursor (Claude)

**Goal:** Implement the approved plan end-to-end in a greenfield workspace.

**Prompt:** "Developer Portal — Implementation Plan. Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself."

**Outcome:** Used to scaffold the project, implement all required portal sections, bonus features, CI pipeline, tests, and documentation files.

### Entry 003

**Tool:** Cursor (Claude)

**Goal:** Create OpenAPI spec parser and snippet generator utilities.

**Prompt:** (Implicit via plan) "Implement src/lib/spec-parser.ts (OpenAPIObject → EndpointDef[]) and src/lib/snippet-generator.ts (cURL/fetch/Python generators)"

**Outcome:** Used with modifications — added schema resolution helpers, example generation, and request URL builder utilities.

### Entry 004

**Tool:** Cursor (Claude)

**Goal:** Debug npm scaffold failure and proceed with manual project setup.

**Prompt:** (Implicit) Network failure on `npm create vite` — retried with manual package.json and file scaffolding.

**Outcome:** Adapted approach — created Vite project structure manually instead of using create-vite CLI.

### Entry 005

**Tool:** Cursor (Claude)

**Goal:** Write unit tests for spec parser and snippet generator.

**Prompt:** (Implicit via plan CI requirements) Vitest tests for parseSpec, searchEndpoints, buildRequestUrl, generateCurl.

**Outcome:** Used as-is in `src/lib/spec-parser.test.ts`.
