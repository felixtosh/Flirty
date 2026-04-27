import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { HardwareManager } from "./hardware/index.js";

export function setupWebSocket(server: Server, hw: HardwareManager) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  hw.onStateChange((state) => {
    const msg = JSON.stringify({ type: "state", data: state });
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    }
  });

  wss.on("connection", async (ws) => {
    // Send initial state on connect
    const state = await hw.getState();
    ws.send(JSON.stringify({ type: "state", data: state }));
  });

  return wss;
}
