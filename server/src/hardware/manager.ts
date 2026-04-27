import { HardwareDriver, DeviceState } from "./types.js";

type StateListener = (state: DeviceState) => void;

export class HardwareManager {
  private driver: HardwareDriver;
  private listeners: Set<StateListener> = new Set();

  constructor(driver: HardwareDriver) {
    this.driver = driver;
  }

  async getState(): Promise<DeviceState> {
    return this.driver.getState();
  }

  async execute(action: string, params: Record<string, unknown>): Promise<DeviceState> {
    await this.driver.execute(action, params);
    const state = await this.driver.getState();
    this.broadcast(state);
    return state;
  }

  async reset(): Promise<DeviceState> {
    await this.driver.reset();
    const state = await this.driver.getState();
    this.broadcast(state, true);
    return state;
  }

  onStateChange(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private broadcast(state: DeviceState, isReset = false) {
    for (const listener of this.listeners) {
      listener(state);
    }
  }
}
