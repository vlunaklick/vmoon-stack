---
name: frontend-workflow
description: Build or change screens, components and frontend interactions. Use for frontend implementation, redesigns or UI fixes; skip backend-only work.
---

# Frontend workflow

Use this as the frontend specialization of vmoon-mode, not a replacement for its feature, bug-fix, verification or model-routing workflow. When invoked directly, read the installed vmoon-mode local policy first.

1. Inspect the existing UI, framework, component library and requested behavior. Reuse established project conventions. For a bug, reproduce the visible failure before changing the design.
2. Inspect the available skill names and descriptions. Read only the relevant skills: one primary design skill for a new design, a framework/component skill when working with that framework, and an animation skill only when motion is requested or needed. Never assume a named skill is installed. If several design skills conflict, select the one best matching the request and explain the choice briefly.
3. Implement the requested UI using the selected instructions. Preserve keyboard navigation, semantic structure, responsive behavior, and loading/error/empty states relevant to the feature. Do not add animation or redesign unrelated screens merely because a skill exists.
4. Verify the actual changed interface with the available browser or UI tools, at relevant viewport sizes. If those tools are unavailable, provide a concrete manual check and state what was not verified. Follow the task's existing tests where useful.
5. Report the visible result, verification and remaining limitations. Save task notes outside the project per vmoon-mode's policy.

Supporting skills can be installed separately or copied alongside this directory inside `specialties/frontend/`. Read their full instructions only when needed. Do not import all frontend instructions into every task.
