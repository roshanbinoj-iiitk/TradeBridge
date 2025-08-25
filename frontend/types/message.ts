// types/message.ts

export interface Message {
  message_id: number;
  sender_id: string;
  receiver_id: string;
  product_id?: number;
  transaction_id?: number;
  message_text: string;
  sent_at: string;
  read_at?: string;
  message_type: 'text' | 'image' | 'system';
  is_deleted: boolean;
  sender?: {
    uuid: string;
    name: string;
    email: string;
  };
  receiver?: {
    uuid: string;
    name: string;
    email: string;
  };
  product?: {
    product_id: number;
    name: string;
    image_url?: string;
  };
}

export interface Conversation {
  conversation_id: number;
  participant1_id: string;
  participant2_id: string;
  product_id?: number;
  last_message_at: string;
  created_at: string;
  latest_message?: Message;
  other_participant?: {
    uuid: string;
    name: string;
    email: string;
  };
  product?: {
    product_id: number;
    name: string;
    image_url?: string;
  };
  unread_count?: number;
}
