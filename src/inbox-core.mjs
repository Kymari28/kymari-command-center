import { randomUUID } from "node:crypto";

export const STATUSES = ["someday", "now", "agent", "review", "others", "done"];
export const AREAS = ["job", "social", "connect", "portfolio", "mindful", "cruise", "passive", "college", "fellow", "grad"];
export const OWNERS = ["me", "codex", "chatgpt", "gemini", "claude"];

const REQUIRED_APPROVAL_ACTIONS = new Set([
  "send_message",
  "submit_application_or_form",
  "publish_or_schedule_content",
  "spend_or_commit_money",
  "delete_data",
  "change_password_or_security",
  "change_access_or_permissions",
  "share_sensitive_data",
  "merge_pull_request",
  "commit_to_main",
  "accept_legal_or_attestation_terms",
  "take_unclear_irreversible_action"
]);

const TRANSITIONS = {
  someday: new Set(STATUSES),
  now: new Set(STATUSES),
  agent: new Set(["agent", "review", "others", "done", "now"]),
  review: new Set(["review", "agent", "others", "done", "now", "someday"]),
  others: new Set(["others", "agent", "review", "done", "now", "someday"]),
  done: new Set(["done", "now", "someday"])
};

function text(value, max = 20000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isoNow(now = new Date()) {
  return now.toISOString();
}

function isWebUrl(value) {
  if (!value) return true;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}

function cleanSteps(steps) {
  return Array.isArray(steps)
    ? steps.slice(0, 100).map((step) => typeof step === "string"
      ? { t: text(step, 140), done: false }
      : { t: text(step?.t, 140), done: Boolean(step?.done) }).filter((step) => step.t)
    : [];
}

function cleanAudit(audit) {
  return Array.isArray(audit) ? audit.slice(-200).filter((entry) => entry && typeof entry === "object") : [];
}

export function recommendAgent(input = {}) {
  const haystack = [input.title, input.notes, input.requestedOutput, input.sourceLink, input.link]
    .filter(Boolean).join(" ").toLowerCase();
  if (text(input.repo, 500) || /\b(repo|repository|code|coding|bug|website|api|test|pull request|github|git)\b/.test(haystack)) {
    return { owner: "codex", reason: "Repository, code, testing, or pull request work is best handled by Codex." };
  }
  if (/\b(google drive|google doc|google sheet|gmail|google calendar|google slides)\b/.test(haystack)) {
    return { owner: "gemini", reason: "This task depends on Google workspace context, so Gemini is the best default." };
  }
  if (/\b(artifact|long-form|long form|deep synthesis|qualitative analysis|analyze transcripts|large document)\b/.test(haystack)) {
    return { owner: "claude", reason: "This task calls for long-context synthesis or Artifact work, so Claude is the best default." };
  }
  if (input.area === "social") {
    return { owner: "chatgpt", reason: "ChatGPT is the default for social planning and drafting. Publishing still requires approval." };
  }
  if (input.area === "college") {
    return { owner: "chatgpt", reason: "ChatGPT is the default for organizing verified financing research and requirements." };
  }
  if (input.area === "job") {
    return { owner: "chatgpt", reason: "ChatGPT is the default for job planning and tailored materials. Submissions still require approval." };
  }
  return { owner: "chatgpt", reason: "ChatGPT is the general coordinator when no specialist signal is present." };
}

export function approvalRequired(actions = []) {
  return actions.some((action) => REQUIRED_APPROVAL_ACTIONS.has(action));
}

export function normalizeTask(input = {}, now = new Date()) {
  const createdAt = input.createdAt || isoNow(now);
  const actions = Array.isArray(input.plannedActions) ? input.plannedActions.map((v) => text(v, 80)).filter(Boolean) : [];
  return {
    id: text(input.id, 100) || `t_${randomUUID()}`,
    title: text(input.title, 140),
    area: AREAS.includes(input.area) ? input.area : "job",
    status: STATUSES.includes(input.status) ? input.status : "someday",
    owner: OWNERS.includes(input.owner) ? input.owner : "me",
    autoAssign: input.autoAssign === true,
    recommendedOwner: OWNERS.includes(input.recommendedOwner) ? input.recommendedOwner : "chatgpt",
    routingReason: text(input.routingReason, 500),
    effort: ["tiny", "small", "big"].includes(input.effort) ? input.effort : "small",
    firstStep: text(input.firstStep, 160),
    due: /^\d{4}-\d{2}-\d{2}$/.test(input.due || "") ? input.due : "",
    link: text(input.link, 2000),
    repo: text(input.repo, 500),
    notes: text(input.notes),
    steps: cleanSteps(input.steps),
    order: Number.isFinite(input.order) ? input.order : 0,
    firstLook: Boolean(input.firstLook),
    requestedOutput: text(input.requestedOutput, 2000),
    sourceLink: text(input.sourceLink, 2000),
    approvalRequired: input.approvalRequired === true || approvalRequired(actions),
    plannedActions: actions,
    assignedAt: input.assignedAt || null,
    lastProgressAt: input.lastProgressAt || null,
    progressNote: text(input.progressNote, 2000),
    blocker: text(input.blocker, 2000),
    resultUrl: text(input.resultUrl, 2000),
    resultNote: text(input.resultNote, 4000),
    createdAt,
    updatedAt: input.updatedAt || isoNow(now),
    doneAt: input.doneAt || null,
    version: Number.isInteger(input.version) && input.version > 0 ? input.version : 1,
    audit: cleanAudit(input.audit)
  };
}

export function validateTask(task) {
  const errors = [];
  if (!task.title) errors.push("title is required");
  if (!AREAS.includes(task.area)) errors.push("area is invalid");
  if (!STATUSES.includes(task.status)) errors.push("status is invalid");
  if (!OWNERS.includes(task.owner)) errors.push("owner is invalid");
  if (!isWebUrl(task.link)) errors.push("link must use http or https");
  if (!isWebUrl(task.sourceLink)) errors.push("source link must use http or https");
  if (!isWebUrl(task.resultUrl)) errors.push("result URL must use http or https");
  if (task.status === "agent" && task.owner === "me") errors.push("agent status requires an AI owner");
  return errors;
}

export function createTask(input, actor = "dashboard", now = new Date()) {
  const task = normalizeTask(input, now);
  const recommendation = recommendAgent(task);
  task.recommendedOwner = recommendation.owner;
  task.routingReason = recommendation.reason;
  if (task.autoAssign) task.owner = recommendation.owner;
  task.updatedAt = isoNow(now);
  const errors = validateTask(task);
  if (errors.length) throw new Error(errors.join("; "));
  task.audit.push({ at: isoNow(now), actor, event: "created", status: task.status });
  return task;
}

export function updateTask(existing, patch, actor = "dashboard", now = new Date()) {
  if (!existing) throw new Error("task not found");
  if (patch.id && patch.id !== existing.id) throw new Error("task id cannot change");
  if (patch.version && patch.version !== existing.version) throw new Error("task changed since it was loaded");
  if (existing.approvalRequired && patch.approvalRequired === false && actor !== "dashboard") throw new Error("only the dashboard can remove an approval gate");
  const nextStatus = patch.status || existing.status;
  if (!TRANSITIONS[existing.status]?.has(nextStatus)) throw new Error(`cannot move from ${existing.status} to ${nextStatus}`);

  const next = normalizeTask({ ...existing, ...patch, id: existing.id }, now);
  const recommendation = recommendAgent(next);
  next.recommendedOwner = recommendation.owner;
  next.routingReason = recommendation.reason;
  if (next.autoAssign) next.owner = recommendation.owner;
  if (next.status === "done" && next.approvalRequired && actor !== "dashboard") throw new Error("approval-gated work must return to review");
  next.version = existing.version + 1;
  next.updatedAt = isoNow(now);
  if (next.status === "agent" && (existing.status !== "agent" || existing.owner !== next.owner)) next.assignedAt = isoNow(now);
  if (patch.progressNote) next.lastProgressAt = isoNow(now);
  if (next.status === "done" && existing.status !== "done") next.doneAt = isoNow(now);
  if (next.status !== "done") next.doneAt = null;
  if (next.status !== "others" && patch.blocker === undefined) next.blocker = existing.blocker || "";

  const changed = Object.keys(next).filter((key) => !["audit", "version", "updatedAt"].includes(key) && JSON.stringify(existing[key]) !== JSON.stringify(next[key]));
  next.audit = cleanAudit(existing.audit);
  next.audit.push({ at: isoNow(now), actor, event: "updated", fields: changed, status: next.status });
  const errors = validateTask(next);
  if (errors.length) throw new Error(errors.join("; "));
  return next;
}

export function codexBrief(task) {
  if (!task.repo) throw new Error("repo is required before assigning a Codex task");
  const approval = task.approvalRequired
    ? "This task includes an approval gate. Prepare the work, then stop before the gated action."
    : "No external approval action is currently listed. Still stop before merging or committing to main.";
  return `Codex task from Kymari's command center

Task ID: ${task.id}
Title: ${task.title}
Area: ${task.area}
Repo: ${task.repo}
Requested output: ${task.requestedOutput || "Complete the repository work and open a pull request for review."}
First step: ${task.firstStep || "Inspect the repository and confirm the scope."}
${task.sourceLink ? `Source: ${task.sourceLink}\n` : ""}${task.notes ? `Notes:\n${task.notes}\n` : ""}
Safety: ${approval}

Ground rules:
- Work on a new codex/ branch.
- Never commit to main.
- Do not merge the pull request.
- Run relevant tests and report the exact results.
- Record progress or blockers against task ${task.id}.
- When ready, attach the pull request URL and move the task to review.
- Do not invent metrics, quotes, testimonials, or results.
- Do not use em dashes in product copy.`;
}
