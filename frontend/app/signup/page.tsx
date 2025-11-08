"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { BackgroundBeams } from "@/components/aceternity/background-beams";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Handshake } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleRoleChange = (value: string) => {
    setForm({ ...form, role: value });
  };

  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);
    const supabase = createClient();
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    
    setLoading(false);
    if (error) {
      setError(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.confirmPassword ||
      !form.role
    ) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      // Step 1: Sign up with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: form.email,
          password: form.password,
          options: {
            data: {
              name: form.name,
              role: form.role,
            },
          },
        }
      );

      if (signUpError) {
        setError(signUpError.message || "Signup failed.");
        return;
      }

      // Step 2: Insert user data into your custom users table
      if (authData.user) {
        const { error: insertError } = await supabase.from("users").upsert({
          email: form.email,
          role: form.role,
          uuid: authData.user.id, // Link to auth user
          name: form.name, // Add the user's name
          // Note: password_hash is not needed since Supabase Auth handles passwords
        });

        if (insertError) {
          console.error("Error inserting user data:", insertError);
          setError(
            "Account created but there was an issue saving profile data. Please contact support."
          );
          return;
        }
      }

      setSuccess(
        "Signup successful! Please check your email to verify your account before logging in."
      );

      // Clear form
      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
      });

      // Redirect to login with any stored redirect URL
      const redirectTo = localStorage.getItem("redirectAfterLogin");
      if (redirectTo) {
        router.push(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen rounded-md bg-isabelline relative flex flex-col items-center justify-center antialiased mt-8 lg:mt-16">
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
          Join TradeBridge Today
        </h2>
        <p className="text-taupe text-sm max-w-sm mt-2 text-center">
          Create an account to start borrowing and lending in your community.
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          <div className="flex flex-col space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Tyler Durden"
                type="text"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                placeholder="projectmayhem@fc.com"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                placeholder="••••••••"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="role">I want to...</Label>
              <Select value={form.role} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Lend & Borrow</SelectItem>
                  <SelectItem value="borrower">Only Borrow</SelectItem>
                  <SelectItem value="lender">Only Lend</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
          {success && (
            <p className="text-green-600 text-center mt-4">{success}</p>
          )}

          <Button
            className="bg-gradient-to-br relative group/btn from-jet to-taupe block w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] mt-8"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign up →"}
            <BottomGradient />
          </Button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-neutral-500">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="bg-white relative group/btn border border-neutral-300 block w-full text-jet rounded-md h-10 font-medium shadow-sm hover:shadow-md transition-all duration-200 mb-8"
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>{loading ? "Signing up..." : "Continue with Google"}</span>
            </div>
          </Button>

          <p className="text-center text-sm text-taupe">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-jet hover:underline font-semibold"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
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
