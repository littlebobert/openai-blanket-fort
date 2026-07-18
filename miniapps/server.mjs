import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const PORT = Number(process.env.MINIAPPS_PORT || 8787);
const HOST = process.env.MINIAPPS_HOST || "127.0.0.1";
const APPS_ROOT = resolve(
  process.env.MINIAPPS_ROOT || join(process.cwd(), "generated-apps"),
);
const DATA_DIR = join(APPS_ROOT, ".blanket-fort");
const DATA_FILE = join(DATA_DIR, "state.json");
const MAX_BODY_BYTES = 256 * 1024;
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,62}$/;
const ALLOWED_ORIGINS = (process.env.MINIAPPS_ALLOWED_ORIGINS || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

mkdirSync(DATA_DIR, { recursive: true });

function loadDatabase() {
  if (!existsSync(DATA_FILE)) return { apps: {} };
  try {
    const parsed = JSON.parse(readFileSync(DATA_FILE, "utf8"));
    return parsed && typeof parsed === "object" && parsed.apps
      ? parsed
      : { apps: {} };
  } catch {
    return { apps: {} };
  }
}

let database = loadDatabase();

function saveDatabase() {
  const temporary = `${DATA_FILE}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(database, null, 2)}\n`, {
    mode: 0o600,
  });
  renameSync(temporary, DATA_FILE);
}

function appRecord(slug) {
  database.apps[slug] ??= {
    state: {},
    votes: {},
    spins: [],
    updatedAt: new Date().toISOString(),
  };
  return database.apps[slug];
}

function commonHeaders(contentType) {
  return {
    "cache-control": "no-store",
    "content-type": contentType,
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    "x-frame-options": "SAMEORIGIN",
  };
}

function sendJson(response, status, value) {
  response.writeHead(status, commonHeaders("application/json; charset=utf-8"));
  response.end(`${JSON.stringify(value)}\n`);
}

function sendText(response, status, value, contentType = "text/plain; charset=utf-8") {
  response.writeHead(status, commonHeaders(contentType));
  response.end(value);
}

function applyCors(request, response) {
  const origin = String(request.headers.origin || "");
  if (!origin) return;
  if (ALLOWED_ORIGINS.includes("*")) {
    response.setHeader("access-control-allow-origin", "*");
  } else if (ALLOWED_ORIGINS.includes(origin)) {
    response.setHeader("access-control-allow-origin", origin);
    response.setHeader("vary", "Origin");
  } else {
    throw Object.assign(new Error("Origin is not allowed"), { status: 403 });
  }
  response.setHeader("access-control-allow-headers", "Content-Type");
  response.setHeader("access-control-allow-methods", "GET, PUT, POST, OPTIONS");
}

async function readJson(request) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      throw Object.assign(new Error("Request body is too large"), { status: 413 });
    }
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    throw Object.assign(new Error("Request body must be valid JSON"), { status: 400 });
  }
}

function validateSlug(slug) {
  if (!SLUG_PATTERN.test(slug || "")) {
    throw Object.assign(new Error("Invalid app slug"), { status: 400 });
  }
}

function voteSummary(record) {
  return Object.values(record.votes).reduce((summary, vote) => {
    summary[vote.choice] = (summary[vote.choice] || 0) + 1;
    return summary;
  }, {});
}

function publicState(slug, record) {
  return {
    app: slug,
    state: record.state,
    votes: Object.values(record.votes),
    totals: voteSummary(record),
    lastSpin: record.spins.at(-1) || null,
    updatedAt: record.updatedAt,
  };
}

function listApps() {
  return readdirSync(APPS_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .filter((name) => SLUG_PATTERN.test(name))
    .sort();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function localizedField(value, fallback) {
  if (typeof value === "string" && value.trim()) {
    return { en: value.trim(), ja: value.trim() };
  }
  if (value && typeof value === "object") {
    const en = typeof value.en === "string" && value.en.trim() ? value.en.trim() : "";
    const ja = typeof value.ja === "string" && value.ja.trim() ? value.ja.trim() : "";
    if (en || ja) return { en: en || ja, ja: ja || en };
  }
  return { en: fallback, ja: fallback };
}

function appMetadata(slug) {
  const fallbackTitle = slug
    .split("-")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
  let metadata = {};
  const metadataFile = join(APPS_ROOT, slug, "app.json");
  if (existsSync(metadataFile)) {
    try {
      const parsed = JSON.parse(readFileSync(metadataFile, "utf8"));
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        metadata = parsed;
      }
    } catch {
      metadata = {};
    }
  }

  const title = localizedField(metadata.title, fallbackTitle);
  const description = localizedField(metadata.description, `A shared ${fallbackTitle} mini app.`);
  const prompt = localizedField(metadata.prompt, "");
  const emoji =
    typeof metadata.emoji === "string" && metadata.emoji.trim()
      ? metadata.emoji.trim().slice(0, 8)
      : "✦";

  return { slug, title, description, prompt, emoji };
}

function renderIndex() {
  const items = listApps()
    .map(appMetadata)
    .map(({ slug, title, description, prompt, emoji }) => {
      const promptBlock =
        prompt.en || prompt.ja
          ? `<div class="prompt">
              <b data-i18n="promptLabel">Original prompt</b>
              <q data-copy-en="${escapeHtml(prompt.en)}" data-copy-ja="${escapeHtml(prompt.ja)}">${escapeHtml(prompt.en)}</q>
            </div>`
          : "";
      return `<li>
        <a class="app-card" href="/apps/${encodeURIComponent(slug)}/">
          <div class="app-heading">
            <span class="app-emoji" aria-hidden="true">${escapeHtml(emoji)}</span>
            <div>
              <h2 data-copy-en="${escapeHtml(title.en)}" data-copy-ja="${escapeHtml(title.ja)}">${escapeHtml(title.en)}</h2>
              <p data-copy-en="${escapeHtml(description.en)}" data-copy-ja="${escapeHtml(description.ja)}">${escapeHtml(description.en)}</p>
            </div>
          </div>
          ${promptBlock}
          <span class="open" data-i18n="open">Open app →</span>
        </a>
      </li>`;
    })
    .join("");
  return `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Blanket Fort / 毛布の秘密基地 mini apps</title>
<style>
  :root{color-scheme:dark}*{box-sizing:border-box}
  body{font:16px/1.6 system-ui,"Hiragino Sans","Yu Gothic",sans-serif;margin:0;min-height:100vh;padding:clamp(1.5rem,7vw,4rem);background:#17251f;color:#f6edda}
  main{max-width:58rem;margin:auto}.top{display:flex;justify-content:space-between;align-items:center;gap:1rem}
  .brand{font-weight:900}.brand b,.eyebrow,a{color:#c9dd67}
  .switcher{display:flex;align-items:center;gap:.35rem;color:#71857a;font-size:.75rem;font-weight:900}
  button{border:0;background:transparent;color:#71857a;font:inherit;font-weight:900;cursor:pointer;padding:.35rem}
  button.active,button:hover{color:#c9dd67}button:focus-visible{outline:2px solid #ff9d47;border-radius:.3rem}
  .eyebrow{margin-top:5rem;font-size:.75rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
  h1{font-size:clamp(2.8rem,10vw,6rem);line-height:.93;letter-spacing:-.055em;margin:.2em 0}
  .intro{max-width:38rem;color:#b9b8a5}
  ul{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,24rem),1fr));gap:1rem;padding:0;margin:2rem 0;list-style:none}
  .app-card{display:flex;min-height:100%;flex-direction:column;gap:1rem;padding:1.25rem;border:1px solid #425d4d;border-radius:1.25rem;background:#20342a;text-decoration:none;transition:transform .15s,border-color .15s,background .15s}
  .app-card:hover{border-color:#ff9d47;transform:translateY(-2px);background:#263d32}
  .app-heading{display:flex;align-items:flex-start;gap:.9rem}.app-emoji{display:grid;flex:0 0 3rem;height:3rem;place-items:center;border-radius:.85rem;background:#17251f;font-size:1.45rem}
  h2{margin:0;color:#f6edda;font-size:1.2rem;line-height:1.2}.app-heading p{margin:.35rem 0 0;color:#b9b8a5;font-size:.9rem;line-height:1.5}
  .prompt{padding:.8rem .9rem;border-left:2px solid #8fc7a8;border-radius:0 .65rem .65rem 0;background:#17251f;color:#9fae9f;font-size:.78rem;line-height:1.45}
  .prompt b{display:block;margin-bottom:.25rem;color:#8fc7a8;font-size:.65rem;letter-spacing:.08em;text-transform:uppercase}.prompt q{quotes:none}
  .open{margin-top:auto;color:#c9dd67;font-size:.8rem;font-weight:900}
  code{background:#2a4336;padding:.15rem .35rem;border-radius:.25rem}
  .health{display:inline-block;margin-top:2rem;font-size:.8rem;font-weight:900;text-decoration:none}
</style>
<main>
  <div class="top">
    <span class="brand" data-i18n="brand">Blanket Fort</span>
    <div class="switcher" role="group" aria-label="Language / 言語">
      <button type="button" data-locale="ja" lang="ja">日本語</button><span>/</span>
      <button type="button" data-locale="en" lang="en">EN</button>
    </div>
  </div>
  <p class="eyebrow" data-i18n="eyebrow">Public app hub</p>
  <h1 data-i18n="title">Mini apps</h1>
  <p class="intro" data-i18n="${items ? "intro" : "empty"}">
    ${items ? "Open a tiny shared app built for a group chat." : "No mini apps yet. Ask Hermes to create one in the shared workspace."}
  </p>
  ${items ? `<ul>${items}</ul>` : ""}
  <a class="health" href="/health" data-i18n="health">Backend health ↗</a>
</main>
<script>
  const messages = {
    en: {
      brand: "Blanket Fort",
      eyebrow: "Public app hub",
      title: "Mini apps",
      intro: "Open a tiny shared app built for a group chat.",
      empty: "No mini apps yet. Ask Hermes to create one in the shared workspace.",
      promptLabel: "Original prompt",
      open: "Open app →",
      health: "Backend health ↗"
    },
    ja: {
      brand: "毛布の秘密基地",
      eyebrow: "公開アプリハブ",
      title: "ミニアプリ",
      intro: "グループチャットから生まれた、小さな共有アプリを開いてみよう。",
      empty: "ミニアプリはまだありません。Hermesに共有ワークスペースで作成を頼んでください。",
      promptLabel: "元のプロンプト",
      open: "アプリを開く →",
      health: "バックエンドの状態 ↗"
    }
  };
  function setLocale(locale, persist = true) {
    document.documentElement.lang = locale;
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = messages[locale][element.dataset.i18n];
    });
    document.querySelectorAll("[data-copy-en]").forEach((element) => {
      element.textContent = element.dataset[locale === "ja" ? "copyJa" : "copyEn"];
    });
    document.querySelectorAll("[data-locale]").forEach((button) => {
      const active = button.dataset.locale === locale;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (persist) localStorage.setItem("blanket-fort-locale", locale);
  }
  document.querySelectorAll("[data-locale]").forEach((button) => {
    button.addEventListener("click", () => setLocale(button.dataset.locale));
  });
  const saved = localStorage.getItem("blanket-fort-locale");
  setLocale(saved === "ja" || saved === "en" ? saved : (navigator.language.toLowerCase().startsWith("ja") ? "ja" : "en"), false);
</script>
</html>`;
}

function safeAppFile(slug, requestedPath) {
  const appRoot = resolve(APPS_ROOT, slug);
  let relativePath = decodeURIComponent(requestedPath || "").replace(/^\/+/, "");
  if (!relativePath || relativePath.endsWith("/")) relativePath += "index.html";
  const candidate = resolve(appRoot, normalize(relativePath));
  if (candidate !== appRoot && !candidate.startsWith(`${appRoot}${sep}`)) {
    return null;
  }
  return candidate;
}

function serveAppFile(response, slug, requestedPath) {
  let file = safeAppFile(slug, requestedPath);
  if (!file) return sendJson(response, 400, { error: "Invalid path" });

  if (!existsSync(file) || !statSync(file).isFile()) {
    const fallback = safeAppFile(slug, "index.html");
    if (!fallback || !existsSync(fallback)) {
      return sendJson(response, 404, { error: "Mini app not found" });
    }
    file = fallback;
  }

  const type = MIME_TYPES[extname(file).toLowerCase()] || "application/octet-stream";
  response.writeHead(200, {
    ...commonHeaders(type),
    "cache-control": type.startsWith("text/html") ? "no-store" : "public, max-age=60",
  });
  response.end(readFileSync(file));
}

async function handleApi(request, response, url) {
  const parts = url.pathname.split("/").filter(Boolean);
  const slug = parts[2];
  const resource = parts[3];
  validateSlug(slug);
  const record = appRecord(slug);

  if (resource === "state" && request.method === "GET") {
    return sendJson(response, 200, publicState(slug, record));
  }

  if (resource === "state" && request.method === "PUT") {
    const body = await readJson(request);
    if (!body.state || typeof body.state !== "object" || Array.isArray(body.state)) {
      return sendJson(response, 400, { error: "Expected a JSON object in state" });
    }
    record.state = body.state;
    record.updatedAt = new Date().toISOString();
    saveDatabase();
    return sendJson(response, 200, publicState(slug, record));
  }

  if (resource === "votes" && request.method === "POST") {
    const body = await readJson(request);
    const userId = String(body.userId || "").trim();
    const choice = String(body.choice || "").trim().slice(0, 80);
    const userName = String(body.userName || "Guest").trim().slice(0, 80);
    if (!userId || !choice) {
      return sendJson(response, 400, { error: "userId and choice are required" });
    }
    record.votes[userId] = {
      userId,
      userName,
      choice,
      updatedAt: new Date().toISOString(),
    };
    record.updatedAt = new Date().toISOString();
    saveDatabase();
    return sendJson(response, 200, publicState(slug, record));
  }

  if (resource === "spin" && request.method === "POST") {
    const weightedChoices = Object.values(record.votes).map((vote) => vote.choice);
    if (!weightedChoices.length) {
      return sendJson(response, 409, { error: "At least one vote is required" });
    }
    const result = weightedChoices[Math.floor(Math.random() * weightedChoices.length)];
    const spin = {
      result,
      totals: voteSummary(record),
      spunAt: new Date().toISOString(),
    };
    record.spins.push(spin);
    record.spins = record.spins.slice(-20);
    record.updatedAt = spin.spunAt;
    saveDatabase();
    return sendJson(response, 200, { ...publicState(slug, record), spin });
  }

  return sendJson(response, 404, { error: "Unknown API route" });
}

const server = createServer(async (request, response) => {
  const startedAt = Date.now();
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    applyCors(request, response);

    if (request.method === "OPTIONS") {
      response.writeHead(204, { "cache-control": "no-store" });
      return response.end();
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return sendJson(response, 200, {
        ok: true,
        service: "blanket-fort-miniapps",
        apps: listApps(),
      });
    }

    if (request.method === "GET" && url.pathname === "/") {
      return sendText(response, 200, renderIndex(), "text/html; charset=utf-8");
    }

    if (url.pathname.startsWith("/api/apps/")) {
      return await handleApi(request, response, url);
    }

    const appMatch = url.pathname.match(/^\/apps\/([^/]+)(\/.*)?$/);
    if (request.method === "GET" && appMatch) {
      validateSlug(appMatch[1]);
      return serveAppFile(response, appMatch[1], appMatch[2] || "/");
    }

    return sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    const status = Number(error.status) || 500;
    sendJson(response, status, {
      error: status === 500 ? "Internal server error" : error.message,
    });
    if (status === 500) console.error(error);
  } finally {
    console.log(
      `${request.method} ${request.url} ${response.statusCode} ${Date.now() - startedAt}ms`,
    );
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Blanket Fort mini-app backend: http://${HOST}:${PORT}`);
  console.log(`Serving generated apps from: ${APPS_ROOT}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
