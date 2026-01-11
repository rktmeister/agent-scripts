# Skills

Agent skills (Agent Skills spec) live under `./<name>/SKILL.md`.

These are intended to be the **symlink target**, with harness directories pointing here:
- Pi: `~/.pi/agent/skills` → `~/agent-scripts/skills`
- Codex: `~/.codex/skills` → `~/agent-scripts/skills`
- Claude: `~/.claude/skills` → `~/agent-scripts/skills`

If you see “name collision” warnings in Pi, it’s usually because the same skill name exists in multiple scanned roots (global + project-local).
