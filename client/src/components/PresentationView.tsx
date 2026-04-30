import type { ReactNode } from "react";
import VoiceVisualizer from "./VoiceVisualizer";

interface Props {
  isConnected: boolean;
  isSpeaking: boolean;
  isTextSession: boolean;
  getOutputVolume: () => number;
  children?: ReactNode;
}

export default function PresentationView({
  isConnected,
  isSpeaking,
  isTextSession,
  getOutputVolume,
  children,
}: Props) {
  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 animate-gradient-shift bg-[length:400%_400%]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 20% 50%, rgba(255,107,74,0.15) 0%, transparent 50%)," +
            "radial-gradient(ellipse at 80% 20%, rgba(180,40,40,0.1) 0%, transparent 50%)," +
            "radial-gradient(ellipse at 50% 80%, rgba(255,60,60,0.08) 0%, transparent 50%)," +
            "linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 25%, #0a0a0a 50%, #150808 75%, #0a0a0a 100%)",
        }}
      />

      {/* Centered visualizer */}
      {isConnected && !isTextSession && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="transform scale-[3]">
            <VoiceVisualizer
              getVolume={getOutputVolume}
              active={isSpeaking}
            />
          </div>
        </div>
      )}

      {/* Floating words overlay */}
      {children}
    </div>
  );
}
