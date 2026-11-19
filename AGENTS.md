<!-- intent-skills:start -->
## TanStack Intent Skills

Before making substantial changes to a TanStack project:
- Run `npx @tanstack/intent@latest list` from the actual workspace root to discover available local skills.
- If a skill directly matches the task, run `npx @tanstack/intent@latest load <package>#<skill>` and follow its `SKILL.md` before editing.
- In a monorepo, run the check at the workspace root and prefer the skill for the package being changed.
- Prefer the most specific matching skill. Load additional skills only when the task spans multiple concerns.
- If the workspace or package manager environment is unavailable, do not pretend the command was run; continue using the repository's existing conventions and the official documentation.
<!-- intent-skills:end -->

# AGENTS.md — TanStack + React Project Guidelines

## 1. Primary Engineering Principles

Act as a senior React and TanStack engineer. Every change must favor maintainability, consistency, accessibility, performance, and clear separation of responsibilities.

Priority order:
1. Reuse and extend existing project components, hooks, utilities, and integrations.
2. Prefer the project's configured **shadcn/ui components using Base UI primitives** for interface elements.
3. Keep route definitions and route-level concerns inside TanStack Router route files.
4. Keep feature behavior and domain logic close to the feature that owns it, without coupling it to page layout.
5. Keep shared code genuinely generic; do not move feature-specific code into global folders just to make it appear reusable.
6. Follow existing project conventions and installed dependency versions. Do not introduce a competing library or architecture without a concrete need.

Do not optimize for the fewest lines of code. Optimize for code that another developer can understand, test, reuse, and safely change.

## 2. Understand the Existing Project Before Coding

Before implementing a feature or refactor:
- Inspect `package.json`, `tsconfig.json`, `vite.config.ts`, `components.json`, and relevant source files.
- Identify whether the application uses TanStack Router alone or TanStack Start, and confirm which TanStack Query, form, validation, and styling libraries are actually installed.
- Inspect existing components and patterns before creating new ones.
- Check the configured shadcn/ui style and primitive library. This project prioritizes **Base UI**; do not silently mix Base UI and Radix UI implementations.
- Follow the existing import aliases, naming conventions, formatting, linting, and file organization.
- Do not assume a package, API, component, or configuration exists. Verify it in the project first.

Make the smallest coherent change that solves the task. Avoid unrelated rewrites, dependency additions, and speculative abstractions.

## 3. Preferred Source Architecture

Use the current project structure as the starting point. Extend it consistently rather than replacing it wholesale.

```text
src/
├── components/
│   ├── ui/                 # shadcn/ui components (Base UI primitives)
│   ├── shared/             # Generic components shared across features
│   ├── layout/             # App shell, navigation, headers, sidebars
│   └── [feature]/          # Components that belong to a specific feature
├── hooks/                  # Truly shared React hooks
├── integrations/           # External services and library integrations
├── lib/                    # Generic utilities, helpers, constants
├── routes/                 # TanStack file-based route modules
├── router.tsx              # Router creation/configuration
├── routeTree.gen.ts        # Generated file; never edit manually
└── styles.css              # Global styles, Tailwind and design tokens
```

For a feature that grows beyond a small component, organize its code by responsibility. A feature-local structure may look like:

```text
src/components/[feature]/
├── components/              # Feature-specific UI pieces
├── hooks/                   # Feature-specific hooks
├── services/                # Feature use cases / API orchestration, if needed
├── schemas/                 # Feature validation schemas, if needed
├── types/                   # Feature-specific types, if needed
└── index.ts                 # Optional public exports; avoid barrel sprawl
```

This is a flexible convention, not a requirement to create every folder. Add a folder only when it improves discoverability or separates a real responsibility.

### Folder ownership

- `routes/`: URL mapping, route layouts, route guards, search-param validation, route loaders, and page composition. Keep substantial feature UI and business logic out of route files.
- `components/ui/`: shadcn-generated or shadcn-customized primitives. Keep these components focused and reusable. Do not put application-specific business rules here.
- `components/shared/`: reusable application-level UI that is not a primitive and is not owned by one feature.
- `components/layout/`: application shell and structural layout components.
- `components/[feature]/`: UI owned by a specific feature. Prefer this over a large flat `components/` directory.
- `hooks/`: hooks that are genuinely shared across unrelated features. Feature-specific hooks belong with their feature.
- `integrations/`: setup and adapters for external systems (for example analytics, authentication providers, payment SDKs, or API clients). Keep provider-specific details behind a small, clear interface where useful.
- `lib/`: framework-agnostic helpers and shared utilities. Do not turn it into a miscellaneous dumping ground.
- `styles.css`: global styles, Tailwind directives/imports, CSS variables, and design tokens. Component-specific styles should remain close to their component when the project uses that pattern.

If a feature becomes large or has several routes, it is acceptable to create a dedicated `src/features/[feature]/` module and keep its components, hooks, schemas, types, and services together. Do this only when it makes ownership clearer; avoid maintaining two competing feature architectures.

## 4. Component Reuse and Design System (High Priority)

Before creating a component:
1. Search `components/ui/`, `components/shared/`, `components/layout/`, and the relevant feature folder.
2. Check whether an existing component can be composed, extended through props, or given a small variant.
3. Reuse existing design tokens, variants, spacing, typography, and interaction patterns.
4. Create a new component only when it represents a meaningful reusable concept or makes a complex view substantially easier to understand.

### Reuse rules

- Prefer composition and small focused components over copied JSX.
- Extract repeated UI when it appears in multiple places or has a clear independent responsibility. Do not create abstractions for trivial one-off markup without a reuse or clarity benefit.
- Keep components cohesive: one clear purpose, explicit props, and predictable behavior.
- Use variants for legitimate visual or behavioral differences instead of duplicating nearly identical components.
- Avoid components with many boolean props that create ambiguous combinations. Prefer discriminated unions, explicit variants, or composition when appropriate.
- Do not create a generic component that knows about unrelated features or contains many feature-specific conditionals.
- Keep state as close as possible to where it is used. Lift it only when multiple parts of the UI need to coordinate.
- Avoid prop drilling through many layers; use composition or a narrowly scoped context when it genuinely simplifies ownership.
- Avoid unnecessary global state and context providers.

### shadcn/ui + Base UI is the default

- Prefer existing shadcn/ui components configured for **Base UI** before writing a component from scratch or choosing another UI library.
- Use the shadcn component registry/CLI and the project's existing configuration when adding components. Inspect the generated code and dependencies instead of blindly overwriting customized files.
- Keep shadcn primitives in `src/components/ui/` (or the path configured by `components.json`). Build application-specific compositions in `shared/`, `layout/`, or the owning feature folder.
- Use the available shadcn components for common patterns such as Button, Input, Label, Select, Checkbox, Switch, Dialog, Alert Dialog, Dropdown Menu, Popover, Tooltip, Tabs, Table, Sheet, Skeleton, and Form where applicable.
- Prefer Base UI APIs and behavior when implementing or customizing these components. Do not copy Radix-specific props, imports, or assumptions into Base UI components.
- Do not mix Base UI and Radix primitives in the same component tree unless a verified compatibility requirement makes it necessary and the reason is documented.
- Do not replace a working shadcn component with a third-party equivalent without a clear functional, accessibility, or maintenance reason.
- If the needed shadcn component is not installed, check the official shadcn documentation and the project's configured Base UI support before adding it.
- Preserve the project's design tokens and CSS variables. Avoid arbitrary colors, one-off styling values, and hardcoded design decisions when a token or existing variant is available.

## 5. TanStack Router and Route Organization

Use TanStack Router's **file-based routing** as the default. It is the preferred approach for most applications and supports route-level code splitting and strong type inference.

- Each route file should export its route using `createFileRoute` and the path generated/configured by the TanStack Router tooling.
- Keep route files focused on route configuration, validation, loaders, metadata, layouts, and composing the page component.
- Put complex page UI in a named page/feature component rather than growing a route file into a large component module.
- Use nested routes and layout routes to share layouts across related pages. Use pathless/grouped routes only when they improve organization or shared behavior.
- Use route params and search params through TanStack Router's typed APIs. Validate and normalize search params with the project's established schema library when available.
- Prefer links and navigation APIs from `@tanstack/react-router` over raw anchors or manual History API changes for internal navigation.
- Use route loaders for data required to render a route and for route-level orchestration. Avoid duplicating the same fetching logic in both a loader and a component.
- Use route-level pending, error, and not-found handling where appropriate. Provide useful loading and empty states rather than leaving blank screens.
- Keep `router.tsx` focused on router creation and global router configuration.
- **Never edit `routeTree.gen.ts` manually.** It is generated by TanStack tooling. Change route files/configuration and let the generator update it.
- Do not invent route conventions or manually hardcode generated route types. Follow the installed TanStack Router version and its generated types.

If the project uses TanStack Start, follow its server/client boundaries:
- Keep secrets, database access, filesystem access, and privileged operations on the server.
- Use server functions for server logic called by the application itself; use server routes for endpoints that must be exposed as HTTP endpoints to external clients.
- Validate untrusted input at server boundaries. Never trust client-side validation for authorization or data integrity.
- Do not import server-only modules into client components or client-side utilities.

## 6. Data Fetching and State

First identify which data and state tools are installed. Do not add TanStack Query, a form library, or a global state library merely by habit.

- Use TanStack Router loaders for route-critical data and navigation-aware loading when appropriate.
- If TanStack Query is installed, use it for shared server state, cache lifecycle, background refetching, mutations, and invalidation. Define stable, consistent query keys and avoid duplicate caches for the same resource.
- Keep server state, URL state, and local UI state distinct:
  - URL/search params: shareable, navigable, filterable, or bookmarkable state.
  - Server state: data owned by an API/backend.
  - Local React state: transient UI state such as open menus, selected tabs that are not part of the URL, and temporary input state.
- Avoid mirroring query results into local state unless there is a clear editing/draft requirement.
- Avoid unnecessary `useEffect` for data fetching, derived state, or event handling. Prefer loaders, query hooks, and derived render-time values.
- Handle loading, error, empty, success, and mutation-pending states deliberately.
- Prevent stale or duplicate requests using the data library's supported mechanisms instead of ad hoc flags.

## 7. React and TypeScript Standards

- Use functional components and modern React patterns consistent with the installed React version.
- Use TypeScript for application code. Avoid `any`; prefer inferred types, `unknown` with narrowing, generics, and explicit domain types.
- Let TypeScript infer types when the result is clear. Add explicit types at public boundaries, complex contracts, and reusable APIs.
- Define component props close to the component. Keep exported types intentional and minimal.
- Prefer named exports unless the framework or existing route convention requires a default export.
- Keep components small and readable, but do not split code into tiny files without a meaningful boundary.
- Keep render functions pure. Do not mutate props, state, or shared objects during render.
- Follow the Rules of Hooks. Do not call hooks conditionally or outside React components/custom hooks.
- Use `useMemo` and `useCallback` only when they solve a measured or understandable identity/performance problem; do not add them automatically.
- Use semantic HTML before creating custom interactive elements. Buttons must be buttons, navigation must be navigation, and form controls must have labels.
- Ensure keyboard navigation, visible focus states, accessible names, and appropriate ARIA only when native semantics are insufficient.
- Avoid suppressing TypeScript or lint errors with `@ts-ignore`, `eslint-disable`, or broad casts. If unavoidable, keep the scope minimal and explain why.

## 8. Forms and Validation

- Reuse the project's established form components and validation approach.
- Prefer shadcn form controls built on Base UI, while preserving native form semantics and accessibility.
- Validate user input at the UI boundary for useful feedback and again at the server/API boundary for security and correctness.
- Keep schemas close to the feature that owns them. Share schemas only when both client and server genuinely use the same contract and the schema is safe to import on both sides.
- Distinguish validation errors from transport, authorization, and unexpected server errors.
- Provide clear labels, descriptions, required indicators, and field-level error messages.
- Prevent duplicate submissions and show pending/success/error feedback.

## 9. Styling and Visual Consistency

- Follow the project's existing Tailwind CSS version and configuration. Do not mix incompatible syntax or configuration styles.
- Prefer shadcn variants, design tokens, CSS variables, and shared layout components over repeated utility-class strings.
- Use responsive layouts deliberately; avoid fixed dimensions where flexible sizing is appropriate.
- Keep spacing, typography, borders, radii, and colors consistent with the existing design system.
- Use `cn` or the project's established class-merging utility when available; do not introduce another helper unnecessarily.
- Avoid inline styles for values that belong in tokens or Tailwind classes. Use inline styles only for genuinely dynamic values.
- Do not add global CSS selectors that unexpectedly affect unrelated components.

## 10. Naming, Imports, and File Hygiene

- Use clear, descriptive names that communicate responsibility.
- Use PascalCase for React component files/exports when consistent with the repository; use the existing convention if it differs.
- Use camelCase for functions, variables, and hooks. Custom hooks must start with `use`.
- Keep imports organized and use the configured path aliases. Avoid deep relative import chains when an alias exists.
- Avoid circular dependencies and broad barrel exports that obscure module ownership or increase coupling.
- Keep one primary responsibility per module. Split a file when distinct concerns are becoming difficult to navigate, not merely because it reaches an arbitrary line count.
- Remove dead code, unused imports, obsolete comments, and temporary debugging output introduced by the change.
- Do not edit build output, generated files, `dist/`, `.output/`, `.tanstack/`, or `node_modules/` unless the task explicitly requires it.

## 11. Error Handling, Security, and Reliability

- Handle expected failures explicitly and provide user-facing feedback that is actionable without exposing internal details.
- Do not silently swallow errors. Log or propagate them according to the project's established error-handling strategy.
- Never expose secrets, tokens, private environment variables, or privileged server data to the browser.
- Enforce authorization on the server for protected operations; hiding a button or route in the UI is not authorization.
- Treat URL params, search params, form data, API responses, and external integration payloads as untrusted input.
- Avoid unsafe HTML injection. If rendering untrusted HTML is unavoidable, sanitize it with an established trusted solution.
- Use stable identifiers for list keys; do not use array indexes when items can be reordered, inserted, or removed.

## 12. Testing and Verification

- Follow the test framework and conventions already present in the repository.
- Add or update tests for meaningful behavior, especially validation, business rules, state transitions, and error cases.
- Prefer tests that verify observable behavior over tests coupled to implementation details.
- Before finishing, run the relevant checks available in `package.json`: type checking, linting, formatting, unit tests, and/or build.
- If a command cannot be run because dependencies, credentials, or environment are unavailable, state that clearly. Never claim a check passed if it was not executed.
- Review the final diff for accidental generated-file changes, duplicated logic, unused code, and unrelated modifications.

## 13. Required Workflow for Every Feature

1. **Inspect:** read the relevant route, feature components, shared components, hooks, integrations, types, and package configuration.
2. **Reuse:** identify existing shadcn/Base UI primitives and application components before creating new UI.
3. **Plan boundaries:** decide what belongs in the route, feature, shared component, hook, integration, and utility layers.
4. **Implement:** make the smallest cohesive change, using typed TanStack APIs and existing project conventions.
5. **Validate:** handle accessibility, responsive behavior, loading/empty/error states, and server/client boundaries.
6. **Verify:** run relevant type, lint, test, and build checks; inspect the final diff.
7. **Report:** summarize what changed, important architectural decisions, and any checks that could not be run.

## 14. Decision Rules

When choosing between two implementations, prefer the one that:
- Reuses an existing component instead of duplicating UI.
- Uses shadcn/ui with Base UI instead of introducing another component system.
- Keeps feature-specific code within its owning feature instead of polluting shared folders.
- Uses TanStack Router's typed, file-based APIs instead of manual routing logic.
- Uses the appropriate state/data layer instead of duplicating state.
- Has fewer hidden side effects and clearer dependencies.
- Is accessible, testable, and easy to extend without premature abstraction.

Do not treat these guidelines as a reason to force abstractions where they do not help. Consistency with the real project and clarity of responsibility take precedence over rigid folder rules.
