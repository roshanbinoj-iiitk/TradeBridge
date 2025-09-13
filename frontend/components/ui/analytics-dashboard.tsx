"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  IndianRupee,
  Package,
  Users,
  Star,
  Calendar,
  BarChart3,
  PieChart,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/components/shared/AuthContext";

interface AnalyticsData {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  bookings: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    thisMonth: number;
    growth: number;
  };
  products: {
    total: number;
    active: number;
    rented: number;
    avgRating: number;
    views: number;
  };
  customers: {
    unique: number;
    returning: number;
    avgRating: number;
    satisfaction: number;
  };
  topProducts: Array<{
    product_id: number;
    name: string;
    bookings: number;
    revenue: number;
    rating: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    revenue: number;
    bookings: number;
    avgDuration: number;
  }>;
  upcoming: Array<{
    booking_id: number;
    product_name: string;
    borrower_name: string;
    start_date: string;
    end_date: string;
    total_amount: number;
  }>;
}

interface AnalyticsDashboardProps {
  userId?: string;
  className?: string;
}

export default function AnalyticsDashboard({
  userId,
  className,
}: AnalyticsDashboardProps) {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30"); // days

  const currentUserId = userId || user?.id;

  useEffect(() => {
    if (currentUserId) {
      fetchAnalytics();
    }
  }, [currentUserId, timeRange]);

  const fetchAnalytics = async () => {
    if (!currentUserId) return;

    try {
      const supabase = createClient();
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(timeRange));

      // Fetch bookings data
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(
          `
          *,
          products(name, category),
          users!bookings_borrower_id_fkey(name)
        `
        )
        .eq("lender_id", currentUserId);

      if (bookingsError) throw bookingsError;

      // Fetch products data
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select(
          `
          *,
          product_images(image_url),
          reviews(overall_rating),
          product_views(view_count)
        `
        )
        .eq("lender_id", currentUserId);

      if (productsError) throw productsError;

      // Process the data
      const processedAnalytics = processAnalyticsData(
        bookingsData || [],
        productsData || []
      );
      setAnalytics(processedAnalytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (
    bookings: any[],
    products: any[]
  ): AnalyticsData => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Revenue calculations
    const totalRevenue = bookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);

    const thisMonthRevenue = bookings
      .filter(
        (b) =>
          b.status === "completed" &&
          new Date(b.start_date) >= thisMonth &&
          new Date(b.start_date) <= thisMonthEnd
      )
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);

    const lastMonthRevenue = bookings
      .filter(
        (b) =>
          b.status === "completed" &&
          new Date(b.start_date) >= lastMonth &&
          new Date(b.start_date) < thisMonth
      )
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);

    const revenueGrowth =
      lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

    // Bookings calculations
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(
      (b) => b.status === "confirmed"
    ).length;
    const completedBookings = bookings.filter(
      (b) => b.status === "completed"
    ).length;
    const cancelledBookings = bookings.filter(
      (b) => b.status === "cancelled"
    ).length;

    const thisMonthBookings = bookings.filter(
      (b) =>
        new Date(b.created_at) >= thisMonth &&
        new Date(b.created_at) <= thisMonthEnd
    ).length;

    const lastMonthBookings = bookings.filter(
      (b) =>
        new Date(b.created_at) >= lastMonth &&
        new Date(b.created_at) < thisMonth
    ).length;

    const bookingsGrowth =
      lastMonthBookings > 0
        ? ((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100
        : 0;

    // Products calculations
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.available_status).length;
    const rentedProducts = bookings.filter(
      (b) => b.status === "confirmed"
    ).length;
    const avgProductRating =
      products.reduce((sum, p) => {
        const avgRating =
          p.reviews?.length > 0
            ? p.reviews.reduce(
                (rSum: number, r: any) => rSum + r.overall_rating,
                0
              ) / p.reviews.length
            : 0;
        return sum + avgRating;
      }, 0) / (products.length || 1);

    const totalViews = products.reduce(
      (sum, p) =>
        sum +
        (p.product_views?.reduce(
          (vSum: number, v: any) => vSum + (v.view_count || 0),
          0
        ) || 0),
      0
    );

    // Customer calculations
    const uniqueCustomers = new Set(bookings.map((b) => b.borrower_id)).size;
    const returningCustomers = bookings.reduce((customers, booking) => {
      const customerId = booking.borrower_id;
      customers[customerId] = (customers[customerId] || 0) + 1;
      return customers;
    }, {} as Record<string, number>);
    // Object.values can be typed as unknown in some TS configs; use Object.keys to preserve number typing
    const returningCount = Object.keys(returningCustomers)
      .map((k) => returningCustomers[k])
      .filter((count) => count > 1).length;

    // Top products
    const productPerformance = products
      .map((product) => {
        const productBookings = bookings.filter(
          (b) => b.product_id === product.product_id
        );
        const productRevenue = productBookings
          .filter((b) => b.status === "completed")
          .reduce((sum, b) => sum + (b.total_amount || 0), 0);
        const avgRating =
          product.reviews?.length > 0
            ? product.reviews.reduce(
                (sum: number, r: any) => sum + r.overall_rating,
                0
              ) / product.reviews.length
            : 0;

        return {
          product_id: product.product_id,
          name: product.name,
          bookings: productBookings.length,
          revenue: productRevenue,
          rating: avgRating,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Revenue by month (last 6 months)
    const revenueByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthStart.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      const monthBookings = bookings.filter(
        (b) =>
          new Date(b.start_date) >= monthStart &&
          new Date(b.start_date) <= monthEnd
      );
      const monthRevenue = monthBookings
        .filter((b) => b.status === "completed")
        .reduce((sum, b) => sum + (b.total_amount || 0), 0);

      revenueByMonth.push({
        month: monthName,
        revenue: monthRevenue,
        bookings: monthBookings.length,
      });
    }

    // Category performance
    type CategoryStats = {
      bookings: any[];
      revenue: number;
      totalDuration: number;
    };
    const categoryStats = products.reduce(
      (stats: Record<string, CategoryStats>, product) => {
        const category = product.category || "Other";
        if (!stats[category]) {
          stats[category] = { bookings: [], revenue: 0, totalDuration: 0 };
        }

        const categoryBookings = bookings.filter(
          (b) => b.product_id === product.product_id
        );
        stats[category].bookings.push(...categoryBookings);
        stats[category].revenue += categoryBookings
          .filter((b) => b.status === "completed")
          .reduce((sum, b) => sum + (b.total_amount || 0), 0);

        return stats;
      },
      {} as Record<string, CategoryStats>
    );

    const categoryPerformance = Object.keys(categoryStats)
      .map((category) => {
        const stats = categoryStats[category];
        return {
          category,
          revenue: stats.revenue,
          bookings: stats.bookings.length,
          avgDuration:
            stats.bookings.length > 0
              ? stats.bookings.reduce((sum: number, b: any) => {
                  const duration =
                    new Date(b.end_date).getTime() -
                    new Date(b.start_date).getTime();
                  return sum + duration / (1000 * 60 * 60 * 24); // days
                }, 0) / stats.bookings.length
              : 0,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    // Upcoming bookings
    const upcoming = bookings
      .filter((b) => b.status === "confirmed" && new Date(b.start_date) > now)
      .sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      )
      .slice(0, 5)
      .map((b) => ({
        booking_id: b.booking_id,
        product_name: b.products?.name || "Unknown Product",
        borrower_name: b.users?.name || "Unknown User",
        start_date: b.start_date,
        end_date: b.end_date,
        total_amount: b.total_amount || 0,
      }));

    return {
      revenue: {
        total: totalRevenue,
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        growth: revenueGrowth,
      },
      bookings: {
        total: totalBookings,
        active: activeBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        thisMonth: thisMonthBookings,
        growth: bookingsGrowth,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        rented: rentedProducts,
        avgRating: avgProductRating,
        views: totalViews,
      },
      customers: {
        unique: uniqueCustomers,
        returning: returningCount,
        avgRating: avgProductRating,
        satisfaction:
          avgProductRating >= 4 ? 95 : avgProductRating >= 3 ? 80 : 65,
      },
      topProducts: productPerformance,
      revenueByMonth,
      categoryPerformance,
      upcoming,
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <BarChart3 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="365">1 year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(analytics.revenue.total)}
                </p>
                <p
                  className={`text-sm flex items-center ${
                    analytics.revenue.growth >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {formatPercentage(analytics.revenue.growth)} this month
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <IndianRupee className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Bookings
                </p>
                <p className="text-2xl font-bold">{analytics.bookings.total}</p>
                <p
                  className={`text-sm flex items-center ${
                    analytics.bookings.growth >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {formatPercentage(analytics.bookings.growth)} this month
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Products
                </p>
                <p className="text-2xl font-bold">
                  {analytics.products.active}
                </p>
                <p className="text-sm text-gray-600">
                  {analytics.products.rented} currently rented
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Customer Satisfaction
                </p>
                <p className="text-2xl font-bold">
                  {analytics.customers.satisfaction}%
                </p>
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {analytics.products.avgRating.toFixed(1)} avg rating
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.revenueByMonth.map((month, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm">{month.month}</span>
                      <span className="font-medium">
                        {formatCurrency(month.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.categoryPerformance.map((category, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm">{category.category}</span>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(category.revenue)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {category.bookings} bookings
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.upcoming.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No upcoming bookings
                </p>
              ) : (
                <div className="space-y-3">
                  {analytics.upcoming.map((booking) => (
                    <div
                      key={booking.booking_id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-medium">{booking.product_name}</p>
                        <p className="text-sm text-gray-600">
                          {booking.borrower_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(booking.total_amount)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(booking.start_date)} -{" "}
                          {formatDate(booking.end_date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topProducts.map((product, index) => (
                  <div
                    key={product.product_id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{product.bookings} bookings</span>
                          {product.rating > 0 && (
                            <>
                              <span>•</span>
                              <div className="flex items-center">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                                {product.rating.toFixed(1)}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(product.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                <p className="text-2xl font-bold">
                  {analytics.customers.unique}
                </p>
                <p className="text-sm text-gray-600">Unique Customers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="mx-auto h-8 w-8 text-green-500 mb-2" />
                <p className="text-2xl font-bold">
                  {analytics.customers.returning}
                </p>
                <p className="text-sm text-gray-600">Returning Customers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
                <p className="text-2xl font-bold">
                  {analytics.customers.satisfaction}%
                </p>
                <p className="text-sm text-gray-600">Satisfaction Rate</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                <p className="text-2xl font-bold">
                  {analytics.bookings.completed}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                <p className="text-2xl font-bold">
                  {analytics.bookings.active}
                </p>
                <p className="text-sm text-gray-600">Active</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <AlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-2" />
                <p className="text-2xl font-bold">
                  {analytics.bookings.cancelled}
                </p>
                <p className="text-sm text-gray-600">Cancelled</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="mx-auto h-8 w-8 text-purple-500 mb-2" />
                <p className="text-2xl font-bold">
                  {analytics.bookings.thisMonth}
                </p>
                <p className="text-sm text-gray-600">This Month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
