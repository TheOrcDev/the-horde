import Lightning from "@/components/lightning";
import SignInXButton from "@/components/sign-in-x-button";
import { isAuthConfigured } from "@/lib/auth-config";

export default function CardNotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <Lightning hue={220} intensity={1} size={1} speed={1} xOffset={0} />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-5 px-4 text-center">
        <a className="font-bold text-white" href="/">
          The Horde
        </a>
        <h1 className="font-bold text-3xl text-white">No poster here</h1>
        <p className="text-white/70">
          Claim this name by signing in with that X handle.
        </p>
        <SignInXButton configured={isAuthConfigured()} />
      </div>
    </div>
  );
}
