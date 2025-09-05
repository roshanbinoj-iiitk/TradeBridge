import { createClient } from "@/utils/supabase/client";

export const parallaxProducts = [
  {
    title: "DJI Mavic Air 2",
    link: "/products/1",
    thumbnail:
      "https://images.pexels.com/photos/724921/pexels-photo-724921.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    title: "Canon EOS R5",
    link: "/products/2",
    thumbnail:
      "https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    title: "Projector Screen",
    link: "/products/3",
    thumbnail:
      "https://images.pexels.com/photos/8068074/pexels-photo-8068074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    title: "Camping Tent",
    link: "/products/4",
    thumbnail:
      "https://images.pexels.com/photos/2422265/pexels-photo-2422265.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    title: "Power Drill",
    link: "/products/5",
    thumbnail:
      "https://images.pexels.com/photos/1249610/pexels-photo-1249610.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    title: "Electric Guitar",
    link: "/products/6",
    thumbnail:
      "https://images.pexels.com/photos/164727/pexels-photo-164727.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    title: "Mountain Bike",
    link: "/products/7",
    thumbnail:
      "https://images.pexels.com/photos/1149601/pexels-photo-1149601.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    title: "Paddleboard",
    link: "/products/8",
    thumbnail:
      "https://images.pexels.com/photos/1687719/pexels-photo-1687719.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    title: "Sewing Machine",
    link: "/products/9",
    thumbnail:
      "https://images.pexels.com/photos/5439373/pexels-photo-5439373.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    title: "Popcorn Machine",
    link: "/products/10",
    thumbnail:
      "https://images.pexels.com/photos/33129/popcorn-movie-party-entertainment.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    title: "Lawn Mower",
    link: "/products/11",
    thumbnail:
      "https://images.pexels.com/photos/4846455/pexels-photo-4846455.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    title: "Studio Microphone",
    link: "/products/12",
    thumbnail:
      "https://images.pexels.com/photos/3756498/pexels-photo-3756498.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    title: "Kayak",
    link: "/products/13",
    thumbnail:
      "https://images.pexels.com/photos/2397414/pexels-photo-2397414.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    title: "Telescope",
    link: "/products/14",
    thumbnail:
      "https://images.pexels.com/photos/3912944/pexels-photo-3912944.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    title: "Folding Chairs",
    link: "/products/15",
    thumbnail:
      "https://images.pexels.com/photos/279614/pexels-photo-279614.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
];

export const featuredProducts = [
  {
    title: "Electronics",
    description:
      "From cameras to drones, find the latest tech for your next project or adventure.",
    link: "/products?category=electronics",
  },
  {
    title: "Events & Party",
    description:
      "Everything you need for your next gathering, from sound systems to popcorn machines.",
    link: "/products?category=events",
  },
  {
    title: "DIY & Tools",
    description:
      "Tackle any home improvement project with our wide selection of power tools.",
    link: "/products?category=tools",
  },
  {
    title: "Outdoors",
    description:
      "Explore the great outdoors with our collection of camping gear, bikes, and more.",
    link: "/products?category=outdoors",
  },
  {
    title: "Home & Garden",
    description:
      "Find the right tools and equipment for your garden and home maintenance needs.",
    link: "/products?category=home",
  },
  {
    title: "Music & Hobbies",
    description:
      "Unleash your creativity with musical instruments and hobbyist equipment.",
    link: "/products?category=hobbies",
  },
];

export const testimonials = [
  {
    quote:
      "Renting a high-end camera for my vacation was so easy and affordable. TradeBridge is a game-changer!",
    name: "Sarah L.",
    title: "Photography Enthusiast",
  },
  {
    quote:
      "I listed my power tools that were just collecting dust, and now they're making me extra income every month. The process was seamless.",
    name: "Mark T.",
    title: "Homeowner & Lender",
  },
  {
    quote:
      "Needed a projector for a last-minute movie night and found one available just a few blocks away. Saved the day!",
    name: "Jessica P.",
    title: "Event Organizer",
  },
  {
    quote:
      "The platform is intuitive, and the community is trustworthy. I've had nothing but positive experiences both renting and lending.",
    name: "David Chen",
    title: "Community Member",
  },
  {
    quote:
      "As someone who loves trying new hobbies, TradeBridge lets me experiment with new gear without the commitment of buying. It's brilliant.",
    name: "Emily R.",
    title: "Hobbyist",
  },
];

/**
 * Fetch a small list of products for the parallax/hero section.
 * - Single query: products + nested product_images (no per-product requests)
 * - Limits results to avoid large payloads
 * - Caller can pass a limit (default 12)
 */
export async function getParallaxProducts({ limit = 15 } = {}) {
  try {
    const supabase = createClient();
    const from = 0;
    const to = Math.max(0, limit - 1);

    const { data, error } = await supabase
      .from("products")
      .select(
        `product_id, name, image_url, product_images(image_id, image_url)`
      )
      .eq("available_status", true)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("getParallaxProducts supabase error", error);
      return [];
    }

    return (data || []).map((p: any) => {
      const thumbnail =
        p.image_url ||
        (p.product_images && p.product_images[0]?.image_url) ||
        "";
      return {
        title: p.name || "Untitled",
        link: `/products/${p.product_id}`,
        thumbnail,
        product_id: p.product_id,
      };
    });
  } catch (err) {
    console.error("getParallaxProducts error", err);
    return [];
  }
}
