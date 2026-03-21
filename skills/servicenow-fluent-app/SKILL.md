---
name: servicenow-fluent-app
description: Build and revise ServiceNow applications with ServiceNow Fluent and `now-sdk`, including custom UI pages, server-side business rules, application menus, navigator modules, server modules, and repo-to-instance deployment. Use when Codex needs to create or modify ServiceNow app artifacts that are not primarily ATF work.
---

# ServiceNow Fluent App

## Boundary

- Use this skill for app artifacts:
  - `UiPage`
  - `BusinessRule`
  - `ApplicationMenu`
  - `Record({ table: 'sys_app_module' ... })`
  - server modules under `src/server/`
  - local build/deploy workflow with `now-sdk`
- Use `servicenow-atf` when the primary task is test authoring, runner choice, or ATF debugging.

## Workflow

### 1. Keep the artifact split clear

- Fluent metadata belongs under `src/fluent/`.
- Reusable server logic belongs under `src/server/`.
- Custom frontend code belongs under `src/client/`.
- Prefer wiring metadata to server modules instead of embedding large scripts inline.

### 2. Choose the smallest correct Fluent surface

- Use `UiPage(...)` for the custom page shell.
- Use `BusinessRule(...)` for server-side incident/task logic.
- Use `ApplicationMenu(...)` for the top-level navigator group.
- Use `Record({ table: 'sys_app_module', ... })` for modules when there is no dedicated helper.

### 3. Use stable ids

- Use `$id: Now.ID[...]` for every Fluent artifact.
- Keep names stable after deployment unless you intentionally want a new record.

### 4. Build and deploy through the repo-native path

- Prefer the repo's existing build and deploy scripts if they are present.
- If the repo exposes `npm run build` and `npm run deploy`, use them from the repo root.
- Otherwise fall back to the direct SDK flow from the repo root:

```bash
now-sdk build
now-sdk install
```

- `now-sdk build` proves the metadata shape is valid.
- `now-sdk install` updates the connected instance.

### 5. Verify generated and deployed records

- Check the generated keys file if the project emits one.
- Check generated update XML if you need to confirm exact record shapes.
- Verify on the instance by opening the relevant `sys_*` record directly when the result matters.

## Working patterns

- Read [references/fluent-app.md](references/fluent-app.md) before inventing a new project structure.
- Keep business behavior server-side so it is easier to validate and test.
- Treat navigator polish as metadata, not frontend code.
- If instance behavior differs from the docs, trust the instance and adjust the design to match observed platform behavior.

## Research rule

- Start with this skill's references and any repo-local curated docs.
- Use repo-local research caches only when they exist and only when curated guidance is not enough.
- Treat cached vendor material as convenience only; re-verify with the official source or the instance if the detail is brittle.
