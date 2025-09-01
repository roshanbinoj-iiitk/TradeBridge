"use client";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";
import type { Conversation } from "@/types/message";
import { ConversationItem } from "./conversation-item";

interface Props {
  conversations: Conversation[];
  loading: boolean;
  selectedId?: number;
  onSelect: (conv: Conversation) => void;
  currentUserId: string;
}

export function ConversationList({
  conversations,
  loading,
  selectedId,
  onSelect,
  currentUserId,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    return conversations.filter(
      (c) =>
        c.other_participant?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        c.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conversations, searchTerm]);

  return (
    <div className="w-full md:w-1/3 border-r flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <h1 className="text-xl font-semibold mb-3">Messages</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search conversations..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            Loading conversations...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageCircle className="mx-auto h-12 w-12 mb-4 text-gray-300" />
            <p>No conversations yet</p>
            <p className="text-sm">
              Messages will appear here when you start chatting
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((c) => (
              <ConversationItem
                key={c.conversation_id}
                conversation={c}
                isSelected={c.conversation_id === selectedId}
                onSelect={() => onSelect(c)}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
