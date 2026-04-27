import { Router } from "express";
import { HardwareManager } from "../hardware/index.js";

export function resetRoutes(hw: HardwareManager): Router {
  const router = Router();

  router.post("/", async (_req, res) => {
    const state = await hw.reset();
    res.json({ status: "reset", state });
  });

  return router;
}
