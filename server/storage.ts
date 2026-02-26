import { db } from "./db";
import { capsules, type Capsule, type InsertCapsule } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getCapsules(): Promise<Capsule[]>;
  getCapsule(id: string): Promise<Capsule | undefined>;
  createCapsule(capsule: InsertCapsule): Promise<Capsule>;
}

export class DatabaseStorage implements IStorage {
  async getCapsules(): Promise<Capsule[]> {
    return await db.select().from(capsules);
  }

  async getCapsule(id: string): Promise<Capsule | undefined> {
    const [capsule] = await db.select().from(capsules).where(eq(capsules.id, id));
    return capsule;
  }

  async createCapsule(insertCapsule: InsertCapsule): Promise<Capsule> {
    const [capsule] = await db.insert(capsules).values(insertCapsule).returning();
    return capsule;
  }
}

export const storage = new DatabaseStorage();
