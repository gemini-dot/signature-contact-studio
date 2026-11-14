// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { defineConfig as defineViteConfig, loadEnv } from "vite";
import path from "node:path";

export default defineViteConfig((configEnv) => {
  // Server secrets remain server-only; the shared config handles VITE_* injection.
  Object.assign(process.env, loadEnv(configEnv.mode, process.cwd(), ""));
  return defineConfig({
  vite: {
    resolve: {
      alias: [
        { find: /^entities\/lib\/decode\.js$/, replacement: path.resolve("node_modules/entities/lib/esm/decode.js") },
        { find: /^entities\/lib\/encode\.js$/, replacement: path.resolve("node_modules/entities/lib/esm/encode.js") },
        // Match only the root import. Modern entities/decode and entities/escape
        // must resolve through their caller's own version (htmlparser2 uses v7).
        { find: /^entities$/, replacement: path.resolve("node_modules/entities/lib/esm/index.js") },
      ],
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  })(configEnv);
});
