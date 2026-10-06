import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Public (publishable) backend config used as a fallback so production builds
// never ship without it. These values are safe to expose in client code.
const FALLBACK_ENV = {
  VITE_SUPABASE_URL: "https://bosodgxsccycbpqqmcgt.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvc29kZ3hzY2N5Y2JwcXFtY2d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjQyMjQsImV4cCI6MjA4NzYwMDIyNH0.BMiwsSYFULebCp-vk0BiMEnOaEbmBlhMVWT_j8N0D_w",
  VITE_SUPABASE_PROJECT_ID: "bosodgxsccycbpqqmcgt",
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), "") };
  const define: Record<string, string> = {};
  for (const [key, fallback] of Object.entries(FALLBACK_ENV)) {
    define[`import.meta.env.${key}`] = JSON.stringify(env[key] || fallback);
  }

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    define,
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
