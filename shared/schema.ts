import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const capsules = pgTable("capsules", {
  id: varchar("id").primaryKey(),
  projectName: text("project_name").notNull(),
  xHandle: text("x_handle"),
  description: text("description").notNull(),
  transcript: text("transcript").notNull(),
  walletAddress: text("wallet_address").notNull(),
  ipfsCid: text("ipfs_cid"),
  hash: text("hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCapsuleSchema = createInsertSchema(capsules).omit({ createdAt: true });

export type Capsule = typeof capsules.$inferSelect;
export type InsertCapsule = z.infer<typeof insertCapsuleSchema>;
