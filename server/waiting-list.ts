"use server";

import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { waitingList } from "@/db/schema";

export const addEmail = async (email: string) => {
  const existingEmail = await db
    .select()
    .from(waitingList)
    .where(eq(waitingList.email, email));

  if (existingEmail.length > 0) {
    return {
      success: false,
      message: "Email already exists in the waiting list.",
    };
  }

  try {
    await db.insert(waitingList).values({
      email,
    });
  } catch {
    return {
      success: false,
      message: "Failed to add email to the waiting list.",
    };
  }

  return {
    success: true,
    message: "Email added to the waiting list.",
  };
};
