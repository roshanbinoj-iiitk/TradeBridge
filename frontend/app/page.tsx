"use client";
import { HeroParallax } from "@/components/aceternity/hero-parallax";
import {
  parallaxProducts,
  featuredProducts,
  testimonials,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HoverEffect } from "@/components/aceternity/hover-effect";
import { Search, CheckCircle, ArrowRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { InfiniteMovingCards } from "@/components/aceternity/infinite-moving-cards";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function HomeContent() {
  const searchParams = useSearchParams();
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get("deleted") === "true") {
      setShowDeleteSuccess(true);
      // Remove the query parameter from the URL without page reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  return (
    <>
      {/* Account deletion success message */}
      {showDeleteSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">
                    Account Deleted Successfully
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your account and all associated data have been permanently
                    removed from our system.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteSuccess(false)}
                className="text-green-400 hover:text-green-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      <HeroParallax
        products={parallaxProducts}
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
              />
            </div>
            <Button
              size="lg"
              className="h-12 text-base bg-jet text-isabelline hover:bg-taupe"
              asChild
            >
              <Link href="/products">
                Browse All Products <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        }
      />

      <section className="py-20 md:py-32 bg-isabelline">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold text-center text-jet font-serif">
            Explore Popular Categories
          </h2>
          <p className="text-lg text-taupe text-center mt-4 max-w-3xl mx-auto">
            Find exactly what you&apos;re looking for. From weekend projects to
            grand adventures, it&apos;s all here.
          </p>
          <HoverEffect items={featuredProducts} />
        </div>
      </section>

      <section id="how-it-works" className="py-20 md:py-32">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-jet font-serif">
            How It Works
          </h2>
          <p className="text-lg text-taupe mt-4 max-w-3xl mx-auto">
            Renting on TradeBridge is simple, secure, and convenient. Get
            started in just three easy steps.
          </p>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <div className="bg-jet text-isabelline rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-jet">
                Find Your Item
              </h3>
              <p className="mt-2 text-taupe">
                Browse our extensive catalog or search for a specific product.
                Filter by category, price, and availability to find the perfect
                match.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-jet text-isabelline rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-jet">
                Request to Rent
              </h3>
              <p className="mt-2 text-taupe">
                Select your rental dates and send a request to the owner.
                You&apos;ll be notified as soon as your request is approved.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-jet text-isabelline rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-jet">
                Arrange Pickup & Return
              </h3>
              <p className="mt-2 text-taupe">
                Coordinate with the owner for a smooth pickup. Enjoy your
                rental, and return it on the agreed-upon date. It&apos;s that
                simple!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-isabelline">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-jet font-serif">
            Join a Community Built on Trust
          </h2>
          <p className="text-lg text-taupe mt-4 max-w-3xl mx-auto">
            Hear from our members who are already saving money, earning extra
            income, and reducing waste.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center">
            <InfiniteMovingCards
              items={testimonials}
              direction="right"
              speed="slow"
            />
          </div>
        </div>
      </section>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
