import { type PaidRailSeat, RAIL_SEAT_CAP } from "@/lib/sponsor-rails";

export const listActiveSeats = async (): Promise<PaidRailSeat[]> => {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const [{ default: db }, { and, asc, gt, inArray }, { sponsor }] =
      await Promise.all([
        import("@/db/drizzle"),
        import("drizzle-orm"),
        import("@/db/schema"),
      ]);

    const rows = await db
      .select({
        id: sponsor.id,
        name: sponsor.name,
        slug: sponsor.slug,
        tagline: sponsor.tagline,
        logoUrl: sponsor.logoUrl,
        url: sponsor.url,
      })
      .from(sponsor)
      .where(
        and(
          inArray(sponsor.status, ["active", "past_due"]),
          gt(sponsor.currentPeriodEnd, new Date())
        )
      )
      .orderBy(asc(sponsor.createdAt))
      .limit(RAIL_SEAT_CAP);

    return rows.slice(0, RAIL_SEAT_CAP);
  } catch {
    return [];
  }
};
