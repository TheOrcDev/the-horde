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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  CARD_CLASSES,
  CARD_ROLES,
  type CardSheetInput,
  CLASS_LABELS,
  FACTIONS,
  ROLE_LABELS,
} from "@/lib/card-schema";
import {
  COMMON_TIMEZONES,
  isListedTimezone,
  isValidIanaTimeZone,
  OTHER_TIMEZONE_VALUE,
} from "@/lib/timezones";
import { cn } from "@/lib/utils";
import { createHordeCard, updateHordeCard } from "@/server/cards";

const selectClassName = cn(
  "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] md:text-sm dark:bg-input/30",
  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
  "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40"
);

const formSchema = z
  .object({
    faction: z.enum(FACTIONS),
    class: z.enum(CARD_CLASSES),
    role: z.enum(CARD_ROLES),
    timezoneSelect: z.string().min(1, "Pick a timezone"),
    timezoneOther: z.string(),
    email: z.union([z.email(), z.literal("")]).optional(),
  })
  .refine(
    (value) =>
      value.timezoneSelect !== OTHER_TIMEZONE_VALUE ||
      isValidIanaTimeZone(value.timezoneOther),
    {
      path: ["timezoneOther"],
      message: "Use a valid IANA timezone",
    }
  );

type FormValues = z.infer<typeof formSchema>;

interface CharacterSheetFormProps {
  defaults?: Partial<CardSheetInput>;
  mode: "create" | "edit";
  needsEmail?: boolean;
}

const timezoneSelectValue = (timezone: string, listed: boolean) => {
  if (listed) {
    return timezone;
  }

  if (timezone) {
    return OTHER_TIMEZONE_VALUE;
  }

  return "";
};

const toFormValues = (defaults?: Partial<CardSheetInput>): FormValues => {
  const timezone = defaults?.timezone ?? "";
  const listed = Boolean(timezone && isListedTimezone(timezone));

  return {
    faction: defaults?.faction ?? "horde",
    class: defaults?.class ?? "grunt",
    role: defaults?.role ?? "dps",
    timezoneSelect: timezoneSelectValue(timezone, listed),
    timezoneOther: listed || !timezone ? "" : timezone,
    email: "",
  };
};

const toSheetInput = (values: FormValues): CardSheetInput => ({
  faction: values.faction,
  class: values.class,
  role: values.role,
  timezone:
    values.timezoneSelect === OTHER_TIMEZONE_VALUE
      ? values.timezoneOther
      : values.timezoneSelect,
  email: values.email,
});

export default function CharacterSheetForm({
  mode,
  needsEmail = false,
  defaults,
}: CharacterSheetFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: toFormValues(defaults),
  });
  const timezoneSelect = form.watch("timezoneSelect");

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    const payload = toSheetInput(values);

    if (mode === "create") {
      const result = await createHordeCard(payload);

      if (result?.success === false) {
        toast.error(result.message);
      }
    } else {
      const result = await updateHordeCard(payload);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    }

    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form
        className="flex w-full flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="faction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Faction</FormLabel>
              <FormControl>
                <select className={selectClassName} {...field}>
                  {FACTIONS.map((faction) => (
                    <option key={faction} value={faction}>
                      {faction === "horde" ? "Horde" : "Alliance"}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="class"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class</FormLabel>
              <FormControl>
                <select className={selectClassName} {...field}>
                  {CARD_CLASSES.map((cardClass) => (
                    <option key={cardClass} value={cardClass}>
                      {CLASS_LABELS[cardClass]}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <select className={selectClassName} {...field}>
                  {CARD_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="timezoneSelect"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <FormControl>
                <select className={selectClassName} {...field}>
                  <option value="">Select timezone</option>
                  {COMMON_TIMEZONES.map((zone) => (
                    <option key={zone.value} value={zone.value}>
                      {zone.label}
                    </option>
                  ))}
                  <option value={OTHER_TIMEZONE_VALUE}>Other</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {timezoneSelect === OTHER_TIMEZONE_VALUE ? (
          <FormField
            control={form.control}
            name="timezoneOther"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IANA timezone</FormLabel>
                <FormControl>
                  <Input placeholder="America/Juneau" {...field} />
                </FormControl>
                <FormDescription>
                  Must be a valid IANA name, like Europe/Prague.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
        {needsEmail ? (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raid summons email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional. X did not share one.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
        <Button disabled={isLoading} type="submit" variant="outline">
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
          {mode === "create" ? "Enlist" : "Update sheet"}
        </Button>
      </form>
    </Form>
  );
}
