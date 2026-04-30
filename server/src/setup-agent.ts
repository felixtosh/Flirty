/**
 * Setup script to create/update the ElevenLabs Conversational AI agent.
 *
 * Run: npx tsx server/src/setup-agent.ts
 *
 * Reads prompt files from prompts/, creates an agent with client tools,
 * and prints the agent ID to add to .env.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_BASE = "https://api.elevenlabs.io/v1";

function getApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    throw new Error("ELEVENLABS_API_KEY not set in .env");
  }
  return key;
}

function loadPrompts(): string {
  const promptsDir = path.resolve(__dirname, "../../prompts");
  const files = ["personality.md", "tools.md", "guardrails.md"];
  return files
    .map((f) => {
      const filepath = path.join(promptsDir, f);
      return fs.existsSync(filepath) ? fs.readFileSync(filepath, "utf-8") : "";
    })
    .filter(Boolean)
    .join("\n\n---\n\n");
}

const clientToolDefinitions = [
  {
    type: "client" as const,
    name: "light_candles",
    description:
      "Toggle the real candles in the room on or off. Use this to create a warm, intimate atmosphere.",
    expects_response: true,
    parameters: {
      type: "object" as const,
      required: ["lit"],
      properties: {
        lit: {
          type: "boolean" as const,
          description: "true to light the candles, false to extinguish them",
        },
      },
    },
  },
  {
    type: "client" as const,
    name: "play_music",
    description:
      "Control the room's music system. Play romantic music to set the mood, pause it, or skip to the next track.",
    expects_response: true,
    parameters: {
      type: "object" as const,
      required: ["action"],
      properties: {
        action: {
          type: "string" as const,
          enum: ["play", "pause", "next"],
          description: "The music action to take",
        },
        genre: {
          type: "string" as const,
          description:
            'Optional genre or mood, e.g. "jazz", "ambient", "romantic classical"',
        },
      },
    },
  },
  {
    type: "client" as const,
    name: "change_color",
    description:
      "Change the ambient lighting color in the room. Use warm colors for intimacy, cool colors for mystery.",
    expects_response: true,
    parameters: {
      type: "object" as const,
      required: ["color"],
      properties: {
        color: {
          type: "string" as const,
          description:
            'A color as hex code or descriptive name, e.g. "#ff4444", "warm red", "deep purple", "soft pink"',
        },
      },
    },
  },
];

async function fetchVoices(): Promise<
  { voice_id: string; name: string }[]
> {
  // Try v2 endpoint first for broader voice listing
  const res = await fetch(`${API_BASE}/voices?show_legacy=true`, {
    headers: { "xi-api-key": getApiKey() },
  });
  const data = await res.json();
  const voices = data.voices ?? [];

  if (voices.length > 0) return voices;

  // Fallback: search shared voice library for deep male voices
  console.log("No voices in personal library, searching shared library...");
  const sharedRes = await fetch(
    `${API_BASE}/shared-voices?gender=male&use_cases=conversational&sort=usage_character_count_7d&page_size=20`,
    { headers: { "xi-api-key": getApiKey() } }
  );
  const sharedData = await sharedRes.json();
  return (sharedData.voices ?? []).map((v: any) => ({
    voice_id: v.voice_id,
    name: v.name,
  }));
}

async function createAgent(systemPrompt: string, voiceId: string) {
  const body = {
    name: "Flirty",
    conversation_config: {
      agent: {
        prompt: {
          prompt: systemPrompt,
          tools: clientToolDefinitions,
        },
        first_message: "[sighs] Well... hello there. Come a little closer... won't you?",
        language: "en",
      },
      tts: {
        voice_id: voiceId,
        model_id: "eleven_v3",
        stability: 0.7,
        similarity_boost: 0.85,
        speed: 0.9,
      },
    },
  };

  const res = await fetch(`${API_BASE}/convai/agents/create`, {
    method: "POST",
    headers: {
      "xi-api-key": getApiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create agent (${res.status}): ${text}`);
  }

  return res.json();
}

async function updateAgent(
  agentId: string,
  systemPrompt: string,
  voiceId: string
) {
  const body = {
    name: "Flirty",
    conversation_config: {
      agent: {
        prompt: {
          prompt: systemPrompt,
          tools: clientToolDefinitions,
        },
        first_message: "[sighs] Well... hello there. Come a little closer... won't you?",
        language: "en",
      },
      tts: {
        voice_id: voiceId,
        model_id: "eleven_v3",
        stability: 0.7,
        similarity_boost: 0.85,
        speed: 0.9,
      },
    },
  };

  const res = await fetch(`${API_BASE}/convai/agents/${agentId}`, {
    method: "PATCH",
    headers: {
      "xi-api-key": getApiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update agent (${res.status}): ${text}`);
  }

  return res.json();
}

async function ensureVoiceInLibrary(voiceId: string) {
  // Check if the voice is already in the user's library
  const res = await fetch(`${API_BASE}/voices/${voiceId}`, {
    headers: { "xi-api-key": getApiKey() },
  });
  if (res.ok) return; // Already in library

  // Search shared library and add if found
  const searchRes = await fetch(
    `${API_BASE}/shared-voices?search=${voiceId}&page_size=1`,
    { headers: { "xi-api-key": getApiKey() } }
  );
  const data = await searchRes.json();
  const shared = data.voices?.[0];
  if (!shared) {
    console.warn(`[agent] Voice ${voiceId} not found in shared library either`);
    return;
  }

  console.log(`[agent] Adding shared voice "${shared.name}" to library...`);
  const addRes = await fetch(
    `${API_BASE}/voices/add/${shared.public_owner_id}/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": getApiKey(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ new_name: shared.name }),
    }
  );
  if (addRes.ok) {
    console.log(`[agent] Voice "${shared.name}" added to library`);
  } else {
    const text = await addRes.text();
    console.warn(`[agent] Failed to add voice: ${text}`);
  }
}

export async function syncAgent() {
  const systemPrompt = loadPrompts();
  console.log(`[agent] Loaded system prompt (${systemPrompt.length} chars)`);

  // Resolve voice ID: prefer explicit env var, otherwise search library
  let voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (voiceId) {
    console.log(`[agent] Using voice from env: ${voiceId}`);
    await ensureVoiceInLibrary(voiceId);
  } else {
    const voices = await fetchVoices();
    console.log(`[agent] Found ${voices.length} voices`);

    const preferred = ["Adam", "Antoni", "AZ", "Bob", "Chris", "Daniel", "Dave", "Fin", "George"];
    let voice = preferred
      .map((name) => voices.find((v) => v.name === name))
      .find(Boolean);

    if (!voice && voices.length > 0) {
      voice = voices[0];
      console.log(`[agent] Preferred voices not found, falling back to: ${voice.name}`);
    }

    if (!voice) {
      throw new Error("No voices available. Set ELEVENLABS_VOICE_ID in .env or check API key permissions.");
    }

    voiceId = voice.voice_id;
    console.log(`[agent] Using voice: ${voice.name} (${voiceId})`);
  }

  const existingId = process.env.ELEVENLABS_AGENT_ID;
  if (existingId) {
    console.log(`[agent] Updating agent ${existingId}...`);
    await updateAgent(existingId, systemPrompt, voiceId);
    console.log(`[agent] Agent synced`);
  } else {
    console.log("[agent] Creating new agent...");
    const result = await createAgent(systemPrompt, voiceId);
    const agentId = result.agent_id;
    console.log(`[agent] Agent created: ${agentId}`);
    console.log(`[agent] Add to .env:\nELEVENLABS_AGENT_ID=${agentId}`);
  }
}

// Allow running as standalone script
const isMainModule = process.argv[1]?.endsWith("setup-agent.ts") || process.argv[1]?.endsWith("setup-agent.js");
if (isMainModule) {
  const dotenv = await import("dotenv");
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
  syncAgent().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
