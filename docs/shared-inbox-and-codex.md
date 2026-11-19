# Shared inbox and Codex handoff

## What this round adds

The command center now has a provider-neutral task inbox. The dashboard and Codex both update the same task record, so the board can show the real handoff state instead of relying on copied notes.

The working loop is:

1. Kymari creates or edits a task in the dashboard.
2. The task records the requested output, source context, repository, and approval requirement.
3. Codex claims the task. Its owner becomes `codex` and its status becomes `agent`.
4. Codex records progress without changing the task's workflow state.
5. If Codex needs input, it records a blocker and moves the task to `others`.
6. When the work is ready, Codex attaches the pull request URL and result summary, then moves the task to `review`.
7. Kymari reviews and decides whether to merge. The agent does not merge.

Every inbox write also adds an audit event with the time, actor, changed fields, and resulting status.

## Task fields

The shared record includes:

- identity: `id`, `title`, `area`
- workflow: `status`, `owner`, `effort`, `firstLook`
- planning: `firstStep`, `due`, `steps`, `notes`
- context: `link`, `repo`, `sourceLink`, `requestedOutput`
- safety: `plannedActions`, `approvalRequired`
- handoff: `assignedAt`, `lastProgressAt`, `progressNote`
- recovery: `blocker`
- result: `resultUrl`, `resultNote`
- integrity: `version`, `createdAt`, `updatedAt`, `doneAt`, `audit`

The server rejects stale versioned updates, invalid statuses, and agent work with no AI owner. A Codex briefing cannot be generated until the task has a repository.

## Local use

Run:

```sh
node server/inbox-server.mjs
```

Open `http://127.0.0.1:8787`. The page automatically detects the inbox API and displays `Shared inbox connected` in the header.

While the page is open, it checks the inbox every 15 seconds so Codex progress, blockers, and results appear without a manual import. Personal view settings remain in browser-local storage and are not treated as task records.

The server uses only Node built-ins. It has no package installation, framework, database account, or model API cost.

The default data file is `data/inbox.json`. It is ignored by Git because tasks can contain private plans, links, and notes. Writes use a temporary file and rename so a partial write does not replace the last valid inbox.

## Authentication and hosting boundary

Local mode listens only on `127.0.0.1`, so it is not exposed to other devices.

For a hosted or multi-device version, put the server behind private authentication and encrypted HTTPS. Set `KCC_TOKEN` only for non-browser agents or a trusted reverse proxy. Do not put that token, a model API key, or a database secret in `index.html`.

Hosting is intentionally not selected in this pull request. Choosing a host creates an external account and a continuing privacy boundary, so Kymari should review that decision first. The inbox contract and Codex workflow can move to a private hosted database later without changing the task model.

## Safety behavior

Urgency may place work in First Look, but it does not remove an approval gate.

The shared task model automatically marks work for approval when its planned actions include sending, submitting, publishing, spending, deleting, changing security or access, sharing sensitive data, merging, committing to main, accepting legal terms, or taking an unclear irreversible action.

Codex briefings always require a feature branch, a pull request, relevant tests, and a stop before merge. A task marked for approval adds a direct instruction to stop before the gated action.

## Recovery

- `GET /api/health` confirms the server and storage path.
- `GET /api/tasks` returns the current inbox and its last update time.
- The audit trail preserves the last 200 events per task.
- A failed dashboard save remains visible in the current page and produces a save error message.
- The JSON store can be backed up while the server is stopped.

## Still left

- Choose a private host if cross-device access is needed.
- Add the other AI providers after their access and approval boundaries are defined.
- Add visual treatment only after design direction is approved.
