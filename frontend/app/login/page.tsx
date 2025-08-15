"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // Fetch user role from backend
    try {
      const res = await fetch(
        `/api/userrole?email=${encodeURIComponent(email)}`
      );
      const result = await res.json();
      if (!res.ok || !result.role) {
        setError("Could not determine user role.");
        setLoading(false);
        return;
      }
      if (result.role === "lender") {
        router.push("/lender/dashboard");
      } else if (result.role === "borrower") {
        router.push("/borrower/dashboard");
      } else if (result.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-green-100 to-white p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-lg flex flex-col items-center">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-green-100 rounded-full p-4 mb-4">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 14v7m0 0H7m5 0h5"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-green-700 mb-2">Login</h1>
          <p className="text-gray-500 text-center">
            Access your TradeBridge dashboard
          </p>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-5 w-full">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-green-600 to-blue-500 text-white px-6 py-3 rounded-xl shadow hover:from-green-700 hover:to-blue-600 transition font-bold text-lg"
          >
            {loading ? "Processing..." : "Login"}
          </button>
        </form>
        <div className="mt-8 text-center">
          <a
            href="/signup"
            className="text-green-600 hover:underline font-semibold"
          >
            Don't have an account? Sign Up
          </a>
        </div>
      </div>
    </main>
  );
}
