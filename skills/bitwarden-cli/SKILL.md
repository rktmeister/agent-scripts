---
name: bitwarden-cli
description: Use Bitwarden Password Manager CLI (`bw`) safely for vault access (login/unlock/BW_SESSION), search/get/list, org support, and self-hosted server config. Use tmux sockets for any multi-command session so `BW_SESSION` persists.
---

# Bitwarden CLI (`bw`)

Args: search term/URL → pick item id → fetch by id.

Use this when interacting with Bitwarden via the CLI (Linux `bw` is already installed here via snap: `/snap/bin/bw`).

## Core idea (why tmux socket)

`BW_SESSION` (the session key) does not persist across new terminal sessions. In this harness, each command runs in a fresh shell, so you must either:
- run all `bw` operations inside one tmux session (recommended), or
- pass `--session <key>` to every command (avoid; easy to leak).

For anything beyond a one-off `bw status`, use a dedicated tmux socket.

## Setup / preflight

- Verify CLI: `bw --version`
- If using EU cloud or self-hosted, set server before login:
  - Show current: `bw config server`
  - Set: `bw config server https://your.bw.domain.com`
- Optional (Zsh completion):
  - `eval "$(bw completion --shell zsh); compdef _bw bw;"`

## Dedicated tmux socket (recommended)

Use an isolated tmux server so you don’t collide with your normal tmux.

```bash
SOCKET_DIR="${CODEX_TMUX_SOCKET_DIR:-${TMPDIR:-/tmp}/codex-tmux-sockets}"
mkdir -p "$SOCKET_DIR"
SOCKET="$SOCKET_DIR/bw.sock"
SESSION="bw-$(date +%Y%m%d-%H%M%S)"

tmux -S "$SOCKET" new -d -s "$SESSION" -n shell
tmux -S "$SOCKET" attach -t "$SESSION"
```

Inside that tmux session, do all `bw` work.

## Login (interactive)

Recommended for interactive use:

```bash
bw login
```

## Unlock + session key

Unlock returns a session key. Prefer `--raw` and keep it in-session only:

```bash
export BW_SESSION="$(bw unlock --raw)"
```

When finished:

```bash
bw lock   # invalidates session key
```

## Common commands (run after unlock)

```bash
bw status
bw sync

# Golden path when multiple matches exist:
# 1) list candidates -> 2) pick an id -> 3) get by exact id
#
# Note: `bw get <field> <string>` can only return one result; if multiple match, it errors.

# List candidates (JSON) and print a compact table (requires jq)
bw list items --search "github" \
  | jq -r '.[] | "\(.id)\t\(.name)\t\(.login.uris[0].uri // "")"'

# URL-scoped search can be cleaner for logins
bw list items --url "https://github.com" \
  | jq -r '.[] | "\(.id)\t\(.name)"'

# Fetch secrets by exact item id (be careful: these print secrets)
bw get username "<item-id>"
bw get password "<item-id>"
bw get totp "<item-id>"

# Safer inspection (avoid dumping fields/notes/FIDO2/etc.)
# Whitelist only the metadata you need to confirm you picked the right item:
bw get item "<item-id>" \
  | jq '{id,name,type,organizationId,folderId,collectionIds,login:{username:(.login.username // null),uris:(.login.uris // [] | map(.uri // ""))}} | with_entries(select(.value != null))'
```

## Automation notes (only when asked)

- API key login (for automation):
  - `bw login --apikey` (or set `BW_CLIENTID` + `BW_CLIENTSECRET`)
  - still requires master password to `bw unlock --raw` for decrypted vault data (unless org uses Key Connector).
- Never write master password to disk; avoid `--passwordfile` unless user explicitly opts in and understands the risk.
- Do not print `BW_SESSION` or paste it into chat/logs.
