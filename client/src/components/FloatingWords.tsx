import type { FloatingWord } from "../lib/types";

interface Props {
  words: FloatingWord[];
}

export default function FloatingWords({ words }: Props) {
  if (words.length === 0) return null;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
      {words.map((word) => (
        <span
          key={word.id}
          className="absolute text-4xl font-light italic text-white/70 animate-word-float drop-shadow-[0_0_12px_rgba(255,107,74,0.3)]"
          style={{
            left: `${word.x}%`,
            top: `${word.y}%`,
            animationDelay: `${word.delay}ms`,
          }}
        >
          {word.text}
        </span>
      ))}
    </div>
  );
}
