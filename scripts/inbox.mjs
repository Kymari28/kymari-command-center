#!/usr/bin/env node

const base = (process.env.KCC_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const token = process.env.KCC_TOKEN || "";
const [command, id, ...rest] = process.argv.slice(2);

function options(method = "GET", payload) {
  const headers = { "x-kcc-actor": "codex-cli" };
  if (token) headers.authorization = `Bearer ${token}`;
  if (payload) headers["content-type"] = "application/json";
  return { method, headers, body: payload ? JSON.stringify(payload) : undefined };
}

async function request(path, method, payload) {
  const response = await fetch(`${base}${path}`, options(method, payload));
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || `request failed: ${response.status}`);
  return result;
}

function value(flag) {
  const index = rest.indexOf(flag);
  return index >= 0 ? rest[index + 1] : "";
}

function usage() {
  console.log(`Usage:
  node scripts/inbox.mjs list
  node scripts/inbox.mjs brief TASK_ID
  node scripts/inbox.mjs claim TASK_ID
  node scripts/inbox.mjs progress TASK_ID --note "Update"
  node scripts/inbox.mjs block TASK_ID --note "What is needed"
  node scripts/inbox.mjs result TASK_ID --url "PR_URL" --note "Summary"

The server defaults to ${base}. Set KCC_URL and KCC_TOKEN when needed.`);
}

try {
  if (command === "list") {
    const { tasks } = await request("/api/tasks");
    tasks.forEach((task) => console.log(`${task.id}\t${task.status}\t${task.owner}\t${task.title}`));
  } else if (command === "brief" && id) {
    console.log((await request(`/api/tasks/${encodeURIComponent(id)}/codex-brief`)).brief);
  } else if (command === "claim" && id) {
    console.log(JSON.stringify((await request(`/api/tasks/${encodeURIComponent(id)}`, "PATCH", { owner: "codex", status: "agent", blocker: "" })).task, null, 2));
  } else if (command === "progress" && id && value("--note")) {
    console.log(JSON.stringify((await request(`/api/tasks/${encodeURIComponent(id)}`, "PATCH", { progressNote: value("--note") })).task, null, 2));
  } else if (command === "block" && id && value("--note")) {
    console.log(JSON.stringify((await request(`/api/tasks/${encodeURIComponent(id)}`, "PATCH", { status: "others", blocker: value("--note") })).task, null, 2));
  } else if (command === "result" && id && value("--url") && value("--note")) {
    console.log(JSON.stringify((await request(`/api/tasks/${encodeURIComponent(id)}`, "PATCH", { status: "review", resultUrl: value("--url"), resultNote: value("--note"), blocker: "" })).task, null, 2));
  } else {
    usage();
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
