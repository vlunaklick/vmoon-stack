---
name: reflect
description: Spawn three parallel review subagents over the active transcript, surface learnings, and route each to a concrete edit on an existing skill. Use when the user says reflect.
---

Read and apply the [local runtime policy](../vstack/references/local-policy.md) before this workflow. It governs models, tools, external project storage and authorization.


# Reflect

On Codex, read the [platform mapping](../vstack/references/codex-tools.md), including its per-skill notes, before following this skill.

Mine the current conversation for durable learnings, then route them into skill edits.

## When to invoke

Invoke when the user says "reflect" or "/reflect". Skip when the conversation is trivial, off-topic, or already covered by an existing skill the parent followed correctly. One-offs are not learnings.

## Process

### 1. Locate the active transcript

On Codex, use the current conversation or an explicitly available session transcript. Do not search Claude transcript directories. If the transcript is unavailable, write a digest under STATE_DIR and continue.

The parent finds its own transcript file before fanning out. The system prompt names Claude Code's per-project transcripts directory at `~/.claude/projects/<encoded-cwd>/`; use that path. Do not glob across `~/.claude/projects/`. That crosses workspace boundaries and reads private chats from unrelated projects.

Run the finder at `skills/reflect/scripts/find-transcript.mjs` under the installed collection with the projects directory and a fragment of the conversation's opening user prompt:

```bash
node <vstack-root>/skills/reflect/scripts/find-transcript.mjs ~/.claude/projects/<encoded-cwd> "<opening prompt fragment>"
```

It covers the three layouts (flat `<id>.jsonl`, nested `<id>/<id>.jsonl`, subagent `<parent>/subagents/<child>.jsonl`), newest first, and prints the first path whose opening `user` record carries the fragment. Do not reimplement the scan by hand: the first line of a transcript is session metadata, not a message, and files run to several megabytes, so the finder streams each candidate and stops at its first `user` record. If it exits 1, write a tight digest of the session and pass that instead.

### 2. Spawn three reviewers in parallel

One message, three `Agent` calls, `subagent_type: "general-purpose"`, explicit `model:` on each. Reviewers need MCP access for context lookups (tickets, chat threads, observability traces referenced in the transcript); pick a subagent_type that retains MCP access. The prompt forbids file writes; the parent applies edits.

| Lens | `model` | Prompt template |
|---|---|---|
| Judgment | your configured reflect-judgment model (default in [Models](#models)) | `references/judgment-reviewer.md` |
| Tooling | your configured reflect-tooling model (default in [Models](#models)) | `references/tooling-reviewer.md` |
| Divergent | your configured reflect-judgment model (default in [Models](#models)) | `references/divergent-reviewer.md` |

Pass each template verbatim, substituting the transcript path or digest where marked. Reviewers return findings in the `Agent` response body.

### 3. Synthesize

One `Agent` call, `subagent_type: "general-purpose"`, using your configured reflect-judgment model (default in [Models](#models)). Pick a subagent_type that retains MCP access — the synthesizer's quality check includes spot-verifying citations, which can require MCP access. Use `references/synthesizer.md` verbatim, with each reviewer's full output inlined where marked. The synthesizer returns a structured Accepted / Rejected / Backlog list.

### 4. Structural enforcement check

Sanity-check the synthesizer's Accepted list. For any item that would be enforced more reliably by a lint rule, script, metadata flag, or runtime check, move it from Accepted to Backlog. See the **encode-lessons-in-structure** principle skill.

### 5. Apply

Present the Accepted/Rejected/Backlog findings. If the user's request already asks to apply improvements, apply the relevant generic changes and report the diff. Otherwise ask which proposed edits to apply. Resolve installed symlinks to edit the canonical local collection, not a second copy.

Keep project-specific findings and backlog under STATE_DIR. Never publish backlog issues automatically or include workplace details in portable skills.

For each approved Accepted item, follow the Routing field exactly:

- Trivial existing-skill edit (a one-line bullet, a tightened sentence, a stale fact corrected): parent does directly.
- Substantive existing-skill edit (a new section, a new pattern table, more than ~10 lines): hand to the **plugin-dev:skill-development** skill and run its draft / test / iterate loop.
- `tune description: <skill path>` (the skill exists but didn't trigger when it should have): hand to `plugin-dev:skill-development` and run its description-optimization loop.
- `new skill via plugin-dev:skill-development: <kebab-name>`: hand creation to `plugin-dev:skill-development`. Do not invent the shape ad hoc.

If your environment ships a SKILL.md validator, run it on every touched skill before declaring done. Skip this step if it doesn't.

### 6. Summarize for the user

Short list, no preamble:

- Edits applied: `<skill path>`. What changed, one line each.
- New skills created: `<skill path>`. One line each (rare).
- Backlog saved locally: `<issue title>` (`<tags>`). One line each.
- Dropped: one line per rejected finding + reason from the synthesizer.

## Models

Resolve role models using [setup-vstack](../setup-vstack/SKILL.md) and the shared local policy. Unconfigured roles inherit the session model. Report whether reviewers actually used distinct models.

