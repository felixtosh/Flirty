import { useEffect, useRef } from "react";
import type { ChatMessage as ChatMessageType } from "../lib/types";
import ChatMessage from "./ChatMessage";

interface Props {
  messages: ChatMessageType[];
}

export default function ChatArea({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-600 text-sm">
          Start a conversation...
        </div>
      )}
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
