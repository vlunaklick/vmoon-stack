# Origin

Fixed source snapshot of https://github.com/michael-denyer/pstack-claude at `2fe2002190bff9257d3e27f84ba6818f2cfd7e32`. Original pstack by Lauren Tan; Claude/Codex port by Michael Denyer. MIT licenses and notices are included.

Local changes: vmoon-mode/vstack-agent names, setup-vstack configuration for host-specific task models, external project notes and checkpoints, local improvement workflows, and user-level symlink installation. Plugin packaging, routing hooks, optional Codex command stubs, repository tests, CI, generators and upstream-update machinery are omitted. Runtime helpers remain. No synchronization is configured; this local copy can evolve independently.

Runtime helpers now run through Node.js and tsx installed with npm; Bun bootstrap and lockfile were removed.
