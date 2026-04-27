import { MockDriver } from "./drivers/mock.js";
import { HardwareManager } from "./manager.js";

export function createHardwareManager(): HardwareManager {
  const mode = process.env.HARDWARE_MODE ?? "mock";

  if (mode === "mock") {
    return new HardwareManager(new MockDriver());
  }

  // Future: add real drivers here based on mode
  console.warn(`Unknown HARDWARE_MODE "${mode}", falling back to mock`);
  return new HardwareManager(new MockDriver());
}

export { HardwareManager } from "./manager.js";
export type { DeviceState, HardwareDriver } from "./types.js";
