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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { addEmail } from "@/server/waiting-list";

const formSchema = z.object({
  email: z.email(),
});

export default function TheHordeForm() {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const { success, message } = await addEmail(values.email);

    if (success) {
      form.reset();
      toast.success(message);
    } else {
      toast.error(message);
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form
        className="flex w-full justify-between gap-2"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="flex-1"
          disabled={isLoading}
          type="submit"
          variant={"outline"}
        >
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
