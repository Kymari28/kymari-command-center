import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("inline dashboard JavaScript parses", () => {
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, "inline script is missing");
  assert.doesNotThrow(() => new vm.Script(script));
});

test("HTML ids are unique", () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  assert.deepEqual([...new Set(duplicates)], []);
});

test("routing and recovery controls stay present", () => {
  for (const marker of [
    'name="autoAssign"',
    'id="ed-route-note"',
    'data-act="retry-sync"',
    'data-act="backup"',
    "Shared inbox needs attention"
  ]) assert.ok(html.includes(marker), `missing ${marker}`);
});

test("product copy has no em dashes or embedded API keys", () => {
  assert.equal(html.includes("—"), false);
  assert.equal(/\bsk-[A-Za-z0-9_-]{12,}/.test(html), false);
  assert.equal(/\bAIza[A-Za-z0-9_-]{12,}/.test(html), false);
});

test("new-window links prevent opener access", () => {
  const links = [...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].map((match) => match[0]);
  assert.ok(links.length > 0);
  links.forEach((link) => assert.match(link, /rel="noopener"/));
});

test("hidden elements cannot be forced visible by component CSS", () => {
  assert.match(html, /\[hidden\]\{display:none!important\}/);
});
