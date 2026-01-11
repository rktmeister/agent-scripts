---
description: Curate user-facing CHANGELOG.md entries since last tag
argument-hint: |
  Optional: baseline tag/version (otherwise uses latest git tag)
---

# /update-changelog

Args: optional baseline tag/version in `$1` (otherwise uses latest git tag).

Purpose: curate user-facing changes since the last release tag and record them in `CHANGELOG.md` under `Unreleased`.

## Scope & inputs
- Read the repo’s `AGENTS.md` first (and any release docs like `docs/RELEASING.md`).
- Baseline: use provided baseline; otherwise `git describe --tags --abbrev=0`.
- Target file: `CHANGELOG.md` (repo convention may differ).

## Steps
1) Pick baseline tag
   - `BASELINE="$(git describe --tags --abbrev=0)"`

2) Collect commits since baseline
   - `git log "$BASELINE"..HEAD --oneline --reverse`
   - Skim diffs as needed to understand user-visible impact.

3) Curate entries (user-facing only)
   - Include: shipped features, fixes, breaking changes, notable UX/behavior tweaks.
   - Exclude: internal refactors, typo-only edits, dependency bumps without user impact, changes added then reverted in the same window.
   - Order by impact: breaking → features → fixes → misc.
   - Add PR/issue refs when available (`#123`). Avoid raw commit hashes.

4) Edit `CHANGELOG.md`
   - Ensure there is an `Unreleased` section at the top; create it if missing.
   - Add concise bullets matching the repo’s style (use `backticks` for identifiers).

5) Sanity checks
   - Markdown renders; wording is concise; no duplicates; scope is user-facing.
   - If a release was just cut, start a fresh `Unreleased` section for the next patch cycle.

## Guardrails
- Do not push unless explicitly requested.
