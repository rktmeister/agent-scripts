---
name: browser-tools
description: Chrome DevTools automation via CLI. Use when you need to control a browser, navigate pages, execute JavaScript, take screenshots, extract content, or test web applications.
---

# Browser Tools

Args: none.

Lightweight Chrome DevTools automation without MCP. Uses Chrome's remote debugging protocol.

## Commands

```bash
browser-tools start [--port 9222]     # Start Chrome with remote debugging
browser-tools nav <url>               # Navigate to URL
browser-tools eval '<js>'             # Execute JavaScript in page context
browser-tools screenshot [file]       # Capture viewport as PNG
browser-tools pick                    # Interactive element picker
browser-tools console [--follow]      # Monitor console logs
browser-tools search <query>          # Google search
browser-tools content <url>           # Extract page content as markdown
browser-tools tabs                    # List open tabs
browser-tools cookies                 # Dump cookies as JSON
browser-tools kill                    # Kill Chrome processes
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
- Screenshots are saved to temp directory, path is printed to stdout
- Use `--follow` with console to continuously monitor logs
