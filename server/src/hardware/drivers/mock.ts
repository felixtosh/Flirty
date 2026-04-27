import { HardwareDriver, DeviceState, DEFAULT_STATE } from "../types.js";

export class MockDriver implements HardwareDriver {
  id = "mock";
  name = "Mock Hardware";
  private state: DeviceState = structuredClone(DEFAULT_STATE);

  async getState(): Promise<DeviceState> {
    return structuredClone(this.state);
  }

  async execute(action: string, params: Record<string, unknown>): Promise<void> {
    switch (action) {
      case "light_candles":
        this.state.candles.lit = params.lit as boolean;
        console.log(`[mock] candles ${this.state.candles.lit ? "lit" : "extinguished"}`);
        break;
      case "play_music":
        if (params.action === "play") {
          this.state.music.playing = true;
          if (params.genre) this.state.music.genre = params.genre as string;
          console.log(`[mock] music playing (${this.state.music.genre ?? "ambient"})`);
        } else if (params.action === "pause") {
          this.state.music.playing = false;
          console.log("[mock] music paused");
        }
        break;
      case "change_color":
        this.state.color.current = params.color as string;
        console.log(`[mock] color changed to ${this.state.color.current}`);
        break;
      default:
        console.log(`[mock] unknown action: ${action}`, params);
    }
  }

  async reset(): Promise<void> {
    this.state = structuredClone(DEFAULT_STATE);
    console.log("[mock] hardware reset to defaults");
  }
}
