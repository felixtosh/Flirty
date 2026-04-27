# Flirty Prompts

This directory contains the AI personality configuration for the Flirty art installation. Each file is plain markdown — no code, easy to tweak.

## Files

- **personality.md** — Core identity, tone, flirtation style, conversation flow
- **tools.md** — Hardware tool descriptions and usage strategy
- **guardrails.md** — Boundaries, safety rules, content limits

## How to Edit

1. Edit any `.md` file in this directory
2. Run the setup script to push changes to ElevenLabs:
   ```bash
   npx tsx server/src/setup-agent.ts
   ```
3. The agent will use the updated prompts on the next conversation

## Tips

- Keep responses concise — Flirty should converse, not monologue
- The AI reads these prompts verbatim as its system instructions
- Test changes by starting a new voice conversation after running setup
- Hardware state is injected at runtime, not in these files
