---
description: Update an existing REPO_GUIDE.md to match current repo state
argument-hint: |
  Optional: focus area(s) or constraints (e.g. "only build/run section", "new architecture only")
---

# /repo-guide-update

Args: `$@` optional focus area(s) or constraints (e.g. "only build/run section", "new architecture only"). If omitted, update all stale parts.

Goal: update `REPO_GUIDE.md` to reflect current reality (refactors, new features, API changes, new tooling), without rewriting it from scratch.

Steps
1) Read `REPO_GUIDE.md` first and preserve its structure/headings.
2) Validate each section against the repo:
- Scripts/config: `package.json`, `Makefile`, `justfile`, `Cargo.toml`, `pyproject.toml`, CI workflows, etc.
- Entry points: main binaries/services, CLI entrypoints, server start, infra entrypoints.
- Directory structure + key modules: confirm names and responsibilities still match.
3) Edit only what’s stale:
- Fix incorrect paths/commands.
- Add new key files/modules; remove obsolete ones.
- Update Gotchas when new requirements appear.
4) Keep it concise and factual. No emojis.

Preserve these sections (don’t rename; update content):
1. **Overview**
2. **Tech Stack**
3. **Directory Structure**
4. **Key Files**
5. **Build & Run**
6. **Architecture**
7. **Gotchas**

