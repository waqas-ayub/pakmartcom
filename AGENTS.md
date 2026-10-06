# Project rules
- vite.config.ts injects fallback publishable backend env values via `define`, so production builds never ship without backend config (a missing URL caused a blank screen).
- main.tsx dynamically imports App inside a global ErrorBoundary, so startup/import failures render a friendly fallback instead of a white screen.
