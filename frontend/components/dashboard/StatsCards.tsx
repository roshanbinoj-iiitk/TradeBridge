import { Card, CardContent } from "@/components/ui/card";
import { Package, TrendingUp, Clock, IndianRupee } from "lucide-react";

interface DashboardStats {
  activeBorrowings: number;
  activeLendings: number;
  pendingRequests: number;
  totalEarnings: number;
  myProducts: number;
}

interface StatsCardsProps {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const statsData = [
    {
      icon: Package,
      value: stats.activeBorrowings,
      label: "Active Borrowings",
      color: "text-blue-600",
    },
    {
      icon: TrendingUp,
      value: stats.activeLendings,
      label: "Active Lendings",
      color: "text-green-600",
    },
    {
      icon: Clock,
      value: stats.pendingRequests,
      label: "Pending Requests",
      color: "text-yellow-600",
    },
    {
      icon: IndianRupee,
      value: stats.totalEarnings,
      label: "Total Earnings",
      color: "text-green-600",
    },
    {
      icon: Package,
      value: stats.myProducts,
      label: "My Products",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <Card key={index}>
          <CardContent className="flex items-center p-6">
            <stat.icon className={`h-8 w-8 ${stat.color} mr-3`} />
            <div>
              <p className="text-2xl font-bold text-jet">{stat.value}</p>
              <p className="text-sm text-taupe">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
