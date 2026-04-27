export interface DeviceState {
  candles: { lit: boolean };
  music: { playing: boolean; track?: string; genre?: string };
  color: { current: string };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export type InputMode = "text" | "voice";
export type OutputMode = "text" | "voice";
