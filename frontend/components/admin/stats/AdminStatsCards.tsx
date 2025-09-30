import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Package,
  Calendar,
  MessageSquare,
  TrendingUp,
  Shield,
  CheckCircle,
} from "lucide-react";
import { AdminStats } from "@/types/admin";

interface AdminStatsCardsProps {
  stats: AdminStats;
}

const statCards = [
  {
    title: "Total Users",
    key: "totalUsers" as keyof AdminStats,
    icon: Users,
    color: "text-blue-600",
  },
  {
    title: "Total Products",
    key: "totalProducts" as keyof AdminStats,
    icon: Package,
    color: "text-green-600",
  },
  {
    title: "Total Bookings",
    key: "totalBookings" as keyof AdminStats,
    icon: Calendar,
    color: "text-purple-600",
  },
  {
    title: "Total Revenue",
    key: "totalRevenue" as keyof AdminStats,
    icon: TrendingUp,
    color: "text-green-600",
    prefix: "₹",
  },
  {
    title: "Pending Bookings",
    key: "pendingBookings" as keyof AdminStats,
    icon: Shield,
    color: "text-yellow-600",
  },
  {
    title: "Flagged Posts",
    key: "flaggedPosts" as keyof AdminStats,
    icon: MessageSquare,
    color: "text-red-600",
  },
  {
    title: "Total Reviews",
    key: "totalReviews" as keyof AdminStats,
    icon: CheckCircle,
    color: "text-indigo-600",
  },
  {
    title: "Verified Users",
    key: "activeUsers" as keyof AdminStats,
    icon: Users,
    color: "text-teal-600",
  },
];

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card) => {
        const Icon = card.icon;
        const value = stats[card.key];

        return (
          <Card key={card.key}>
            <CardContent className="flex items-center p-6">
              <Icon className={`h-8 w-8 ${card.color} mr-3`} />
              <div>
                <p className="text-2xl font-bold text-jet">
                  {card.prefix && `${card.prefix}${value}`}
                  {!card.prefix && value}
                </p>
                <p className="text-sm text-taupe">{card.title}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
