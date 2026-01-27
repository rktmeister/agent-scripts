---
description: Fix an issue end-to-end (tests, changelog, commit, push, comment, close)
argument-hint: |
  Recommended: issue number/URL + 1-line goal
  Examples:
    /fixissue 1234 fix flaky CI on windows
    /fixissue https://github.com/org/repo/issues/1234 handle empty input
---

# /fixissue

Args: `$1` = issue number/URL (recommended). `$@` = any additional context.

Purpose: fix an issue end-to-end, with regression tests and proper follow-through.

Do (in order):
1) Understand + reproduce
- Restate the issue in 1–2 lines.
- Reproduce locally (or explain why it can’t be reproduced).
- Identify the expected behavior and the minimal fix surface.

2) Implement the fix (take your time)
- Fix it properly; refactor if necessary (within scope).
- Avoid breaking public APIs / persistent formats unless explicitly required.

3) Add regression tests + run them
- Add/update tests that fail before and pass after.
- Run the smallest relevant test set first, then the repo’s canonical gate if available.

4) Changelog
- Add a changelog entry referencing the issue (`#$issue`) if the repo has a changelog.
- If `$1` (issue) isn’t provided, ask for it before changelog/comment/close steps.

5) Commit + sync + push
- Commit via `committer` (include issue reference):
  - `committer "fix: <summary> (#<issue>)" CHANGELOG.md <changed files>`
- Pull/rebase as needed; push your branch.

6) Comment + close
- Comment on the issue with:
  - what changed (high-level)
  - tests run (exact commands)
  - any migration/upgrade notes
- Close the issue (only after confirming fix is merged or the project’s workflow expects closure on push).

Guardrails:
- Don’t leak secrets (tokens, `.env` contents, private keys).
- If the user did not explicitly ask you to push/comment/close: stop and ask before doing those steps.