---
name: babysit
description: Watch an open PR, fix failing CI, handle the straightforward review comments, and drive it to a mergeable state. Use after opening a PR when the user wants the agent to shepherd it without re-prompting, or for /babysit.
---

# Babysit a PR

A loop over the `gh` CLI, paced by re-checks.

## When to use

- There's an open PR and the user explicitly wants it kept green.
- The user invokes `/babysit` directly.
- A subagent that opens a PR does NOT babysit. Return to the parent and let the parent decide.

## Steps

1. **Fetch PR state.**

   ```bash
   gh pr view <number> --json number,title,state,mergeable,reviewDecision,statusCheckRollup,mergeStateStatus,comments,reviews
   ```

2. **Triage in priority order.**
   - Merge conflicts (`mergeStateStatus == DIRTY`): run the **fix-merge-conflicts** skill. Force-push only if the branch is yours and not shared.
   - Failing checks (`statusCheckRollup` entries with `conclusion: FAILURE`): run the **fix-ci** skill. Root-cause the failure; fix the underlying code or test; commit; push.
   - Review comments: run the **get-pr-comments** skill for the summary, then act only on feedback you actually agree with. When a comment has a single mechanical answer (a rename, a guard clause, a formatting nit) make the edit and quote the comment in the commit message. When it hinges on a judgement call, or you can't tell what's being asked, don't guess: leave it and reply with what you would have done.
   - Review-bot comments (Bugbot and similar automation): classify fix/dismiss/ask before acting, per [`references/bot-triage.md`](references/bot-triage.md). Ask by default on security, data, and high-severity findings.

3. **Loop.** Pace re-checks by what you're watching:
   - Active CI run: `gh pr checks --watch` blocks until checks finish, so no interval needed.
   - Awaiting reviewer: 20 to 30 min heartbeat.
   - Idle but want to catch new comments: hourly.

   On Claude Code, use the `loop` skill for pacing. On Codex there is no `loop`; re-run the step yourself on a cadence, or use a scheduled task if available.

4. **When to stop.**
   - Build is green, every comment resolved, branch merges cleanly: call it ready.
   - You've run three rounds of fix, push, recheck and it still isn't fully green: stop, summarise what's still broken, and hand control back.
   - The next fix would force a design choice: pause and put it to the user. On Claude Code use `AskUserQuestion`; on Codex ask in plain text.

5. **Report.** Summarize fixes applied, comments addressed, comments deferred (with reason), current PR status. Cite each commit by SHA.

## Hard rules

- Don't rewrite history on a branch others may have pulled. If a rebase or force-push looks necessary, clear it with the user first.
- Don't tweak a test's expected values just to get a pass. Only change an assertion when the behaviour genuinely changed and the assertion was pinned to the old behaviour.
- Never skip hooks (`--no-verify`).
- Never bypass a failing check by marking it as not required.
- `gh pr ready` only when all checks are green and no unresolved review comments remain.

## Cross-refs

- Opening a PR does not start a babysit. It starts only when asked.
- Use `unslop` on any prose you write here (PR comments, commit messages, status reports).
