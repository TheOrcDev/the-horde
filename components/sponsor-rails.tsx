import { connection } from "next/server";
import type { ReactNode } from "react";

import { SponsorRailsTrack } from "@/components/sponsor-rails-track";
import { listActiveSeats } from "@/server/sponsors";

interface SponsorRailsProps {
  children: ReactNode;
}

export default async function SponsorRails({ children }: SponsorRailsProps) {
  await connection();
  const seats = await listActiveSeats();

  return <SponsorRailsTrack seats={seats}>{children}</SponsorRailsTrack>;
}
