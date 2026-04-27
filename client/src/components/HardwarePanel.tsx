import type { DeviceState } from "../lib/types";

interface Props {
  state: DeviceState | null;
}

export default function HardwarePanel({ state }: Props) {
  if (!state) return null;

  return (
    <div className="flex gap-5 px-4 py-2.5 text-xs text-gray-600 border-b border-surface-lighter bg-surface-light/30">
      <span
        className={`flex items-center gap-1.5 transition-colors ${
          state.candles.lit ? "text-amber-400 animate-candle" : ""
        }`}
      >
        <span className="text-base">{state.candles.lit ? "\u{1F525}" : "\u{1FAE5}"}</span>
        {state.candles.lit ? "candles lit" : "candles off"}
      </span>

      <span
        className={`flex items-center gap-1.5 transition-colors ${
          state.music.playing ? "text-green-400 animate-ambient-pulse" : ""
        }`}
      >
        <span className="text-base">{state.music.playing ? "\u{1F3B5}" : "\u{1F507}"}</span>
        {state.music.playing
          ? `playing${state.music.genre ? ` \u00B7 ${state.music.genre}` : ""}`
          : "music off"}
      </span>

      <span className="flex items-center gap-1.5">
        <span
          className="inline-block w-3 h-3 rounded-full ring-1 ring-white/10 transition-colors"
          style={{
            backgroundColor: state.color.current,
            boxShadow: `0 0 8px ${state.color.current}40`,
          }}
        />
        <span className="text-gray-500">{state.color.current}</span>
      </span>
    </div>
  );
}
