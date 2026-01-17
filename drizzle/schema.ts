import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * 用户表 - 存储用户基本信息
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"), // 用户头像URL
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  status: mysqlEnum("status", ["active", "disabled"]).default("active").notNull(), // 用户状态
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 日记表 - 存储旅游日记
 */
export const diaries = mysqlTable("diaries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // 关联用户ID
  title: varchar("title", { length: 200 }).notNull(), // 日记标题
  content: text("content").notNull(), // 日记内容（支持富文本）
  summary: varchar("summary", { length: 500 }), // 摘要
  coverImage: text("coverImage"), // 封面图片URL
  
  // 地理位置信息
  locationName: varchar("locationName", { length: 200 }), // 地点名称
  latitude: decimal("latitude", { precision: 10, scale: 7 }), // 纬度
  longitude: decimal("longitude", { precision: 10, scale: 7 }), // 经度
  
  // 天气信息（记录发布时的天气）
  weather: varchar("weather", { length: 50 }), // 天气状况
  temperature: varchar("temperature", { length: 20 }), // 温度
  
  // 状态管理
  status: mysqlEnum("status", ["published", "draft", "hidden"]).default("published").notNull(),
  isDeleted: boolean("isDeleted").default(false).notNull(), // 软删除标记
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Diary = typeof diaries.$inferSelect;
export type InsertDiary = typeof diaries.$inferInsert;

/**
 * 日记图片表 - 存储日记中的图片
 */
export const diaryImages = mysqlTable("diary_images", {
  id: int("id").autoincrement().primaryKey(),
  diaryId: int("diaryId").notNull(), // 关联日记ID
  imageUrl: text("imageUrl").notNull(), // 图片URL
  fileKey: varchar("fileKey", { length: 500 }).notNull(), // S3文件key
  sortOrder: int("sortOrder").default(0).notNull(), // 排序顺序
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DiaryImage = typeof diaryImages.$inferSelect;
export type InsertDiaryImage = typeof diaryImages.$inferInsert;
