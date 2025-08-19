"use client";
import React from "react";
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

        <form className="my-8">
          <div className="flex flex-col space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Tyler Durden" type="text" />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                placeholder="projectmayhem@fc.com"
                type="email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" placeholder="••••••••" type="password" />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                placeholder="••••••••"
                type="password"
              />
            </div>
            <div>
              <Label htmlFor="role">I want to...</Label>
              <Select>
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

          <Button
            className="bg-gradient-to-br relative group/btn from-jet to-taupe block w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] mt-8"
            type="submit"
          >
            Sign up &rarr;
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
