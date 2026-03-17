---
name: browser-tools
description: Chrome DevTools automation via CLI. Use when you need to control a browser, navigate pages, execute JavaScript, take screenshots, extract content, or test web applications.
---

# Browser Tools

Args: none.

Lightweight Chrome DevTools automation without MCP. Uses Chrome's remote debugging protocol.

## Commands

```bash
browser-tools start [--port 9222] [--profile] [--profile-source <path>] [--profile-dir <path>] [--profile-directory <name>]
browser-tools nav <url>                               # Navigate to URL
browser-tools eval [--pretty-print] '<js>'            # Execute JavaScript in page context
browser-tools screenshot                              # Capture viewport as PNG to a temp file
browser-tools pick <message...>                       # Interactive element picker
browser-tools console [--follow] [--types <list>]    # Monitor console logs
browser-tools search [--content] <query...>          # Google search
browser-tools content <url>                          # Extract page content as markdown-like text
browser-tools cookies                                # Dump cookies as JSON
browser-tools inspect [--json]                       # List DevTools Chrome sessions and tabs
browser-tools kill (--all | --ports <list> | --pids <list>) [--force]
```

## Typical Workflow

1. Use a persistent automation profile dir and reuse it across agent runs:
   `browser-tools start --profile-dir "$HOME/.cache/browser-tools/work" --profile-directory <profile-directory>`
2. If the site requires auth and the automation profile has not been seeded yet, copy your existing browser profile once before launch:
   `browser-tools start --profile --profile-directory <profile-directory> --profile-dir "$HOME/.cache/browser-tools/work"`
3. If auto-detection picks the wrong browser user-data dir, set it explicitly:
   `browser-tools start --profile --profile-source <browser-user-data-dir> --profile-directory <profile-directory> --profile-dir "$HOME/.cache/browser-tools/work"`
4. After that one-time copy, keep reusing the same automation profile:
   `browser-tools start --profile-dir "$HOME/.cache/browser-tools/work" --profile-directory <profile-directory>`
5. Navigate and interact:
   `browser-tools nav "https://example.com"`
   `browser-tools eval "document.querySelector('button').click()"`
6. Verify:
   `browser-tools screenshot`
   `browser-tools eval "document.title"`

## Notes

- Chrome must be started with `browser-tools start` before other commands work
- Default debugging port is 9222
- `--profile-directory` uses the browser's internal profile directory name, usually `Default` or `Profile 1`, not necessarily the profile label shown in the UI
- The default profile dir is `~/.cache/scraping`; using the same `--profile-dir` across runs preserves browser state
- Prefer the explicit automation profile `~/.cache/browser-tools/work` so every agent uses the same logged-in browser state
- Do not launch multiple Chrome processes against the same profile dir at the same time
- `--profile` copies an existing browser user-data dir into the target `--profile-dir` before launch; use `--profile-source` when auto-detection is wrong or when you want a specific source
- Avoid pointing `--profile-dir` at your live browser config directly; prefer copying it into a dedicated automation dir and reusing that copy
- `inspect` replaces any need for a separate `tabs` command; use it to list matching browser sessions and their open tabs
- `kill` requires `--all`, `--ports <list>`, or `--pids <list>` to select targets; add `--force` to skip the confirmation prompt
- `search --content` fetches readable content for each result; use `content <url>` when you want extraction for one page directly
- Screenshots are always saved to the temp directory, and the path is printed to stdout
- Use `--follow` with console to continuously monitor logs
