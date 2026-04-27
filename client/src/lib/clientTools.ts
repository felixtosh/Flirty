import { hardwareAction } from "./api";

export const clientTools = {
  light_candles: async (params: { lit: boolean }) => {
    const action = params.lit ? "on" : "off";
    await hardwareAction("candles", action);
    return params.lit ? "Candles are now lit" : "Candles extinguished";
  },
  play_music: async (params: { action: "play" | "pause" | "next"; genre?: string }) => {
    await hardwareAction("music", params.action, { genre: params.genre });
    if (params.action === "play") return `Music playing${params.genre ? ` (${params.genre})` : ""}`;
    if (params.action === "pause") return "Music paused";
    return "Next track";
  },
  change_color: async (params: { color: string }) => {
    await hardwareAction("color", "set", { color: params.color });
    return `Ambient color changed to ${params.color}`;
  },
};
