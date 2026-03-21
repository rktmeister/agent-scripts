# ServiceNow Service Model

## Global versus local

These patterns are reusable across projects:

- local-first authoring with `now-sdk`
- Fluent metadata under `src/fluent/`
- server modules under `src/server/`
- client assets under `src/client/`
- ServiceNow app primitives such as `UiPage`, `BusinessRule`, `ApplicationMenu`, and `Record({ table: 'sys_app_module' ... })`
- ATF authoring and execution patterns
- trust model for docs versus instance behavior

These stay in each project repo:

- business-rule examples tied to that app
- instance-specific URLs and sys_ids
- project-specific navigation structures
- app-specific workflows and examples

## Trust model

- curated docs and skill references are the default starting point
- upstream cached docs are for discovery and background context
- the live instance is the authority for runtime behavior

## Current routing

- Use `servicenow-fluent-app` for:
  - `UiPage`
  - `BusinessRule`
  - `ApplicationMenu`
  - `Record({ table: 'sys_app_module' ... })`
  - server modules
  - local build and deploy with `now-sdk`
- Use `servicenow-atf` for:
  - ATF test authoring
  - runner selection
  - browser-versus-server execution decisions
  - result inspection and ATF debugging

## Fallback

- If the task is ServiceNow work but no specialized skill exists yet, stay in the project repo and keep any new guidance local until the pattern is proven reusable.
- Do not load large vendor caches by default.
