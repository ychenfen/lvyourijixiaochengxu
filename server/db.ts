import { eq, desc, and, sql, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, diaries, diaryImages, InsertDiary, InsertDiaryImage, Diary } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

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

// ==================== 用户相关 ====================

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

    const textFields = ["name", "email", "loginMethod", "avatar"] as const;
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
      values.role = 'admin';
      updateSet.role = 'admin';
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

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers(page: number = 1, pageSize: number = 20, search?: string) {
  const db = await getDb();
  if (!db) return { users: [], total: 0 };
  
  const offset = (page - 1) * pageSize;
  
  let whereClause = undefined;
  if (search) {
    whereClause = or(
      like(users.name, `%${search}%`),
      like(users.email, `%${search}%`)
    );
  }
  
  const [userList, countResult] = await Promise.all([
    db.select().from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(users).where(whereClause)
  ]);
  
  return { users: userList, total: countResult[0]?.count || 0 };
}

export async function updateUserStatus(userId: number, status: "active" | "disabled") {
  const db = await getDb();
  if (!db) return false;
  
  await db.update(users).set({ status }).where(eq(users.id, userId));
  return true;
}

// ==================== 日记相关 ====================

export async function createDiary(diary: InsertDiary) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(diaries).values(diary);
  return result[0].insertId;
}

export async function updateDiary(id: number, userId: number, data: Partial<InsertDiary>) {
  const db = await getDb();
  if (!db) return false;
  
  await db.update(diaries)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(diaries.id, id), eq(diaries.userId, userId)));
  return true;
}

export async function deleteDiary(id: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  
  await db.update(diaries)
    .set({ isDeleted: true })
    .where(and(eq(diaries.id, id), eq(diaries.userId, userId)));
  return true;
}

export async function getDiaryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(diaries)
    .where(and(eq(diaries.id, id), eq(diaries.isDeleted, false)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getDiaryWithImages(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const diary = await getDiaryById(id);
  if (!diary) return undefined;
  
  const images = await db.select().from(diaryImages)
    .where(eq(diaryImages.diaryId, id))
    .orderBy(diaryImages.sortOrder);
  
  return { ...diary, images };
}

export async function getUserDiaries(userId: number, page: number = 1, pageSize: number = 10) {
  const db = await getDb();
  if (!db) return { diaries: [], total: 0 };
  
  const offset = (page - 1) * pageSize;
  
  const [diaryList, countResult] = await Promise.all([
    db.select().from(diaries)
      .where(and(eq(diaries.userId, userId), eq(diaries.isDeleted, false)))
      .orderBy(desc(diaries.createdAt))
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(diaries)
      .where(and(eq(diaries.userId, userId), eq(diaries.isDeleted, false)))
  ]);
  
  return { diaries: diaryList, total: countResult[0]?.count || 0 };
}

export async function getUserFootprints(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select({
    id: diaries.id,
    title: diaries.title,
    locationName: diaries.locationName,
    latitude: diaries.latitude,
    longitude: diaries.longitude,
    coverImage: diaries.coverImage,
    createdAt: diaries.createdAt,
  }).from(diaries)
    .where(and(
      eq(diaries.userId, userId),
      eq(diaries.isDeleted, false),
      sql`${diaries.latitude} IS NOT NULL`,
      sql`${diaries.longitude} IS NOT NULL`
    ))
    .orderBy(desc(diaries.createdAt));
  
  return result;
}

// ==================== 日记图片相关 ====================

export async function addDiaryImages(images: InsertDiaryImage[]) {
  const db = await getDb();
  if (!db) return;
  
  if (images.length > 0) {
    await db.insert(diaryImages).values(images);
  }
}

export async function deleteDiaryImages(diaryId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(diaryImages).where(eq(diaryImages.diaryId, diaryId));
}

export async function getDiaryImages(diaryId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(diaryImages)
    .where(eq(diaryImages.diaryId, diaryId))
    .orderBy(diaryImages.sortOrder);
}

// ==================== 管理员相关 ====================

export async function getAllDiaries(page: number = 1, pageSize: number = 20, status?: string, search?: string) {
  const db = await getDb();
  if (!db) return { diaries: [], total: 0 };
  
  const offset = (page - 1) * pageSize;
  
  const conditions = [eq(diaries.isDeleted, false)];
  if (status && status !== 'all') {
    conditions.push(eq(diaries.status, status as "published" | "draft" | "hidden"));
  }
  if (search) {
    conditions.push(or(
      like(diaries.title, `%${search}%`),
      like(diaries.content, `%${search}%`)
    )!);
  }
  
  const whereClause = and(...conditions);
  
  const [diaryList, countResult] = await Promise.all([
    db.select({
      diary: diaries,
      user: {
        id: users.id,
        name: users.name,
        avatar: users.avatar,
      }
    }).from(diaries)
      .leftJoin(users, eq(diaries.userId, users.id))
      .where(whereClause)
      .orderBy(desc(diaries.createdAt))
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(diaries).where(whereClause)
  ]);
  
  return { 
    diaries: diaryList.map(item => ({ ...item.diary, user: item.user })), 
    total: countResult[0]?.count || 0 
  };
}

export async function updateDiaryStatus(id: number, status: "published" | "draft" | "hidden") {
  const db = await getDb();
  if (!db) return false;
  
  await db.update(diaries).set({ status }).where(eq(diaries.id, id));
  return true;
}

export async function adminDeleteDiary(id: number) {
  const db = await getDb();
  if (!db) return false;
  
  await db.update(diaries).set({ isDeleted: true }).where(eq(diaries.id, id));
  return true;
}

// ==================== 统计相关 ====================

export async function getStatistics() {
  const db = await getDb();
  if (!db) return { totalUsers: 0, totalDiaries: 0, todayDiaries: 0, activeUsers: 0 };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [userCount, diaryCount, todayDiaryCount, activeUserCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(diaries).where(eq(diaries.isDeleted, false)),
    db.select({ count: sql<number>`count(*)` }).from(diaries)
      .where(and(eq(diaries.isDeleted, false), sql`${diaries.createdAt} >= ${today}`)),
    db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.status, "active"))
  ]);
  
  return {
    totalUsers: userCount[0]?.count || 0,
    totalDiaries: diaryCount[0]?.count || 0,
    todayDiaries: todayDiaryCount[0]?.count || 0,
    activeUsers: activeUserCount[0]?.count || 0,
  };
}


// ==================== 公开日记 ====================

export async function getRecentDiaries(limit: number = 6) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select({
    diary: diaries,
    user: {
      id: users.id,
      name: users.name,
      avatar: users.avatar,
    }
  }).from(diaries)
    .leftJoin(users, eq(diaries.userId, users.id))
    .where(and(
      eq(diaries.isDeleted, false),
      eq(diaries.status, "published")
    ))
    .orderBy(desc(diaries.createdAt))
    .limit(limit);
  
  return result.map(item => ({ ...item.diary, user: item.user }));
}
