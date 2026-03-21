# Agent Scripts

Single source of truth for agent guardrails + reusable prompts/skills + lightweight CLI tools, shared across coding harnesses (Codex CLI, Pi coding agent, Claude Code, etc.).

Heavily inspired by Peter Steinberger’s agent-scripts workflow (@steipete): https://github.com/steipete/agent-scripts

## Setup

```bash
bun install
bun run build
```

Artifacts are built to `./bin`.

Recommended:
- Add `~/agent-scripts/bin` to `PATH`
- Keep `bin/` out of git (this repo’s `.gitignore` does that)

Optional:
- Copy tools into a common bin dir on `PATH` via `bun run install-bin` (defaults to `~/.local/bin/`)

## Harness setup

This repo is designed so harnesses *auto-load* the shared files via symlinks.

Run:

```bash
~/agent-scripts/scripts/link-harnesses.sh
```

### Pi coding agent

Pi loads from `~/.pi/agent/`:
- `AGENTS.md`
- `prompts/*.md`
- `skills/**/SKILL.md`

### Codex CLI

Codex loads from `~/.codex/` (prompts + skills + `AGENTS.md`). The linker script points them to this repo.

### Claude Code

Claude skills live under `~/.claude/skills`. The linker script points that directory to `./skills`.

Note: Pi also scans project-local `.claude/skills` based on your current working directory. If you run `pi` from a directory that contains `.claude/skills`, you may see “name collision” warnings.

## Dotfiles + GNU Stow

If you run `stow --adopt .` in your dotfiles repo, stow may try to pull harness files back into the dotfiles repo.

Recommendation:
- ignore harness-owned paths (e.g. `~/.codex/{AGENTS.md,prompts,skills}`, `~/.claude/skills`) in your stow config
- then run `~/agent-scripts/scripts/link-harnesses.sh` after stow to reassert canonical links

## SSH in sandboxed runs

When running under Linux bubblewrap sandbox, prefer an explicit user SSH config file:

```bash
ssh -F ~/.ssh/config -i "$CODEX_SSH_KEY" -o BatchMode=yes -o ConnectTimeout=10 <host>
```

Why:
- Avoids failures from system config includes like `/etc/ssh/ssh_config.d/*` that can be unreadable in sandboxed contexts
- Keeps host aliases from your own `~/.ssh/config`

Notes:
- Use a host alias that exists in `~/.ssh/config`
- If an alias does not exist, add it there instead of relying on system config

## Build a single tool

```bash
TOOL=browser-tools bun run build:tool
# or directly:
bun build <tool>.ts --compile --outfile bin/<tool>
```

## docs-list

List + sanity-check `docs/**/*.md` in the current repo.

```bash
docs-list
docs-list --docs ./docs --exclude archive --exclude research
```

## trash

Move files/directories to Trash (safer than `rm`).

```bash
trash path/to/file path/to/dir
trash --allow-missing path/that/might/not/exist
```

## slop-check

Wrapper for the `slop-guard` prose linter that avoids the system `sg` name collision.

```bash
slop-check README.md
slop-check -t 60 docs/*.md
slop-check -j draft.md | jq
```

Behavior:
- uses `~/.local/bin/sg` if you installed `slop-guard` persistently with `uv tool install slop-guard`
- otherwise falls back to `uvx --from slop-guard sg ...`
- requires `uv`/`uvx`

## browser-tools

Chrome DevTools automation via CLI.

```bash
browser-tools start [--port 9222]     Start Chrome/Chromium with remote debugging
browser-tools nav <url>               Navigate to URL
browser-tools eval '<js>'             Execute JavaScript in page
browser-tools screenshot [file]       Capture viewport as PNG
browser-tools pick                    Interactive element picker
browser-tools console [--follow]      Monitor console logs
browser-tools search <query>          Google search
browser-tools content <url>           Extract page content as markdown
browser-tools tabs                    List open tabs
browser-tools kill                    Kill Chrome processes
browser-tools start --profile-dir "$HOME/.cache/browser-tools/work" --profile-directory <profile-directory>
browser-tools start --profile --profile-directory <profile-directory> --profile-dir "$HOME/.cache/browser-tools/work"
browser-tools start --profile --profile-source <browser-user-data-dir> --profile-directory <profile-directory> --profile-dir "$HOME/.cache/browser-tools/work"
```

Use the persistent `work` automation profile by default so agents share the same logged-in browser state.

### Seed the persistent agent profile

Seed once by copying the browser user-data dir that contains the profile you want agents to reuse. Use the browser's internal profile directory name, usually `Default` or `Profile 1`, not necessarily the profile label shown in the UI.

One-time seed:

```bash
cd /path/to/agent-scripts
bin/browser-tools start --profile --profile-directory <profile-directory> --profile-dir "$HOME/.cache/browser-tools/work"
```

If auto-detection picks the wrong source browser dir, run:

```bash
cd /path/to/agent-scripts
bin/browser-tools start --profile --profile-source <browser-user-data-dir> --profile-directory <profile-directory> --profile-dir "$HOME/.cache/browser-tools/work"
```

This copies the chosen browser profile into the dedicated agent profile dir `~/.cache/browser-tools/work`.

Steady-state agent launch:

```bash
cd /path/to/agent-scripts
bin/browser-tools start --profile-dir "$HOME/.cache/browser-tools/work" --profile-directory <profile-directory>
```

Notes:
- Reuse `~/.cache/browser-tools/work` for every agent run after the initial seed.
- `--profile-directory` should be the internal profile directory name inside the browser user-data dir, for example `Default` or `Profile 1`.
- Do not point `--profile-dir` at the live browser config; copy it once, then reuse the dedicated automation profile.
- Do not launch multiple Chrome or Chromium processes against the same profile dir at the same time.

## committer

Commit helper (stages exactly the paths you list; rejects `.`).

```bash
committer "feat: message" path/to/file1 path/to/file2
committer --force "fix: message" path/to/file   # clears stale .git/index.lock if needed
```

Source: `scripts/committer` (copied into `bin/committer` by `bun run build`).

## gwt

Create/ensure a dedicated per-branch worktree under `.worktrees/` (one worktree per branch).

```bash
gwt feat/my-branch
cd "$(gwt feat/my-branch)"
```

Optional override:

```bash
GIT_WORKTREES_DIR=~/.worktrees/my-repo gwt feat/my-branch
```

Source: `scripts/gwt` (copied into `bin/gwt` by `bun run build`).

## prompts

Global slash-command prompt templates.

These are intended to be the symlink target, with harness directories pointing here:
- Pi: `~/.pi/agent/prompts` → `~/agent-scripts/prompts`
- Codex: `~/.codex/prompts` → `~/agent-scripts/prompts`

Each `*.md` filename becomes a `/command` (e.g. `pickup.md` → `/pickup`).

Notes:
- Pi only documents `description` in YAML front matter. Extra keys like `argument-hint` are harmless, but may not show in Pi UI.
- For Pi, prefer a short `Args:` line in the prompt body so the model sees it.

Args:
- `$1` = first argument
- `$ARGUMENTS` = all arguments joined
- Prefer `$ARGUMENTS` for cross-harness portability (Codex + Pi).

## skills

Agent skills (Agent Skills spec) live under `./skills/<name>/SKILL.md`.

These are intended to be the **symlink target**, with harness directories pointing here:
- Pi: `~/.pi/agent/skills` → `~/agent-scripts/skills`
- Codex: `~/.codex/skills` → `~/agent-scripts/skills`
- Claude: `~/.claude/skills` → `~/agent-scripts/skills`

If you see “name collision” warnings in Pi, it’s usually because the same skill name exists in multiple scanned roots (global + project-local).

Note: keep non-skill Markdown out of `./skills/` (Pi may interpret it as a skill).

## Adding new tools

1. Create `<tool-name>.ts` in repo root
2. Add dependencies to package.json if needed
3. Document commands in this README
4. Run `bun run build && bun run install-bin`

## Credits

- Inspired by @steipete’s agent-scripts repo and guardrails-first workflow: https://github.com/steipete/agent-scripts
