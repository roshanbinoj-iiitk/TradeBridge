import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Trash2,
  MessageCircle,
  MessageSquare,
} from "lucide-react";
import { ForumAction } from "@/types/admin";

interface ForumPost {
  post_id: number;
  title: string;
  content: string;
  is_flagged: boolean;
  is_approved?: boolean;
  created_at: string;
  author?: {
    name: string;
  };
}

interface ForumReply {
  reply_id: number;
  content: string;
  is_flagged: boolean;
  is_approved?: boolean;
  created_at: string;
  author?: {
    name: string;
  };
  post?: {
    title: string;
  };
}

interface ForumTableProps {
  forumPosts: ForumPost[];
  forumReplies: ForumReply[];
  onForumAction: (
    id: number,
    action: ForumAction,
    type: "post" | "reply"
  ) => void;
}

export function ForumTable({
  forumPosts,
  forumReplies,
  onForumAction,
}: ForumTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Forum Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Flagged Posts */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Flagged Posts ({forumPosts.length})
            </h3>
            <div className="space-y-4">
              {forumPosts.length === 0 && (
                <div className="p-4 border rounded-lg text-taupe">
                  No flagged posts found.
                </div>
              )}

              {forumPosts.map((post) => (
                <div
                  key={post.post_id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{post.title}</p>
                    <p className="text-sm text-taupe line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="destructive">Flagged</Badge>
                      <span className="text-xs text-taupe">
                        by {post.author?.name}
                      </span>
                      <span className="text-xs text-taupe">
                        • {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        onForumAction(post.post_id, "approve", "post")
                      }
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        onForumAction(post.post_id, "delete", "post")
                      }
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flagged Replies */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Flagged Replies ({forumReplies.length})
            </h3>
            <div className="space-y-4">
              {forumReplies.length === 0 && (
                <div className="p-4 border rounded-lg text-taupe">
                  No flagged replies found.
                </div>
              )}

              {forumReplies.map((reply) => (
                <div
                  key={reply.reply_id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="text-sm text-taupe line-clamp-2">
                      {reply.content}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="destructive">Flagged</Badge>
                      <span className="text-xs text-taupe">
                        by {reply.author?.name}
                      </span>
                      <span className="text-xs text-taupe">
                        • on "{reply.post?.title}"
                      </span>
                      <span className="text-xs text-taupe">
                        • {new Date(reply.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        onForumAction(reply.reply_id, "approve", "reply")
                      }
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        onForumAction(reply.reply_id, "delete", "reply")
                      }
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
