"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Handshake } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BackgroundBeams } from "@/components/aceternity/background-beams";
import { Skeleton } from "@/components/ui/skeleton";

function LoginForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Store redirect URL from query params to localStorage on component mount
  useEffect(() => {
    const redirectTo = searchParams?.get("redirectTo");
    if (redirectTo) {
      localStorage.setItem("redirectAfterLogin", redirectTo);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      // Check if there's a redirect URL in the query params or localStorage
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo =
        urlParams.get("redirectTo") ||
        localStorage.getItem("redirectAfterLogin");

      // Clear the stored redirect URL
      localStorage.removeItem("redirectAfterLogin");

      // Redirect to the intended page or default to dashboard
      if (redirectTo && redirectTo !== "/login" && redirectTo !== "/signup") {
        router.push(redirectTo);
      } else {
        router.push("/dashboard");
      }
    }
  };

  return (
    <div className="w-full min-h-screen rounded-md bg-isabelline relative flex flex-col items-center justify-center antialiased">
      {loading ? (
        <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white/50 backdrop-blur-sm border border-platinum z-10">
          <Skeleton className="h-8 w-1/2 mb-4 mx-auto" />
          <Skeleton className="h-6 w-3/4 mb-2 mx-auto" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
        </div>
      ) : (
        <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white/50 backdrop-blur-sm border border-platinum z-10">
          <div className="flex justify-center mb-6">
            <Link
              href="/"
              className="flex items-center space-x-2 font-serif text-2xl font-bold text-jet"
            >
              <Handshake className="h-7 w-7 text-jet" />
              <span>TradeBridge</span>
            </Link>
          </div>
          <h2 className="font-bold text-xl text-jet text-center">
            Welcome Back
          </h2>
          <p className="text-taupe text-sm max-w-sm mt-2 text-center">
            Log in to manage your rentals and continue sharing.
          </p>

          <form className="my-8" onSubmit={handleLogin}>
            <div className="flex flex-col space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  placeholder="projectmayhem@fc.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-center mt-4">{error}</div>
            )}

            <Button
              className="bg-gradient-to-br relative group/btn from-jet to-taupe block w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] mt-8"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In →"}
              <BottomGradient />
            </Button>

            <div className="bg-gradient-to-r from-transparent via-neutral-300 to-transparent my-8 h-[1px] w-full" />

            <p className="text-center text-sm text-taupe">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-jet hover:underline font-semibold"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      )}
      <BackgroundBeams />
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
