"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/components/shared/AuthContext";

export default function DebugProfile() {
  const { user, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    if (user && !loading) {
      const checkUserData = async () => {
        const supabase = createClient();

        console.log("Auth user:", user);
        console.log("User ID:", user.id);

        // Check if user exists in public.users table
        const {
          data: userData,
          error: userError,
          count,
        } = await supabase
          .from("users")
          .select("*", { count: "exact" })
          .eq("uuid", user.id);

        console.log("User query result:", { userData, userError, count });

        // Also try querying by email
        const { data: emailData, error: emailError } = await supabase
          .from("users")
          .select("*")
          .eq("email", user.email);

        console.log("Email query result:", { emailData, emailError });

        // Check total users in table
        const { count: totalUsers } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });

        console.log("Total users in table:", totalUsers);

        setDebugInfo({
          authUser: user,
          userData,
          userError,
          emailData,
          emailError,
          totalUsers,
        });
      };

      checkUserData();
    }
  }, [user, loading]);

  if (loading) return <div>Loading auth...</div>;
  if (!user) return <div>No user authenticated</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Debug Profile</h1>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
}
