import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadPrompts(): string {
  const promptsDir = path.resolve(__dirname, "../../../prompts");
  const files = ["personality.md", "tools.md", "guardrails.md"];
  return files
    .map((f) => {
      const filepath = path.join(promptsDir, f);
      return fs.existsSync(filepath) ? fs.readFileSync(filepath, "utf-8") : "";
    })
    .filter(Boolean)
    .join("\n\n---\n\n");
}

export function chatRoutes(): Router {
  const router = Router();
  const systemPrompt = loadPrompts();

  router.get("/prompt", (_req, res) => {
    res.json({ prompt: systemPrompt });
  });

  router.post("/", async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "messages array required" });
      return;
    }

    // Text-mode fallback: proxy to ElevenLabs or direct LLM
    // For now, return a placeholder — will be wired to ElevenLabs in step 5/6
    res.json({
      role: "assistant",
      content: "Text mode is not yet connected to AI. Use voice mode for now.",
    });
  });

  return router;
}
