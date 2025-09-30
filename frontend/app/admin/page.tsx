"use client";

import { useAdminPage } from "@/hooks/admin/useAdminPage";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  const {
    currentUser,
    loading,
    fetchError,
    adminData,
    handleUserAction,
    handleProductAction,
    handleReviewAction,
    handleBookingAction,
    handleForumAction,
    handleUserView,
    handleBookingView,
  } = useAdminPage();

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jet mx-auto mb-4"></div>
          <p className="text-taupe">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <AdminDashboard
      adminData={adminData}
      fetchError={fetchError}
      onUserAction={handleUserAction}
      onProductAction={handleProductAction}
      onReviewAction={handleReviewAction}
      onBookingAction={handleBookingAction}
      onForumAction={handleForumAction}
      onUserView={handleUserView}
      onBookingView={handleBookingView}
    />
  );
}
