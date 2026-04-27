import { Router } from "express";

export function signedUrlRoutes(): Router {
  const router = Router();

  router.get("/", async (_req, res) => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const agentId = process.env.ELEVENLABS_AGENT_ID;

    if (!apiKey || !agentId) {
      res.status(500).json({ error: "ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID must be set" });
      return;
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      { headers: { "xi-api-key": apiKey } }
    );

    if (!response.ok) {
      const text = await response.text();
      res.status(response.status).json({ error: `ElevenLabs error: ${text}` });
      return;
    }

    const body = await response.json();
    res.json(body);
  });

  return router;
}
