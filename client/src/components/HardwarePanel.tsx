import type { DeviceState } from "../lib/types";

interface Props {
  state: DeviceState | null;
}

export default function HardwarePanel({ state }: Props) {
  if (!state) return null;

  return (
    <div className="flex gap-4 px-4 py-2 text-xs text-gray-500 border-b border-surface-lighter">
      <span className={state.candles.lit ? "text-amber-400" : ""}>
        {state.candles.lit ? "candles lit" : "candles off"}
      </span>
      <span className={state.music.playing ? "text-green-400" : ""}>
        {state.music.playing ? `playing${state.music.genre ? ` (${state.music.genre})` : ""}` : "music off"}
      </span>
      <span>
        <span
          className="inline-block w-2 h-2 rounded-full mr-1 align-middle"
          style={{ backgroundColor: state.color.current }}
        />
        {state.color.current}
      </span>
    </div>
  );
}
