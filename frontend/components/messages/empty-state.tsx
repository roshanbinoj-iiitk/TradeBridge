"use client";

import { MessageCircle } from "lucide-react";

export function EmptyState({
  variant = "default",
}: {
  variant?: "default" | "loading";
}) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">
          {variant === "loading" ? "Loading messages..." : "No messages yet"}
        </p>
      </div>
    </div>
  );
}
