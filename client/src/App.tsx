import { useState, useCallback, useEffect, useRef } from "react";
import type { ChatMessage, FloatingWord, InputMode, OutputMode } from "./lib/types";
import { useHardwareState } from "./hooks/useHardwareState";
import { useFlirty } from "./hooks/useFlirty";
import { extractEmphasisWords } from "./lib/emphasisWords";
import { musicPlayer } from "./lib/musicPlayer";
import ChatArea from "./components/ChatArea";
import InputBar from "./components/InputBar";
import HardwarePanel from "./components/HardwarePanel";
import MicButton from "./components/MicButton";
import ModeToggles from "./components/ModeToggles";
import Footer from "./components/Footer";
import PresentationView from "./components/PresentationView";
import FloatingWords from "./components/FloatingWords";

const FLOATING_WORD_LIFETIME = 5000;

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMode, setInputMode] = useState<InputMode>("voice");
  const [outputMode, setOutputMode] = useState<OutputMode>("voice");
  const [appMode, setAppMode] = useState<"config" | "presentation">("config");
  const [floatingWords, setFloatingWords] = useState<FloatingWord[]>([]);
  const [latestEmphasis, setLatestEmphasis] = useState<string[]>([]);
  const { state: hwState, onReset: onExternalReset } = useHardwareState();
  const wordIdRef = useRef(0);

  const applyEmphasis = useCallback((words: string[]) => {
    if (words.length === 0) return;
    setLatestEmphasis(words);

    // Add floating words with random positions
    const newWords: FloatingWord[] = words.map((text, i) => ({
      id: String(++wordIdRef.current),
      text,
      x: 10 + Math.random() * 80,
      y: 15 + Math.random() * 70,
      delay: i * 400,
      createdAt: Date.now(),
    }));
    setFloatingWords((prev) => [...prev, ...newWords]);
  }, []);

  const addMessage = useCallback((msg: ChatMessage) => {
    if (msg.role === "assistant") {
      const words = extractEmphasisWords(msg.content);
      msg = { ...msg, emphasisWords: words.length > 0 ? words : undefined };
      applyEmphasis(words);
    }
    setMessages((prev) => [...prev, msg]);
  }, [applyEmphasis]);

  const flirty = useFlirty({ onMessage: addMessage });

  // Clean up expired floating words
  useEffect(() => {
    if (floatingWords.length === 0) return;
    const timer = setInterval(() => {
      const now = Date.now();
      setFloatingWords((prev) =>
        prev.filter((w) => now - w.createdAt < FLOATING_WORD_LIFETIME + w.delay)
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [floatingWords.length]);

  const isConnected = flirty.status === "connected";

  // Handle external reset (e.g. from curl POST /api/reset)
  useEffect(() => {
    onExternalReset(async () => {
      musicPlayer.stop();
      if (flirty.status === "connected") {
        await flirty.disconnect();
      }
      setMessages([]);
    });
  }, [flirty, onExternalReset]);

  // Mute mic when input mode is text (not applicable in text-only sessions)
  useEffect(() => {
    if (isConnected && !flirty.isTextSession) {
      flirty.setMuted(inputMode === "text");
    }
  }, [inputMode, isConnected, flirty]);

  // Mute output audio when output mode is text (not applicable in text-only sessions)
  useEffect(() => {
    if (isConnected && !flirty.isTextSession) {
      flirty.setVolume(outputMode === "text" ? 0 : 1);
    }
  }, [outputMode, isConnected, flirty]);

  const handleSend = useCallback(
    (text: string) => {
      if (isConnected) {
        flirty.sendText(text);
      }
    },
    [flirty, isConnected]
  );

  const handleConnect = useCallback(() => {
    flirty.connect({ textOnly: inputMode === "text" && outputMode === "text" });
  }, [flirty, inputMode, outputMode]);

  const handleDisconnect = useCallback(async () => {
    musicPlayer.stop();
    await flirty.disconnect();
  }, [flirty]);


  return (
    <div className={`h-screen bg-surface flex flex-col w-full ${appMode === "config" ? "max-w-2xl mx-auto" : ""}`}>

      {appMode === "config" ? (
        <>
          {/* Mode toggles + Hardware status */}
          <ModeToggles
            inputMode={inputMode}
            outputMode={outputMode}
            onInputModeChange={setInputMode}
            onOutputModeChange={setOutputMode}
          />
          <HardwarePanel state={hwState} emphasisWords={latestEmphasis} />

          {/* Chat messages */}
          <ChatArea messages={messages} />

          {/* Input area */}
          <div
            className={`flex items-center gap-3 p-4 border-t border-surface-lighter/50 ${
              inputMode === "voice" && !isConnected ? "justify-center" : ""
            }`}
          >
            {inputMode === "text" ? (
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1">
                  <InputBar onSend={handleSend} disabled={!isConnected} />
                </div>
              </div>
            ) : (
              <MicButton
                isConnected={isConnected}
                isMuted={flirty.isMuted}
                isSpeaking={flirty.isSpeaking}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onToggleMute={() => flirty.setMuted(!flirty.isMuted)}
              />
            )}
          </div>
        </>
      ) : (
        <PresentationView
          isConnected={isConnected}
          isSpeaking={flirty.isSpeaking}
          isTextSession={flirty.isTextSession}
          getOutputVolume={flirty.getOutputVolume}
        >
          <FloatingWords words={floatingWords} />
        </PresentationView>
      )}

      {/* Footer - always visible */}
      <Footer
        isConnected={isConnected}
        isConnecting={flirty.status === "connecting"}
        onStart={handleConnect}
        onStop={handleDisconnect}
        appMode={appMode}
        onToggleMode={() => setAppMode((m) => (m === "config" ? "presentation" : "config"))}
      />
    </div>
  );
}
