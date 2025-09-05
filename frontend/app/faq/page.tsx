"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    q: "How does borrowing work on TradeBridge?",
    a: `Search or browse products, request a booking for the dates you need, and once the lender approves the request you'll coordinate pickup or delivery. Payments and deposits (if applicable) are handled through the platform.`,
  },
  {
    q: "How do I become a lender?",
    a: `Sign up and choose the "Lender" role during registration (or update your profile). Then list your item with details, availability, and images so borrowers can find and request it.`,
  },
  {
    q: "What payment methods are supported?",
    a: `Payments are processed through the platform integrations configured by the site owners. Typically we support card payments — check the checkout flow for the exact options available to you.`,
  },
  {
    q: "Can I cancel a booking?",
    a: `Yes — bookings can be cancelled according to the booking status and the lender's terms. Visit your dashboard to view and manage bookings. Refunds and disputes follow our platform policies.`,
  },
  {
    q: "How do you keep transactions safe?",
    a: `We encourage verified profiles, clear product photos, and secure in-app messaging. The platform also logs transactions and provides tools for reporting issues. Always follow recommended pickup/delivery and documentation practices.`,
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-6 py-16 min-h-screen mt-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold font-serif text-jet mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-taupe mb-8">
          Helpful answers to common questions about borrowing, lending,
          accounts, and safety on TradeBridge.
        </p>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {FAQ_ITEMS.map((item, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="bg-white border border-platinum rounded-md"
            >
              <AccordionTrigger className="px-5 py-4 text-left text-base font-medium">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-0 text-taupe text-sm leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-10 text-sm text-taupe">
          <p>
            Still have questions?{" "}
            <a href="/contact" className="text-jet hover:underline">
              Contact our support team
            </a>{" "}
            and we'll be happy to help.
          </p>
        </div>
      </div>
    </div>
  );
}
