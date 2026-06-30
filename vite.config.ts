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
      dedupe: ["react", "react-dom", "three", "@react-three/fiber", "@react-three/drei", "@react-three/postprocessing"],
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
          chunkFileNames: (chunkInfo) => {
            let name = chunkInfo.name || 'chunk';
            if (name.includes('Error')) {
              name = name.replace(/Error/g, 'Err');
            }
            if (name.includes('error')) {
              name = name.replace(/error/g, 'err');
            }
            return `assets/${name}-[hash].js`;
          },
          entryFileNames: (chunkInfo) => {
            let name = chunkInfo.name || 'entry';
            if (name.includes('Error')) {
              name = name.replace(/Error/g, 'Err');
            }
            if (name.includes('error')) {
              name = name.replace(/error/g, 'err');
            }
            return `assets/${name}-[hash].js`;
          },
          assetFileNames: (assetInfo) => {
            let name = assetInfo.name || 'asset';
            if (name.includes('Error')) {
              name = name.replace(/Error/g, 'Err');
            }
            if (name.includes('error')) {
              name = name.replace(/error/g, 'err');
            }
            // Keep the extension pattern
            return `assets/${name}-[hash][extname]`;
          }
        }
      }
    },
  };
});
