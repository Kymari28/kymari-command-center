# Kymari's Command Center

This repository contains Kymari's personal command center as a standalone web application. It is intentionally separate from the portfolio repository.

## Current baseline

- `index.html` is the untouched HTML export from the Claude Artifact.
- Outside Claude, task data falls back to browser-local storage.
- Claude-specific database and model features only work inside the Claude Artifact host.

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
