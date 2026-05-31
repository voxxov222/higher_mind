import express from "express";
import path from "path";
import fs from "fs";
import { createRequestHandler } from "@remix-run/express";
import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;
function getAI() {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // Static directory for generated image assets
  app.use("/assets/images", express.static("/src/assets/images"));

  // API to retrieve the path/URL of the generated mystical zodiac illustration
  app.get("/api/zodiac-illustration", (req, res) => {
      try {
          const dir = "/src/assets/images";
          if (fs.existsSync(dir)) {
              const files = fs.readdirSync(dir);
              const imageFile = files.find(f => f.startsWith("zodiac_celestial_") && f.endsWith(".png"));
              if (imageFile) {
                  return res.json({ url: `/assets/images/${imageFile}` });
              }
          }
          res.json({ url: null });
      } catch (error) {
          console.error("Error reading zodiac image:", error);
          res.json({ url: null });
      }
  });

  app.post("/api/generate-media", async (req, res) => {
      try {
          const { prompt, type } = req.body;
          const aiClient = getAI();
          // Based on type, decide model. If 'video', use 'veo-3.1-lite-generate-preview'. If 'image', 'gemini-3.1-flash-image'
          if (type === 'video') {
              const operation = await aiClient.models.generateVideos({
                  model: 'veo-3.1-lite-generate-preview',
                  prompt: prompt,
                  config: {
                      numberOfVideos: 1,
                      resolution: '720p',
                      aspectRatio: '16:9'
                  }
              });
              res.json({ operationName: operation.name });
          } else {
              const interaction = await aiClient.interactions.create({
                  model: 'gemini-3.1-flash-image',
                  input: prompt,
                  response_modalities: ['image', 'text'],
                  generation_config: {
                      image_config: { aspect_ratio: "1:1", image_size: "1K" },
                  },
              });
              // ... extract image ...
              let imageUrl = null;
              for (const step of interaction.steps) {
                  if (step.type === 'model_output') {
                      const imageContent = step.content?.find(c => c.type === 'image');
                      if (imageContent && imageContent.data) {
                          imageUrl = `data:${imageContent.mime_type || 'image/png'};base64,${imageContent.data}`;
                          break;
                      }
                  }
              }
              res.json({ imageUrl });
          }
      } catch (e) {
          console.error(e);
          res.status(500).json({ error: 'Failed to generate media' });
      }
  });

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
    const distPath = path.join(process.cwd(), "dist/client");
    app.use(express.static(distPath, { immutable: true, maxAge: "1y" }));
    
    // Updated: Load the bundled server.cjs
    const build = await import(path.join(process.cwd(), "dist/server.cjs"));
    
    app.all("*", (req, res, next) => {
        return createRequestHandler({
          build,
          mode: "production",
        })(req, res, next);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
