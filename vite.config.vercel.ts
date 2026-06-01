import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Dedicated Vercel build config.
// - disables Cloudflare build integration from lovable's wrapper
// - tailwindcss + tsconfigPaths are already included by the wrapper
export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    server: { entry: "server" },
  },
});
