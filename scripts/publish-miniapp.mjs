import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = resolve(import.meta.dirname, "..");
const DEFAULT_API_BASE =
  process.env.BLANKET_FORT_API_BASE ||
  "https://kaycee-soundable-unappeasingly.ngrok-free.dev";
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,62}$/;

function fail(message) {
  console.error(`publish-app: ${message}`);
  process.exit(1);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (result.error) fail(result.error.message);
  if (result.status !== 0) {
    fail(`${command} ${args.join(" ")} exited with status ${result.status}`);
  }
}

function option(name, fallback = "") {
  const prefix = `--${name}=`;
  const match = process.argv.find((value) => value.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

const slug = process.argv.slice(2).find((value) => !value.startsWith("--"));
if (!SLUG_PATTERN.test(slug || "")) {
  fail("pass a lowercase kebab-case app slug, for example: npm run publish-app -- dinner-wheel");
}

const shouldPush = process.argv.includes("--push");
const isPrivate = process.argv.includes("--private");
const owner = option("owner", process.env.GITHUB_OWNER || "");
const repositoryName = option("repo", `blanket-fort-${slug}`);
const apiBase = option("api-base", DEFAULT_API_BASE).replace(/\/$/, "");
const source = join(ROOT, "generated-apps", slug);
const output = resolve(option("output", join(ROOT, "work", "published-apps", slug)));
const metadataFile = join(source, "app.json");
const indexFile = join(source, "index.html");

if (!existsSync(indexFile)) fail(`missing ${indexFile}`);
if (!existsSync(metadataFile)) fail(`missing ${metadataFile}`);

let metadata;
try {
  metadata = JSON.parse(readFileSync(metadataFile, "utf8"));
} catch {
  fail(`${metadataFile} must contain valid JSON`);
}

const title =
  metadata?.title?.en || metadata?.title?.ja || basename(source);
const description =
  metadata?.description?.en ||
  metadata?.description?.ja ||
  `A mini app created with Blanket Fort.`;
const prompt = metadata?.prompt?.en || metadata?.prompt?.ja || "";

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
cpSync(source, output, { recursive: true });

let html = readFileSync(join(output, "index.html"), "utf8");
if (!html.includes("blanket-fort.config.js")) {
  const configTag = '<script src="./blanket-fort.config.js"></script>';
  html = html.includes("</head>")
    ? html.replace("</head>", `  ${configTag}\n</head>`)
    : html.replace(/<body([^>]*)>/i, `<body$1>\n${configTag}`);
  writeFileSync(join(output, "index.html"), html);
}

writeFileSync(
  join(output, "blanket-fort.config.js"),
  `window.BLANKET_FORT_API_BASE = ${JSON.stringify(apiBase)};\n`,
);

writeFileSync(
  join(output, "README.md"),
  `# ${title}

${description}

Built from a group-chat request with [Blanket Fort](https://github.com/littlebobert/openai-blanket-fort).

## Original prompt

> ${prompt || "Prompt not recorded."}

## Continue building

Open this repository in Codex or clone it into Claude Code. Changes pushed to
\`main\` are automatically deployed by the included GitHub Pages workflow.

The collaborative state API is configured in
\`blanket-fort.config.js\`. Do not commit secrets to this public repository.
`,
);

const handoff = `# Mini-app editing contract

This is a public Blanket Fort mini app.

- Keep the app mobile-friendly and usable as a static site.
- Preserve English and Japanese support unless the owner asks otherwise.
- Do not put credentials, private chat content, or personal information in code.
- Keep the shared API URL configurable through \`window.BLANKET_FORT_API_BASE\`.
- Validate the app locally before pushing. A push to \`main\` deploys production.
`;
writeFileSync(join(output, "AGENTS.md"), handoff);
writeFileSync(join(output, "CLAUDE.md"), handoff);
writeFileSync(join(output, ".nojekyll"), "");

const workflowDirectory = join(output, ".github", "workflows");
mkdirSync(workflowDirectory, { recursive: true });
writeFileSync(
  join(workflowDirectory, "deploy-pages.yml"),
  `name: Deploy mini app

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v4
        with:
          path: .
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`,
);

console.log(`Prepared ${title} at ${output}`);
console.log(`Shared API: ${apiBase}`);

if (!shouldPush) {
  console.log(`Preview with: cd ${output} && python3 -m http.server 8080`);
  console.log(`Publish with: npm run publish-app -- ${slug} --push${owner ? ` --owner=${owner}` : ""}`);
  process.exit(0);
}

if (!owner) {
  fail("set GITHUB_OWNER or pass --owner=<github-user-or-org> when using --push");
}

run("gh", ["auth", "status"], output);
run("git", ["init", "-b", "main"], output);
run("git", ["add", "."], output);
run("git", ["commit", "-m", `Publish ${title}`], output);

const repository = `${owner}/${repositoryName}`;
run(
  "gh",
  [
    "repo",
    "create",
    repository,
    isPrivate ? "--private" : "--public",
    "--description",
    description,
    "--source",
    ".",
    "--remote",
    "origin",
    "--push",
  ],
  output,
);

const pages = spawnSync(
  "gh",
  ["api", "--method", "POST", `repos/${repository}/pages`, "-f", "build_type=workflow"],
  { cwd: output, encoding: "utf8", stdio: "inherit" },
);
if (pages.status !== 0) {
  run(
    "gh",
    ["api", "--method", "PUT", `repos/${repository}/pages`, "-f", "build_type=workflow"],
    output,
  );
}
run("gh", ["workflow", "run", "deploy-pages.yml", "--repo", repository], output);

console.log(`Repository: https://github.com/${repository}`);
console.log(`Deployment: https://${owner.toLowerCase()}.github.io/${repositoryName}/`);
