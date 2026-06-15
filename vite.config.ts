import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
    resolve: {
      dedupe: ["react", "react-dom", "three", "@react-three/fiber"],
    },
    plugins: [
      remix({
        buildDirectory: "dist",
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_lazyRouteDiscovery: true,
          v3_singleFetch: true,
        },
      }),
      tsconfigPaths(),
      tailwindcss(),
    ],
    
    build: {
      target: "esnext",
      minify: "esbuild",
      sourcemap: false,
      cssMinify: true,
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("three")) return "vendor-three";
              if (id.includes("@react-three")) return "vendor-react-three";
              if (id.includes("lucide-react")) return "vendor-lucide";
              if (id.includes("recharts")) return "vendor-recharts";
              if (id.includes("firebase")) return "vendor-firebase";
              if (id.includes("motion")) return "vendor-motion";
              if (id.includes("react") || id.includes("react-dom")) return "vendor-react";
              return "vendor";
            }
          }
        }
      }
    },
  };
});
