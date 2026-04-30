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
  emphasisWords?: string[];
}

export interface FloatingWord {
  id: string;
  text: string;
  x: number;
  y: number;
  delay: number;
  createdAt: number;
}

export type InputMode = "text" | "voice";
export type OutputMode = "text" | "voice";
