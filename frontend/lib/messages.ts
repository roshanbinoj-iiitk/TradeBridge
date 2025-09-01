import { createClient } from "@/utils/supabase/client";
import type { Message, Conversation } from "@/types/message";

export async function sendMessage(
  senderId: string,
  receiverId: string,
  messageText: string,
  productId?: number
): Promise<Message> {
  const supabase = createClient();

  let participant1_id: string;
  let participant2_id: string;

  if (productId) {
    // Fetch lender_id from products
    const { data: product } = await supabase
      .from("products")
      .select("lender_id")
      .eq("product_id", productId)
      .single();

    if (product) {
      const lenderId = product.lender_id;
      if (senderId === lenderId) {
        participant1_id = receiverId; // borrower
        participant2_id = senderId; // lender
      } else {
        participant1_id = senderId; // borrower
        participant2_id = receiverId; // lender
      }
    } else {
      // Fallback if product not found
      participant1_id = senderId;
      participant2_id = receiverId;
    }
  } else {
    participant1_id = senderId;
    participant2_id = receiverId;
  }

  // Find or create conversation
  let conversationId: number;
  const { data: existingConv } = await supabase
    .from("conversations")
    .select("conversation_id")
    .or(
      `and(participant1_id.eq.${participant1_id},participant2_id.eq.${participant2_id}),and(participant1_id.eq.${participant2_id},participant2_id.eq.${participant1_id})`
    )
    .eq("product_id", productId || null)
    .single();

  if (existingConv) {
    conversationId = existingConv.conversation_id;
  } else {
    const { data: newConv, error: convError } = await supabase
      .from("conversations")
      .insert({
        participant1_id,
        participant2_id,
        product_id: productId,
      })
      .select("conversation_id")
      .single();

    if (convError)
      throw new Error(`Failed to create conversation: ${convError.message}`);
    conversationId = newConv.conversation_id;
  }

  // Insert message
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      message_text: messageText,
      message_type: "text",
    })
    .select(
      `
      *,
      sender:users!messages_sender_id_fkey(*),
      conversation:conversations(product:products(*))
    `
    )
    .single();

  if (error) {
    throw new Error(`Failed to send message: ${error.message}`);
  }

  // Set product from conversation
  const messageData = data as any;
  messageData.product = messageData.conversation?.product;
  delete messageData.conversation;

  // Update conversation last_message_at
  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("conversation_id", conversationId);

  return messageData as Message;
}

export async function getConversations(
  userId: string
): Promise<Conversation[]> {
  const supabase = createClient();

  // Query conversations where user is participant1
  const { data: convs1, error: error1 } = await supabase
    .from("conversations")
    .select(
      `
      *,
      product:products(*)
    `
    )
    .eq("participant1_id", userId)
    .order("last_message_at", { ascending: false });

  // Query conversations where user is participant2
  const { data: convs2, error: error2 } = await supabase
    .from("conversations")
    .select(
      `
      *,
      product:products(*)
    `
    )
    .eq("participant2_id", userId)
    .order("last_message_at", { ascending: false });

  if (error1 || error2) {
    throw new Error(
      `Failed to fetch conversations: ${error1?.message || error2?.message}`
    );
  }

  const allConvs = [...(convs1 || []), ...(convs2 || [])];

  const conversations = await Promise.all(
    allConvs.map(async (conv: any) => {
      // Get other participant
      const otherParticipantId =
        conv.participant1_id === userId
          ? conv.participant2_id
          : conv.participant1_id;
      const { data: otherUser } = await supabase
        .from("users")
        .select("*")
        .eq("uuid", otherParticipantId)
        .single();

      // Get latest message
      const { data: latestMsg } = await supabase
        .from("messages")
        .select(
          `
        *,
        sender:users(*),
        conversation:conversations(product:products(*))
      `
        )
        .eq("conversation_id", conv.conversation_id)
        .order("sent_at", { ascending: false })
        .limit(1)
        .single();

      // Set product on latestMsg
      if (latestMsg) {
        (latestMsg as any).product = (latestMsg as any).conversation?.product;
        delete (latestMsg as any).conversation;
      }

      // Get unread count
      const { count: unreadCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conv.conversation_id)
        .neq("sender_id", userId)
        .is("read_at", null);

      return {
        ...conv,
        other_participant: otherUser
          ? {
              uuid: otherUser.uuid,
              name: otherUser.name,
              email: otherUser.email,
            }
          : undefined,
        latest_message: latestMsg || undefined,
        unread_count: unreadCount || 0,
      };
    })
  );

  return conversations as Conversation[];
}

export async function getMessages(conversationId: number): Promise<Message[]> {
  const supabase = createClient();

  // Build the base query
  const baseQuery = () =>
    supabase
      .from("messages")
      .select(
        `
      *,
      sender:users!messages_sender_id_fkey(*),
      conversation:conversations(product:products(*))
    `
      )
      .eq("conversation_id", conversationId)
      .order("sent_at", { ascending: true });

  // First try: include is_deleted filter if the column exists in schema
  let data: any[] | null = null;
  let error: any = null;

  try {
    const res = await baseQuery().eq("is_deleted", false);
    data = res.data as any[] | null;
    error = res.error;

    // If error mentions missing column, retry without the filter
    if (error && /is_deleted/i.test(error.message || "")) {
      const fallback = await baseQuery();
      data = fallback.data as any[] | null;
      error = fallback.error;
    }
  } catch (err) {
    // supabase client shouldn't throw, but handle defensive
    throw new Error(`Failed to fetch messages: ${String(err)}`);
  }

  if (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }

  // Set product from conversation for each message and normalize is_deleted
  const messages = (data || []).map((msg) => {
    msg.product = msg.conversation?.product;
    delete msg.conversation;
    // normalize missing is_deleted to false
    if (typeof msg.is_deleted === "undefined") msg.is_deleted = false;
    return msg;
  });

  return messages as Message[];
}

export async function markMessagesAsRead(messageIds: number[]): Promise<void> {
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

  // Get conversation IDs where user is participant
  const { data: convs1 } = await supabase
    .from("conversations")
    .select("conversation_id")
    .eq("participant1_id", userId);

  const { data: convs2 } = await supabase
    .from("conversations")
    .select("conversation_id")
    .eq("participant2_id", userId);

  const conversationIds = [
    ...(convs1?.map((c) => c.conversation_id) || []),
    ...(convs2?.map((c) => c.conversation_id) || []),
  ];

  if (conversationIds.length === 0) return 0;

  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .in("conversation_id", conversationIds)
    .neq("sender_id", userId)
    .is("read_at", null);

  if (error) {
    throw new Error(`Failed to get unread count: ${error.message}`);
  }

  return count || 0;
}
