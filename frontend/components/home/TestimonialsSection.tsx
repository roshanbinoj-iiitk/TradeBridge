import { InfiniteMovingCards } from "@/components/aceternity/infinite-moving-cards";
import { testimonials } from "@/lib/constants";

export default function TestimonialsSection() {
  return (
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
  );
}
