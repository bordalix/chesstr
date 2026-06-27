# Chesstr

### A chessboard powered by Nostr

https://chesstr.pages.dev

Want to play chess with a friend anywhere in the world?

Presenting chesstr, a virtual chessboard powered by nostr.

Just create a random url and share it with your friend.

The full url is used as the seed for the private key, so the same url means the same key and the same key means the same board.

Using nostr, each client subscribe to itself, and sends an event to itself when the board changes, putting them in sync.

## Technical overview

The project is split into three main layers:

- `src/components/`: UI pieces for the chess app.
  - `board.tsx`: renders the board and handles piece movement.
  - `status.tsx`, `details.tsx`, `info.tsx`, `lead.tsx`, `fen.tsx`: present game state and metadata.
  - `buttons.tsx`, `flex.tsx`: reusable interaction and layout components.
- `src/lib/`: core logic and integrations.
  - `move.ts`: move parsing and transformation helpers.
  - `highlight.ts`: board square highlighting rules.
  - `nostr.ts`: Nostr key/events/subscription logic used for sync.
  - `toast.ts`: notification helpers.
- app shell:
  - `src/App.tsx`: top-level composition and game flow.
  - `src/main.tsx`: React bootstrap entrypoint.
  - `index.html`: static host page used by Vite and direct browser load.

Supporting config lives at repo root (`vite.config.ts`, `tsconfig*.json`, `package.json`), while static assets are in `public/`.

## Run on your computer

### Development mode (recommended)

1. Install Node.js 20+.
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the local dev server:

   ```bash
   pnpm dev
   ```

4. Open the local URL shown in the terminal (usually http://localhost:5173).

### Build and preview production output

```bash
pnpm build
pnpm preview
```
