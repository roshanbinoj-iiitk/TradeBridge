"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function LenderDashboard() {
  const router = useRouter();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-green-400 via-blue-300 to-white px-4 py-12">
      <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl max-w-2xl w-full shadow-2xl p-10 sm:p-14 border border-white/30">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 text-center select-none">
            Lender Dashboard
          </h1>
          <button
            className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg font-bold shadow hover:bg-red-600"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
        <p className="text-lg text-gray-700 text-center mb-6">
          Welcome, Lender! Here you can manage your listed items, view requests,
          and track your lending history.
        </p>
        {/* Lender Features */}
        <div className="grid grid-cols-1 gap-6 mt-8">
          <button
            className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-500 hover:from-green-700 hover:to-blue-600 text-white rounded-xl font-bold text-lg shadow-lg transition"
            onClick={() => router.push("/lender/dashboard/list-item")}
          >
            List New Item
          </button>
          <button
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white rounded-xl font-bold text-lg shadow-lg transition"
            onClick={() => router.push("/lender/dashboard/requests")}
          >
            View Borrow Requests
          </button>
          <button
            className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-400 hover:from-green-600 hover:to-blue-500 text-white rounded-xl font-bold text-lg shadow-lg transition"
            onClick={() => router.push("/lender/dashboard/history")}
          >
            Lending History
          </button>
        </div>
        {/* Summary Section */}
        <div className="mt-10 p-6 bg-blue-50 rounded-xl shadow-inner">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">
            Your Summary
          </h2>
          <ul className="text-gray-700 space-y-2">
            <li>
              <strong>Active Listings:</strong> 0
            </li>
            <li>
              <strong>Pending Requests:</strong> 0
            </li>
            <li>
              <strong>Total Items Lent:</strong> 0
            </li>
            <li>
              <strong>Rating:</strong> ⭐⭐⭐⭐⭐
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
