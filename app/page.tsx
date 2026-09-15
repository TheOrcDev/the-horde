import Lightning from "@/components/lightning";
import SignInXButton from "@/components/sign-in-x-button";
import TheHordeForm from "@/components/the-horde-form";
import { isAuthConfigured } from "@/lib/auth-config";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="absolute h-full w-full">
      <Lightning hue={220} intensity={1} size={1} speed={1} xOffset={0} />
      <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-5">
        <h1 className="text-nowrap font-bold text-3xl text-white md:text-5xl">
          IT IS COMING
        </h1>
        {error === "oauth_cancelled" ? (
          <p className="text-sm text-white/70">Sign-in cancelled.</p>
        ) : null}
        <SignInXButton configured={isAuthConfigured()} />
        <TheHordeForm />
      </div>
    </div>
  );
}
