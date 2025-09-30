import { HoverEffect } from "@/components/aceternity/hover-effect";
import { featuredProducts } from "@/lib/constants";

export default function FeaturedCategoriesSection() {
  return (
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
  );
}
