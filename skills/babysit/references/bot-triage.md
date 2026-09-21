# Review-bot triage

Use this when babysit handles comments from Bugbot or similar review automation. The goal is not to ignore the bot by default. The goal is to stop treating every comment as a required code change.

## Decision rubric

Classify each bot thread before acting:

- `fix`: The comment identifies a plausible correctness, security, privacy, data loss, auth, billing, migration, idempotency, race, or shipped-behavior issue. Fix it, reply with the commit SHA, and resolve the thread.
- `dismiss`: The comment matches a known low-risk noisy pattern, and the current code or context proves the concern does not need a code change. Reply with a short reason and resolve the thread.
- `ask`: The comment is novel, high-severity, security/privacy/data-related, or ambiguous. Ask the user instead of guessing.

When in doubt, ask. Skipping a noisy code-quality comment is cheap; skipping a real data or security bug is not.

## Common dismiss cases

Dismiss only when the evidence is visible in the diff, the PR description, or nearby code:

- Intentional visual or design-system changes the PR description already calls out. Not when the comment is about accessibility, focus, keyboard navigation, or contrast.
- "Unused export" flags for symbols used by a later PR in the same stack. Not when the PR is standalone or the symbol is public API.
- Small deliberate duplication while an old path is being replaced. Not when the duplicated code touches security, billing, or data access.
- A concern already guaranteed by a shared component, framework contract, or type invariant. Not when the invariant is assumed rather than enforced.
- Findings the bot itself later withdraws as false positive, verified locally.

## Ask by default

Never auto-dismiss these, even if a previous PR dismissed something similar:

- Security, privacy, auth, billing, data retention, and permission-boundary findings.
- High-severity findings.
- Migration, schema, idempotency, concurrency, and cross-system behavior findings.
- Comments where the suggested fix is small and clearly reduces risk without changing product intent.

## Verify cheap claims before classifying

If the claim can be checked with one command (run the test the bot says is broken, grep for the symbol it says is unused), run it first. A red run confirms the claim; a green run is the evidence for the dismissal reply.

## Recording patterns

When a dismiss pattern repeats across PRs, add it above in this shape: name, skip when, do not skip when, example signal.
