interface Props {
  isConnected: boolean;
  isConnecting: boolean;
  onStart: () => void;
  onStop: () => void;
  appMode: "config" | "presentation";
  onToggleMode: () => void;
}

export default function Footer({
  isConnected,
  isConnecting,
  onStart,
  onStop,
  appMode,
  onToggleMode,
}: Props) {
  return (
    <footer className="flex items-center justify-between px-4 py-2 border-t border-surface-lighter/50">
      <span className="text-xs text-gray-600 font-light tracking-wider">
        Flirty 0.1
      </span>
      <div className="flex items-center gap-2">
        {isConnected ? (
          <button
            onClick={onStop}
            className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors"
            title="Stop conversation"
          >
            <span className="text-sm">⏹️</span>
          </button>
        ) : (
          <button
            onClick={onStart}
            disabled={isConnecting}
            className="w-8 h-8 rounded-full bg-accent/10 hover:bg-accent/20 flex items-center justify-center transition-colors disabled:opacity-40"
            title="Start conversation"
          >
            <span className="text-sm">▶️</span>
          </button>
        )}
        <button
          onClick={onToggleMode}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            appMode === "presentation"
              ? "bg-accent/20 hover:bg-accent/30"
              : "bg-surface-lighter/30 hover:bg-surface-lighter/50"
          }`}
          title={appMode === "config" ? "Enter presentation mode" : "Exit presentation mode"}
        >
          <span className="text-sm">❤️</span>
        </button>
      </div>
    </footer>
  );
}
