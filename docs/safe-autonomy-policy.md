# Safe autonomy policy

## Goal

Offload as much routine coordination as possible while protecting Kymari's privacy, money, accounts, reputation, opportunities, and control over irreversible actions.

## Default operating rule

Agents may organize, research, draft, analyze, test, prioritize, and prepare work without asking first. Agents must stop before an action creates an external commitment, communicates as Kymari, exposes sensitive information, spends money, changes access, or removes data.

## Allowed automatically

- Read tasks and supporting material that Kymari placed in scope.
- Break work into smaller steps.
- Recommend the best agent for a task.
- Reorder or surface tasks in First Look using the deterministic rules below.
- Move a task into an internal review state.
- Draft emails, posts, applications, forms, documents, and replies without sending them.
- Research deadlines, requirements, programs, jobs, and opportunities.
- Create local files, branches, tests, commits, and pull requests within the assigned repository.
- Run non-destructive checks and tests.
- Record results, blockers, sources, and recommended next actions.
- Suggest calendar blocks without creating events.

## Must wait for Kymari

- Send a message, email, comment, direct message, or outreach.
- Submit a job, school, financial-aid, fellowship, grant, or other application.
- Publish or schedule a social-media post.
- Make a purchase, donation, booking, subscription, or financial commitment.
- Delete cloud or local data.
- Change passwords, account security, repository visibility, sharing, collaborators, or permissions.
- Upload or share sensitive personal, financial, education, employment, medical, or identity information.
- Merge a pull request or commit directly to `main`.
- Accept legal terms or make a representation that Kymari has reviewed information when she has not.
- Take an action where the consequence is unclear or difficult to reverse.

## First Look rules

The dashboard may automatically surface a task in First Look when any of these conditions are true:

1. Kymari pinned it for first look.
2. Its due date has passed.
3. It is due today.
4. Its status is Waiting on me.
5. It is due tomorrow.
6. It is due within three days.

Ties receive a small preference for the current priority areas:

1. Full-time job
2. Community-college financing
3. Social media

First Look is a derived queue. Surfacing a task does not change its workflow status, send anything, or create an external commitment. This makes automatic reprioritization visible and reversible.

## Agent routing rules

- Codex handles repository implementation, tests, technical audits, branches, commits, and pull requests.
- ChatGPT handles orchestration, drafting, job-material tailoring, research synthesis, and connected productivity work.
- Gemini is preferred for work centered on Google Drive, Docs, Sheets, or other Google-account context.
- Claude is preferred for operations that must happen inside the existing Claude Artifact and for task decomposition supported by that host.
- The system may recommend a different agent, but the reason should be recorded on the task.

## Urgent work

Urgency may change where a task appears, but it does not remove approval requirements. An urgent application may move to First Look automatically. It still cannot be submitted without Kymari's approval.

## Audit trail

Every agent result should record:

- what changed
- what was only drafted
- what remains blocked
- which source or account was used
- whether approval is required
- the result link, file, branch, or pull request when applicable
