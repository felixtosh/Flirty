import { useState, useCallback } from "react";
import type { ChatMessage } from "./lib/types";
import { resetAll } from "./lib/api";
import { useHardwareState } from "./hooks/useHardwareState";
import ChatArea from "./components/ChatArea";
import InputBar from "./components/InputBar";
import HardwarePanel from "./components/HardwarePanel";
import ResetButton from "./components/ResetButton";

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { state: hwState, refresh: refreshHw } = useHardwareState();

  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role, content, timestamp: Date.now() },
    ]);
  }, []);

  const handleSend = useCallback(
    (text: string) => {
      addMessage("user", text);
      // AI response will be wired in step 5
    },
    [addMessage]
  );

  const handleReset = useCallback(async () => {
    await resetAll();
    setMessages([]);
    refreshHw();
  }, [refreshHw]);

  return (
    <div className="h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-surface-lighter">
        <h1 className="text-lg font-light tracking-wide text-accent">Flirty</h1>
        <ResetButton onReset={handleReset} />
      </header>

      {/* Hardware status bar */}
      <HardwarePanel state={hwState} />

      {/* Chat messages */}
      <ChatArea messages={messages} />

      {/* Input */}
      <InputBar onSend={handleSend} />
    </div>
  );
}
