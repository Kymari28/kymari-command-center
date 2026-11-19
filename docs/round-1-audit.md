# Round 1 audit and direction

## Executive recommendation

Focus the current round on task logic, safe autonomy, agent routing, and reliable handoffs. Visual direction is intentionally deferred until Kymari returns with design guidance.

Do not connect paid AI APIs yet. First create a reliable shared task model, a clear routing system, and a safe approval boundary. Direct model calls can come later without rebuilding the task logic again.

## What is already working

- The six task states are understandable: parking lot, now, agent, review, others, and done.
- The three-task limit on the Today view is a useful constraint.
- The task editor already captures area, effort, first step, owner, status, notes, and repository.
- The handoff reply format is structured enough for reliable imports.
- Reduced-motion support is present.
- The focus timer, brain dump, and recurring rhythms support different types of work instead of forcing everything into a single board.
- The current colors feel personal and recognizable.

## Highest-priority problems

### 1. Every area has equal visual weight

Ten area cards appear together, even though the current priorities are:

1. Full-time job
2. Community-college financing
3. Social media

This makes the dashboard describe everything Kymari cares about without helping her decide what deserves attention now.

**Recommendation:** Add a Focus view that surfaces the three priority areas first. Put the remaining areas in a quieter secondary section that can be expanded when needed.

### 2. The visual system competes with the work

The current design stacks several expressive treatments at once:

- rounded display lettering
- handwritten lettering
- thick black borders
- heavy offset shadows
- wood texture
- decorative swirls
- animated insects
- irregular pill shapes
- emojis on nearly every object

Each treatment is charming by itself. Together they create too many visual signals and make the interface feel younger than intended.

**Recommendation:** Keep the moss, cream, pink, and wood accents, but use Inter for nearly all interface text. Reserve one playful typeface for a small brand moment. Use lighter borders, softer shadows, fewer background decorations, and ordinary rounded rectangles for controls.

### 3. The agent connection language overpromises

Claude is live only because the Artifact host supplies its own database and model helpers. ChatGPT, Gemini, and Codex currently use copied prompts and pasted replies. The exported app falls back to browser-local storage, so its data is not shared with the Claude Artifact or other devices.

**Recommendation:** Label the current system as Assisted Handoff. Present direct connections as a later integration level, not as a feature that is already nearly connected.

### 4. Status and ownership are mixed together

`owner` says who should act. `status` says where the task is in the workflow. The current interface changes both during handoffs, but it does not show the last handoff, expected deliverable, source conversation, or whether approval is required.

**Recommendation:** Keep owner and status separate, then add:

- requested output
- assigned time
- last update time
- source link or thread
- approval requirement
- result link or pull request
- error or blocker message

### 5. The board works visually, but not equally well for keyboard and mobile use

The six-column board becomes a wide horizontal scroller on smaller screens. Dragging is optional because tasks can be edited, but the visual design still makes horizontal movement the primary mental model.

**Recommendation:** On small screens, replace the six-column canvas with a status-filtered list. Keep drag and drop as a desktop enhancement.

### 6. Failure states are too quiet

Storage failures and model failures mainly appear as temporary toast messages. A failed save can be easy to miss, and the user does not get a durable recovery action.

**Recommendation:** Add a persistent status center with retry, export backup, last successful sync, and a plain explanation of where data is stored.

## Recommended information architecture

### Primary navigation

1. Focus
2. Tasks
3. Agents
4. Rhythms
5. Areas

Focus replaces Today as the true starting screen. It should show the top three priority areas, the three tasks for today, anything waiting for Kymari, and one calm next action.

### Focus hierarchy

1. One recommended next action
2. Three tasks for today
3. Waiting for Kymari
4. Active agents
5. Priority-area progress
6. Everything else, collapsed

## Recommended agent routing

Routing should be based on the task and available account access, not on assigning work evenly.

| Agent | Best default use | Avoid as the default for |
| --- | --- | --- |
| Codex | Repository work, tests, technical audits, branches, pull requests | Sending applications or publishing content |
| ChatGPT | Orchestration, drafting, job-material tailoring, research synthesis, connected productivity tools | Changes that require a repository unless handed to Codex |
| Gemini | Google Drive, Docs, Sheets, and Google-account workflows | Repository implementation |
| Claude | Work performed inside the existing Artifact, long-form synthesis, task decomposition | Acting as the only source of truth outside Claude |

For the first three priority areas:

- Full-time job: ChatGPT leads planning and tailored materials. Codex handles application tooling and portfolio code. The user approves every submission.
- Community-college financing: ChatGPT or Gemini researches current programs and organizes verified requirements. The user approves applications and financial forms.
- Social media: ChatGPT or Claude drafts and plans. The user approves every public post or message.

## Connection levels

### Level 1: Assisted handoff

This is the current system. It is low-cost and safe, but it requires copy and paste.

### Level 2: Shared task inbox

Recommended next. All agents read and write a shared task record. The dashboard shows assignment, progress, blockers, and results. Human approval remains required for external actions.

### Level 3: Direct model execution

The dashboard calls model APIs through a secure server. This requires API billing, protected credentials, rate limits, logs, and error handling. API keys must never be stored in the browser HTML.

## Recommended implementation rounds

### Round 1: Foundation and approval

- Preserve the current export as the baseline.
- Agree on the calmer visual direction.
- Confirm priority-area behavior.
- Choose a private data and hosting approach.
- Decide whether Level 2 or Level 3 connection is the real target.

### Round 2: Calm interface

- Build the new Focus hierarchy.
- Simplify typography, borders, shadows, controls, and decoration.
- Preserve the palette and a small amount of garden personality.
- Improve small-screen task browsing.

### Round 3: Reliable handoffs

- Add requested output, source link, timestamps, approval, result, and blocker fields.
- Add a clear routing recommendation for each task.
- Add durable sync and recovery states.

### Round 4: Connections

- Connect Codex to repository tasks and pull-request results.
- Add the chosen shared task inbox.
- Add direct ChatGPT, Gemini, or Claude API calls only if the benefit justifies cost and maintenance.

### Round 5: Verification

- Test keyboard use, mobile layouts, saving, imports, failures, and recovery.
- Review every destructive or external action for an approval gate.
- Run a final content and accessibility pass.

## Decisions needed before visual implementation

1. Should the visual target be **calm garden workspace**, **professional with garden accents**, or **mostly professional with one playful moment**?
2. Should the three current priorities stay pinned until Kymari changes them, or rotate automatically from deadlines and waiting work?
3. Is a shared task inbox enough for the next release, or is paid direct API execution required immediately?
4. Should the repository and hosted app remain private by default? This audit recommends yes because the board contains personal plans.

## Scope intentionally not changed yet

- No visual redesign has been applied.
- No model API or credential has been added.
- No hosting platform has been selected.
- No task data has been moved out of Claude.
- No application, message, or post has been submitted.

## Logic implemented in this round

- Added a First Look queue for overdue, due-today, waiting-for-review, and soon-due tasks.
- Kept First Look derived and reversible, so automatic prioritization does not alter workflow status.
- Set the default priority areas to full-time job, community-college financing, and social media.
- Added a written and machine-readable safe-autonomy policy.
- Deferred visual redesign until Kymari provides the next design direction.
