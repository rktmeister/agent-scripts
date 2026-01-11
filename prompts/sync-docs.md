---
description: Docs hygiene loop (front matter + read_when + docs-list clean)
argument-hint: |
  Optional: list of docs files you touched
---

# /sync-docs

Args: optional list of docs files you touched in `$@`.

Goal: keep `docs/` discoverable and `docs-list` clean after doc changes.

0) Scope
- Only touch docs needed for this task. No rewrites for style.

1) Inventory
- Run `docs-list` at repo root (or the repo’s `docs:list` script if it exists).
- Identify docs that are missing YAML front matter or have missing/empty `summary`.

2) Fix front matter (minimum required)
- For each doc in `docs/`:
  - Add YAML front matter with:
    - `summary`: one sentence describing the doc
    - `read_when`: 1–5 bullets for when this doc should be read (trigger phrases)
- Keep the rest of the content unchanged unless it’s outdated for the current task.

3) Update `read_when` hints (high leverage)
- If you touched a subsystem and there’s no obvious doc for it, add a new doc with a tight `summary` and concrete `read_when` triggers.
- If a doc is cross-cutting, add a `read_when` hint that points future work at it (“Touching auth tokens”, “Editing CI/gates”, “Changing DB schema”, etc.).

4) Verify
- Re-run `docs-list` and ensure output is clean (no missing front matter / missing summary).

Guardrail: do not push unless explicitly requested.
