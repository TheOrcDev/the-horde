import { Button } from "@/components/ui/button";
import { cardPermalink, cardShareText } from "@/lib/card-share";

interface ShareOnXButtonProps {
  handle: string;
  origin: string;
  title: string;
}

export default function ShareOnXButton({
  title,
  handle,
  origin,
}: ShareOnXButtonProps) {
  const href = `https://x.com/intent/tweet?text=${encodeURIComponent(cardShareText(title))}&url=${encodeURIComponent(cardPermalink(origin, handle))}`;

  return (
    <Button asChild size="lg" variant="outline">
      <a href={href} rel="noopener" target="_blank">
        Post to X
      </a>
    </Button>
  );
}
