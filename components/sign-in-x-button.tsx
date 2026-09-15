"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface SignInXButtonProps {
  callbackURL?: string;
  configured: boolean;
}

export default function SignInXButton({
  callbackURL = "/join",
  configured,
}: SignInXButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    if (!configured) {
      return;
    }

    setIsLoading(true);
    await authClient.signIn.social({
      provider: "twitter",
      callbackURL,
      errorCallbackURL: "/",
    });
    setIsLoading(false);
  };

  return (
    <Button
      disabled={isLoading || !configured}
      onClick={onClick}
      type="button"
      variant="outline"
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
      {configured ? "Sign in with X" : "OAuth not configured"}
    </Button>
  );
}
