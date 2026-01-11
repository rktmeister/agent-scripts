# Command Line Interface Guidelines (condensed)

Source + contribution:
- Full guide: https://clig.dev/
- Propose changes: https://github.com/cli-guidelines/cli-guidelines

Table of contents:
- Foreword
- Introduction
- Philosophy
  - Human-first design
  - Simple parts that work together
  - Consistency across programs
  - Saying (just) enough
  - Ease of discovery
  - Conversation as the norm
  - Robustness
  - Empathy
  - Chaos
- Guidelines
  - The Basics
  - Help
  - Documentation
  - Output
  - Errors
  - Arguments and flags
  - Interactivity
  - Subcommands
  - Robustness
  - Future-proofing
  - Signals and control characters
  - Configuration
  - Environment variables
  - Naming
  - Distribution
  - Analytics
  - Further reading
- Authors

This is a practical rubric for designing CLI interfaces (args/flags/subcommands/help/output/errors/config). Keep humans first, but preserve composability and scriptability.

## Foreword

The command line is a primary interface for computers. Good CLI design makes tools enjoyable for people and reliable for automation.

## Introduction

CLIs exist in a spectrum from fully interactive (humans) to fully non-interactive (pipes/scripts). The best tools handle both.

## Philosophy

### Human-first design

Design for humans by default. Provide helpful feedback and make the happy path obvious.

### Simple parts that work together

Follow Unix-style composability: make tools that do one job well and work with pipes and other tools.

### Consistency across programs

Use familiar flag conventions (`-h/--help`, `--version`, `--json`, `--quiet`). Be predictable.

### Saying (just) enough

Prefer concise output. Show what matters, and let users ask for more detail (`--verbose`).

### Ease of discovery

Make help and docs easy to find. Clear `--help` output beats hidden behavior.

### Conversation as the norm

Interactive prompts are fine when stdin is a TTY. Always provide non-interactive alternatives.

### Robustness

Be resilient to partial failures and weird input. Provide stable output formats.

### Empathy

Error messages should help users fix the problem. Don’t blame them for mistakes.

### Chaos

Expect that scripts will be interrupted, piped, truncated, or run in weird environments.

## Guidelines

### The Basics

- Provide a one-line description in `--help`.
- Make the default behavior safe. Provide `--dry-run` for dangerous operations.
- Use exit codes consistently. Treat invalid usage differently from runtime failure.

### Help

- `-h, --help` should be present and always work.
- Show examples for common use cases.
- Group flags logically and keep naming consistent.

### Documentation

- Use `--help` as primary “what does this do?” reference.
- Prefer docs that match the installed version.

### Output

- Primary output to stdout. Diagnostics/errors to stderr.
- Detect TTY and format accordingly (color, progress).
- Provide machine output (`--json`) when automation is expected.
- Respect `NO_COLOR` and `TERM=dumb`.

### Errors

- Use actionable, specific errors.
- Include context: file paths, attempted command, expected format.
- Prefer "what to do next" over stack traces.
- Avoid failing silently.

### Arguments and flags

- Prefer verbs as subcommands (`init`, `run`, `list`, `get`, `set`).
- Use flags for optional behavior, args for primary objects.
- Don’t require quoting for common cases when avoidable.
- Prefer long descriptive flags; keep short flags for frequently used ones.

### Interactivity

- Only prompt when stdin is a TTY.
- Provide `--no-input` to force non-interactive mode.
- For destructive operations, require an explicit confirmation in non-interactive mode (`--force` or `--confirm=...`).

### Subcommands

- Use subcommands when the tool has distinct verbs or domains.
- Keep shared flags global when possible.

### Robustness

- Handle Ctrl-C cleanly.
- Avoid partial writes; write to temp then rename where possible.
- Make operations idempotent when appropriate.

### Future-proofing

- Don’t break scripts accidentally: stable machine output, backward compatible flags.
- Deprecate with warnings and timelines.

### Signals and control characters

- Don’t emit progress spinners or control characters when not in a TTY.
- Provide `--quiet` and `--verbose`.

### Configuration

- Prefer a clear precedence order: flags > env > project config > user config > defaults.
- Document where config lives.
- Support `XDG_*` locations on Linux when relevant.

### Environment variables

- Use env vars for secrets and defaults (not for required primary inputs).
- Document them in `--help` or docs.

### Naming

- Command names should be short, memorable, and easy to type.
- Avoid collisions with common system commands.

### Distribution

- Provide a single binary when possible, or a clearly documented runtime requirement.
- Make install/uninstall easy.

### Analytics

- Don’t add analytics without explicit user consent and documentation.

### Further reading

- https://clig.dev/

## Authors

These guidelines are adapted from the open CLI Guidelines project.
