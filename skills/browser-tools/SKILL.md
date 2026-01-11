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

1. Start Chrome: `browser-tools start`
2. Navigate: `browser-tools nav "https://example.com"`
3. Interact: `browser-tools eval "document.querySelector('button').click()"`
4. Verify: `browser-tools screenshot` or `browser-tools eval "document.title"`

## Notes

- Chrome must be started with `browser-tools start` before other commands work
- Default debugging port is 9222
- Screenshots are saved to temp directory, path is printed to stdout
- Use `--follow` with console to continuously monitor logs
