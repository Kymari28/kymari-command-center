# Kymari's Command Center

This repository contains Kymari's personal command center as a standalone web application. It is intentionally separate from the portfolio repository.

## Current baseline

- `index.html` remains a standalone web application with no framework.
- When opened through the included inbox server, tasks use one shared JSON store instead of browser-local storage.
- When no inbox server or Claude host is available, the app safely falls back to browser-local storage.
- Claude-specific model features still only work inside the Claude Artifact host.

## Working rules

- Changes happen on `codex/` branches.
- Do not merge changes without Kymari's review.
- Keep the app simple and avoid adding frameworks unless the integration genuinely requires one.
- Do not invent metrics, quotes, testimonials, or outcomes.
- Do not use em dashes in product copy.

## First improvement round

The first round focuses on task logic, safe autonomy, AI routing, and reliable handoffs. Visual redesign is deferred until Kymari returns with design direction.

The Today view includes a derived First Look queue. It surfaces overdue, due-today, waiting-for-review, and soon-due tasks without changing their workflow status or taking an external action.

Run the lightweight policy check with:

```sh
node scripts/validate-policy.mjs
```

## Shared inbox

Start the local command center and inbox:

```sh
node server/inbox-server.mjs
```

Then open [http://127.0.0.1:8787](http://127.0.0.1:8787). Tasks saved from that page are written to `data/inbox.json`, which is intentionally ignored by Git.

Run the inbox tests with:

```sh
node --test tests/*.test.mjs
```

## Codex handoff

Codex can use the small inbox command line interface without editing the data file directly:

```sh
node scripts/inbox.mjs list
node scripts/inbox.mjs brief TASK_ID
node scripts/inbox.mjs claim TASK_ID
node scripts/inbox.mjs progress TASK_ID --note "Implemented the storage layer"
node scripts/inbox.mjs block TASK_ID --note "Need a decision on hosting"
node scripts/inbox.mjs result TASK_ID --url "https://github.com/owner/repo/pull/1" --note "Ready for review"
```

See [docs/shared-inbox-and-codex.md](docs/shared-inbox-and-codex.md) for the data model, safety behavior, and hosting boundary.

## Automatic routing and QA

New tasks can be assigned to the best-fit agent with a visible reason. Manual choices always remain available, and routing never starts an external action by itself.

The dashboard also keeps a persistent inbox error message with retry and local backup actions. See [docs/agent-routing-and-qa.md](docs/agent-routing-and-qa.md) for the routing order, safety rules, connection limits, and verification coverage.
