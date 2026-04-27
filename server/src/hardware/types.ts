export interface DeviceState {
  candles: { lit: boolean };
  music: { playing: boolean; track?: string; genre?: string };
  color: { current: string };
}

export interface HardwareDriver {
  id: string;
  name: string;
  getState(): Promise<DeviceState>;
  execute(action: string, params: Record<string, unknown>): Promise<void>;
  reset(): Promise<void>;
}

export const DEFAULT_STATE: DeviceState = {
  candles: { lit: false },
  music: { playing: false },
  color: { current: "#1a1a2e" },
};
