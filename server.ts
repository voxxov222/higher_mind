import express from "express";
import path from "path";
import fs from "fs";
import { createRequestHandler } from "@remix-run/express";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { WebSocketServer } from "ws";

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
  
  // Static directory for generated image assets
  app.use("/assets/images", express.static(path.join(process.cwd(), "src/assets/images")));

  // API to retrieve the path/URL of the generated mystical zodiac illustration
  app.get("/api/zodiac-illustration", (req, res) => {
      try {
          const dir = path.join(process.cwd(), "src/assets/images");
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

  app.post("/api/generate-media", express.json(), async (req, res) => {
      try {
          const { prompt, type } = req.body;
          const aiClient = getAI();
          // Based on type, decide model. If 'video', use 'veo-2.0-generate-001'. If 'image', 'imagen-3.0-generate-002'
          if (type === 'video') {
              const operation = await aiClient.models.generateVideos({
                  model: 'veo-2.0-generate-001',
                  prompt: prompt,
                  config: {
                      numberOfVideos: 1,
                      resolution: '720p',
                      aspectRatio: '16:9'
                  }
              });
              res.json({ operationName: operation.name });
          } else {
              const response = await aiClient.models.generateImages({
                  model: 'imagen-3.0-generate-002',
                  prompt: prompt,
                  config: { numberOfImages: 1, aspectRatio: '1:1' },
              });
              let imageUrl = null;
              const generatedImage = response.generatedImages?.[0];
              if (generatedImage?.image?.imageBytes) {
                  imageUrl = `data:image/png;base64,${generatedImage.image.imageBytes}`;
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
    
    // Updated: Load the bundled Remix server build
    const build = await import(path.join(process.cwd(), "dist/server/index.js"));
    
    app.all("*", (req, res, next) => {
        return createRequestHandler({
          build,
          mode: "production",
        })(req, res, next);
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server listening on http://0.0.0.0:${PORT}`);
  });

  const wss = new WebSocketServer({ server, path: '/live' });

  wss.on("connection", async (clientWs) => {
    try {
      const aiClient = getAI();
      const session = await aiClient.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
          onclose: () => {
            clientWs.close();
          },
          onerror: (error) => {
             console.error("Live API Error:", error);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are the Astral Mind Guide, an expert, avant-garde digital mystic and highly advanced AI assistant. Your purpose is to help users navigate their spiritual, mathematical, and celestial blueprints by seamlessly synthesizing Western Astrology, Hermetic Kabbalah, and Gematria (alphanumeric numerical mysticism). Your tone is deep, insightful, futuristic, and intellectually sharp.",
        },
      });

      clientWs.on("message", (data) => {
        try {
          const { audio } = JSON.parse(data.toString());
          if (audio) {
            session.sendRealtimeInput({
              audio: { data: audio, mimeType: "audio/pcm;rate=16000" },
            });
          }
        } catch (e) {
          console.error("Failed to parse message from client", e);
        }
      });

      clientWs.on("close", () => {
        try {
           session.close();
        } catch(e) {}
      });
      
    } catch (e) {
       console.error("Failed to connect to Live API", e);
       clientWs.close();
    }
  });
}

startServer();

