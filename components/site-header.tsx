"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SignInXButton from "@/components/sign-in-x-button";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface SiteHeaderProps {
  configured: boolean;
}

const NAV_LINKS = [{ href: "/horde", label: "Horde" }] as const;

export default function SiteHeader({ configured }: SiteHeaderProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const onSignOut = async () => {
    await authClient.signOut();
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-20 border-white/10 border-b bg-black/50 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            className="shrink-0 font-bold text-sm text-white tracking-wide md:text-base"
            href="/"
          >
            The Horde
          </Link>
          <nav className="flex items-center gap-3 overflow-x-auto text-sm">
            {NAV_LINKS.map((item) => (
              <Link
                className="whitespace-nowrap text-white/75 transition-colors hover:text-white"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isPending ? (
            <Loader2 className="size-4 animate-spin text-white/70" />
          ) : null}
          {!isPending && user ? (
            <>
              {user.image ? (
                <Image
                  alt={`${user.name} avatar`}
                  className="size-8 rounded-full object-cover"
                  height={32}
                  src={user.image}
                  width={32}
                />
              ) : (
                <span className="flex size-8 items-center justify-center rounded-full bg-white/15 font-semibold text-white text-xs">
                  {user.name.slice(0, 1)}
                </span>
              )}
              <Button asChild size="sm" variant="outline">
                <Link href="/me">Your card</Link>
              </Button>
              <Button
                onClick={onSignOut}
                size="sm"
                type="button"
                variant="ghost"
              >
                Sign out
              </Button>
            </>
          ) : null}
          {isPending || user ? null : <SignInXButton configured={configured} />}
        </div>
      </div>
    </header>
  );
}
