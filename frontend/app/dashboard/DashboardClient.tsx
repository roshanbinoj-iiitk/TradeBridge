"use client";

import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Package, TrendingUp, ChevronDown, ChevronRight } from "lucide-react";
import DashboardSkeleton from "@/components/ui/DashboardSkeleton";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import BookingCard from "@/components/dashboard/BookingCard";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function DashboardClient() {
  const { user, loading, isAuthenticated } = useAuthRedirect();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get("tab") || "borrowing";
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [showCompletedBorrowing, setShowCompletedBorrowing] = useState(false);
  const [showCompletedLending, setShowCompletedLending] = useState(false);

  const { dashboardData, isLoading, fetchDashboardData, handleBookingAction } =
    useDashboardData(user);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  useEffect(() => {
    const tab = searchParams?.get("tab") || "borrowing";
    if (tab !== activeTab) setActiveTab(tab);
  }, [searchParams, activeTab]);

  if (loading || !user) {
    return <div className="text-center py-10 text-taupe">Loading...</div>;
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const renderBorrowingContent = () => {
    // Separate active and completed transactions
    const activeTransactions = dashboardData.borrowingTransactions.filter(
      (transaction) => !["completed", "cancelled"].includes(transaction.status)
    );
    const completedTransactions = dashboardData.borrowingTransactions.filter(
      (transaction) => ["completed", "cancelled"].includes(transaction.status)
    );

    if (activeTransactions.length === 0 && completedTransactions.length === 0) {
      return (
        <div className="text-center py-8 text-taupe">
          <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>You haven&apos;t borrowed any items yet.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/products")}
          >
            Browse Products
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Active Transactions */}
        {activeTransactions.length > 0 && (
          <div className="space-y-4">
            {activeTransactions.slice(0, 5).map((transaction) => (
              <BookingCard
                key={transaction.booking_id}
                booking={transaction}
                type="borrowing"
                onScanSuccess={fetchDashboardData}
              />
            ))}
            {activeTransactions.length > 5 && (
              <div className="text-center">
                <Button variant="outline" size="sm">
                  View All Active ({activeTransactions.length})
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Completed Section */}
        {completedTransactions.length > 0 && (
          <Collapsible open={showCompletedBorrowing} onOpenChange={setShowCompletedBorrowing}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span>Completed ({completedTransactions.length})</span>
                {showCompletedBorrowing ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              {completedTransactions.map((transaction) => (
                <BookingCard
                  key={transaction.booking_id}
                  booking={transaction}
                  type="borrowing"
                  onScanSuccess={fetchDashboardData}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    );
  };

  const renderLendingContent = () => {
    // Separate active and completed transactions
    const activeTransactions = dashboardData.lendingTransactions.filter(
      (transaction) => !["completed", "cancelled"].includes(transaction.status)
    );
    const completedTransactions = dashboardData.lendingTransactions.filter(
      (transaction) => ["completed", "cancelled"].includes(transaction.status)
    );

    if (activeTransactions.length === 0 && completedTransactions.length === 0) {
      if (dashboardData.myProducts.length === 0) {
        return (
          <div className="text-center py-8 text-taupe">
            <TrendingUp className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No lending activity yet.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/products/new")}
            >
              List Your First Product
            </Button>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <h4 className="font-semibold text-jet mb-2">Your Listed Products</h4>
          {dashboardData.myProducts.map((product) => (
            <div
              key={product.product_id}
              className="border rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-lg text-jet">
                  {product.name}
                </div>
                <div className="text-taupe text-sm">
                  {product.category} &middot; {product.condition}
                </div>
                <div className="text-taupe text-sm">${product.price}/day</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/products/${product.product_id}`)}
              >
                View
              </Button>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Active Transactions */}
        {activeTransactions.length > 0 && (
          <div className="space-y-4">
            {activeTransactions.slice(0, 5).map((transaction) => (
              <BookingCard
                key={transaction.booking_id}
                booking={transaction}
                type="lending"
                onScanSuccess={fetchDashboardData}
                onBookingAction={handleBookingAction}
              />
            ))}
            {activeTransactions.length > 5 && (
              <div className="text-center">
                <Button variant="outline" size="sm">
                  View All Active ({activeTransactions.length})
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Completed Section */}
        {completedTransactions.length > 0 && (
          <Collapsible open={showCompletedLending} onOpenChange={setShowCompletedLending}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span>Completed ({completedTransactions.length})</span>
                {showCompletedLending ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              {completedTransactions.map((transaction) => (
                <BookingCard
                  key={transaction.booking_id}
                  booking={transaction}
                  type="lending"
                  onScanSuccess={fetchDashboardData}
                  onBookingAction={handleBookingAction}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-10 px-6 min-h-screen">
      <DashboardHeader onRefresh={fetchDashboardData} isLoading={isLoading} />
      <StatsCards stats={dashboardData.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <DashboardSidebar stats={dashboardData.stats} />

        <div className="lg:col-span-2">
          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              setActiveTab(val);
              router.push(`/dashboard?tab=${val}`);
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="borrowing">My Borrowing</TabsTrigger>
              <TabsTrigger value="lending">My Lending</TabsTrigger>
            </TabsList>

            <TabsContent value="borrowing">
              <Card>
                <CardHeader>
                  <CardTitle>Borrowing Activity</CardTitle>
                  <CardDescription>
                    Overview of your current and past rentals.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderBorrowingContent()}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lending">
              <Card>
                <CardHeader>
                  <CardTitle>Lending Activity</CardTitle>
                  <CardDescription>
                    Overview of your listed items and rental requests.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderLendingContent()}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
