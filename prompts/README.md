# Prompts

Global slash-command prompt templates.

These are intended to be the **symlink target**, with harness directories pointing here:
- Pi: `~/.pi/agent/prompts` → `~/agent-scripts/prompts`
- Codex: `~/.codex/prompts` → `~/agent-scripts/prompts`

Each `*.md` filename becomes a `/command` (e.g. `pickup.md` → `/pickup`).

Notes:
- Pi only documents `description` in YAML front matter. Extra keys like `argument-hint` are harmless, but may not show in Pi UI.
- For Pi, prefer a short `Args:` line in the prompt body so the model sees it.

Args:
- `$1` = first argument
- `$@` = all arguments joined
