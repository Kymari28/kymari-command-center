# Agent routing and logic QA

## Automatic assignment

New tasks default to automatic assignment. The router records both the recommended owner and a plain-language reason. Assignment does not mean an agent has started working. A task moves to `agent` only when it is actually handed off or claimed.

The current routing order is:

1. Repository, code, test, website, API, GitHub, or pull request work goes to Codex.
2. Google Drive, Docs, Sheets, Gmail, Calendar, or Slides work goes to Gemini.
3. Artifact and long-context synthesis work goes to Claude.
4. Social media planning, community-college financing organization, and full-time job materials go to ChatGPT.
5. ChatGPT coordinates tasks with no specialist signal.

Kymari can turn automatic assignment off and choose an owner manually. A manual handoff locks in that choice so a later inbox update cannot silently reroute it.

## Safety checks

- Automatic assignment never submits, sends, publishes, purchases, deletes, merges, or changes access.
- Routing changes the owner only. It does not mark the task as actively being worked.
- Only the dashboard can remove an existing approval gate.
- An agent cannot mark approval-gated work done. It must return the task for review.
- Inbox deletion requires a confirmation header that matches the exact task id.
- Stale versioned writes return a conflict instead of overwriting newer work.

## Recovery and visibility

The header shows the latest successful shared-inbox contact. If a save or refresh fails, a persistent warning stays visible with two recovery actions:

- Retry the shared inbox connection.
- Download a JSON backup before closing the page.

Backups include tasks, view metadata, and the export time. They are created locally in the browser and do not send data elsewhere.

## Connection truthfulness

- Codex has a direct shared-inbox lifecycle for repository tasks.
- ChatGPT and Gemini remain assisted handoffs until a private authenticated connection is added.
- Claude's Artifact tools remain specific to the Claude host.
- Assignment recommendations do not claim that a provider is currently running.

## Verification coverage

The test suite checks:

- task normalization and audit history
- routing recommendations and manual overrides
- approval-gate enforcement
- assignment, progress, blocker, and result transitions
- stale update protection
- the real local server lifecycle
- dashboard JavaScript syntax
- duplicate HTML ids
- recovery controls
- embedded-key patterns
- em dash policy
- safe new-window links
- reliable hidden-element behavior

Visual redesign remains outside this round. The logic and error-state controls are ready for Kymari's later design direction.
