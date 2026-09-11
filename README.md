# Hailou Chat Widget

Embeddable visitor chat widget for Hailou Chat. React + TypeScript + Vite, with REST chat initiation and WebSocket messaging.

## Overview

Sites load an injector script with a `data-client-id`. The injector mounts an iframe to the widget app, passing parent page URL, referrer, title, and mobile hints. The widget starts a visitor session (device + approximate location metadata), then exchanges messages over WebSocket with typing indicators, read receipts, attachments, and contact-details / end-chat flows.

## Features

- Floating chat button and chat window (desktop + mobile layouts)
- Session start via Hailou Chat HTTP API; realtime via WebSocket
- Typing indicators, message seen, attachment upload
- Contact details modal and end-chat confirmation
- Duplicate-message guards and auto-reconnect on non-clean WS close
- Example host page and `public/injector.js` for drop-in embedding

## Stack

- React 19, TypeScript, Vite 7
- Tailwind CSS (`@tailwindcss/vite`)
- Lucide icons
- Native WebSocket (no extra realtime SDK)

## Structure

```
src/
  components/     # ChatWidget, chat UI, modals
  hooks/          # useChat, useWebSocket
  config/         # API / WS defaults
  utils/          # Device, location, message helpers
  types/          # Chat types
public/
  injector.js     # Host-page embed script
  example.html    # Sample integration page
```

## How to run

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

## Embed

1. Serve the built widget (or point the injector `baseUrl` at your Vite dev server).
2. On the host page:

```html
<script
  src="https://your-widget-host/injector.js"
  data-client-id="YOUR_CLIENT_ID"
  async
></script>
```

Configure API/WS bases in `src/config/chatConfig.ts` for your environment. Do not commit private keys or production client secrets into the repo.
