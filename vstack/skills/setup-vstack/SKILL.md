---
name: setup-vstack
description: Configure vmoon-mode models by task for Claude Code or Codex. Use for initial setup, model preferences, review panels, or changing which available models handle each role.
---

# Setup vstack

Read [local policy](../vmoon-mode/references/local-policy.md). This skill is explicitly authorized to edit the local model configuration when invoked to configure it.

1. Identify the current host: `claude` or `codex`. Inspect the actual delegation tool schema, host configuration and available model list. Do not assume a model exists from a static name, subscription or another machine. If no list is exposed, ask the user for the enabled models. Distinguish selectable parent models from models the host can select for delegates.
2. Read `~/.config/vstack/models.json` if present. Preserve the other host and existing choices. A malformed file must be reported, not silently replaced.
3. Propose a mapping using only accessible models: quick mechanical work for `quick`, implementation for `coding`, harder reasoning for `debugging` and `architecture`, evidence gathering for `investigation`, a list for `review`, and synthesis for `reflection`. Start with `inherit` wherever availability is unknown. Explain that native delegation stays within the active host; it does not launch the other provider's CLI.
4. Ask one concise question about the proposed mapping unless the user has already specified it. Then write the accepted host section in the local JSON file, creating its directory as needed. Do not put it in the project or this distributable repository. Do not write secrets, change the session's selected model, or change host-global settings.
5. Show the saved mapping and identify any choices not yet verified by an actual delegation. If the host cannot select delegate models, explain that the map is advisory and the user must select the session model manually.

## Configuration format

```json
{
  "claude": {
    "default": "inherit",
    "roles": {
      "quick": "inherit",
      "coding": "inherit",
      "debugging": "inherit",
      "architecture": "inherit",
      "investigation": "inherit",
      "review": ["inherit"],
      "reflection": "inherit"
    }
  },
  "codex": {
    "default": "inherit",
    "roles": {}
  }
}
```

A role accepts a model ID/alias supported by that host, or a nonempty list for a panel. `inherit`, `inherit-parent` and `auto` mean omit the model argument, not literal model IDs. No file or no matching role means inherit the selected session model. Do not execute content from the JSON file as commands.

## Routing

- `how`, `why`, `teach`, `recall`: investigation.
- `architect`, design comparisons in `arena`: architecture.
- Feature work, refactoring, implementation workers: coding.
- Bug fixes, performance investigations: debugging.
- `interrogate`, adversarial/code review: review.
- `reflect`, `automate-me`: reflection.
- Explicitly trivial mechanical subtasks: quick.

A mixed workflow resolves the role separately for each stage. The parent stays on its selected model. Use the delegate's model field only if the actual host supports it. If a model is rejected, explain the problem and continue with the session model when that still meets the task; do not silently claim the requested panel ran or rewrite configuration.
