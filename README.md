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

## browser-tools

Chrome DevTools automation via CLI.

```
browser-tools start [--port 9222]     Start Chrome with remote debugging
browser-tools nav <url>               Navigate to URL
browser-tools eval '<js>'             Execute JavaScript in page
browser-tools screenshot [file]       Capture viewport as PNG
browser-tools pick                    Interactive element picker
browser-tools console [--follow]      Monitor console logs
browser-tools search <query>          Google search
browser-tools content <url>           Extract page content as markdown
browser-tools tabs                    List open tabs
browser-tools kill                    Kill Chrome processes
```

## committer

Commit helper (stages exactly the paths you list; rejects `.`).

```bash
committer "feat: message" path/to/file1 path/to/file2
committer --force "fix: message" path/to/file   # clears stale .git/index.lock if needed
```

Source: `scripts/committer` (copied into `bin/committer` by `bun run build`).

## prompts

Prompt templates live in `./prompts/*.md`.

## skills

Agent skills live in `./skills/**/SKILL.md`.

## Adding new tools

1. Create `<tool-name>.ts` in repo root
2. Add dependencies to package.json if needed
3. Document commands in this README
4. Run `bun run build && bun run install-bin`

## Credits

- Inspired by @steipete’s agent-scripts repo and guardrails-first workflow: https://github.com/steipete/agent-scripts
