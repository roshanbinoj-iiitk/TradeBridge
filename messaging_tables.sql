-- Messaging System Tables for TradeBridge

-- Messages table to store all messages
CREATE TABLE public.messages (
  message_id SERIAL PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.users(uuid),
  receiver_id UUID NOT NULL REFERENCES public.users(uuid),
  product_id INTEGER REFERENCES public.products(product_id),
  transaction_id INTEGER REFERENCES public.transactions(transaction_id),
  message_text TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Conversations table (optional but helpful for performance)
CREATE TABLE public.conversations (
  conversation_id SERIAL PRIMARY KEY,
  participant1_id UUID NOT NULL REFERENCES public.users(uuid),
  participant2_id UUID NOT NULL REFERENCES public.users(uuid),
  product_id INTEGER REFERENCES public.products(product_id),
  last_message_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  -- Ensure unique conversations per product between two users
  UNIQUE(participant1_id, participant2_id, product_id)
);

-- Indexes for better performance
CREATE INDEX idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);
CREATE INDEX idx_messages_product ON public.messages(product_id);
CREATE INDEX idx_messages_sent_at ON public.messages(sent_at DESC);
CREATE INDEX idx_messages_read_status ON public.messages(receiver_id, read_at) WHERE read_at IS NULL;

CREATE INDEX idx_conversations_participants ON public.conversations(participant1_id, participant2_id);
CREATE INDEX idx_conversations_last_message ON public.conversations(last_message_at DESC);

-- Function to update conversation last_message_at when new message is sent
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Update existing conversation or create new one
  INSERT INTO public.conversations (
    participant1_id, 
    participant2_id, 
    product_id, 
    last_message_at
  ) VALUES (
    CASE WHEN NEW.sender_id < NEW.receiver_id THEN NEW.sender_id ELSE NEW.receiver_id END,
    CASE WHEN NEW.sender_id < NEW.receiver_id THEN NEW.receiver_id ELSE NEW.sender_id END,
    NEW.product_id,
    NEW.sent_at
  )
  ON CONFLICT (participant1_id, participant2_id, product_id) 
  DO UPDATE SET 
    last_message_at = NEW.sent_at,
    updated_at = NOW(),
    is_active = TRUE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update conversations
CREATE TRIGGER trigger_update_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Row Level Security (RLS) policies for security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Users can only see messages they sent or received
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Users can only insert messages they are sending
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
  );

-- Users can only update messages they received (for read_at)
CREATE POLICY "Users can mark received messages as read" ON public.messages
  FOR UPDATE USING (
    auth.uid() = receiver_id
  );

-- Users can view conversations they participate in
CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT USING (
    auth.uid() = participant1_id OR auth.uid() = participant2_id
  );

-- Sample data for testing (optional)
/*
-- Insert some test messages
INSERT INTO public.messages (sender_id, receiver_id, product_id, message_text, message_type) VALUES
('user-uuid-1', 'user-uuid-2', 101, 'Hi! Is this item still available?', 'text'),
('user-uuid-2', 'user-uuid-1', 101, 'Yes, it is! When would you need it?', 'text'),
('user-uuid-1', 'user-uuid-2', 101, 'Great! I would need it from next Monday for 3 days.', 'text'),
('user-uuid-2', 'user-uuid-1', 101, 'Perfect! That works for me. Let me know if you have any questions.', 'text');
*/
