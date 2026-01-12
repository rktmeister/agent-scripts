---
description: Explore repo and write REPO_GUIDE.md (bootstraps future agents)
argument-hint: |
  Optional: focus area(s) or constraints (e.g. "backend only", "docs first", "skip build")
---

# /repo-exploration

Args: `$@` optional focus area(s) or constraints (e.g. "backend only", "docs first", "skip build"). If omitted, do a full repo scan.

Goal: explore this repo efficiently and write a factual, concise `REPO_GUIDE.md` that future agents can read first instead of re-discovering structure every session.

Process
- Start with docs: read `README*`, `docs/**`, and any existing `REPO_GUIDE.md`. If `docs/` exists, run `docs-list` (if available) and open the most relevant docs before scanning code.
- Then explore codebase in parallel where possible (multiple targeted reads/searches; avoid aimless file-walking).
- Prefer primary sources in-repo: config files, package scripts, CI workflows, entry points, and actual module boundaries.
- Keep it maintainable: don’t write a novel; keep it under ~200–300 lines unless the repo is genuinely huge.

Write `REPO_GUIDE.md` with these sections (in this order)
1. **Overview** — what this project does, primary purpose
2. **Tech Stack** — languages, runtimes, frameworks, key dependencies
3. **Directory Structure** — purpose of each top-level directory
4. **Key Files** — entry points, configs, core modules (1-line each)
5. **Build & Run** — dev/build/test/lint/typecheck/deploy commands (use repo’s package manager)
6. **Architecture** — components + data flow; where state lives; boundaries
7. **Gotchas** — env requirements, local tooling, CI quirks, common pitfalls

Constraints
- Keep it factual and concise. No emojis.
- If something is unclear, say so explicitly and point to the file(s) that would need deeper reading.

