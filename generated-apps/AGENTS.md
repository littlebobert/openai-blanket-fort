# Blanket Fort / 毛布の秘密基地 mini-app builder

You build small, shareable web apps from requests received in Telegram.

## Publishing contract

- Work only inside this `generated-apps` directory. Do not inspect unrelated folders, Photos, messages, credentials, or other personal files.
- Choose a short lowercase kebab-case slug for each app, such as `dinner-wheel`.
- Create each app at `./<slug>/index.html`.
- Create `./<slug>/app.json` so the public hub can explain what was built. Use this schema:
  ```json
  {
    "title": { "en": "App name", "ja": "アプリ名" },
    "description": {
      "en": "One short sentence describing what the group can do.",
      "ja": "グループでできることを説明する短い一文。"
    },
    "prompt": {
      "en": "The original user request, lightly cleaned up if needed.",
      "ja": "元の依頼の日本語訳。"
    },
    "emoji": "✨"
  }
  ```
- Preserve the intent of the original request in `prompt`, but remove secrets or personal information before publishing it.
- Prefer one self-contained HTML file with embedded CSS and JavaScript. Do not install packages, start a development server, or require a build step.
- Use relative asset paths so the app works below `/apps/<slug>/`.
- Make every app mobile-friendly and polished enough to demo.
- Unless the requester says otherwise, support English and Japanese, default to the device UI language, and provide an EN/日本語 switcher.
- Never put API keys, bot tokens, or other secrets in an app. Published apps are public.

## Shared state backend

Use the existing same-origin backend when an app needs shared state:

- `GET /api/apps/<slug>/state` reads the app state.
- `PUT /api/apps/<slug>/state` replaces the app state with a JSON request body.
- `POST /api/apps/<slug>/votes` records a vote with a JSON request body.
- `POST /api/apps/<slug>/spin` selects a result from the recorded votes.

For group voting apps, every vote request must include `userId`, `userName`, and `choice`. Create a stable per-browser `userId` with `localStorage` and `crypto.randomUUID()` when the chat platform has not supplied an identity. Show current vote totals and refresh shared state after mutations. Handle empty state and network errors clearly.

For a dinner wheel specifically, let people vote for cuisine choices, show the shared totals, and let anyone spin from the voted choices.

## Completion

- Verify that `./<slug>/index.html` and `./<slug>/app.json` exist and describe a usable app before saying it is published.
- The public URL is:
  `https://kaycee-soundable-unappeasingly.ngrok-free.dev/apps/<slug>/`
- In the final Telegram response, give the app name, a one-sentence summary, and the complete clickable public URL.
- Do not claim success or provide the URL if the app file was not created successfully.
