interface Props {
  isConnected: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onToggleMute: () => void;
}

export default function MicButton({
  isConnected,
  isMuted,
  isSpeaking,
  onConnect,
  onDisconnect,
  onToggleMute,
}: Props) {
  if (!isConnected) {
    return (
      <button
        onClick={onConnect}
        className="w-14 h-14 rounded-full bg-accent/20 text-accent hover:bg-accent/30 hover:glow-accent flex items-center justify-center transition-all"
        title="Start voice conversation"
      >
        <MicIcon />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggleMute}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
          isMuted
            ? "bg-red-500/20 text-red-400"
            : isSpeaking
              ? "bg-accent/20 text-accent glow-accent animate-pulse"
              : "bg-accent/20 text-accent"
        }`}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <MicOffIcon /> : <MicIcon />}
      </button>
      <button
        onClick={onDisconnect}
        className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center text-xs transition-colors"
        title="End conversation"
      >
        <EndIcon />
      </button>
    </div>
  );
}

function MicIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M1 1l22 22" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 16.95A7 7 0 015 12v-2m14 0v2c0 .87-.16 1.71-.46 2.49M12 19v4M8 23h8"
      />
    </svg>
  );
}

function EndIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
