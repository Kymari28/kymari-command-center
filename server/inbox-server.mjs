import http from "node:http";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createTask, updateTask, codexBrief } from "../src/inbox-core.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dataFile = resolve(process.env.KCC_DATA_FILE || join(root, "data/inbox.json"));
const host = process.env.KCC_HOST || "127.0.0.1";
const port = Number(process.env.KCC_PORT || 8787);
const token = process.env.KCC_TOKEN || "";
let writes = Promise.resolve();

async function readStore() {
  if (!existsSync(dataFile)) return { version: 1, tasks: [], updatedAt: null };
  const parsed = JSON.parse(await readFile(dataFile, "utf8"));
  return { version: 1, tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [], updatedAt: parsed.updatedAt || null };
}

function saveStore(store) {
  store.updatedAt = new Date().toISOString();
  const snapshot = `${JSON.stringify(store, null, 2)}\n`;
  writes = writes.then(async () => {
    const temporary = `${dataFile}.tmp`;
    await mkdir(dirname(dataFile), { recursive: true });
    await writeFile(temporary, snapshot, "utf8");
    await rename(temporary, dataFile);
  });
  return writes;
}

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "content-type": type, "cache-control": "no-store" });
  res.end(type.startsWith("application/json") ? JSON.stringify(body) : body);
}

async function body(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 1_000_000) throw new Error("request is too large");
  }
  return raw ? JSON.parse(raw) : {};
}

function authorized(req) {
  return !token || req.headers.authorization === `Bearer ${token}`;
}

const store = await readStore();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || host}`);
    if (url.pathname.startsWith("/api/") && !authorized(req)) return send(res, 401, { error: "unauthorized" });
    if (req.method === "GET" && url.pathname === "/api/health") return send(res, 200, { ok: true, storage: dataFile });

    if (req.method === "GET" && url.pathname === "/api/tasks") return send(res, 200, { tasks: store.tasks, updatedAt: store.updatedAt });
    if (req.method === "POST" && url.pathname === "/api/tasks") {
      const task = createTask(await body(req), req.headers["x-kcc-actor"] || "dashboard");
      store.tasks.push(task);
      await saveStore(store);
      return send(res, 201, { task });
    }

    const match = url.pathname.match(/^\/api\/tasks\/([^/]+)(?:\/(codex-brief))?$/);
    if (match) {
      const id = decodeURIComponent(match[1]);
      const index = store.tasks.findIndex((task) => task.id === id);
      if (index < 0) return send(res, 404, { error: "task not found" });
      if (req.method === "GET" && match[2] === "codex-brief") return send(res, 200, { brief: codexBrief(store.tasks[index]) });
      if (req.method === "GET" && !match[2]) return send(res, 200, { task: store.tasks[index] });
      if (req.method === "PATCH" && !match[2]) {
        const task = updateTask(store.tasks[index], await body(req), req.headers["x-kcc-actor"] || "dashboard");
        store.tasks[index] = task;
        await saveStore(store);
        return send(res, 200, { task });
      }
      if (req.method === "DELETE" && !match[2]) {
        if (req.headers["x-kcc-confirm-delete"] !== id) return send(res, 400, { error: "delete confirmation does not match task id" });
        store.tasks.splice(index, 1);
        await saveStore(store);
        return send(res, 200, { deleted: id });
      }
    }

    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      return send(res, 200, await readFile(join(root, "index.html"), "utf8"), "text/html; charset=utf-8");
    }
    if (req.method === "GET" && url.pathname === "/config/supabase.js") {
      return send(res, 200, await readFile(join(root, "config/supabase.js"), "utf8"), "text/javascript; charset=utf-8");
    }
    const asset = req.method === "GET" && /^\/assets\/([a-z0-9-]+\.(webp|woff2))$/.exec(url.pathname);
    if (asset) {
      try { return send(res, 200, await readFile(join(root, "assets", asset[1])), asset[2] === "woff2" ? "font/woff2" : "image/webp"); }
      catch { return send(res, 404, { error: "not found" }); }
    }
    return send(res, 404, { error: "not found" });
  } catch (error) {
    const status = /not found/.test(error.message) ? 404 : /changed since/.test(error.message) ? 409 : 400;
    return send(res, status, { error: error.message });
  }
});

server.listen(port, host, () => {
  console.log(`Kymari's Command Center: http://${host}:${port}`);
  console.log(`Shared inbox: ${dataFile}`);
});
