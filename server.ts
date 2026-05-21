import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from "@google/genai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API routes
  app.post("/api/generate-title", async (req, res) => {
    const { theme } = req.body;
    try {
      if (!process.env.GEMINI_API_KEY) {
         // Return simulated titles if API key is missing
         return res.json([
           `${theme} - A Neural Interpretation`,
           `The ${theme} Paradigm`,
           `Evolution of ${theme}`
         ]);
      }
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate 3 creative titles or captions for the theme: "${theme}". Return as a JSON array of strings.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
        }
      });
      res.json(JSON.parse(response.text || "[]"));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate title" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
