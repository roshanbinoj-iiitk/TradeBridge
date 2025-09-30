import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminStatsCards } from "./stats/AdminStatsCards";
import { UsersTable } from "./tables/UsersTable";
import { ProductsTable } from "./tables/ProductsTable";
import { BookingsTable } from "./tables/BookingsTable";
import { ReviewsTable } from "./tables/ReviewsTable";
import { ForumTable } from "./tables/ForumTable";
import { AdminData } from "@/types/admin";
import {
  UserAction,
  ProductAction,
  ReviewAction,
  BookingAction,
  ForumAction,
} from "@/types/admin";

interface AdminDashboardProps {
  adminData: AdminData;
  fetchError: string | null;
  onUserAction: (userId: string, action: UserAction) => void;
  onProductAction: (productId: number, action: ProductAction) => void;
  onReviewAction: (reviewId: number, action: ReviewAction) => void;
  onBookingAction: (bookingId: number, action: BookingAction) => void;
  onForumAction: (
    id: number,
    action: ForumAction,
    type: "post" | "reply"
  ) => void;
  onUserView: (userId: string) => void;
  onBookingView: (bookingId: number) => void;
}

export function AdminDashboard({
  adminData,
  fetchError,
  onUserAction,
  onProductAction,
  onReviewAction,
  onBookingAction,
  onForumAction,
  onUserView,
  onBookingView,
}: AdminDashboardProps) {
  return (
    <div className="container mx-auto py-10 px-6 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-serif text-jet mb-2">
          Admin Dashboard
        </h1>
        <p className="text-taupe">
          Manage users, products, bookings, and platform content.
        </p>
      </div>

      <AdminStatsCards stats={adminData.stats} />

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="forum">Forum</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersTable
            users={adminData.users}
            fetchError={fetchError}
            onUserAction={onUserAction}
            onUserView={onUserView}
          />
        </TabsContent>

        <TabsContent value="products">
          <ProductsTable
            products={adminData.products}
            onProductAction={onProductAction}
          />
        </TabsContent>

        <TabsContent value="bookings">
          <BookingsTable
            bookings={adminData.bookings}
            onBookingAction={onBookingAction}
            onBookingView={onBookingView}
          />
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewsTable
            reviews={adminData.reviews}
            onReviewAction={onReviewAction}
          />
        </TabsContent>

        <TabsContent value="forum">
          <ForumTable
            forumPosts={adminData.forumPosts}
            forumReplies={adminData.forumReplies}
            onForumAction={onForumAction}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
