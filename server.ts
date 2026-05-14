import express from "express";
import path from "path";
import { createRequestHandler } from "@remix-run/express";

async function startServer() {
  const app = express();
  const PORT = 3000;

  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await import("vite");
    const viteDevServer = await vite.createServer({
      server: { middlewareMode: true },
    });
    app.use(viteDevServer.middlewares);
    
    app.all("*", async (req, res, next) => {
      try {
        const build = await viteDevServer.ssrLoadModule("virtual:remix/server-build") as any;
        return createRequestHandler({
          build,
          mode: "development",
        })(req, res, next);
      } catch (error) {
        next(error);
      }
    });

  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "build/client");
    app.use(express.static(distPath, { immutable: true, maxAge: "1y" }));
    
    app.all("*", (req, res, next) => {
       import("./build/server/index.js").then((build: any) => {
         return createRequestHandler({
           build,
           mode: "production",
         })(req, res, next);
       }).catch(next);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
