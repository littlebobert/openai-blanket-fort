import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Blanket Fort product page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Blanket Fort/);
  assert.match(html, /your group chat builds apps/i);
  assert.match(html, /Hermes Agent/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("landing page and mini-app hub support device-aware Japanese and English", async () => {
  const [page, hub] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../miniapps/server.mjs", import.meta.url), "utf8"),
  ]);

  for (const source of [page, hub]) {
    assert.match(source, /navigator\.language/);
    assert.match(source, /blanket-fort-locale/);
    assert.match(source, /日本語/);
    assert.match(source, /\bEN\b/);
  }

  assert.match(page, /グループチャットが/);
  assert.match(page, /アプリをつくる/);
  assert.match(page, /毛布の秘密基地/);
  assert.match(hub, /公開アプリハブ/);
  assert.match(hub, /ミニアプリ/);
  assert.match(hub, /毛布の秘密基地/);
});
