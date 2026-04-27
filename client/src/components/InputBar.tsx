import { useState, type FormEvent } from "react";

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function InputBar({ onSend, disabled }: Props) {
  const [text, setText] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something..."
        disabled={disabled}
        className="flex-1 bg-surface-light border border-surface-lighter rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-colors"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="px-5 py-3 bg-accent/20 text-accent rounded-xl text-sm font-medium hover:bg-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Send
      </button>
    </form>
  );
}
