import { useState, useEffect, useCallback } from "react";
import type { DeviceState } from "../lib/types";
import { fetchHardwareState } from "../lib/api";

export function useHardwareState() {
  const [state, setState] = useState<DeviceState | null>(null);

  const refresh = useCallback(async () => {
    const s = await fetchHardwareState();
    setState(s);
  }, []);

  useEffect(() => {
    refresh();

    // WebSocket for real-time updates
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${location.host}/ws`);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "state") {
        setState(msg.data);
      }
    };

    ws.onclose = () => {
      // Reconnect after a delay
      setTimeout(() => refresh(), 2000);
    };

    return () => ws.close();
  }, [refresh]);

  return { state, refresh };
}
