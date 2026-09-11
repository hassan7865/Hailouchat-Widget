# Hailouchat Widget

Embeddable chat widget built with React, TypeScript, and Vite.

## Overview

Hailouchat-Widget is a lightweight chat UI intended to be embedded or integrated into host applications. It is a Vite-based React library/app rather than a full backend.

## Stack

- React
- TypeScript
- Vite

## Structure

```
src/           # Widget source
public/        # Static assets
index.html
vite.config.ts
```

## Getting started

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Integration

Build the widget and include the generated assets in the host page, or import components from `src/` depending on your embedding approach. Configure the chat API endpoint via environment or props — never hardcode secrets.
