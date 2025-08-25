import { createClient } from "@/utils/supabase/client";
import type { Message, Conversation } from "@/types/message";

export async function sendMessage(
  senderId: string,
  receiverId: string,
  messageText: string,
  productId?: number,
  transactionId?: number
): Promise<Message> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      message_text: messageText,
      product_id: productId,
      transaction_id: transactionId,
      message_type: 'text'
    })
    .select(`
      *,
      sender:users!messages_sender_id_fkey(*),
      receiver:users!messages_receiver_id_fkey(*),
      product:products(*)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to send message: ${error.message}`);
  }

  return data as Message;
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  const supabase = createClient();

  const { data: messages, error } = await supabase
    .from("messages")
    .select(`
      *,
      sender:users!messages_sender_id_fkey(*),
      receiver:users!messages_receiver_id_fkey(*),
      product:products(*)
    `)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("sent_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch conversations: ${error.message}`);
  }

  // Group messages by conversation
  const conversationMap = new Map<string, Conversation>();
  
  messages?.forEach((message: any) => {
    const otherParticipantId = message.sender_id === userId 
      ? message.receiver_id 
      : message.sender_id;
    
    const conversationKey = `${userId < otherParticipantId ? userId : otherParticipantId}-${userId < otherParticipantId ? otherParticipantId : userId}-${message.product_id || 'general'}`;
    
    if (!conversationMap.has(conversationKey)) {
      conversationMap.set(conversationKey, {
        conversation_id: Date.now(), // Temporary ID
        participant1_id: userId,
        participant2_id: otherParticipantId,
        product_id: message.product_id,
        last_message_at: message.sent_at,
        created_at: message.sent_at,
        latest_message: message,
        other_participant: message.sender_id === userId ? message.receiver : message.sender,
        product: message.product,
        unread_count: message.sender_id !== userId && !message.read_at ? 1 : 0
      });
    } else {
      const conversation = conversationMap.get(conversationKey)!;
      if (new Date(message.sent_at) > new Date(conversation.last_message_at)) {
        conversation.latest_message = message;
        conversation.last_message_at = message.sent_at;
      }
      if (message.sender_id !== userId && !message.read_at) {
        conversation.unread_count = (conversation.unread_count || 0) + 1;
      }
    }
  });

  return Array.from(conversationMap.values());
}

export async function getMessages(
  userId: string,
  otherUserId: string,
  productId?: number
): Promise<Message[]> {
  const supabase = createClient();

  let query = supabase
    .from("messages")
    .select(`
      *,
      sender:users!messages_sender_id_fkey(*),
      receiver:users!messages_receiver_id_fkey(*),
      product:products(*)
    `)
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
    .order("sent_at", { ascending: true });

  if (productId) {
    query = query.eq("product_id", productId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }

  return data as Message[];
}

export async function markMessagesAsRead(
  messageIds: number[]
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .in("message_id", messageIds);

  if (error) {
    throw new Error(`Failed to mark messages as read: ${error.message}`);
  }
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", userId)
    .is("read_at", null);

  if (error) {
    throw new Error(`Failed to get unread count: ${error.message}`);
  }

  return count || 0;
}
