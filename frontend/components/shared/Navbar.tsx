"use client";

import React from "react";
import { useAuth } from "@/components/shared/AuthContext";
import Link from "next/link";
import { Handshake } from "lucide-react";
import { FloatingNav } from "@/components/aceternity/floating-nav";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const { user, loading } = useAuth();

  const navItems = [
    { name: "Browse Products", link: "/products" },
    { name: "Community", link: "/social" },
    { name: "How It Works", link: "/#how-it-works" },
  ];

  const Logo = () => (
    <Link
      href="/"
      className="flex items-center space-x-2 font-serif text-xl font-bold text-jet"
    >
      <Handshake className="h-6 w-6 text-jet" />
      <span>TradeBridge</span>
    </Link>
  );

  const AuthButtons = () => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" asChild>
        <Link href="/login">Log In</Link>
      </Button>
      <Button className="bg-jet text-isabelline hover:bg-taupe" asChild>
        <Link href="/signup">Sign Up</Link>
      </Button>
    </div>
  );

  const UserMenu = () => (
    <div className="flex items-center gap-3">
      {/* User name display */}
      <div className="hidden md:flex flex-col items-end">
        <span className="text-sm font-medium text-jet">
          {user?.user_metadata?.name || user?.email?.split("@")[0] || "User"}
        </span>
        <span className="text-xs text-taupe">Welcome back</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={
                  user?.avatar_url ||
                  "https://i.pravatar.cc/150?u=a042581f4e29026704d"
                }
                alt="User Avatar"
              />
              <AvatarFallback>
                {user?.email?.[0]?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard">Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/messages">Messages</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/borrower">My Rentals</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/lender">My Products</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              const supabase =
                require("@/utils/supabase/client").createClient();
              supabase.auth.signOut();
              window.location.href = "/";
            }}
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <FloatingNav
      navItems={navItems}
      logo={<Logo />}
      authComponent={loading ? null : user ? <UserMenu /> : <AuthButtons />}
    />
  );
  // ...existing code...
}
