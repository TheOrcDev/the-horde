"use server";

import db from "@/db/drizzle";
import { waitingList } from "@/db/schema";
import { eq } from "drizzle-orm";

export const addEmail = async (email: string) => {
    const existingEmail = await db.select().from(waitingList).where(eq(waitingList.email, email));

    if (existingEmail.length > 0) {
        return {
            success: false,
            message: "Email already exists in the waiting list.",
        };
    }

    try {
        await db.insert(waitingList).values({
            email: email,
        });
    } catch (error) {
        console.error(error);
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
