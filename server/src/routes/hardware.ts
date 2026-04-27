import { Router } from "express";
import { HardwareManager } from "../hardware/index.js";

export function hardwareRoutes(hw: HardwareManager): Router {
  const router = Router();

  router.get("/state", async (_req, res) => {
    const state = await hw.getState();
    res.json(state);
  });

  router.post("/:device/:action", async (req, res) => {
    const { device, action } = req.params;

    const actionMap: Record<string, string> = {
      "candles/toggle": "light_candles",
      "candles/on": "light_candles",
      "candles/off": "light_candles",
      "music/play": "play_music",
      "music/pause": "play_music",
      "music/next": "play_music",
      "color/set": "change_color",
    };

    const key = `${device}/${action}`;
    const hwAction = actionMap[key];

    if (!hwAction) {
      res.status(400).json({ error: `Unknown action: ${key}` });
      return;
    }

    let params: Record<string, unknown> = req.body ?? {};

    // Convenience defaults
    if (key === "candles/on") params = { ...params, lit: true };
    if (key === "candles/off") params = { ...params, lit: false };
    if (key === "candles/toggle") {
      const state = await hw.getState();
      params = { ...params, lit: !state.candles.lit };
    }
    if (key === "music/play") params = { ...params, action: "play" };
    if (key === "music/pause") params = { ...params, action: "pause" };

    const state = await hw.execute(hwAction, params);
    res.json(state);
  });

  return router;
}
