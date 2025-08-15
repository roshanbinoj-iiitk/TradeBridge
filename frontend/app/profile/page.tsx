"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type UserProfile = {
  id: number;
  name: string;
  contact: string;
  email: string;
  role: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      const { data, error } = await supabase.auth.getUser();
      console.log("Supabase user:", data?.user);
      if (data?.user?.email) {
        try {
          const res = await fetch(
            `http://localhost:8000/get_user_profile?email=${encodeURIComponent(data.user.email)}`
          );
          const result = await res.json();
          if (res.ok && result.profile) {
            setProfile(result.profile);
          } else {
            setError("Profile not found.");
          }
        } catch {
          setError("Network error. Please try again.");
        }
      } else {
        setError("User not logged in.");
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-400 via-blue-300 to-white px-4 py-12">
      <div className="bg-white bg-opacity-90 rounded-3xl max-w-md w-full shadow-2xl p-10 border border-white/30">
        <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">
          Profile
        </h1>
        {loading ? (
          <p className="text-blue-600 text-center">Loading...</p>
        ) : error ? (
          <p className="text-red-600 text-center">{error}</p>
        ) : (
          <div className="space-y-4">
            <div>
              <strong>Name:</strong> {profile?.name}
            </div>
            <div>
              <strong>Email:</strong> {profile?.email}
            </div>
            <div>
              <strong>Contact:</strong> {profile?.contact}
            </div>
            <div>
              <strong>Role:</strong> {profile?.role}
            </div>
            <div>
              <strong>User ID:</strong> {profile?.id}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
