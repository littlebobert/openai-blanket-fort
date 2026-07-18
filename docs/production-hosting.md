# Production hosting / 本番ホスティング

## Recommended split

| Component | Recommended home | Why |
| --- | --- | --- |
| Hermes gateway and coding runtime | Railway or Fly.io | A normal Linux container/VM, persistent disk, background process, Git, and subprocess execution |
| Generated mini apps | Cloudflare Pages | Public static hosting, custom domains, previews, and automatic deployment from GitHub |
| Shared mini-app API | Cloudflare Workers | Small public HTTP API close to users |
| Per-app collaborative state | Durable Objects or D1 | Durable voting and room state without a single laptop |
| App source and handoff | One GitHub repository per app | Codex/Claude collaboration, history, forks, and push-triggered deployment |

## Why Hermes is separate from Cloudflare Workers

Hermes is designed to live on a Linux/macOS machine and run a persistent
messaging gateway, local tools, Git, and coding subprocesses. A standard
Cloudflare Worker is a request-oriented isolate with CPU, filesystem, and
process constraints, so it is not a drop-in host for the existing Hermes
installation.

Cloudflare Containers may eventually fit, but for the first production version
a conventional always-on container with a persistent volume is simpler and
closer to how Hermes is documented to run.

## Production flow

1. Telegram sends a request to the cloud-hosted Hermes gateway.
2. Blanket Fort creates a build job and immediately replies once with a
   job-specific monitoring URL.
3. Hermes generates the app in a temporary, isolated workspace while internal
   events update that job. Tool activity and validation commentary never go to
   the group chat.
4. Blanket Fort creates one public GitHub repository for the app.
5. Cloudflare Pages deploys `main` and creates previews for pull requests.
6. The app reads/writes shared state through a Cloudflare Worker backed by a
   Durable Object or D1.
7. Blanket Fort sends exactly one final chat message: the deployed app and
   repository on success, or a concise recoverable error on failure.
8. The owner clones or opens the repository in Codex or Claude. Every accepted
   change pushed to `main` redeploys automatically.

The two-message chat contract is:

1. `🧶 Got it — building Mood Cloud. Track progress: <build URL>`
2. `✅ Mood Cloud is ready. <one-sentence summary> <app URL>` or one concise
   unrecoverable-error message.

## Reproducible Railway startup

The versioned startup script at `scripts/start-railway-hermes.sh` reapplies the
Telegram display policy on every boot, starts the mini-app server, and runs the
Hermes gateway. Set the Railway service **Start Command** to:

```bash
bash /opt/data/workspaces/blanket-fort/scripts/start-railway-hermes.sh
```

The settings are also written to Hermes configuration on the persistent
`/opt/data` volume. Reapplying them is intentional: redeploys preserve the
settings, while a replacement service or fresh volume receives the same
configuration automatically. If either the mini-app server or gateway exits,
the script exits so Railway can restart the complete service.

Publishing must be explicit: chat text can contain private names, locations, or
inside jokes, so Hermes should show the proposed public title, description, and
repository visibility before creating the repository.

---

## 推奨構成

- Hermesゲートウェイとコーディング実行環境：RailwayまたはFly.io
- 生成ミニアプリ：Cloudflare Pages
- 共有API：Cloudflare Workers
- 投票・ルーム状態：Durable ObjectsまたはD1
- ソースコード：アプリごとに1つのGitHubリポジトリ

Hermesは常駐プロセス、Git、ローカルツール、サブプロセスを使うため、最初の本番版は
通常のLinuxコンテナと永続ボリュームで動かすのが最も簡単です。Cloudflareは、
公開アプリ、共有API、永続状態、独自ドメインを担当させるのが適しています。
