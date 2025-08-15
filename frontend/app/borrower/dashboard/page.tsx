"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  start_date?: string;
  end_date?: string;
  available: boolean;
}

export default function BorrowerDashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [borrowDate, setBorrowDate] = useState("");
  const [duration, setDuration] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch all items from backend
  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/api/items");
        const data = await res.json();
        setItems(data.items || []);
      } catch {
        setMessage("Failed to fetch items.");
      }
      setLoading(false);
    }
    fetchItems();
  }, []);

  // Borrow item
  const handleBorrow = async (itemId: number) => {
    setLoading(true);
    try {
      const res = await fetch("/api/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId, date: borrowDate, duration }),
      });
      const data = await res.json();
      if (res.ok) {
        setItems((prev) =>
          prev.map((item: Item) =>
            item.id === itemId ? { ...item, available: false } : item
          )
        );
        setMessage("Item borrowed successfully!");
      } else {
        setMessage(data.detail || "Failed to borrow item.");
      }
    } catch {
      setMessage("Network error.");
    }
    setSelectedItem(null);
    setBorrowDate("");
    setDuration(1);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-br from-green-100 to-white p-8">
      <div className="flex justify-between items-center mb-4 w-full max-w-xl mx-auto">
        <h1 className="text-4xl font-bold text-green-700 text-center">
          Borrower Dashboard
        </h1>
        <button
          className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg font-bold shadow hover:bg-red-600"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      <p className="mb-4 text-lg text-gray-700 text-center">
        Browse items, request to borrow, and track your rentals.
      </p>

      {/* List items available for borrowing */}
      <div className="w-full max-w-xl">
        <h2 className="text-2xl font-semibold mb-4 text-green-800">
          Available Items
        </h2>
        <ul className="space-y-4">
          {items.map((item: Item) => (
            <li
              key={item.id}
              className="bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row justify-between items-center border border-green-200"
            >
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {item.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="item"
                      className="h-16 w-16 object-cover rounded"
                    />
                  ))}
                </div>
                <div>
                  <span className="font-bold text-green-700 text-lg">
                    {item.name}
                  </span>
                  <span className="block text-gray-700">
                    {item.description}
                  </span>
                  <span className="block text-blue-700 font-semibold">
                    ₹{item.price} / day
                  </span>
                  <span className="block text-gray-500 text-xs">
                    Available: {item.start_date} to {item.end_date}
                  </span>
                </div>
              </div>
              {item.available ? (
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold mt-2 sm:mt-0"
                  onClick={() => setSelectedItem(item.id)}
                >
                  Borrow
                </button>
              ) : (
                <span className="text-red-500 font-semibold mt-2 sm:mt-0">
                  Not available
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Borrow modal */}
      {selectedItem !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Borrow Item</h3>
            <label className="block mb-2">Select Date:</label>
            <input
              type="date"
              value={borrowDate}
              onChange={(e) => setBorrowDate(e.target.value)}
              className="mb-4 px-3 py-2 border rounded w-full"
            />
            <label className="block mb-2">Duration (days):</label>
            <input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="mb-4 px-3 py-2 border rounded w-full"
            />
            <div className="flex gap-4">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold"
                onClick={() => handleBorrow(selectedItem)}
              >
                Confirm Borrow
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded-lg font-semibold"
                onClick={() => setSelectedItem(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="mt-6 text-center text-green-700 font-semibold">
          {message}
        </div>
      )}
    </main>
  );
}
