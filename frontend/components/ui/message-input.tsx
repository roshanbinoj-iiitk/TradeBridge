"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MessageInputProps extends React.ComponentProps<"div"> {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MessageInput = React.forwardRef<HTMLDivElement, MessageInputProps>(
  (
    {
      className,
      onSendMessage,
      placeholder = "Type a message...",
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [message, setMessage] = React.useState("");

    const handleSend = () => {
      if (message.trim() && !disabled) {
        onSendMessage(message.trim());
        setMessage("");
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-end gap-2 p-4 border-t bg-white", className)}
        {...props}
      >
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[40px] max-h-[120px] resize-none pr-20"
            rows={1}
          />
          <div className="absolute right-2 bottom-2 flex gap-1">
            <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
              <Paperclip className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
              <Smile className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <Button onClick={handleSend} disabled={!message.trim() || disabled}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    );
  }
);

MessageInput.displayName = "MessageInput";

export { MessageInput };
