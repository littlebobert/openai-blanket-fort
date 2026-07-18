# 毛布の秘密基地 / Blanket Fort mini-app backend

Start the local service:

```bash
npm run miniapps
```

Expose it through the assigned ngrok domain:

```bash
ngrok http 8787 --url https://kaycee-soundable-unappeasingly.ngrok-free.dev
```

Generated apps live at `generated-apps/<slug>/index.html` and are served at
`/apps/<slug>/`.

Each app should also include `generated-apps/<slug>/app.json`. The public hub
uses it to show the app name, a short English/Japanese description, the original
prompt, and an emoji. See `generated-apps/AGENTS.md` for the schema. Apps without
metadata remain visible with a slug-based fallback title.

## API

- `GET /health`
- `GET /api/apps/<slug>/state`
- `PUT /api/apps/<slug>/state` with `{ "state": { ... } }`
- `POST /api/apps/<slug>/votes` with `{ "userId", "userName", "choice" }`
- `POST /api/apps/<slug>/spin`

State persists locally in `generated-apps/.blanket-fort/state.json`.
