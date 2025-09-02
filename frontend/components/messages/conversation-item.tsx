"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { formatMessageTime } from "@/utils/date";
import type { Conversation } from "@/types/message";

interface Props {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: () => void;
  currentUserId: string;
}

export function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  currentUserId,
}: Props) {
  return (
    <div
      className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
        isSelected ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
      }`}
      onClick={onSelect}
    >
      <div className="flex gap-3">
        <Avatar>
          <AvatarFallback>
            {conversation.other_participant?.name
              ?.substring(0, 2)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-sm truncate">
              {conversation.other_participant?.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {formatMessageTime(conversation.last_message_at)}
              </span>
              {(conversation.unread_count ?? 0) > 0 && (
                <Badge className="bg-blue-600 text-white px-2 py-1 text-xs">
                  {conversation.unread_count ?? 0}
                </Badge>
              )}
            </div>
          </div>

          {conversation.product && (
            <div className="flex items-center gap-2 mt-1">
              {conversation.product.image_url && (
                <Image
                  src={conversation.product.image_url}
                  alt={conversation.product.name}
                  width={24}
                  height={24}
                  className="rounded object-cover"
                />
              )}
              <span className="text-xs text-gray-600 truncate">
                {conversation.product.name}
              </span>
            </div>
          )}

          {conversation.latest_message && (
            <p className="text-sm text-gray-600 truncate mt-1">
              {conversation.latest_message.sender_id === currentUserId &&
                "You: "}
              {conversation.latest_message.message_text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
