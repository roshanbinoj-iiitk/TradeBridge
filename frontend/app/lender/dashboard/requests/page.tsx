"use client";
import React from "react";

export default function BorrowRequests() {
  // TODO: Fetch and display borrow requests from backend
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-400 via-green-300 to-white px-4 py-12">
      <div className="bg-white bg-opacity-90 rounded-3xl max-w-lg w-full shadow-2xl p-10 border border-white/30">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
          Borrow Requests
        </h1>
        <p className="text-gray-700 text-center mb-4">No requests yet.</p>
        {/* TODO: List requests here */}
      </div>
    </main>
  );
}
