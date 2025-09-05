import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type ParallaxProduct = {
  product_id: number;
  title: string;
  link: string;
  thumbnail: string;
};

// TTL for client-side cache (ms). Tune as needed — longer reduces requests.
const CACHE_TTL = 60 * 1000; // 1 minute

// Simple in-memory cache shared across hook instances to dedupe requests.
const cache = new Map<string, { ts: number; data: ParallaxProduct[] }>();

/**
 * Client-side hook to fetch a small, cached list of products for parallax/hero.
 * - Single Supabase query that returns products with nested product_images
 * - In-memory TTL cache to reduce repeated requests across components
 * - Safe for use in client components (uses public anon key)
 */
export function useParallaxProducts(limit = 12) {
  const key = String(limit);
  const initial = (() => {
    const entry = cache.get(key);
    if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
    return null;
  })();

  const [data, setData] = useState<ParallaxProduct[] | null>(initial);
  const [loading, setLoading] = useState<boolean>(initial ? false : true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    const entry = cache.get(key);
    if (entry && Date.now() - entry.ts < CACHE_TTL) {
      setData(entry.data);
      setLoading(false);
      return () => (mounted = false);
    }

    setLoading(true);
    const supabase = createClient();

    async function fetchData() {
      try {
        const { data: rows, error: fetchError } = await supabase
          .from("products")
          .select(
            "product_id, name, image_url, product_images(image_id, image_url)"
          )
          .eq("available_status", true)
          .order("created_at", { ascending: false })
          .range(0, Math.max(0, limit - 1));

        if (!mounted) return;

        if (fetchError) {
          setError(fetchError);
          setLoading(false);
          return;
        }

        const mapped: ParallaxProduct[] = (rows || []).map((p: any) => {
          const thumbnail =
            p.image_url ||
            (p.product_images && p.product_images[0]?.image_url) ||
            "";
          return {
            product_id: p.product_id,
            title: p.name || "Untitled",
            link: `/products/${p.product_id}`,
            thumbnail,
          };
        });

        cache.set(key, { ts: Date.now(), data: mapped });
        setData(mapped);
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        setError(err);
        setLoading(false);
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [key, limit]);

  return { data, loading, error } as const;
}
