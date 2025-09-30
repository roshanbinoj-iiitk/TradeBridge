"use client";

import { HeroParallax } from "@/components/aceternity/hero-parallax";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeroSectionProps {
  products: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: (term?: string) => void;
}

export default function HeroSection({
  products,
  searchTerm,
  setSearchTerm,
  onSearch,
}: HeroSectionProps) {
  const router = useRouter();

  return (
    <HeroParallax
      products={products || []}
      title={
        <>
          Rent Anything, <br /> From Anyone.
        </>
      }
      subTitle="Your community's marketplace for borrowing and lending. Access what you need, when you need it, and earn by sharing what you have."
      cta={
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-battleship-gray" />
            <Input
              placeholder="Search for a drone, camera, tent..."
              className="pl-10 w-full sm:w-80 h-12 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSearch();
                }
              }}
            />
          </div>
          <Button
            size="lg"
            className="h-12 text-base bg-jet text-isabelline hover:bg-taupe"
            onClick={() => router.push("/products")}
          >
            Browse All Products <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      }
    />
  );
}
