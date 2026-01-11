---
description: Summarize PR status fast (diff, reviews, CI, next actions)
argument-hint: |
  Optional: PR number or URL (otherwise uses current-branch PR if available)
---

# /pr-status

Args: optional PR number/URL in `$1` (otherwise uses current-branch PR if available).

Goal: produce a concise PR status snapshot and the next 2–5 actions.

1) Working tree + branch
- `git status -sb`
- `git branch --show-current`

2) Identify PR
- If PR number/URL provided: use that.
- Else try current-branch PR:
  - `gh pr view --json number,title,author,baseRefName,headRefName,isDraft,mergeable,reviewDecision,state,url`

3) Read the PR
- `gh pr view <PR> --comments --files`
- `gh pr diff <PR>`

4) CI
- `gh pr checks <PR> --watch=false` (if supported) or:
  - `gh run list -L 10`
  - `gh run view <id>`

5) Summarize
- What changed (1–3 bullets)
- Review state (who/what is blocking)
- CI state (what’s failing, linkable `gh` commands)
- Risk callouts (edge cases, migrations, config changes)
- Next actions (ordered, concrete commands)
