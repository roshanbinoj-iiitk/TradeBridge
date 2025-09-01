"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { useSearchParams } from "next/navigation";
import {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
} from "@/lib/messages";
import type { Conversation, Message } from "@/types/message";
import { ConversationList } from "@/components/messages/conversation-list";
import { ChatWindow } from "@/components/messages/chat-window";
import { EmptyState } from "@/components/messages/empty-state";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";

export default function MessagesPage() {
  const { user, loading } = useAuthRedirect();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const productId = searchParams.get("productId");
  const otherUserId = searchParams.get("otherUserId");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✅ Fetch messages when selecting a conversation (moved above conversations useEffect)
  const fetchMessages = useCallback(
    async (conv: Conversation) => {
      if (!user) return;

      setLoadingMessages(true);
      try {
        const data = await getMessages(conv.conversation_id);
        setMessages(data);

        const unreadIds = data
          .filter((m) => m.sender_id !== user.id && !m.read_at)
          .map((m) => m.message_id);
        if (unreadIds.length) await markMessagesAsRead(unreadIds);

        setConversations((prev) =>
          prev.map((c) =>
            c.conversation_id === conv.conversation_id
              ? { ...c, unread_count: 0 }
              : c
          )
        );
      } catch {
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      } finally {
        setLoadingMessages(false);
      }
    },
    [user, toast]
  );

  // ✅ Fetch conversations
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        setLoadingConversations(true);
        const data = await getConversations(user.id);
        setConversations(data);

        // If productId & otherUserId present, try to auto-open a matching conversation
        if (productId && otherUserId) {
          const matchingConv = data.find(
            (conv) =>
              conv.product_id === parseInt(productId) &&
              (conv.participant1_id === otherUserId ||
                conv.participant2_id === otherUserId)
          );

          if (matchingConv) {
            await fetchMessages(matchingConv);
            setSelectedConversation(matchingConv);
          } else {
            // No existing conversation — create a temporary conversation object
            const supabase = createClient();
            const { data: otherUser } = await supabase
              .from("users")
              .select("uuid, name, email")
              .eq("uuid", otherUserId)
              .single();

            const { data: product } = await supabase
              .from("products")
              .select("product_id, name, image_url, lender_id")
              .eq("product_id", parseInt(productId))
              .single();

            // Always set participant1 as borrower, participant2 as lender (same logic as old page)
            let participant1_id = user.id;
            let participant2_id = otherUserId;
            if (product && product.lender_id) {
              if (user.id === product.lender_id) {
                participant1_id = otherUserId; // borrower
                participant2_id = user.id; // lender
              }
            }

            const tempConv: Conversation = {
              conversation_id: Date.now(), // temporary
              participant1_id,
              participant2_id,
              product_id: parseInt(productId),
              last_message_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              other_participant: otherUser
                ? {
                    uuid: otherUser.uuid,
                    name: otherUser.name,
                    email: otherUser.email,
                  }
                : { uuid: otherUserId, name: "Lender", email: "" },
              product: product
                ? {
                    product_id: product.product_id,
                    name: product.name,
                    image_url: product.image_url,
                  }
                : undefined,
              unread_count: 0,
            };

            setSelectedConversation(tempConv);
          }
        }
      } catch {
        toast({
          title: "Error",
          description: "Failed to load conversations",
          variant: "destructive",
        });
      } finally {
        setLoadingConversations(false);
      }
    })();
  }, [user, toast, productId, otherUserId, fetchMessages]);

  const handleSelectConversation = useCallback(
    async (conv: Conversation) => {
      await fetchMessages(conv);
      setSelectedConversation(conv);
    },
    [fetchMessages]
  );

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!user || !selectedConversation) return;
      try {
        const receiverId =
          selectedConversation.participant1_id === user.id
            ? selectedConversation.participant2_id
            : selectedConversation.participant1_id;

        const newMsg = await sendMessage(
          user.id,
          receiverId,
          text,
          selectedConversation.product_id
        );
        setMessages((prev) => [...prev, newMsg]);
      } catch {
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
      }
    },
    [user, selectedConversation, toast]
  );

  if (loading || !user) return <EmptyState variant="loading" />;

  return (
    <div className="container mx-auto h-[calc(100vh-80px)] max-w-7xl flex border rounded-lg bg-white mt-24">
      <ConversationList
        conversations={conversations}
        loading={loadingConversations}
        selectedId={selectedConversation?.conversation_id}
        onSelect={handleSelectConversation}
        currentUserId={user.id}
      />
      <ChatWindow
        conversation={selectedConversation}
        messages={messages}
        loading={loadingMessages}
        onSendMessage={handleSendMessage}
        onBack={() => setSelectedConversation(null)}
        currentUserId={user.id}
        messagesEndRef={messagesEndRef}
      />
    </div>
  );
}
