import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface MessageBubbleProps {
  message: {
    id: string;
    text: string;
    sender: {
      id: string;
      name: string;
      avatar?: string;
    };
    timestamp: Date;
    isRead?: boolean;
    type?: 'text' | 'system';
  };
  isOwn: boolean;
  showAvatar?: boolean;
}

const MessageBubble = React.forwardRef<HTMLDivElement, MessageBubbleProps>(
  ({ message, isOwn, showAvatar = true, className, ...props }, ref) => {
    const formatTime = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(date);
    };

    if (message.type === 'system') {
      return (
        <div
          ref={ref}
          className={cn("flex justify-center my-4", className)}
          {...props}
        >
          <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
            {message.text}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-3 max-w-[80%]",
          isOwn ? "ml-auto flex-row-reverse" : "mr-auto",
          className
        )}
        {...props}
      >
        {showAvatar && (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={message.sender.avatar} />
            <AvatarFallback className="text-xs">
              {message.sender.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
          <div
            className={cn(
              "rounded-lg px-3 py-2 max-w-full break-words",
              isOwn
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-900"
            )}
          >
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          </div>
          
          <div className={cn(
            "flex items-center gap-1 mt-1 text-xs text-gray-500",
            isOwn && "flex-row-reverse"
          )}>
            <span>{formatTime(message.timestamp)}</span>
            {isOwn && (
              <span className={cn(
                "text-xs",
                message.isRead ? "text-blue-600" : "text-gray-400"
              )}>
                {message.isRead ? "Read" : "Delivered"}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

MessageBubble.displayName = "MessageBubble";

export { MessageBubble };
