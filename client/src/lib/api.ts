import type { DeviceState } from "./types";

const BASE = "/api";

export async function fetchHardwareState(): Promise<DeviceState> {
  const res = await fetch(`${BASE}/hardware/state`);
  return res.json();
}

export async function hardwareAction(
  device: string,
  action: string,
  params?: Record<string, unknown>
): Promise<DeviceState> {
  const res = await fetch(`${BASE}/hardware/${device}/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: params ? JSON.stringify(params) : undefined,
  });
  return res.json();
}

export async function resetAll(): Promise<void> {
  await fetch(`${BASE}/reset`, { method: "POST" });
}

export async function getSignedUrl(): Promise<string> {
  const res = await fetch(`${BASE}/signed-url`);
  const data = await res.json();
  return data.signed_url;
}

export async function sendChatMessage(
  messages: { role: string; content: string }[]
): Promise<{ role: string; content: string }> {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  return res.json();
}
