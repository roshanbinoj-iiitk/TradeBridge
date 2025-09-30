import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { PlusCircle, Bell, Clock, CheckCircle, TrendingUp } from "lucide-react";

interface DashboardStats {
  activeBorrowings: number;
  activeLendings: number;
  pendingRequests: number;
  totalEarnings: number;
  myProducts: number;
}

interface SidebarProps {
  stats: DashboardStats;
}

export default function DashboardSidebar({ stats }: SidebarProps) {
  const router = useRouter();

  return (
    <div className="lg:col-span-1 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PlusCircle className="mr-2 h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full bg-jet text-isabelline hover:bg-taupe"
            onClick={() => router.push("/products/new")}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> List a New Product
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/products")}
          >
            Browse Products
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/profile")}
          >
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.pendingRequests > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center text-yellow-600">
                <Clock className="mr-3 h-5 w-5" />
                <p>
                  You have {stats.pendingRequests} pending rental request
                  {stats.pendingRequests !== 1 ? "s" : ""}.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard?tab=lending")}
              >
                Review Requests
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center text-green-600">
                <CheckCircle className="mr-3 h-5 w-5" />
                <p>All caught up! No pending notifications.</p>
              </div>
              {stats.activeLendings > 0 && (
                <div className="flex items-center text-blue-600">
                  <TrendingUp className="mr-3 h-5 w-5" />
                  <p>
                    You have {stats.activeLendings} active rental
                    {stats.activeLendings !== 1 ? "s" : ""}.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
