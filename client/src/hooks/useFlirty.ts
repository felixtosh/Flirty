import { useCallback, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { getSignedUrl } from "../lib/api";
import { clientTools } from "../lib/clientTools";
import type { ChatMessage } from "../lib/types";

interface UseFlirtyOptions {
  onMessage: (msg: ChatMessage) => void;
}

export function useFlirty({ onMessage }: UseFlirtyOptions) {
  const msgIdRef = useRef(0);
  const [isTextSession, setIsTextSession] = useState(false);
  const lastAiMsgRef = useRef<string>("");

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
        // Deduplicate identical consecutive AI messages
        if (payload.message === lastAiMsgRef.current) return;
        lastAiMsgRef.current = payload.message;
        onMessage(makeMsg("assistant", payload.message));
      } else if (payload.source === "user") {
        // Show transcribed voice input
        onMessage(makeMsg("user", payload.message));
      }
    },
    onError: (message, context) => {
      console.error("ElevenLabs error:", message, context);
    },
    onDisconnect: () => {
      setIsTextSession(false);
    },
  });

  const connect = useCallback(async (options?: { textOnly?: boolean }) => {
    try {
      const textOnly = options?.textOnly ?? false;
      setIsTextSession(textOnly);
      const signedUrl = await getSignedUrl();
      await conversation.startSession({
        signedUrl,
        overrides: textOnly
          ? { conversation: { textOnly: true } }
          : undefined,
      });
    } catch (err) {
      setIsTextSession(false);
      console.error("Failed to connect:", err);
    }
  }, [conversation]);

  const disconnect = useCallback(async () => {
    await conversation.endSession();
    setIsTextSession(false);
    lastAiMsgRef.current = "";
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
    isTextSession,
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
    mode: conversation.mode,
    isMuted: conversation.isMuted,
    setMuted: (muted: boolean) => {
      try { conversation.setMuted(muted); } catch {}
    },
    setVolume: (vol: number) => {
      try { conversation.setVolume({ volume: vol }); } catch {}
    },
    getInputVolume: conversation.getInputVolume,
    getOutputVolume: conversation.getOutputVolume,
  };
}
