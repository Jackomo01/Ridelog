import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, activities, bucketItems, passes } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// RideLog Database Queries

export async function getActivitiesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(activities).where(eq(activities.userId, userId));
}

export async function createActivity(
  userId: number,
  data: {
    date: Date;
    location: string;
    category: string;
    notes?: string;
    cost?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(activities).values({
    userId,
    date: data.date,
    location: data.location,
    category: data.category as any,
    notes: data.notes,
    cost: data.cost,
  });
  
  return result;
}

export async function updateActivity(
  id: number,
  userId: number,
  data: {
    location: string;
    category: string;
    notes?: string;
    cost?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = {
    location: data.location,
    category: data.category,
    notes: data.notes,
    cost: data.cost,
  };
  
  return db.update(activities).set(updateData).where(
    and(eq(activities.id, id), eq(activities.userId, userId))
  );
}

export async function deleteActivity(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(activities).where(
    and(eq(activities.id, id), eq(activities.userId, userId))
  );
}

export async function getBucketItemsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(bucketItems).where(eq(bucketItems.userId, userId));
}

export async function createBucketItem(
  userId: number,
  data: {
    title: string;
    category?: string;
    priority: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(bucketItems).values({
    userId,
    title: data.title,
    category: data.category,
    priority: data.priority as any,
  });
}

export async function updateBucketItem(
  id: number,
  userId: number,
  data: { completed?: number; title?: string; priority?: string }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = {};
  if (data.completed !== undefined) updateData.completed = data.completed;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.priority !== undefined) updateData.priority = data.priority;
  
  return db.update(bucketItems).set(updateData).where(
    and(eq(bucketItems.id, id), eq(bucketItems.userId, userId))
  );
}

export async function deleteBucketItem(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(bucketItems).where(
    and(eq(bucketItems.id, id), eq(bucketItems.userId, userId))
  );
}

export async function getPassesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(passes).where(eq(passes.userId, userId));
}

export async function createPass(
  userId: number,
  data: {
    name: string;
    purchasePrice: number;
    youthDayPrice: number;
    adultDayPrice: number;
    userGroup: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(passes).values({
    userId,
    name: data.name,
    purchasePrice: data.purchasePrice,
    youthDayPrice: data.youthDayPrice,
    adultDayPrice: data.adultDayPrice,
    userGroup: data.userGroup as any,
  });
}

export async function updatePassVisits(id: number, userId: number, visits: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(passes).set({ visits }).where(
    and(eq(passes.id, id), eq(passes.userId, userId))
  );
}

export async function deletePass(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(passes).where(
    and(eq(passes.id, id), eq(passes.userId, userId))
  );
}

// Anonymous user creation for local app usage
export async function createAnonymousUser() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Generate a unique anonymous openId
  const anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  const result = await db.insert(users).values({
    openId: anonymousId,
    name: "Anonymous User",
    email: null,
    loginMethod: "anonymous",
    role: "user",
    lastSignedIn: new Date(),
  });
  
  // Get the created user
  const user = await getUserByOpenId(anonymousId);
  if (!user) throw new Error("Failed to create anonymous user");
  
  return user;
}
