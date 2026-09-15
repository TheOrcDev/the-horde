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
import { portalRequestSchema } from "@/lib/sponsor-schema";

const portalResponseSchema = z.object({
  url: z.url(),
});

const errorResponseSchema = z.object({
  error: z.string(),
});

type PortalFormValues = z.infer<typeof portalRequestSchema>;

interface SponsorManageBillingProps {
  configured: boolean;
  sessionId?: string;
  stripeCustomerId?: string;
}

export default function SponsorManageBilling({
  configured,
  sessionId,
  stripeCustomerId,
}: SponsorManageBillingProps) {
  const [isLoading, setIsLoading] = useState(false);
  const hasReference = Boolean(sessionId || stripeCustomerId);
  const form = useForm<PortalFormValues>({
    resolver: zodResolver(portalRequestSchema),
    defaultValues: {
      sessionId,
      stripeCustomerId,
      email: "",
    },
  });

  async function onSubmit(values: PortalFormValues) {
    if (!configured) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: values.sessionId || sessionId,
          stripeCustomerId: values.stripeCustomerId || stripeCustomerId,
          email: values.email || undefined,
        }),
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        const parsed = errorResponseSchema.safeParse(payload);
        toast.error(parsed.success ? parsed.data.error : "Portal failed");
        return;
      }

      const parsed = portalResponseSchema.safeParse(payload);

      if (!parsed.success) {
        toast.error("Portal failed");
        return;
      }

      window.location.assign(parsed.data.url);
    } catch {
      toast.error("Portal failed");
    } finally {
      setIsLoading(false);
    }
  }

  if (!configured) {
    return <p className="text-sm text-white/70">Stripe is not configured</p>;
  }

  return (
    <Form {...form}>
      <form
        className="flex w-full flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {hasReference ? null : (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing email</FormLabel>
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
        )}
        <Button disabled={isLoading} type="submit" variant="outline">
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
          Manage billing
        </Button>
      </form>
    </Form>
  );
}
