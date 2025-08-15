"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

interface HistoryItem {
  product_name: string;
  borrower_name: string;
  start_date: string;
  end_date: string;
  status: string;
}

export default function LendingHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      setError("");
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("Could not get user info. Please login again.");
        setLoading(false);
        return;
      }
      // Fetch history for this lender
      try {
        const res = await fetch(
          `http://localhost:8000/api/lending-history?lender_id=${user.id}`
        );
        const data = await res.json();
        if (res.ok) {
          setHistory(data.history || []);
        } else {
          setError(data.detail || "Failed to fetch history.");
        }
      } catch {
        setError("Network error. Please try again.");
      }
      setLoading(false);
    }
    fetchHistory();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-300 via-blue-200 to-white px-4 py-12">
      <div className="bg-white bg-opacity-90 rounded-3xl max-w-lg w-full shadow-2xl p-10 border border-white/30">
        <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
          Lending History
        </h1>
        {loading ? (
          <p className="text-blue-600 text-center">Loading...</p>
        ) : error ? (
          <p className="text-red-600 text-center">{error}</p>
        ) : history.length === 0 ? (
          <p className="text-gray-700 text-center mb-4">No history yet.</p>
        ) : (
          <ul className="space-y-4">
            {history.map((item, idx) => (
              <li key={idx} className="bg-blue-50 rounded-xl p-4 shadow">
                <div className="font-bold text-green-700">
                  {item.product_name}
                </div>
                <div className="text-gray-700">
                  Borrower: {item.borrower_name}
                </div>
                <div className="text-gray-500 text-sm">
                  {item.start_date} to {item.end_date}
                </div>
                <div className="text-blue-700 font-semibold">
                  Status: {item.status}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
