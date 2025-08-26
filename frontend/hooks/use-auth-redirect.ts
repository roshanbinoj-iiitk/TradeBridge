"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/shared/AuthContext";

/**
 * Hook to handle authentication redirects
 * Stores current page URL and redirects to login if user is not authenticated
 * @param redirectPath - Optional custom redirect path (defaults to current path)
 */
export function useAuthRedirect(redirectPath?: string) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Store the current URL or custom redirect path for redirect after login
      const pathToStore =
        redirectPath || window.location.pathname + window.location.search;
      localStorage.setItem("redirectAfterLogin", pathToStore);
      router.push("/login");
    }
  }, [user, loading, router, redirectPath]);

  return { user, loading, isAuthenticated: !loading && !!user };
}
