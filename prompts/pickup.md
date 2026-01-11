---
description: Pickup checklist (rehydrate repo/task context fast)
argument-hint: |
  Optional: PR number/URL, branch name, or 1-line goal
---

# /pickup

Args: optional context in `$@` (PR number/URL, branch name, 1-line goal).

Purpose: rehydrate context quickly when you start work.

Steps:
1) Read `AGENTS.md` + any relevant docs (run a `docs:list` script if the repo has one).
2) Repo state: `git status -sb`; check for local commits; confirm current branch and intended target branch.
3) PR/CI (if applicable): use `gh`, not a browser:
   - `gh pr view <num|url> --comments --files`
   - `gh pr diff <num|url>`
   - `gh run list` / `gh run view <id>` (if CI is relevant)
4) Running processes: list/attach tmux sessions if needed:
   - `tmux list-sessions`
   - `tmux attach -t <session>` / `tmux capture-pane -p -J -t <session>:0.0 -S -200`
5) Tests/checks: note what last ran (from handoff notes/CI) and what you will run first.
6) Plan next 2–3 actions as bullets and execute.

Output format: concise bullet summary; include copy/paste tmux attach/capture commands when live sessions are present.
