/**
 * Setup script to create/update the ElevenLabs Conversational AI agent.
 *
 * Run: npx tsx server/src/setup-agent.ts
 *
 * Reads prompt files from prompts/, creates an agent with client tools,
 * and prints the agent ID to add to .env.
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_BASE = "https://api.elevenlabs.io/v1";
const API_KEY = process.env.ELEVENLABS_API_KEY;

if (!API_KEY) {
  console.error("ELEVENLABS_API_KEY not set in .env");
  process.exit(1);
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
  const res = await fetch(`${API_BASE}/voices`, {
    headers: { "xi-api-key": API_KEY! },
  });
  const data = await res.json();
  return data.voices ?? [];
}

async function createAgent(systemPrompt: string, voiceId: string) {
  const body = {
    name: "Flirty",
    conversation_config: {
      agent: {
        prompt: {
          prompt: systemPrompt,
        },
        first_message: "Well... hello there.",
        language: "en",
        tools: clientToolDefinitions,
      },
      tts: {
        voice_id: voiceId,
        model_id: "eleven_flash_v2",
        stability: 0.4,
        similarity_boost: 0.8,
      },
    },
  };

  const res = await fetch(`${API_BASE}/convai/agents/create`, {
    method: "POST",
    headers: {
      "xi-api-key": API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Failed to create agent (${res.status}):`, text);
    process.exit(1);
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
        },
        first_message: "Well... hello there.",
        language: "en",
        tools: clientToolDefinitions,
      },
      tts: {
        voice_id: voiceId,
        model_id: "eleven_flash_v2",
        stability: 0.4,
        similarity_boost: 0.8,
      },
    },
  };

  const res = await fetch(`${API_BASE}/convai/agents/${agentId}`, {
    method: "PATCH",
    headers: {
      "xi-api-key": API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Failed to update agent (${res.status}):`, text);
    process.exit(1);
  }

  return res.json();
}

async function main() {
  const systemPrompt = loadPrompts();
  console.log(`Loaded system prompt (${systemPrompt.length} chars)`);

  // Find a deep male voice
  const voices = await fetchVoices();
  const preferred = ["Adam", "Antoni", "AZ", "Bob"];
  const voice = preferred
    .map((name) => voices.find((v) => v.name === name))
    .find(Boolean);

  if (!voice) {
    console.error("No suitable voice found. Available:", voices.map((v) => v.name).join(", "));
    process.exit(1);
  }
  console.log(`Using voice: ${voice.name} (${voice.voice_id})`);

  const existingId = process.env.ELEVENLABS_AGENT_ID;
  if (existingId) {
    console.log(`Updating existing agent ${existingId}...`);
    await updateAgent(existingId, systemPrompt, voice.voice_id);
    console.log(`Agent updated: ${existingId}`);
  } else {
    console.log("Creating new agent...");
    const result = await createAgent(systemPrompt, voice.voice_id);
    const agentId = result.agent_id;
    console.log(`\nAgent created: ${agentId}`);
    console.log(`\nAdd to .env:\nELEVENLABS_AGENT_ID=${agentId}`);
  }
}

main().catch(console.error);
