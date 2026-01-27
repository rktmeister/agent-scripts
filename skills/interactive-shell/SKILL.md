---
name: interactive-shell
description: Cheat sheet + workflow for launching interactive coding-agent CLIs (Claude Code, Gemini CLI, Codex CLI, Cursor CLI, and pi itself) via the interactive_shell overlay. The overlay is for interactive supervision only - headless commands should use the bash tool instead.
---

# Interactive Shell (Skill)

Last verified: 2026-01-18

This skill documents usage of pi’s **interactive-shell extension** (tool: `interactive_shell`).

Extension system notes:
- pi can load extensions either from auto-discovery locations **or** via **pi packages**.
- Auto-discovery locations:
  - Global: `~/.pi/agent/extensions/*.ts` or `~/.pi/agent/extensions/*/index.ts`
  - Project: `.pi/extensions/*.ts` or `.pi/extensions/*/index.ts`
- In this setup, `pi-interactive-shell` is installed as a **package** (see `~/.pi/agent/settings.json` → `packages`).
  - Package checkout path: `~/.pi/agent/git/github.com/nicobailon/pi-interactive-shell/`
  - pi loads the extension/tools/skills from that checkout directly (no need for `~/.pi/agent/extensions/interactive-shell/`).

## Foreground vs Background Subagents

Pi has two ways to delegate work to other AI coding agents:

| | Foreground Subagents | Background Subagents |
|---|---|---|
| **Tool** | `interactive_shell` | `subagent` |
| **Visibility** | User sees overlay in real-time | Hidden from user |
| **Default agent** | `pi` (others if user requests) | Pi only |
| **Output** | Minimal (tail preview) | Full output captured |
| **User control** | Can take over anytime | No intervention |
| **Best for** | Long tasks needing supervision | Parallel tasks, structured delegation |

**Foreground subagents** run in an overlay where the user watches (and can intervene). Use `interactive_shell` with `mode: "hands-free"` to monitor while receiving periodic updates.

**Background subagents** run invisibly via the `subagent` tool. Pi-only, but captures full output and supports parallel execution.

## When to Use Foreground Subagents

Use `interactive_shell` (foreground) when:
- The task is **long-running** and the user should see progress
- The user might want to **intervene or guide** the agent
- You want **hands-free monitoring** with periodic status updates
- You need a **different agent's capabilities** (only if user specifies)

Use `subagent` (background) when:
- You need **parallel execution** of multiple tasks
- You want **full output capture** for processing
- The task is **quick and deterministic**
- User doesn't need to see the work happening

### Default Agent Choice

**Default to `pi`** for foreground subagents unless the user explicitly requests a different agent:

| User says | Agent to use |
|---|---|
| "Run this in hands-free" | `pi` |
| "Delegate this task" | `pi` |
| "Use Claude to review this" | `claude` |
| "Have Gemini analyze this" | `gemini` |
| "Run aider to fix this" | `aider` |

Pi is the default because it's already available, has the same capabilities, and maintains consistency. Only use Claude, Gemini, Codex, or other agents when the user specifically asks for them.

## Foreground Subagent Modes

### Interactive (default)
User has full control, types directly into the agent.

```typescript
interactive_shell({ command: 'pi' })
```

### Interactive with Initial Prompt
Agent starts working immediately, user supervises.

```typescript
interactive_shell({ command: 'pi "Review this codebase for security issues"' })
```

### Hands-Free (Foreground Subagent) - NON-BLOCKING
Agent works autonomously, **returns immediately** with sessionId. You query for status/output and kill when done.

```typescript
// 1. Start session - returns immediately
interactive_shell({
  command: 'pi "Fix all TypeScript errors in src/"',
  mode: "hands-free",
  reason: "Fixing TS errors"
})
// Returns: { sessionId: "calm-reef", status: "running" }

// 2. Check status and get new output
interactive_shell({ sessionId: "calm-reef" })
// Returns: { status: "running", output: "...", runtime: 30000 }

// 3. When you see task is complete, kill session
interactive_shell({ sessionId: "calm-reef", kill: true })
// Returns: { status: "killed", output: "final output..." }
```

This is the primary pattern for **foreground subagents** - you delegate to pi (or another agent), query for progress, and decide when the task is done.

## Hands-Free Workflow

### Starting a Session

```typescript
const result = interactive_shell({
  command: 'codex "Review this codebase"',
  mode: "hands-free"
})
// result.details.sessionId = "calm-reef"
// result.details.status = "running"
```

The user sees the overlay immediately. You get control back to continue working.

### Querying Status

```typescript
interactive_shell({ sessionId: "calm-reef" })
```

Returns:
- `status`: "running" | "user-takeover" | "exited" | "killed" | "backgrounded"
- `output`: Last 20 lines of rendered terminal (clean, no TUI animation noise)
- `runtime`: Time elapsed in ms

**Rate limited:** Queries are limited to once every 60 seconds. If you query too soon, the tool will automatically wait until the limit expires before returning. The user is watching the overlay in real-time - you're just checking in periodically.

### Ending a Session

```typescript
interactive_shell({ sessionId: "calm-reef", kill: true })
```

Kill when you see the task is complete in the output. Returns final status and output.

### Fire-and-Forget Tasks

For single-task delegations where you don't need multi-turn interaction, enable auto-exit so the session kills itself when the agent goes quiet:

```typescript
interactive_shell({
  command: 'pi "Review this codebase for security issues. Save your findings to /tmp/security-review.md"',
  mode: "hands-free",
  reason: "Security review",
  handsFree: { autoExitOnQuiet: true }
})
// Session auto-kills after ~5s of quiet
// Read results from file:
// read("/tmp/security-review.md")
```

**Instruct subagent to save results to a file** since the session closes automatically.

### Multi-Turn Sessions (default)

For back-and-forth interaction, leave auto-exit disabled (the default). Query status and kill manually when done:

```typescript
interactive_shell({
  command: 'cursor-agent -f',
  mode: "hands-free",
  reason: "Interactive refactoring"
})

// Send follow-up prompts
interactive_shell({ sessionId: "calm-reef", input: "Now fix the tests\n" })

// Kill when done
interactive_shell({ sessionId: "calm-reef", kill: true })
```

### Sending Input

```typescript
interactive_shell({ sessionId: "calm-reef", input: "/help\n" })
interactive_shell({ sessionId: "calm-reef", inputKeys: ["ctrl+c"] })
interactive_shell({ sessionId: "calm-reef", inputPaste: "multi\nline\ncode" })
interactive_shell({ sessionId: "calm-reef", input: "y", inputKeys: ["enter"] })  // combine text + keys
```

### Query Output

Status queries return **rendered terminal output** (what's actually on screen), not raw stream:
- Default: 20 lines, 5KB max per query
- No TUI animation noise (spinners, progress bars, etc.)
- Configurable via `outputLines` (max: 200) and `outputMaxChars` (max: 50KB)

```typescript
// Get more output when reviewing a session
interactive_shell({ sessionId: "calm-reef", outputLines: 50 })

// Get even more for detailed review
interactive_shell({ sessionId: "calm-reef", outputLines: 100, outputMaxChars: 30000 })
```

### Incremental Reading

Use `incremental: true` to paginate through output without re-reading:

```typescript
// First call: get first 50 lines
interactive_shell({ sessionId: "calm-reef", outputLines: 50, incremental: true })
// → { output: "...", hasMore: true }

// Next call: get next 50 lines (server tracks position)
interactive_shell({ sessionId: "calm-reef", outputLines: 50, incremental: true })
// → { output: "...", hasMore: true }

// Keep calling until hasMore: false
interactive_shell({ sessionId: "calm-reef", outputLines: 50, incremental: true })
// → { output: "...", hasMore: false }
```

The server tracks your read position - just keep calling with `incremental: true` to get the next chunk.

## CLI Quick Reference

| Agent | Interactive | With Prompt | Headless (bash) |
|---|---|---|---|
| `claude` | `claude` | `claude "prompt"` | `claude -p "prompt"` |
| `gemini` | `gemini` | `gemini -i "prompt"` | `gemini "prompt"` |
| `codex` | `codex` | `codex "prompt"` | `codex exec "prompt"` |
| `agent` | `agent` | `agent "prompt"` | `agent -p "prompt"` |
| `pi` | `pi` | `pi "prompt"` | `pi -p "prompt"` |

**Gemini model:** `gemini -m gemini-3-flash-preview -i "prompt"`

## Prompt Packaging Rules

The `reason` parameter is **UI-only** - it's shown in the overlay header but NOT passed to the subprocess.

To give the agent an initial prompt, embed it in the `command`:

```typescript
// WRONG - agent starts idle, reason is just UI text
interactive_shell({ command: 'claude', reason: 'Review the codebase' })

// RIGHT - agent receives the prompt
interactive_shell({ command: 'claude "Review the codebase"', reason: 'Code review' })
```

## Safe TUI Capture

**Never run TUI agents via bash** - they hang even with `--help`. Use `interactive_shell` with `timeout` instead:

```typescript
interactive_shell({
  command: "pi --help",
  mode: "hands-free",
  timeout: 5000  // Auto-kill after 5 seconds
})
```

The process is killed after timeout and captured output is returned in the handoff preview.

## Background Subagent (Contrast)

```typescript
subagent({ agent: "scout", task: "Find all TODO comments" })
```