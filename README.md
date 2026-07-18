# Blanket Fort（日本語）

> グループチャットが、アプリをつくる。

Blanket Fort（毛布の秘密基地）は、
[Hermes Agent](https://hermes-agent.org)を使ったグループ向けアプリビルダーです。
チャットで「夕食を決めるアプリを作って」のように頼むと、Hermesが小さな共有Web
アプリを作り、公開し、そのリンクを会話へ返します。

![Blanket Fort ソーシャルカード](public/og.png)

## 審査用クイックパス

1. [公開デモ](https://blanket-fort-hermes.littlebobert.chatgpt.site)を開きます。
2. **ワンタップでわかる体験**までスクロールします。
3. **夕食ルーレット**、**ゲームナイト**、**トーナメント**を切り替えます。
4. スマートフォン内のアプリカードをタップします。
5. 生成されたミニアプリを操作します。
6. [公開ミニアプリハブ](https://kaycee-soundable-unappeasingly.ngrok-free.dev/)を開きます。

サイトとミニアプリハブは日本語・英語に対応しています。初回表示は端末のUI言語に
合わせ、画面上の切り替えで選んだ言語はブラウザに保存されます。

## 現在動いているもの

- Hermes Agent v0.18.2とGPT-5.6 Solを使うTelegramボット。
- Telegramから依頼を受け、進捗をメッセージで返すゲートウェイ。
- `generated-apps/<slug>/`にアプリを作る専用ワークスペース。
- ngrokで公開される共有ミニアプリ・バックエンド。
- グループ投票、共有状態、ルーレット結果を保存するAPI。
- レスポンシブで操作可能なプロダクトデモ。

## コアループ

```text
Telegramのメッセージ
    ↓
Hermesメッセージング・ゲートウェイ
    ↓
Blanket Fortビルダー
    ↓
安全な範囲でミニアプリを生成
    ↓
共有バックエンドで公開
    ↓
チャットへURLと進捗を返信
```

## ローカル起動

Node.js `>=22.13.0`が必要です。

```bash
npm install
npm run dev
```

共有ミニアプリ・バックエンド：

```bash
npm run miniapps
ngrok http 8787 --url https://kaycee-soundable-unappeasingly.ngrok-free.dev
```

---

# Blanket Fort (English)

> Your group chat builds apps.

Blanket Fort is a group-first app builder powered by
[Hermes Agent](https://hermes-agent.org). A friend asks for something useful in
the chat—“make an app to help us decide what to do for dinner”—and the fort
builds a tiny shared web app, publishes it, and replies with the link.

![Blanket Fort social card](public/og.png)

## Judge quick path

This submission is designed to be understood and evaluated quickly.

1. Open the
   [deployed product demo](https://blanket-fort-hermes.littlebobert.chatgpt.site).
2. Scroll to **The pitch, in one tap**.
3. Switch between **dinner wheel**, **game night**, and **bracket**.
4. Tap the app card inside the phone.
5. Interact with the generated mini-app.
6. Review [`app/page.tsx`](app/page.tsx) for the product implementation and
   [`app/globals.css`](app/globals.css) for the responsive visual system.

The production build passes with:

```bash
npm install
npm run build
```

## The core loop

```text
Telegram message
    ↓
Hermes messaging gateway
    ↓
Blanket Fort builder skill
    ↓
Generate a safe, bounded web app
    ↓
Publish it through the shared mini-app backend
    ↓
Reply to the chat with the shared URL
```

The live hackathon bot uses Telegram. Hermes receives a direct message, streams
tool progress back into the chat, builds inside a dedicated workspace, and can
return an app hosted by the shared backend through ngrok.

## What works in this submission

- A polished, responsive product experience built from the original concept
  mockup.
- A realistic group-chat simulation with three distinct app requests.
- Three working mini-apps:
  - **DinnerWheel** — spin to pick a cuisine.
  - **SlotGrid** — vote across days and times to find the best shared slot.
  - **BracketBowl** — select semifinalists and a champion.
- Clear Hermes-oriented product architecture and a three-hour implementation
  plan.
- Keyboard-accessible controls, responsive layouts, and reduced-motion support.
- A production deployment and purpose-built social preview card.
- A live Hermes Agent connected to GPT-5.6 Sol through OpenAI Codex OAuth.
- A paired Telegram bot with editable progress messages.
- A public mini-app hub with persistent shared state, voting, and spin APIs.
- English and Japanese interfaces that default to the device UI language.

## What is not faked

The landing page is an interactive product demonstration, while the Telegram
bot and public mini-app backend are separate live processes running on the demo
Mac. The bot is genuinely connected to Hermes and GPT-5.6 Sol. The shared
backend genuinely stores votes and app state.

For the hackathon, generated apps run inside one bounded workspace and use one
controlled backend rather than exposing arbitrary generated servers. The ngrok
URL remains available while the demo Mac, backend, and tunnel are online.

## Why Hermes

Hermes already provides the difficult agent-runtime layer:

- persistent agent sessions and memory;
- a multi-platform messaging gateway;
- terminal and sandboxed execution backends;
- reusable `SKILL.md` workflows;
- self-hosting with an MIT license.

Blanket Fort adds the missing product opinion: group context, safe app
templates, publishing, and a link that returns to the conversation.

Hermes therefore handles **where the request comes from and how the agent
works**. Blanket Fort handles **what gets built and how the group uses it**.

## Hackathon scope

| Time | Deliverable |
| --- | --- |
| `0:00–0:35` | Configure Hermes and pair one Telegram bot |
| `0:35–1:35` | Implement the DinnerWheel builder workflow and audited template |
| `1:35–2:20` | Publish the generated app and return its URL in Telegram |
| `2:20–3:00` | Rehearse the end-to-end demo, record a fallback, and polish |

### Success criterion

One Telegram message:

> Make an app to help me decide what to do for dinner.

One automated response:

> DinnerWheel is ready: `https://…`

One link that opens a usable shared app.

## Product decisions

### Group-first, not prompt-first

Most AI builders begin with an empty prompt box and a single creator. Blanket
Fort begins with an existing conversation. The group's preferences, constraints,
and inside jokes become inputs to the app.

### Templates before arbitrary code

The hackathon version maps requests to audited app templates. That makes the
demo fast, predictable, mobile-friendly, and substantially safer than executing
unbounded generated code from a messaging account.

### Web links before native apps

A web link works immediately for every person in the chat. It avoids installs,
platform review, and device compatibility work while preserving the magical
part of the idea: the requested tool appears back in the conversation.

## Repository map

```text
app/
  page.tsx       Interactive product demo and mini-app behavior
  globals.css    Brand system, phone UI, responsive layout, accessibility
  layout.tsx     Metadata and social sharing configuration
miniapps/
  server.mjs     Shared app hosting, state, voting, and spin API
generated-apps/
  <slug>/        Hermes-generated mini apps
public/
  og.png         Generated Blanket Fort social card
.openai/
  hosting.json   Sites deployment configuration
```

The local shared-state layer persists to a gitignored JSON file for the
hackathon. A production deployment would move the same API contract to a hosted
database.

## Local development

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Useful commands:

```bash
npm run build  # production build
npm run lint   # static checks
npm test       # build plus rendered HTML checks
```

## Next milestone

Complete the DinnerWheel UI against the shared vote API and have Hermes return
its ngrok URL automatically in Telegram. After the demo, move the backend to a
durable cloud runtime and replace the local JSON store with a hosted database.
