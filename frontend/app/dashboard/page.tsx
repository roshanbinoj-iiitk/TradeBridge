"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/shared/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  PlusCircle,
  Bell,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Transaction, Product, Profile } from "@/types/db";
import { updateTransactionStatus } from "@/lib/transactions";
import { useToast } from "@/hooks/use-toast";
import DashboardSkeleton from "@/components/ui/DashboardSkeleton";

interface DashboardStats {
  activeBorrowings: number;
  activeLendings: number;
  pendingRequests: number;
  totalEarnings: number;
  myProducts: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get("tab") || "borrowing";
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<{
    borrowingTransactions: Transaction[];
    lendingTransactions: Transaction[];
    myProducts: Product[];
    stats: DashboardStats;
  }>({
    borrowingTransactions: [],
    lendingTransactions: [],
    myProducts: [],
    stats: {
      activeBorrowings: 0,
      activeLendings: 0,
      pendingRequests: 0,
      totalEarnings: 0,
      myProducts: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    const supabase = createClient();

    try {
      // Fetch borrowing transactions
      const { data: borrowingTransactions } = await supabase
        .from("transactions")
        .select(
          `
          *,
          product:products(*),
          lender:users!transactions_lender_id_fkey(*)
        `
        )
        .eq("borrower_id", user.id);

      // Fetch lending transactions
      const { data: lendingTransactions } = await supabase
        .from("transactions")
        .select(
          `
          *,
          product:products(*),
          borrower:users!transactions_borrower_id_fkey(*)
        `
        )
        .eq("lender_id", user.id);

      // Fetch user's products
      const { data: myProducts } = await supabase
        .from("products")
        .select("*")
        .eq("lender_id", user.id);

      // Calculate stats
      const activeBorrowings =
        borrowingTransactions?.filter((t) => t.status === "approved").length ||
        0;

      const activeLendings =
        lendingTransactions?.filter((t) => t.status === "approved").length || 0;

      const pendingRequests =
        lendingTransactions?.filter((t) => t.status === "pending").length || 0;

      const totalEarnings =
        lendingTransactions?.reduce((sum, t) => {
          if (t.status === "completed" && t.product?.price) {
            const days =
              t.start_date && t.end_date
                ? Math.ceil(
                    (new Date(t.end_date).getTime() -
                      new Date(t.start_date).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                : 1;
            return sum + t.product.price * days;
          }
          return sum;
        }, 0) || 0;

      setDashboardData({
        borrowingTransactions: borrowingTransactions || [],
        lendingTransactions: lendingTransactions || [],
        myProducts: myProducts || [],
        stats: {
          activeBorrowings,
          activeLendings,
          pendingRequests,
          totalEarnings,
          myProducts: myProducts?.length || 0,
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  useEffect(() => {
    // keep activeTab in sync with URL
    const tab = searchParams?.get("tab") || "borrowing";
    if (tab !== activeTab) setActiveTab(tab);
  }, [searchParams, activeTab]);

  const handleTransactionAction = async (
    transactionId: number,
    action: "approved" | "rejected"
  ) => {
    try {
      await updateTransactionStatus(transactionId, action);
      toast({
        title: "Success",
        description: `Transaction ${action} successfully.`,
      });
      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update transaction status.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
    };

    return (
      <Badge
        className={
          variants[status as keyof typeof variants] ||
          "bg-gray-100 text-gray-800"
        }
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading || !user) {
    return <div className="text-center py-10 text-taupe">Loading...</div>;
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="container mx-auto py-10 px-6 min-h-screen">
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
          onClick={fetchDashboardData}
          disabled={isLoading}
          className="flex items-center"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-jet">
                {dashboardData.stats.activeBorrowings}
              </p>
              <p className="text-sm text-taupe">Active Borrowings</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-jet">
                {dashboardData.stats.activeLendings}
              </p>
              <p className="text-sm text-taupe">Active Lendings</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-jet">
                {dashboardData.stats.pendingRequests}
              </p>
              <p className="text-sm text-taupe">Pending Requests</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-jet">
                ${dashboardData.stats.totalEarnings}
              </p>
              <p className="text-sm text-taupe">Total Earnings</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Package className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-jet">
                {dashboardData.stats.myProducts}
              </p>
              <p className="text-sm text-taupe">My Products</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Quick Actions & Notifications */}
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
              {dashboardData.stats.pendingRequests > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center text-yellow-600">
                    <Clock className="mr-3 h-5 w-5" />
                    <p>
                      You have {dashboardData.stats.pendingRequests} pending
                      rental request
                      {dashboardData.stats.pendingRequests !== 1 ? "s" : ""}.
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
                  {dashboardData.stats.activeLendings > 0 && (
                    <div className="flex items-center text-blue-600">
                      <TrendingUp className="mr-3 h-5 w-5" />
                      <p>
                        You have {dashboardData.stats.activeLendings} active
                        rental
                        {dashboardData.stats.activeLendings !== 1 ? "s" : ""}.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activity Tabs */}
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
                  {dashboardData.borrowingTransactions.length === 0 ? (
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
                  ) : (
                    <div className="space-y-4">
                      {dashboardData.borrowingTransactions
                        .slice(0, 5)
                        .map((transaction) => (
                          <div
                            key={transaction.transaction_id}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-jet">
                                  {transaction.product?.name || "Product"}
                                </h4>
                                <p className="text-sm text-taupe">
                                  Lender:{" "}
                                  {transaction.lender?.name || "Unknown"}
                                </p>
                              </div>
                              {getStatusBadge(transaction.status)}
                            </div>

                            <div className="flex items-center text-sm text-taupe space-x-4">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {transaction.start_date && (
                                  <span>
                                    {new Date(
                                      transaction.start_date
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                                {transaction.end_date && (
                                  <span>
                                    {" - "}
                                    {new Date(
                                      transaction.end_date
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                <span>
                                  ${transaction.product?.price || 0}/day
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                      {dashboardData.borrowingTransactions.length > 5 && (
                        <div className="text-center">
                          <Button variant="outline" size="sm">
                            View All (
                            {dashboardData.borrowingTransactions.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
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
                  {dashboardData.lendingTransactions.length === 0 ? (
                    dashboardData.myProducts.length === 0 ? (
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
                    ) : (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-jet mb-2">
                          Your Listed Products
                        </h4>
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
                              <div className="text-taupe text-sm">
                                ${product.price}/day
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/products/${product.product_id}`)
                              }
                            >
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="space-y-4">
                      {dashboardData.lendingTransactions
                        .slice(0, 5)
                        .map((transaction) => (
                          <div
                            key={transaction.transaction_id}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-jet">
                                  {transaction.product?.name || "Product"}
                                </h4>
                                <p className="text-sm text-taupe">
                                  Borrower:{" "}
                                  {transaction.borrower?.name || "Unknown"}
                                </p>
                              </div>
                              {getStatusBadge(transaction.status)}
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center text-taupe space-x-4">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {transaction.start_date && (
                                    <span>
                                      {new Date(
                                        transaction.start_date
                                      ).toLocaleDateString()}
                                    </span>
                                  )}
                                  {transaction.end_date && (
                                    <span>
                                      {" - "}
                                      {new Date(
                                        transaction.end_date
                                      ).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  <span>
                                    ${transaction.product?.price || 0}/day
                                  </span>
                                </div>
                              </div>

                              {transaction.status === "pending" && (
                                <div className="space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleTransactionAction(
                                        transaction.transaction_id,
                                        "approved"
                                      )
                                    }
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleTransactionAction(
                                        transaction.transaction_id,
                                        "rejected"
                                      )
                                    }
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Decline
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                      {dashboardData.lendingTransactions.length > 5 && (
                        <div className="text-center">
                          <Button variant="outline" size="sm">
                            View All ({dashboardData.lendingTransactions.length}
                            )
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
