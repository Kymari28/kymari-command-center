import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

test("server supports the Codex handoff lifecycle", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "kcc-inbox-"));
  const dataFile = join(directory, "inbox.json");
  const port = 18787 + Math.floor(Math.random() * 1000);
  const child = spawn(process.execPath, ["server/inbox-server.mjs"], {
    cwd: new URL("..", import.meta.url),
    env: { ...process.env, KCC_PORT: String(port), KCC_DATA_FILE: dataFile },
    stdio: ["ignore", "pipe", "pipe"]
  });
  t.after(() => child.kill());
  await new Promise((resolve, reject) => {
    child.stdout.once("data", resolve);
    child.once("error", reject);
  });
  const base = `http://127.0.0.1:${port}`;
  const create = await fetch(`${base}/api/tasks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "Build inbox", area: "job", repo: "https://github.com/example/repo" })
  });
  assert.equal(create.status, 201);
  let { task } = await create.json();
  const briefResponse = await fetch(`${base}/api/tasks/${task.id}/codex-brief`);
  assert.equal(briefResponse.status, 200);
  assert.match((await briefResponse.json()).brief, /Build inbox/);

  for (const patch of [
    { owner: "codex", status: "agent" },
    { progressNote: "Implemented the storage layer" },
    { status: "others", blocker: "Need review of the API shape" },
    { status: "review", blocker: "", resultUrl: "https://github.com/example/repo/pull/1", resultNote: "Ready for review" }
  ]) {
    const response = await fetch(`${base}/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-kcc-actor": "codex" },
      body: JSON.stringify(patch)
    });
    assert.equal(response.status, 200);
    ({ task } = await response.json());
  }
  assert.equal(task.status, "review");
  assert.equal(task.owner, "codex");
  assert.equal(task.resultUrl, "https://github.com/example/repo/pull/1");
  assert.ok(task.audit.length >= 5);
  const saved = JSON.parse(await readFile(dataFile, "utf8"));
  assert.equal(saved.tasks[0].id, task.id);
});
