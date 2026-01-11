#!/usr/bin/env bash

set -euo pipefail

ts() { date +%Y%m%d-%H%M%S; }

backup_if_needed() {
  local path="$1"
  if [ -L "$path" ]; then
    return 0
  fi
  if [ -e "$path" ]; then
    local backup="${path}.bak-$(ts)"
    mv "$path" "$backup"
    printf 'Backed up %s -> %s\n' "$path" "$backup" >&2
  fi
}

link_path() {
  local source="$1"
  local dest="$2"

  mkdir -p "$(dirname "$dest")"
  backup_if_needed "$dest"
  ln -sfn "$source" "$dest"
  printf 'Linked %s -> %s\n' "$dest" "$(readlink -f "$dest")" >&2
}

ROOT="${HOME}/agent-scripts"

if [ ! -d "$ROOT" ]; then
  printf 'Error: missing %s\n' "$ROOT" >&2
  exit 1
fi

# Codex CLI
link_path "$ROOT/AGENTS.md" "$HOME/.codex/AGENTS.md"
link_path "$ROOT/prompts" "$HOME/.codex/prompts"
link_path "$ROOT/skills" "$HOME/.codex/skills"

# Pi coding agent
mkdir -p "$HOME/.pi/agent"
link_path "$ROOT/AGENTS.md" "$HOME/.pi/agent/AGENTS.md"
link_path "$ROOT/prompts" "$HOME/.pi/agent/prompts"
link_path "$ROOT/skills" "$HOME/.pi/agent/skills"

# Claude Code (skills only; project-local .claude/skills still override per-cwd)
mkdir -p "$HOME/.claude"
link_path "$ROOT/skills" "$HOME/.claude/skills"

printf '\nDone.\n' >&2
