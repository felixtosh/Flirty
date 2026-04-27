interface Props {
  onReset: () => void;
}

export default function ResetButton({ onReset }: Props) {
  return (
    <button
      onClick={onReset}
      className="px-3 py-1.5 text-xs text-gray-500 hover:text-red-400 border border-surface-lighter hover:border-red-400/30 rounded-lg transition-colors"
    >
      Reset
    </button>
  );
}
