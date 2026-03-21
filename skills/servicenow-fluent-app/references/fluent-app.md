# ServiceNow Fluent App Reference

## Local-first model

- author locally
- build and deploy from the repo root
- execute on the ServiceNow instance

The SDK is the authoring and deployment layer, not the runtime.

## Common SDK layout

- `src/fluent/ui-pages/`
  - UI page metadata
- `src/fluent/business-rules/`
  - business rule metadata
- `src/fluent/navigation/`
  - app menus and navigator modules
- `src/fluent/atf/`
  - tests only
- `src/server/`
  - server-side TypeScript modules imported by Fluent metadata
- `src/client/`
  - custom frontend assets bundled into the UI page

## Core Fluent-to-record mapping

- `UiPage(...)` -> `sys_ui_page`
- `BusinessRule(...)` -> `sys_script`
- `ApplicationMenu(...)` -> `sys_app_application`
- `Record({ table: 'sys_app_module' ... })` -> `sys_app_module`
- `Test(...)` belongs in `src/fluent/atf/` and is handled by `servicenow-atf`

## Navigator pattern

Use a small, product-facing menu shape:

- one `ApplicationMenu`
- one `DIRECT` module for the custom workspace or landing page
- optional `LIST` modules for operational views and troubleshooting

That keeps the client-facing surface simple while still exposing standard platform lists when needed.

## Build and deploy

- Prefer repo-native wrapper scripts if they exist.
- Otherwise use `now-sdk build` and `now-sdk install` from the repo root.
- After deployment, verify the generated keys file if the project emits one and inspect the target instance record when exact shape matters.

## Verification checklist

After changing app artifacts:

1. run the project build step or `now-sdk build`
2. run the project deploy step or `now-sdk install`
3. inspect the generated keys file if the project emits one
4. inspect generated update XML if exact record shape matters
5. verify the target record or page on the instance
