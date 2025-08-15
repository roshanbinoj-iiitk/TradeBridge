"use client";
import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("borrower");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(pwd);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }
    setLoading(true);
    // Step 1: Supabase Auth signup
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    // Step 2: Register user details in backend
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          contact,
          email,
          role,
          password_hash: password, // For demo, send plain password. In production, hash it!
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Registration failed.");
      } else {
        // Success: redirect to dashboard by role
        if (role === "lender") {
          window.location.href = "/lender/dashboard";
        } else if (role === "borrower") {
          window.location.href = "/borrower/dashboard";
        } else if (role === "admin") {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-tr from-blue-400 via-green-300 to-white flex items-center justify-center px-4 py-12">
      <div className="relative bg-white bg-opacity-90 backdrop-blur-md rounded-3xl max-w-lg w-full shadow-2xl p-10 sm:p-14 border border-white/30">
        {/* Heading */}
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600 mb-8 text-center select-none">
          Create Account
        </h1>

        <form onSubmit={handleSignup} className="space-y-8">
          {/* Name */}
          <div className="relative">
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="peer placeholder-transparent w-full border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition"
              placeholder="Full Name"
            />
            <label
              htmlFor="name"
              className="absolute left-0 -top-6 text-gray-600 text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-blue-500 peer-focus:text-sm transition-all"
            >
              Full Name
            </label>
          </div>

          {/* Contact */}
          <div className="relative">
            <input
              id="contact"
              type="tel"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="peer placeholder-transparent w-full border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition"
              placeholder="Contact Number"
            />
            <label
              htmlFor="contact"
              className="absolute left-0 -top-6 text-gray-600 text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-blue-500 peer-focus:text-sm transition-all"
            >
              Contact Number
            </label>
          </div>

          {/* Email */}
          <div className="relative">
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="peer placeholder-transparent w-full border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition"
              placeholder="Email Address"
            />
            <label
              htmlFor="email"
              className="absolute left-0 -top-6 text-gray-600 text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-blue-500 peer-focus:text-sm transition-all"
            >
              Email Address
            </label>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer placeholder-transparent w-full border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none transition"
              placeholder="Password"
            />
            <label
              htmlFor="password"
              className="absolute left-0 -top-6 text-gray-600 text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-blue-500 peer-focus:text-sm transition-all"
            >
              Password
            </label>
            <p className="text-xs text-gray-400 mt-1">
              At least 8 chars, uppercase, lowercase, number & special char
            </p>
          </div>

          {/* Role */}
          <div className="relative">
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none text-gray-700 py-2 pr-8 appearance-none bg-transparent transition"
            >
              <option value="borrower">Borrower</option>
              <option value="lender">Lender</option>
              <option value="admin">Admin</option>
            </select>
            <label
              htmlFor="role"
              className="absolute left-0 -top-6 text-gray-600 text-sm pointer-events-none select-none"
            >
              Select Role
            </label>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-600 text-center font-semibold animate-shake">
              {error}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white rounded-xl font-bold text-lg shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Login
          </a>
        </p>
      </div>

      {/* Extra animation for shaking error */}
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          20%,
          60% {
            transform: translateX(-6px);
          }
          40%,
          80% {
            transform: translateX(6px);
          }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </main>
  );
}
