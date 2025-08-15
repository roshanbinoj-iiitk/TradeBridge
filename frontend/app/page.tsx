"use client";
import React, { useState } from "react";

export default function Home() {
  const [showLogin, setShowLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Placeholder for authentication logic
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Add your authentication logic here (e.g., Supabase)
    setTimeout(() => {
      setLoading(false);
      setError("Authentication not implemented yet.");
    }, 1000);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-white p-8">
      <h1 className="text-4xl font-bold mb-6 text-blue-700 text-center">
        Welcome to TradeBridge!
      </h1>
      <p className="mb-8 text-lg text-gray-700 text-center">
        A student rental platform for IIIT Kottayam.
      </p>
      <div className="flex gap-6">
        <a href="/login">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition font-semibold text-lg">
            Login
          </button>
        </a>
        <a href="/signup">
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition font-semibold text-lg">
            Sign Up
          </button>
        </a>
      </div>
    </main>
  );
}
