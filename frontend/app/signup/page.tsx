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

          <div className="bg-gradient-to-r from-transparent via-neutral-300 to-transparent my-8 h-[1px] w-full" />

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
