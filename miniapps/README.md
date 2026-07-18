# Blanket Fort mini-app backend

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

## API

- `GET /health`
- `GET /api/apps/<slug>/state`
- `PUT /api/apps/<slug>/state` with `{ "state": { ... } }`
- `POST /api/apps/<slug>/votes` with `{ "userId", "userName", "choice" }`
- `POST /api/apps/<slug>/spin`

State persists locally in `generated-apps/.blanket-fort/state.json`.
