import { useState, useCallback, useEffect } from "react";
import type { ChatMessage, InputMode, OutputMode } from "./lib/types";
import { resetAll } from "./lib/api";
import { useHardwareState } from "./hooks/useHardwareState";
import { useFlirty } from "./hooks/useFlirty";
import ChatArea from "./components/ChatArea";
import InputBar from "./components/InputBar";
import HardwarePanel from "./components/HardwarePanel";
import ResetButton from "./components/ResetButton";
import MicButton from "./components/MicButton";
import ModeToggles from "./components/ModeToggles";
import VoiceVisualizer from "./components/VoiceVisualizer";

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMode, setInputMode] = useState<InputMode>("voice");
  const [outputMode, setOutputMode] = useState<OutputMode>("voice");
  const { state: hwState, refresh: refreshHw, onReset: onExternalReset } = useHardwareState();

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const flirty = useFlirty({ onMessage: addMessage });

  // Handle external reset (e.g. from curl POST /api/reset)
  useEffect(() => {
    onExternalReset(async () => {
      if (flirty.status === "connected") {
        await flirty.disconnect();
      }
      setMessages([]);
    });
  }, [flirty, onExternalReset]);

  // Mute mic when input mode is text
  useEffect(() => {
    if (flirty.status === "connected") {
      flirty.setMuted(inputMode === "text");
    }
  }, [inputMode, flirty]);

  // Mute output audio when output mode is text
  useEffect(() => {
    if (flirty.status === "connected") {
      flirty.setVolume(outputMode === "text" ? 0 : 1);
    }
  }, [outputMode, flirty]);

  const handleSend = useCallback(
    (text: string) => {
      if (flirty.status === "connected") {
        flirty.sendText(text);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "user", content: text, timestamp: Date.now() },
        ]);
      }
    },
    [flirty]
  );

  const handleReset = useCallback(async () => {
    if (flirty.status === "connected") {
      await flirty.disconnect();
    }
    await resetAll();
    setMessages([]);
    refreshHw();
  }, [flirty, refreshHw]);

  const showTextInput = inputMode === "text" || flirty.status !== "connected";
  const showMicButton = inputMode === "voice" || flirty.status !== "connected";

  return (
    <div className="h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-surface-lighter">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-light tracking-wide text-accent">Flirty</h1>
          {flirty.status === "connected" && (
            <VoiceVisualizer
              getVolume={flirty.getOutputVolume}
              active={flirty.isSpeaking}
            />
          )}
          {flirty.status === "connecting" && (
            <span className="text-xs text-gray-500">connecting...</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <ResetButton onReset={handleReset} />
        </div>
      </header>

      {/* Mode toggles + Hardware status */}
      <ModeToggles
        inputMode={inputMode}
        outputMode={outputMode}
        onInputModeChange={setInputMode}
        onOutputModeChange={setOutputMode}
      />
      <HardwarePanel state={hwState} />

      {/* Chat messages */}
      <ChatArea messages={messages} />

      {/* Input area */}
      <div className="flex items-center gap-3 p-4 border-t border-surface-lighter">
        {showTextInput && (
          <div className="flex-1">
            <InputBar onSend={handleSend} disabled={false} />
          </div>
        )}
        {showMicButton && (
          <MicButton
            isConnected={flirty.status === "connected"}
            isMuted={flirty.isMuted}
            isSpeaking={flirty.isSpeaking}
            onConnect={flirty.connect}
            onDisconnect={flirty.disconnect}
            onToggleMute={() => flirty.setMuted(!flirty.isMuted)}
          />
        )}
      </div>
    </div>
  );
}
