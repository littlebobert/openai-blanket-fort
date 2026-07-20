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

test("Hermes startup keeps Telegram and Discord quiet and private", async () => {
  const [startup, contract] = await Promise.all([
    readFile(new URL("../scripts/start-railway-hermes.sh", import.meta.url), "utf8"),
    readFile(new URL("../generated-apps/AGENTS.md", import.meta.url), "utf8"),
  ]);

  assert.match(startup, /config set display\.tool_progress off/);
  assert.match(startup, /config set display\.interim_assistant_messages false/);
  assert.match(startup, /config set display\.show_commentary false/);
  assert.match(startup, /for platform in telegram discord/);
  for (const setting of [
    "tool_progress",
    "busy_ack_detail",
    "interim_assistant_messages",
    "long_running_notifications",
    "cleanup_progress",
  ]) {
    assert.match(startup, new RegExp(`display\\.platforms\\.\\$\\{platform\\}\\.${setting}`));
  }

  assert.match(startup, /DISCORD_ALLOW_ALL_USERS.*false/);
  assert.match(startup, /DISCORD_REQUIRE_MENTION.*true/);
  assert.match(startup, /DISCORD_IGNORE_NO_MENTION.*true/);
  assert.match(startup, /DISCORD_ALLOW_BOTS.*none/);
  assert.match(startup, /DISCORD_AUTO_THREAD.*true/);
  assert.match(startup, /DISCORD_REACTIONS.*true/);
  assert.match(startup, /DISCORD_ALLOWED_ROLES/);
  assert.match(startup, /no allowed users or roles/);
  assert.match(startup, /MINIAPPS_ROOT.*REPO_ROOT.*generated-apps/);
  assert.doesNotMatch(startup, /DISCORD_BOT_TOKEN=/);
  assert.match(contract, /Telegram and Discord/);
  assert.match(contract, /final chat response/);
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
  assert.match(page, /\/demo\/dinner-wheel/);
  assert.match(page, /hermes-gateway-production-0aaf\.up\.railway\.app/);
  assert.doesNotMatch(page, /ngrok-free\.dev/);
  assert.match(hub, /公開アプリハブ/);
  assert.match(hub, /ミニアプリ/);
  assert.match(hub, /毛布の秘密基地/);
  assert.match(hub, /app\.json/);
  assert.match(hub, /Original prompt/);
  assert.match(hub, /data-copy-en/);
});
