import type { ChatMessage as ChatMessageType } from "../lib/types";

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3 animate-message-in`}>
      <div className="max-w-[80%]">
        <div
          className={`px-4 py-3 rounded-2xl transition-colors ${
            isUser
              ? "bg-accent/10 text-white/90 rounded-br-sm border border-accent/10"
              : "bg-surface-lighter text-gray-300 rounded-bl-sm border border-white/5"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        {!isUser && message.emphasisWords && message.emphasisWords.length > 0 && (
          <p className="mt-1 ml-2 text-xs italic text-accent/50">
            {"✦ " + message.emphasisWords.join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}
