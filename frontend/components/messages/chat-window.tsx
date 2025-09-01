"use client";

import { ChatHeader } from "./chat-header";
import { MessageList } from "./message-list";
import { MessageInput } from "@/components/ui/message-input";
import { useEffect } from "react";
import type { Conversation, Message } from "@/types/message";

interface Props {
  conversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  onSendMessage: (text: string) => void;
  onBack: () => void;
  currentUserId?: string;
  messagesEndRef?: React.RefObject<HTMLDivElement>;
}

export function ChatWindow({
  conversation,
  messages,
  loading,
  onSendMessage,
  onBack,
  currentUserId = "",
  messagesEndRef,
}: Props) {
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-center text-gray-500">
        <p>Select a conversation to start messaging</p>
      </div>
    );
  }

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef && messagesEndRef.current) {
      try {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      } catch (e) {
        // ignore
      }
    }
  }, [messages, messagesEndRef]);

  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader conversation={conversation} onBack={onBack} />
      <MessageList
        messages={messages}
        loading={loading}
        currentUserId={currentUserId}
        messagesEndRef={messagesEndRef!}
      />
      <MessageInput
        onSendMessage={onSendMessage}
        placeholder={`Message ${conversation.other_participant?.name}...`}
      />
    </div>
  );
}
