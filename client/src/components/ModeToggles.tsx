import type { InputMode, OutputMode } from "../lib/types";

interface Props {
  inputMode: InputMode;
  outputMode: OutputMode;
  onInputModeChange: (mode: InputMode) => void;
  onOutputModeChange: (mode: OutputMode) => void;
}

export default function ModeToggles({
  inputMode,
  outputMode,
  onInputModeChange,
  onOutputModeChange,
}: Props) {
  return (
    <div className="flex items-center gap-4 px-4 py-2 border-b border-surface-lighter">
      <Toggle
        label="Input"
        optionA="Text"
        optionB="Mic"
        active={inputMode === "voice" ? "b" : "a"}
        onToggle={() => onInputModeChange(inputMode === "text" ? "voice" : "text")}
      />
      <Toggle
        label="Output"
        optionA="Text"
        optionB="Voice"
        active={outputMode === "voice" ? "b" : "a"}
        onToggle={() => onOutputModeChange(outputMode === "text" ? "voice" : "text")}
      />
    </div>
  );
}

function Toggle({
  label,
  optionA,
  optionB,
  active,
  onToggle,
}: {
  label: string;
  optionA: string;
  optionB: string;
  active: "a" | "b";
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-500">{label}:</span>
      <button
        onClick={onToggle}
        className="flex items-center bg-surface-light rounded-full p-0.5"
      >
        <span
          className={`px-2 py-1 rounded-full transition-colors ${
            active === "a" ? "bg-accent/20 text-accent" : "text-gray-500"
          }`}
        >
          {optionA}
        </span>
        <span
          className={`px-2 py-1 rounded-full transition-colors ${
            active === "b" ? "bg-accent/20 text-accent" : "text-gray-500"
          }`}
        >
          {optionB}
        </span>
      </button>
    </div>
  );
}
