import { createRoot } from "react-dom/client";
import "./index.css";

const REQUIRED_ENV = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"] as const;

console.info("[PakMart] Starting app…", { mode: import.meta.env.MODE });
const missing = REQUIRED_ENV.filter((k) => !import.meta.env[k]);
if (missing.length) console.error("[PakMart] Missing required config:", missing.join(", "));
else console.info("[PakMart] Config OK");

window.addEventListener("unhandledrejection", (e) => {
  console.error("[PakMart] Unhandled promise rejection:", e.reason);
});

const rootEl = document.getElementById("root")!;
const root = createRoot(rootEl);

// Load the app dynamically so even import-time failures show a friendly screen
Promise.all([import("./App.tsx"), import("./components/ErrorBoundary")])
  .then(([{ default: App }, { default: ErrorBoundary }]) => {
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
    console.info("[PakMart] App rendered");
  })
  .catch(async (err) => {
    console.error("[PakMart] Failed to initialize app:", err);
    const { ErrorFallback } = await import("./components/ErrorBoundary");
    root.render(<ErrorFallback message={String(err?.message || err)} />);
  });
