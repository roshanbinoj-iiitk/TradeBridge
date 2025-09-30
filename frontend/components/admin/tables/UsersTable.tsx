import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ban, CheckCircle, Eye } from "lucide-react";
import { UserAction } from "@/types/admin";

interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface UsersTableProps {
  users: User[];
  fetchError: string | null;
  onUserAction: (userId: string, action: UserAction) => void;
  onUserView: (userId: string) => void;
}

export function UsersTable({
  users,
  fetchError,
  onUserAction,
  onUserView,
}: UsersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fetchError && (
            <div className="p-4 border rounded-lg text-red-600">
              {fetchError}
            </div>
          )}

          {!fetchError && users.length === 0 && (
            <div className="p-4 border rounded-lg text-taupe">
              No users found.
            </div>
          )}

          {!fetchError &&
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-taupe">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={
                        user.role === "admin"
                          ? "default"
                          : user.role === "banned"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {user.role}
                    </Badge>
                    <span className="text-xs text-taupe">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUserView(user.uuid)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  {user.role !== "admin" && user.role !== "banned" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onUserAction(user.uuid, "ban")}
                    >
                      <Ban className="w-4 h-4 mr-1" />
                      Ban
                    </Button>
                  )}
                  {user.role === "banned" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUserAction(user.uuid, "unban")}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Unban
                    </Button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
