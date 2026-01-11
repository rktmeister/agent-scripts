---
description: Land PR via temp-branch rebase + full gate before commit
argument-hint: |
  Required: PR number or URL
---

# /landpr

Args: `$1` = PR number or URL (required).

Land PR: rebase onto a temp base branch, fix+tests+changelog, run the full repo gate before commit, commit via `committer`, push updated PR branch, merge PR, sync base, comment with SHAs, verify `MERGED`, delete temp branch.

Input
- PR: `<pr-number-or-url>`

Do (end-to-end)
1) Repo clean: `git status -sb`.

2) Identify PR meta (author + head + base):
- `gh pr view "$1" --json number,title,author,headRefName,baseRefName --jq '{number,title,author:.author.login,head:.headRefName,base:.baseRefName}'`
- `pr=$(gh pr view "$1" --json number --jq .number)`
- `contrib=$(gh pr view "$1" --json author --jq .author.login)`
- `head=$(gh pr view "$1" --json headRefName --jq .headRefName)`
- `base=$(gh pr view "$1" --json baseRefName --jq .baseRefName)`

3) Fast-forward base:
- `git checkout "$base"`
- `git pull --ff-only`

4) Create temp base branch from `$base`:
- `git checkout -b "temp/landpr-$pr"`

5) Check out PR branch locally:
- `gh pr checkout "$pr"`

6) Rebase PR branch onto temp base:
- `git rebase "temp/landpr-$pr"`
- Resolve conflicts; keep history tidy.

7) Fix + tests + changelog:
- Implement fixes + add/adjust tests.
- Update `CHANGELOG.md` and mention `#$pr` + `@$contrib` (if applicable).

8) Full gate (BEFORE commit):
- Prefer the repo’s canonical full gate (`ci`, `gate`, etc.) if it exists.
- Otherwise run the best equivalent for the repo (example for pnpm repos: `pnpm lint && pnpm build && pnpm test`).

9) Commit via `committer` (include `#$pr` + contributor in commit message):
- `committer "fix: <summary> (#$pr) (thanks @$contrib)" CHANGELOG.md <changed files>`
- `land_sha=$(git rev-parse HEAD)`

10) Push updated PR branch (rebase => usually needs force):
- `git push --force-with-lease`

11) Merge PR:
- `gh pr merge "$pr" --merge`

12) Sync `$base` + push:
- `git checkout "$base"`
- `git pull --ff-only`
- `git push`

13) Comment on PR with what we did + SHAs + thanks:
- `merge_sha=$(gh pr view "$pr" --json mergeCommit --jq '.mergeCommit.oid')`
- `gh pr comment "$pr" --body "Landed via temp rebase onto $base.\n\n- Gate: <describe the gate you ran>\n- Land commit: $land_sha\n- Merge commit: $merge_sha\n\nThanks @$contrib!"`

14) Verify PR state == `MERGED`:
- `gh pr view "$pr" --json state --jq .state`

15) Delete temp branch:
- `git branch -d "temp/landpr-$pr"`
- If deletion fails (not merged / not fully integrated): stop and ask before using `-D`.

Guardrails:
- Keep working tree clean throughout (`git status -sb`).
- If the user did not explicitly ask you to push/merge: stop + ask before pushing/merging.
- If unsure what the gate is: find the repo’s canonical “ci/gate” script and run that (don’t invent).
