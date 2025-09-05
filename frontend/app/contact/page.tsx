"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

export default function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const validate = () => {
    const e: { [k: string]: string } = {};
    if (!form.name.trim()) e.name = "Please enter your name.";
    if (!form.email.trim()) e.email = "Please enter your email.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      e.email = "Please enter a valid email.";
    if (!form.message.trim()) e.message = "Please enter a message.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (k: string, v: string) => {
    setForm((s) => ({ ...s, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || "Failed to send message");
      }
      setForm({ name: "", email: "", subject: "", message: "" });
      toast({
        title: "Message sent",
        description: "We received your message and will get back to you soon.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Unable to send message.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-16 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold text-jet font-serif text-center">
          Contact Us
        </h1>
        <p className="mt-4 text-lg text-taupe text-center max-w-3xl mx-auto">
          Have questions, feedback, or need help with a booking? Send us a
          message and our support team will respond as soon as possible.
        </p>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="p-6">
              <CardHeader>
                <h2 className="text-xl font-semibold">Get in touch</h2>
                <p className="text-sm text-taupe mt-1">
                  We&apos;re here to help — reach out anytime.
                </p>
              </CardHeader>

              <Separator className="my-4" />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="text-jet p-2 bg-muted rounded-md">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Address</div>
                    <div className="text-sm text-taupe">
                      123 TradeBridge Lane
                      <br />
                      Community District, City
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-jet p-2 bg-muted rounded-md">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Email</div>
                    <div className="text-sm text-taupe">
                      support@tradebridge.example
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-jet p-2 bg-muted rounded-md">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Phone</div>
                    <div className="text-sm text-taupe">+1 (555) 123-4567</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-jet p-2 bg-muted rounded-md">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Hours</div>
                    <div className="text-sm text-taupe">
                      Mon - Fri: 9:00am - 6:00pm
                    </div>
                  </div>
                </div>

                <Separator className="my-2" />

                <div className="text-sm text-taupe">
                  For urgent matters related to active rentals, please include
                  your booking ID in the message.
                </div>

                <div className="mt-4">
                  <div className="w-full h-64 md:h-96 rounded overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3932.128109948461!2d76.65005186665006!3d9.7552145612444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b07ce23bc170053%3A0x8757971e61eb21dd!2sIndian%20Institute%20of%20Information%20Technology%20(IIIT)%20Kottayam!5e0!3m2!1sen!2sin!4v1757035621035!5m2!1sen!2sin"
                      className="w-full h-full"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="p-6">
              <CardHeader>
                <h2 className="text-xl font-semibold">Send us a message</h2>
                <p className="text-sm text-taupe mt-1">
                  Tell us how we can help and we&apos;ll get back to you
                  shortly.
                </p>
              </CardHeader>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Your name</label>
                    <Input
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Jane Doe"
                    />
                    {errors.name && (
                      <div className="text-sm text-destructive mt-1">
                        {errors.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="you@example.com"
                    />
                    {errors.email && (
                      <div className="text-sm text-destructive mt-1">
                        {errors.email}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Subject (optional)
                  </label>
                  <Input
                    value={form.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    placeholder="Subject"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    placeholder="How can we help?"
                    className="h-40"
                  />
                  {errors.message && (
                    <div className="text-sm text-destructive mt-1">
                      {errors.message}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setForm({ name: "", email: "", subject: "", message: "" })
                    }
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    className="flex items-center"
                    disabled={loading}
                  >
                    {loading ? (
                      "Sending…"
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" /> Send Message
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
