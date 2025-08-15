"use client";
import React from "react";

export default function AdminDashboard() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-100 to-white p-8">
      <h1 className="text-4xl font-bold mb-6 text-gray-700 text-center">
        Admin Dashboard
      </h1>
      <p className="mb-4 text-lg text-gray-700 text-center">
        Manage users, approve listings, and view analytics.
      </p>
      {/* Add admin-specific features here */}
    </main>
  );
}
