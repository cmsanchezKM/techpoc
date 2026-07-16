
You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Signal Forms instead of Reactive or Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Project: Angular AI Dashboard

### Required Stack and Patterns

- Angular 22, strict TypeScript (no `any`, enforced via `ng lint`).
- Standalone components (`standalone: true` is the default in v22, do not declare it explicitly).
- Angular Signals (`signal`, `computed`, `effect`) as the state model; prioritize over RxJS except for complex async flows or WebSockets.
- Signal Forms for new forms (stable API since v22, replaces Reactive Forms).
- `httpResource` / `resource` for reactive HTTP calls (stable since v22).
- Zoneless change detection (no `Zone.js`, no `NgModule` decorators).
- Modern control flow syntax: `@if` and `@for` (never `*ngIf` / `*ngFor`).
- Lazy loading on all routes under `features/`.
- `@defer` for non-critical below-the-fold content (comments, secondary widgets, sections outside the initial viewport).
- Runtime i18n with Transloco (or ngx-translate) — Angular's native i18n is compile-time and doesn't support language switching without a rebuild.
- TailwindCSS v4 for layout, mobile-first approach.
- Tests with Vitest.

### SSR (Server-Side Rendering)

This project uses hybrid rendering (SSR + prerendering where applicable), configured via `app.routes.server.ts` with `RenderMode.Server`, `RenderMode.Client`, or `RenderMode.Prerender` per route — never assume a single all-or-nothing rendering mode.

- Do NOT access `window`, `document`, `localStorage`, or other browser-only globals directly. Guard with `isPlatformBrowser(inject(PLATFORM_ID))` or defer the logic to `afterNextRender()` / `afterRenderEffect()`.
- Avoid hydration mismatches: do not render non-deterministic content (`Math.random()`, unpinned `Date.now()`, locale-dependent formatting without a fixed locale) that could differ between server and client render passes.
- Use `httpResource` / `HttpClient` with `TransferState` caching so data fetched during SSR is reused on the client, avoiding duplicate HTTP requests on hydration.
- `@defer` blocks render on the server by default unless configured otherwise; verify the trigger (`on viewport`, `on interaction`, etc.) and placeholder behave correctly during SSR before relying on them for below-the-fold content.
- Runtime i18n (Transloco) must resolve the active language on the server (e.g., via cookie or `Accept-Language` header) so the server-rendered markup matches the client on hydration, preventing language flicker or mismatch errors.

### Commands

- Development server: `ng serve`
- Tests: `ng test`
- Production build: `ng build`
- Lint: `ng lint`

### General Data Flow

Unidirectional architecture: reactive services based on Angular Signals for global state, pure presentational components (receive data via `input()`, emit via `output()`, no business logic).

### Modules and Domain

Screaming Architecture: the folder structure reflects the business domain, not the file type.

- `/src/app/core`: global services, interceptors, and AI configuration (API clients).
- `/src/app/shared`: reusable atomic UI components (buttons, inputs, layouts).
- `/src/app/features`: page modules organized by domain (e.g. `features/chat-agent`, `features/analytics`).

### Language Model (LLM) Integration

- Calls to AI services are centralized in `core/services/ai-gateway.service.ts`. Do not duplicate API clients in other modules.
- System prompts are managed in static files under `assets/prompts/`, not hardcoded in components.

### Boundaries (never touch without explicit confirmation)

- Do not modify anything in `/dist` or generated files.
- Do not commit `.env` files or API keys.
- Do not add new dependencies without justifying them in the PR.

### Git

- Commits in conventional commits format: `feat:`, `fix:`, `chore:`, `docs:`.
- Squash merge on PRs to `main`.

### AI Tools

- The Angular CLI includes an MCP server (`ng mcp`) for AI-assisted tooling.

### Documentation

- **Any `.md` documentation file generated by agents MUST be placed in the `/doc` folder.**
- Examples: feature guides, architecture, configuration, troubleshooting, etc.
- Exceptions: `README.md` at the root (already exists), `AGENTS.md` (definitions), `CLAUDE.md` (configuration).
- Keep the `/doc` folder clean and organized as the project's centralized reference.
