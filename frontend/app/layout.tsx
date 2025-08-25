import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { inter, playfairDisplay } from "@/lib/fonts";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { AuthProvider } from "@/components/shared/AuthContext";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "TradeBridge - Rent Anything, From Anyone.",
  description: "Your community's marketplace for borrowing and lending.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          playfairDisplay.variable
        )}
      >
        <AuthProvider>
          <Navbar />
          <main className="relative overflow-x-hidden">{children}</main>
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
