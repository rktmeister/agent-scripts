---
name: servicenow-atf
description: Author, review, and plan ServiceNow Automated Test Framework (ATF) work, including ServiceNow Fluent `.now.ts` tests, classic in-instance ATF steps and suites, browser/server runner decisions, and custom scripted server-side steps. Use when Codex needs to create or revise ServiceNow automated tests, map a workflow to ATF steps, explain how ATF executes, or emulate ServiceNow Test generation behavior without access to the proprietary feature.
---

# ServiceNow ATF

For non-test ServiceNow app artifacts such as UI pages, business rules, app menus, or navigator modules, use `servicenow-fluent-app`.

## Workflow

### 1. Choose the authoring surface first

- If the project uses `@servicenow/sdk`, `now-sdk`, or `.now.ts` metadata files, prefer ServiceNow Fluent for code-first ATF authoring.
- Otherwise, work in the native ATF mental model: test records, ordered test steps, suites, schedules, and step configs inside the instance.
- Read [references/atf-authoring.md](references/atf-authoring.md) before inventing a new model. ATF is record-native even when authored from source.

### 2. Split the test into server and browser work

- Server-only tests are the simplest path and run entirely on the instance.
- UI steps require a runner: `Client Test Runner`, `Scheduled Client Test Runner`, `Headless Browser`, or a newer ServiceNow-managed runner path if the environment supports it.
- State this constraint explicitly when proposing a plan. ATF does not run fully offline on the local machine.

### 3. Run a progressive preflight

- Start with a minimal server-only smoke test before adding UI or security coverage.
- Add browser steps only after a server smoke test builds, deploys, and passes.
- Write negative permission tests only against an explicitly known restriction on the target instance. Do not assume generic ITSM ACL behavior.
- Inspect the real target form or view before adding submit steps. Required fields, client scripts, and UI policies can differ from table-level assumptions.

### 4. Design isolated tests

- Create data inside the test instead of depending on existing records.
- Prefer creating users over impersonating shared existing users.
- Use output variables instead of hardcoded sys_ids.
- Avoid system tables and metadata tables unless the test genuinely needs them.
- Keep tests parallel-safe. If two tests truly conflict, call that out rather than hiding the dependency.

### 5. Prefer built-in steps before custom scripting

- Use built-in ATF categories first.
- Reach for custom step configs only when built-in steps cannot express the behavior.
- Custom step configs are server-side scripted only. Do not propose browser-running custom step configs.

### 6. Make assertions explicit

- Keep the assertion close to the action it validates.
- Prefer record validation, field validation, or explicit output checks over vague "happy path" flows.
- If the user asks for AI-generated tests, follow the documented prompting rules in [references/atf-authoring.md](references/atf-authoring.md).

## Fluent Rules

- Keep Fluent tests in standalone `.now.ts` files under the project's Fluent source tree, commonly `src/fluent/`.
- Use stable `$id: Now.ID[...]` values on the test record and on every ATF step.
- Prefer `failOnServerError: true` unless the user has a reason not to.
- Reuse output values from prior steps rather than hardcoding transient identifiers.
- Check the reference file for the supported Fluent step categories and an example test shape.

## Runner Rules

- Manual UI execution uses the `Client Test Runner`.
- Scheduled UI execution uses the `Scheduled Client Test Runner`.
- `Headless Browser` is legacy, but the official Zurich docs still require it for on-premise instances that cannot use Cloud Runner-style alternatives.
- Treat browser execution as infrastructure attached to the ServiceNow instance, not as a local unit test runtime.
- Verify `sn_atf.runner.enabled=true` before assuming browser-backed tests are broken.
- Treat `sys_atf_test_result` and `sys_atf_test_result_step` as the source of truth for status and failure analysis. The runner page can still say `Waiting for a test to run` while the browser is simply idle between batches.

## Debugging Rules

- If a Fluent build fails with `Failed to determine ID for "sys_atf_step" record`, add a distinct `$id` to each step.
- If `Submit a Form` fails with `aborted before being sent to the server`, inspect mandatory fields, client scripts, and UI policies on the actual form before changing ATF infrastructure.
- If a negative security test succeeds unexpectedly, treat it as an instance-model mismatch first. Confirm the target ACL or role restriction before changing the test harness.

## Test Generation Caveat

Public ServiceNow docs describe the `Test generation` feature and its prompting guidance, but they do not expose ServiceNow's internal prompt template or a literal `SKILL.md`. Emulate the documented behavior; do not claim access to ServiceNow's proprietary skill internals unless the user provides them.

## Reference

Read [references/atf-authoring.md](references/atf-authoring.md) for the ATF mental model, Fluent example, runner constraints, Test generation limits, and official source links.
