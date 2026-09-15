"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  SPONSOR_NAME_MAX,
  SPONSOR_TAGLINE_MAX,
  type SponsorCheckoutInput,
  sponsorCheckoutSchema,
} from "@/lib/sponsor-schema";

const checkoutResponseSchema = z.object({
  url: z.url(),
});

const errorResponseSchema = z.object({
  error: z.string(),
});

interface SponsorCheckoutFormProps {
  configured: boolean;
  soldOut: boolean;
}

export default function SponsorCheckoutForm({
  configured,
  soldOut,
}: SponsorCheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<SponsorCheckoutInput>({
    resolver: zodResolver(sponsorCheckoutSchema),
    defaultValues: {
      name: "",
      tagline: "",
      url: "",
      logoUrl: "",
      email: "",
    },
  });

  async function onSubmit(values: SponsorCheckoutInput) {
    if (!configured || soldOut) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        const parsed = errorResponseSchema.safeParse(payload);
        toast.error(parsed.success ? parsed.data.error : "Checkout failed");
        return;
      }

      const parsed = checkoutResponseSchema.safeParse(payload);

      if (!parsed.success) {
        toast.error("Checkout failed");
        return;
      }

      window.location.assign(parsed.data.url);
    } catch {
      toast.error("Checkout failed");
    } finally {
      setIsLoading(false);
    }
  }

  if (!configured) {
    return <p className="text-sm text-white/70">Stripe is not configured</p>;
  }

  if (soldOut) {
    return <p className="text-sm text-white/70">Sold out.</p>;
  }

  return (
    <Form {...form}>
      <form
        className="flex w-full flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  autoComplete="organization"
                  maxLength={SPONSOR_NAME_MAX}
                  placeholder="Company name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tagline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tagline</FormLabel>
              <FormControl>
                <Input
                  maxLength={SPONSOR_TAGLINE_MAX}
                  placeholder="One line for the rail"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site URL</FormLabel>
              <FormControl>
                <Input
                  autoComplete="url"
                  placeholder="https://example.com"
                  type="url"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/logo.png"
                  type="url"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  autoComplete="email"
                  placeholder="billing@example.com"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={isLoading} type="submit" variant="outline">
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
          Buy a monthly seat
        </Button>
      </form>
    </Form>
  );
}
