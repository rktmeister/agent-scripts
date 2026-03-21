---
description: Remove inconsistent AI “slop” from the current diff without removing the feature
argument-hint: |
  No args
---

# /remove-slop

Args: none.

Goal: clean up AI-generated slop from the diff against main while preserving the actual feature.

The diff against main is one of, in this order:
- `git dft --cached`
- `git dft`
- `git dft main..HEAD` or `git dft master..HEAD`

AI-generated slop includes:
- Extra comments that a human wouldn't add or is inconsistent with the rest of the file.
- Extra defensive checks or try/catch blocks that are abnormal for that area of the codebase (especially if called by trusted / validated codepaths).
- Variables or functions that are only used a single time right after declaration; prefer inlining.
- Redundant checks/casts inside a function that the caller already handles.
- Any other style that is inconsistent with the file, including using types when the file doesn't.
- Consistency of the changes with `AGENTS.md` requirements.

If `slop-check` is available, use it on changed prose-first docs or user-facing copy to ground the cleanup. Do not apply it blindly to instruction-heavy files such as `AGENTS.md`, prompts, or skills.

Guardrails:
- Do not remove the actual feature.
- Do not `git add` your changes.

Report at the end with only a 1–3 sentence summary of what you changed.
