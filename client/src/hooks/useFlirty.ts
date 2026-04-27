import { useCallback, useRef } from "react";
import { useConversation } from "@elevenlabs/react";
import { getSignedUrl } from "../lib/api";
import { clientTools } from "../lib/clientTools";
import type { ChatMessage } from "../lib/types";

interface UseFlirtyOptions {
  onMessage: (msg: ChatMessage) => void;
}

export function useFlirty({ onMessage }: UseFlirtyOptions) {
  const msgIdRef = useRef(0);

  const makeMsg = useCallback(
    (role: "user" | "assistant", content: string): ChatMessage => ({
      id: String(++msgIdRef.current),
      role,
      content,
      timestamp: Date.now(),
    }),
    []
  );

  const conversation = useConversation({
    clientTools,
    onMessage: (payload) => {
      if (payload.source === "ai") {
        onMessage(makeMsg("assistant", payload.message));
      } else if (payload.source === "user") {
        onMessage(makeMsg("user", payload.message));
      }
    },
    onError: (message, context) => {
      console.error("ElevenLabs error:", message, context);
    },
  });

  const connect = useCallback(async () => {
    try {
      const signedUrl = await getSignedUrl();
      await conversation.startSession({ signedUrl });
    } catch (err) {
      console.error("Failed to connect:", err);
    }
  }, [conversation]);

  const disconnect = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const sendText = useCallback(
    (text: string) => {
      if (conversation.status === "connected") {
        conversation.sendUserMessage(text);
      }
    },
    [conversation]
  );

  return {
    connect,
    disconnect,
    sendText,
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
    mode: conversation.mode,
    isMuted: conversation.isMuted,
    setMuted: conversation.setMuted,
    getInputVolume: conversation.getInputVolume,
    getOutputVolume: conversation.getOutputVolume,
  };
}
