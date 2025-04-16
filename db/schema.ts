import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const waitingList = pgTable("waiting_list", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});