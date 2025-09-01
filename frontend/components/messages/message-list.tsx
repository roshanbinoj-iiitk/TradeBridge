"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/ui/message-bubble";
import type { Message } from "@/types/message";

interface Props {
  messages: Message[];
  loading: boolean;
  currentUserId: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function MessageList({
  messages,
  loading,
  currentUserId,
  messagesEndRef,
}: Props) {
  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">Loading messages...</div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages
          .filter((m) => !m.is_deleted)
          .map((m, i, arr) => {
            const isOwn = m.sender_id === currentUserId;
            const showAvatar = i === 0 || arr[i - 1]?.sender_id !== m.sender_id;

            return (
              <MessageBubble
                key={m.message_id}
                message={{
                  id: m.message_id.toString(),
                  text: m.message_text,
                  sender: {
                    id: m.sender_id,
                    name: isOwn ? "You" : m.sender?.name || "Unknown",
                  },
                  timestamp: new Date(m.sent_at),
                  isRead: !!m.read_at,
                  type: m.message_type as "text" | "system",
                }}
                isOwn={isOwn}
                showAvatar={showAvatar}
              />
            );
          })}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
