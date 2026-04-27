import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { HardwareManager } from "./hardware/index.js";

export function setupWebSocket(server: Server, hw: HardwareManager) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  const broadcast = (msg: string) => {
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    }
  };

  hw.onStateChange((state) => {
    broadcast(JSON.stringify({ type: "state", data: state }));
  });

  hw.onReset((state) => {
    broadcast(JSON.stringify({ type: "reset", data: state }));
  });

  wss.on("connection", async (ws) => {
    const state = await hw.getState();
    ws.send(JSON.stringify({ type: "state", data: state }));
  });

  return wss;
}
