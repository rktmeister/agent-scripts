---
description: Handoff packet (goal-conditioned checkpoint for new session/agent)
argument-hint: |
  Recommended: next goal for the new thread + any emphasis
  Examples:
    /handoff continue implementation, focus on correctness
    /handoff start a clean thread to fix failing tests
    /handoff write HANDOFF.md and include git status
---

# /handoff

Args: `$@` = goal for the next thread and/or emphasis.

Purpose: produce a **goal-conditioned handoff packet** so the next session/agent can continue without re-discovering context.

Principles:
- Preserve **early constraints/decisions** (do not focus only on recent messages).
- Prefer **actionable state** (paths, commands, error messages, symbols) over narrative.
- Keep it **concise and bounded**; drop noisy details first.
- **Do not leak secrets** (tokens, `.env` contents, private keys, auth files).

## What to do

1) Determine the **handoff goal**
- Use `$@` as the primary goal.
- If `$@` is empty, infer the most likely “next step” goal from the conversation.

2) Extract **scope + status**
- What we were trying to do (original scope)
- What’s done / in progress / blocked

3) Capture **constraints & key decisions**
- Constraints/preferences stated by the user (even if they were early)
- Key decisions made, with brief rationale

4) Capture **operational context (from tool calls/results)**
Include only high-signal items:
- Commands that matter (git/checks/migrations/scripts) and their outcomes
- Failures that matter: command + minimal error snippet (1–5 lines)
- State-changing actions: generated files, config edits, migrations applied

5) Capture **repo state** (if tools are available)
- `git status -sb`
- `git diff --stat` (or `git diff --name-only`)
- Optional: `git log -5 --oneline`
- Branch/PR/CI references if known

6) Capture **files/artifacts**
- List relevant files that were read or modified and why they matter.
- Prefer file paths + symbols (functions/types) over long excerpts.

7) Capture **running processes** (if relevant)
- tmux sessions/panes and how to attach:
  - `tmux list-sessions`
  - `tmux attach -t <session>`
  - `tmux capture-pane -p -J -t <session>:0.0 -S -200`

8) Produce **next steps**
- Ordered checklist (copy/paste commands where possible)

9) Add **risks/gotchas**
- Flaky tests, feature flags, credentials setup steps (without secrets), brittle areas

## Output format (strict)

Write a structured Markdown handoff packet:

- `## Goal`
- `## Constraints & Preferences`
- `## Progress` (Done / In Progress / Blocked)
- `## Key Decisions`
- `## Operational Context` (commands + failures, minimal)
- `## Repo State` (branch, dirty status, PR/CI)
- `## Next Steps`
- `## Risks & Gotchas`

Then append file lists:

<read-files>
(one file path per line)
</read-files>

<modified-files>
(one file path per line)
</modified-files>

If a detail is unknown, say so explicitly instead of guessing.

Optional: if asked in `$@` (e.g. “write HANDOFF.md”), write the final handoff packet to `HANDOFF.md` in the repo root as well.
