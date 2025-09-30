import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export default function DashboardHeader({
  onRefresh,
  isLoading,
}: DashboardHeaderProps) {
  return (
    <div className="mb-8 flex justify-between items-end">
      <div>
        <h1 className="text-4xl font-bold font-serif text-jet mb-2">
          Dashboard
        </h1>
        <p className="text-taupe">
          Welcome back! Here&apos;s your rental activity overview.
        </p>
      </div>
      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center"
      >
        <RefreshCw
          className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
        />
        Refresh
      </Button>
    </div>
  );
}
