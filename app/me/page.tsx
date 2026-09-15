import { redirect } from "next/navigation";
import { getCardByUserId } from "@/server/cards";
import { requireSession } from "@/server/session";

export default async function MePage() {
  const session = await requireSession();
  const card = await getCardByUserId(session.user.id);

  if (card) {
    redirect(`/c/${card.handle}`);
  }

  redirect("/join");
}
