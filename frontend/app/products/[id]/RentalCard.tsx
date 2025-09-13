"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { addDays, differenceInDays, format } from "date-fns";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { createRentalRequest } from "@/lib/transactions";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Loader2 } from "lucide-react";

interface RentalCardProps {
  price: number;
  productId: number;
}

export default function RentalCard({ price, productId }: RentalCardProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const days =
    date?.from && date?.to ? differenceInDays(date.to, date.from) + 1 : 0;
  const totalPrice = days * price;

  const handleRentalRequest = async () => {
    if (!date?.from || !date?.to) {
      toast({
        title: "Error",
        description: "Please select rental dates",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Check if user is authenticated
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to request a rental",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      // Create rental request
      await createRentalRequest(
        productId,
        user.id,
        format(date.from, "yyyy-MM-dd"),
        format(date.to, "yyyy-MM-dd")
      );

      toast({
        title: "Success!",
        description:
          "Your rental request has been submitted. The lender will be notified.",
      });

      // Optionally redirect to dashboard or orders page
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating rental request:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit rental request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-3xl">₹{price} / day</CardTitle>
        <CardDescription>Select your rental dates.</CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="range"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
        <div className="mt-6">
          <p className="text-lg font-semibold text-jet">
            Total Price: ₹{totalPrice > 0 ? totalPrice.toFixed(2) : "___"}
          </p>
          <p className="text-sm text-taupe">
            (for {days > 0 ? days : "___"} days)
          </p>
        </div>
        <Button
          size="lg"
          className="w-full mt-4 h-12 text-base bg-jet text-isabelline hover:bg-taupe disabled:opacity-50"
          onClick={handleRentalRequest}
          disabled={isLoading || !date?.from || !date?.to}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Request to Rent"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
