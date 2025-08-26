"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageInput } from "@/components/ui/message-input";
import { MessageBubble } from "@/components/ui/message-bubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Search,
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
} from "@/lib/messages";
import type { Conversation, Message } from "@/types/message";

export default function MessagesPage() {
  const { user, loading, isAuthenticated } = useAuthRedirect();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      const fetchConversationsData = async () => {
        try {
          setLoadingConversations(true);
          const data = await getConversations(user.id);
          setConversations(data);
        } catch (err) {
          setError("Failed to load conversations");
          console.error("Error fetching conversations:", err);
        } finally {
          setLoadingConversations(false);
        }
      };

      fetchConversationsData();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoadingConversations(true);
      const data = await getConversations(user.id);
      setConversations(data);
    } catch (err) {
      setError("Failed to load conversations");
      console.error("Error fetching conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchMessages = async (conversation: Conversation) => {
    if (!user) return;

    try {
      setLoadingMessages(true);
      const data = await getMessages(
        user.id,
        conversation.participant2_id,
        conversation.product_id
      );
      setMessages(data);

      // Mark messages as read
      const unreadMessages = data
        .filter((msg) => msg.sender_id !== user.id && !msg.read_at)
        .map((msg) => msg.message_id);

      if (unreadMessages.length > 0) {
        await markMessagesAsRead(unreadMessages);
        // Update conversation unread count
        setConversations((prev) =>
          prev.map((conv) =>
            conv.conversation_id === conversation.conversation_id
              ? { ...conv, unread_count: 0 }
              : conv
          )
        );
      }
    } catch (err) {
      setError("Failed to load messages");
      console.error("Error fetching messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation);
  };

  const handleSendMessage = async (messageText: string) => {
    if (!user || !selectedConversation) return;

    try {
      const newMessage = await sendMessage(
        user.id,
        selectedConversation.participant2_id,
        messageText,
        selectedConversation.product_id
      );

      setMessages((prev) => [...prev, newMessage]);

      // Update conversation's last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.conversation_id === selectedConversation.conversation_id
            ? {
                ...conv,
                latest_message: newMessage,
                last_message_at: newMessage.sent_at,
              }
            : conv
        )
      );
    } catch (err) {
      setError("Failed to send message");
      console.error("Error sending message:", err);
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.other_participant?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      conv.product?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto h-[calc(100vh-80px)] max-w-7xl">
      <div className="flex h-full border rounded-lg overflow-hidden bg-white">
        {/* Conversations Sidebar */}
        <div
          className={`w-full md:w-1/3 border-r flex flex-col ${
            selectedConversation ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b bg-gray-50">
            <h1 className="text-xl font-semibold mb-3">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            {loadingConversations ? (
              <div className="p-4 text-center text-gray-500">
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                <p>No conversations yet</p>
                <p className="text-sm">
                  Messages will appear here when you start chatting
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.conversation_id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                      selectedConversation?.conversation_id ===
                      conversation.conversation_id
                        ? "bg-blue-50 border-l-4 border-l-blue-600"
                        : ""
                    }`}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <div className="flex gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {conversation.other_participant?.name
                            .substring(0, 2)
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
                            {conversation.unread_count &&
                              conversation.unread_count > 0 && (
                                <Badge className="bg-blue-600 text-white px-2 py-1 text-xs">
                                  {conversation.unread_count}
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
                            {conversation.latest_message.sender_id ===
                              user.id && "You: "}
                            {conversation.latest_message.message_text}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div
          className={`flex-1 flex flex-col ${
            selectedConversation ? "flex" : "hidden md:flex"
          }`}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>

                  <Avatar>
                    <AvatarFallback>
                      {selectedConversation.other_participant?.name
                        .substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h2 className="font-semibold">
                      {selectedConversation.other_participant?.name}
                    </h2>
                    {selectedConversation.product && (
                      <Link
                        href={`/products/${selectedConversation.product.product_id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        About: {selectedConversation.product.name}
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

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {loadingMessages ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading messages...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const isOwn = message.sender_id === user.id;
                      const showAvatar =
                        index === 0 ||
                        messages[index - 1]?.sender_id !== message.sender_id;

                      return (
                        <MessageBubble
                          key={message.message_id}
                          message={{
                            id: message.message_id.toString(),
                            text: message.message_text,
                            sender: {
                              id: message.sender_id,
                              name: isOwn
                                ? "You"
                                : message.sender?.name || "Unknown",
                            },
                            timestamp: new Date(message.sent_at),
                            isRead: !!message.read_at,
                            type: message.message_type as "text" | "system",
                          }}
                          isOwn={isOwn}
                          showAvatar={showAvatar}
                        />
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <MessageInput
                onSendMessage={handleSendMessage}
                placeholder={`Message ${selectedConversation.other_participant?.name}...`}
              />
            </>
          ) : (
            /* No Conversation Selected */
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <MessageCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  Select a conversation
                </h2>
                <p className="text-gray-500 max-w-md">
                  Choose a conversation from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
