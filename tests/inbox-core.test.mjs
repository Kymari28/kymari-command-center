import test from "node:test";
import assert from "node:assert/strict";
import { approvalRequired, codexBrief, createTask, recommendAgent, updateTask } from "../src/inbox-core.mjs";

const now = new Date("2026-11-19T20:00:00.000Z");

test("creates a normalized task with an audit event", () => {
  const task = createTask({ title: "Tailor resume", area: "job" }, "test", now);
  assert.equal(task.status, "someday");
  assert.equal(task.owner, "me");
  assert.equal(task.audit[0].event, "created");
});

test("detects approval-gated actions", () => {
  assert.equal(approvalRequired(["research", "submit_application_or_form"]), true);
  assert.equal(approvalRequired(["research", "draft"]), false);
});

test("routes specialist work and records a plain-language reason", () => {
  assert.equal(recommendAgent({ title: "Fix the portfolio API" }).owner, "codex");
  assert.equal(recommendAgent({ title: "Update my Google Sheet" }).owner, "gemini");
  assert.equal(recommendAgent({ title: "Plan three posts", area: "social" }).owner, "chatgpt");
  const task = createTask({ title: "Fix the portfolio", repo: "owner/repo", autoAssign: true }, "test", now);
  assert.equal(task.owner, "codex");
  assert.match(task.routingReason, /Codex/);
});

test("keeps a manual owner when automatic assignment is off", () => {
  const task = createTask({ title: "Fix the portfolio", repo: "owner/repo", owner: "claude", autoAssign: false }, "test", now);
  assert.equal(task.owner, "claude");
  assert.equal(task.recommendedOwner, "codex");
});

test("records assignment, progress, blocker, and result", () => {
  let task = createTask({ title: "Fix dashboard", repo: "https://github.com/example/repo" }, "test", now);
  task = updateTask(task, { owner: "codex", status: "agent" }, "codex", new Date("2026-11-19T20:01:00.000Z"));
  assert.equal(task.status, "agent");
  assert.ok(task.assignedAt);
  task = updateTask(task, { progressNote: "Tests are running" }, "codex", new Date("2026-11-19T20:02:00.000Z"));
  assert.ok(task.lastProgressAt);
  task = updateTask(task, { status: "others", blocker: "Need the API contract" }, "codex", new Date("2026-11-19T20:03:00.000Z"));
  assert.equal(task.blocker, "Need the API contract");
  task = updateTask(task, { status: "review", resultUrl: "https://github.com/example/repo/pull/4", resultNote: "Ready for review" }, "codex", new Date("2026-11-19T20:04:00.000Z"));
  assert.equal(task.resultUrl, "https://github.com/example/repo/pull/4");
  assert.equal(task.status, "review");
});

test("Codex brief requires a repository and preserves safety gates", () => {
  const withoutRepo = createTask({ title: "Fix dashboard" }, "test", now);
  assert.throws(() => codexBrief(withoutRepo), /repo is required/);
  const task = createTask({
    title: "Fix dashboard",
    repo: "https://github.com/example/repo",
    plannedActions: ["merge_pull_request"]
  }, "test", now);
  const brief = codexBrief(task);
  assert.match(brief, /approval gate/);
  assert.match(brief, /Do not merge/);
});

test("rejects stale updates", () => {
  const task = createTask({ title: "Fix dashboard" }, "test", now);
  assert.throws(() => updateTask(task, { version: task.version + 1, notes: "stale" }, "test", now), /changed since/);
});

test("agents cannot remove approval gates or finish gated work", () => {
  const task = createTask({ title: "Submit application", approvalRequired: true }, "dashboard", now);
  assert.throws(() => updateTask(task, { approvalRequired: false }, "codex-cli", now), /only the dashboard/);
  assert.throws(() => updateTask(task, { status: "done" }, "codex-cli", now), /return to review/);
  assert.equal(updateTask(task, { status: "done" }, "dashboard", now).status, "done");
});

test("rejects non-web links from inbox clients", () => {
  assert.throws(() => createTask({ title: "Unsafe link", resultUrl: "javascript:alert(1)" }, "test", now), /http or https/);
});
