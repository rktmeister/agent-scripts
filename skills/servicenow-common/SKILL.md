---
name: servicenow-common
description: Route general ServiceNow work to the right specialized skill and apply the shared trust model for Fluent app work, ATF, and future ServiceNow security or CI/CD tasks. Use when Codex needs a compact starting point for ServiceNow development before choosing a narrower skill.
---

# ServiceNow Common

## Purpose

Use this skill as the narrow entrypoint for general ServiceNow work.

It should help decide which more specific skill to use without loading every ServiceNow reference at once.

## Routing

- Use `servicenow-fluent-app` for:
  - `UiPage`
  - `BusinessRule`
  - `ApplicationMenu`
  - `sys_app_module`
  - server modules
  - local build/deploy with `now-sdk`
- Use `servicenow-atf` for:
  - ATF test authoring
  - runner choice
  - browser-vs-server execution decisions
  - ATF debugging
- Reserve future skills for:
  - security and ACL modeling
  - CI/CD pipelines
  - integrations

## Shared rules

- Start with curated guidance, not upstream vendor docs.
- Keep the reusable ServiceNow rules in skills and their `references/` files. Keep repo-local examples and instance notes in the project repo.
- Treat cached research as a convenience layer, not a source of unquestioned truth.
- For runtime questions, trust the ServiceNow instance over static docs.
- Keep business logic server-side where possible so testing and debugging stay tractable.

## Reference

Read [references/service-model.md](references/service-model.md) before choosing a deeper ServiceNow path.
