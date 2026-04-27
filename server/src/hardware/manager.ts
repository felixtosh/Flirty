import { HardwareDriver, DeviceState } from "./types.js";

type StateListener = (state: DeviceState) => void;
type ResetListener = (state: DeviceState) => void;

export class HardwareManager {
  private driver: HardwareDriver;
  private stateListeners: Set<StateListener> = new Set();
  private resetListeners: Set<ResetListener> = new Set();

  constructor(driver: HardwareDriver) {
    this.driver = driver;
  }

  async getState(): Promise<DeviceState> {
    return this.driver.getState();
  }

  async execute(action: string, params: Record<string, unknown>): Promise<DeviceState> {
    await this.driver.execute(action, params);
    const state = await this.driver.getState();
    this.broadcastState(state);
    return state;
  }

  async reset(): Promise<DeviceState> {
    await this.driver.reset();
    const state = await this.driver.getState();
    this.broadcastReset(state);
    return state;
  }

  onStateChange(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  onReset(listener: ResetListener): () => void {
    this.resetListeners.add(listener);
    return () => this.resetListeners.delete(listener);
  }

  private broadcastState(state: DeviceState) {
    for (const listener of this.stateListeners) {
      listener(state);
    }
  }

  private broadcastReset(state: DeviceState) {
    for (const listener of this.resetListeners) {
      listener(state);
    }
  }
}
