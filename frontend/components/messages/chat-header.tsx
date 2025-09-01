"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";
import Link from "next/link";
import type { Conversation } from "@/types/message";

interface Props {
  conversation: Conversation;
  onBack: () => void;
}

export function ChatHeader({ conversation, onBack }: Props) {
  return (
    <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <Avatar>
          <AvatarFallback>
            {conversation.other_participant?.name
              ?.substring(0, 2)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <h2 className="font-semibold">
            {conversation.other_participant?.name}
          </h2>
          {conversation.product && (
            <Link
              href={`/products/${conversation.product.product_id}`}
              className="text-sm text-blue-600 hover:underline"
            >
              About: {conversation.product.name}
            </Link>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="ghost" size="sm">
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Video className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
