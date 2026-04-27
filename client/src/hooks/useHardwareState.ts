import { useState, useEffect, useCallback, useRef } from "react";
import type { DeviceState } from "../lib/types";
import { fetchHardwareState } from "../lib/api";

type ResetHandler = () => void;

export function useHardwareState() {
  const [state, setState] = useState<DeviceState | null>(null);
  const onResetRef = useRef<ResetHandler | null>(null);

  const refresh = useCallback(async () => {
    const s = await fetchHardwareState();
    setState(s);
  }, []);

  useEffect(() => {
    refresh();

    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${location.host}/ws`);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "state") {
        setState(msg.data);
      } else if (msg.type === "reset") {
        setState(msg.data);
        onResetRef.current?.();
      }
    };

    ws.onclose = () => {
      setTimeout(() => refresh(), 2000);
    };

    return () => ws.close();
  }, [refresh]);

  const onReset = useCallback((handler: ResetHandler) => {
    onResetRef.current = handler;
  }, []);

  return { state, refresh, onReset };
}
