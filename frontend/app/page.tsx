"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useParallaxProducts } from "@/hooks/useParallaxProducts";
import HeroSection from "@/components/home/HeroSection";
import FeaturedCategoriesSection from "@/components/home/FeaturedCategoriesSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import DeleteSuccessNotification from "@/components/home/DeleteSuccessNotification";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const { data: parallaxProducts, loading: parallaxLoading } =
    useParallaxProducts(15);

  useEffect(() => {
    if (searchParams.get("deleted") === "true") {
      setShowDeleteSuccess(true);
      // Remove the query parameter from the URL without page reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // Initialize search input from ?search=... if present
    const initial = searchParams.get("search") || "";
    if (initial) setSearchTerm(initial);
  }, [searchParams]);

  const submitSearch = (q?: string) => {
    const query = (q ?? searchTerm).trim();
    if (!query) {
      router.push("/products");
      return;
    }
    router.push(`/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <DeleteSuccessNotification
        show={showDeleteSuccess}
        onHide={() => setShowDeleteSuccess(false)}
      />
      <HeroSection
        products={parallaxProducts || []}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={submitSearch}
      />
      <FeaturedCategoriesSection />
      <HowItWorksSection />
      <TestimonialsSection />
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
