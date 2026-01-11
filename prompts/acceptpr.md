---
description: Land one PR end-to-end (fix/tests/changelog/gate/merge)
argument-hint: |
  Required: PR number or URL
---

# /acceptpr

Args: `$1` = PR number or URL (required).

Input: PR number or URL (required). Default merge mode: rebase.

0) Guardrails
- Must end on `main` (or repo default branch if no `main`).
- `git status -sb` clean before/after. No uncommitted changes.
- If PR is draft, has conflicts, or base branch != `main`: stop + ask.
- If PR is from a fork and you can’t push: stop + ask.
- If the user did not explicitly ask you to push/merge: stop + ask before pushing/merging.

1) Capture context
- `START_BRANCH="$(git branch --show-current)"`
- `gh pr view <PR> --json number,title,author,baseRefName,headRefName,isDraft,mergeable,maintainerCanModify`
- Skim: `gh pr view <PR> --comments` and `gh pr diff <PR>`

2) Checkout + suggested fixes
- `gh pr checkout <PR>`
- Apply fixes (and tests if needed). Keep edits minimal; follow repo conventions.
- Commit with explicit paths (no `git add .`), then push: `git push origin HEAD`

3) Changelog (and thank contributor)
- Edit `CHANGELOG.md` (or project changelog file).
- Add entry under the top “Unreleased” section (match existing style).
- Include PR + thanks, e.g.: `- <short change> (#<num>) — thanks @<author>`
- Commit + push changelog if it changed.

4) Lint / gate
- Run the repo’s gate (lint/typecheck/tests/docs) using existing scripts.
- If there’s no obvious target, search for likely commands:
  - `rg -n "lint|typecheck|test|check|ci|gate|biome|eslint|swiftlint|ruff" package.json Makefile scripts -S`

5) Merge (then delete PR branch)
- Prefer rebase merge: `gh pr merge <PR> --rebase --delete-branch`
- If rebase is disallowed, fallback to repo preference (`--merge` or `--squash`).

6) Sync `main` + exit clean
- `git checkout main || git checkout "$(git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@')"`
- `git pull --ff-only`
- Verify merged: `gh pr view <PR> --json mergedAt,mergeCommit`
- `git status -sb` (clean) + ensure you’re on `main`.
