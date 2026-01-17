import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1, role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    loginMethod: "manus",
    role,
    status: "active",
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("diary procedures", () => {
  it("diary.list requires authentication", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.diary.list({ page: 1, pageSize: 10 })).rejects.toThrow();
  });

  it("diary.footprints requires authentication", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.diary.footprints()).rejects.toThrow();
  });

  it("diary.create requires authentication", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.diary.create({
        title: "测试日记",
        content: "测试内容",
      })
    ).rejects.toThrow();
  });

  it("diary.get is public", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    // Should not throw for authentication, but may throw for not found
    await expect(caller.diary.get({ id: 999999 })).rejects.toThrow("日记不存在");
  });
});

describe("weather procedures", () => {
  it("weather.current is public and returns data", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.weather.current({});

    expect(result).toHaveProperty("city");
    expect(result).toHaveProperty("weather");
    expect(result).toHaveProperty("temperature");
    expect(result).toHaveProperty("humidity");
    expect(result).toHaveProperty("wind");
  });

  it("weather.current accepts city parameter", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.weather.current({ city: "北京" });

    expect(result.city).toBe("北京");
  });
});

describe("nearby procedures", () => {
  it("nearby.places is public and returns places", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.nearby.places({
      latitude: 39.9042,
      longitude: 116.4074,
      category: "all",
    });

    expect(result).toHaveProperty("places");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.places)).toBe(true);
  });

  it("nearby.places filters by category", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.nearby.places({
      latitude: 39.9042,
      longitude: 116.4074,
      category: "restaurant",
    });

    expect(result.places.every((p) => p.category === "restaurant")).toBe(true);
  });
});

describe("admin procedures", () => {
  it("admin.statistics requires admin role", async () => {
    const userCtx = createAuthContext(1, "user");
    const userCaller = appRouter.createCaller(userCtx);

    await expect(userCaller.admin.statistics()).rejects.toThrow("需要管理员权限");
  });

  it("admin.users.list requires admin role", async () => {
    const userCtx = createAuthContext(1, "user");
    const userCaller = appRouter.createCaller(userCtx);

    await expect(userCaller.admin.users.list({ page: 1, pageSize: 20 })).rejects.toThrow(
      "需要管理员权限"
    );
  });

  it("admin.diaries.list requires admin role", async () => {
    const userCtx = createAuthContext(1, "user");
    const userCaller = appRouter.createCaller(userCtx);

    await expect(userCaller.admin.diaries.list({ page: 1, pageSize: 20 })).rejects.toThrow(
      "需要管理员权限"
    );
  });
});

describe("upload procedures", () => {
  it("upload.image requires authentication", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.upload.image({
        base64: "dGVzdA==",
        filename: "test.jpg",
        mimeType: "image/jpeg",
      })
    ).rejects.toThrow();
  });
});
