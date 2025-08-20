"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { addDays, differenceInDays } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

interface RentalCardProps {
  price: number;
}

export default function RentalCard({ price }: RentalCardProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const days =
    date?.from && date?.to ? differenceInDays(date.to, date.from) + 1 : 0;
  const totalPrice = days * price;

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-3xl">${price} / day</CardTitle>
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
            Total Price: ${totalPrice > 0 ? totalPrice.toFixed(2) : "___"}
          </p>
          <p className="text-sm text-taupe">
            (for {days > 0 ? days : "___"} days)
          </p>
        </div>
        <Button
          size="lg"
          className="w-full mt-4 h-12 text-base bg-jet text-isabelline hover:bg-taupe"
        >
          Request to Rent
        </Button>
      </CardContent>
    </Card>
  );
}
