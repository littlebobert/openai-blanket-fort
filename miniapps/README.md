# 毛布の秘密基地 / Blanket Fort mini-app backend

Start the local service:

```bash
npm run miniapps
```

The production service is available at
`https://hermes-gateway-production-0aaf.up.railway.app`. For temporary local
sharing, start an ngrok tunnel against port `8787` and use the URL it assigns.

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

Cross-origin requests are enabled by default because generated mini apps are
public and use no cookies or credentials. In production, restrict this to known
app origins:

```bash
MINIAPPS_ALLOWED_ORIGINS=https://example.pages.dev,https://apps.example.com npm run miniapps
```

## Prepare a standalone repository

```bash
npm run publish-app -- dinner-wheel
```

This creates a clean repository-shaped export under
`work/published-apps/dinner-wheel`, including GitHub Pages deployment,
`AGENTS.md`, `CLAUDE.md`, and a configurable shared API URL.

After authenticating GitHub CLI, create and deploy a public repository:

```bash
gh auth login
npm run publish-app -- dinner-wheel --push --owner=littlebobert
```

Every later push to `main` automatically redeploys the app.
