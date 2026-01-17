import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import axios from "axios";

// 管理员权限检查
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: '需要管理员权限' });
  }
  return next({ ctx });
});

// 天气代码转中文描述
function getWeatherDescription(code: number): string {
  const weatherMap: Record<number, string> = {
    0: '晴朗',
    1: '大部晴朗',
    2: '局部多云',
    3: '多云',
    45: '雾',
    48: '雾凇',
    51: '小毛毛雨',
    53: '毛毛雨',
    55: '大毛毛雨',
    56: '冻毛毛雨',
    57: '大冻毛毛雨',
    61: '小雨',
    63: '中雨',
    65: '大雨',
    66: '小冻雨',
    67: '大冻雨',
    71: '小雪',
    73: '中雪',
    75: '大雪',
    77: '雪粒',
    80: '小阵雨',
    81: '中阵雨',
    82: '大阵雨',
    85: '小阵雪',
    86: '大阵雪',
    95: '雷暴',
    96: '雷暴伴小冰雹',
    99: '雷暴伴大冰雹',
  };
  return weatherMap[code] || '未知';
}

// 城市坐标映射（常用城市）
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  '北京': { lat: 39.9042, lng: 116.4074 },
  '上海': { lat: 31.2304, lng: 121.4737 },
  '广州': { lat: 23.1291, lng: 113.2644 },
  '深圳': { lat: 22.5431, lng: 114.0579 },
  '杭州': { lat: 30.2741, lng: 120.1551 },
  '成都': { lat: 30.5728, lng: 104.0668 },
  '西安': { lat: 34.3416, lng: 108.9398 },
  '重庆': { lat: 29.4316, lng: 106.9123 },
  '南京': { lat: 32.0603, lng: 118.7969 },
  '武汉': { lat: 30.5928, lng: 114.3055 },
  '天津': { lat: 39.3434, lng: 117.3616 },
  '苏州': { lat: 31.2990, lng: 120.5853 },
  '厦门': { lat: 24.4798, lng: 118.0894 },
  '青岛': { lat: 36.0671, lng: 120.3826 },
  '大连': { lat: 38.9140, lng: 121.6147 },
  '三亚': { lat: 18.2528, lng: 109.5119 },
  '丽江': { lat: 26.8721, lng: 100.2299 },
  '桂林': { lat: 25.2736, lng: 110.2907 },
  '拉萨': { lat: 29.6500, lng: 91.1000 },
  '香港': { lat: 22.3193, lng: 114.1694 },
};

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // 日记相关接口
  diary: router({
    // 创建日记
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(200),
        content: z.string().min(1),
        summary: z.string().max(500).optional(),
        coverImage: z.string().optional(),
        locationName: z.string().max(200).optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        weather: z.string().max(50).optional(),
        temperature: z.string().max(20).optional(),
        images: z.array(z.object({
          imageUrl: z.string(),
          fileKey: z.string(),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { images, ...diaryData } = input;
        
        // 生成摘要
        const summary = input.summary || input.content.substring(0, 200);
        
        const diaryId = await db.createDiary({
          ...diaryData,
          summary,
          latitude: input.latitude?.toString(),
          longitude: input.longitude?.toString(),
          userId: ctx.user.id,
        });
        
        // 保存图片
        if (images && images.length > 0) {
          await db.addDiaryImages(images.map((img, index) => ({
            diaryId,
            imageUrl: img.imageUrl,
            fileKey: img.fileKey,
            sortOrder: index,
          })));
        }
        
        return { id: diaryId };
      }),
    
    // 更新日记
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(200).optional(),
        content: z.string().min(1).optional(),
        summary: z.string().max(500).optional(),
        coverImage: z.string().optional(),
        locationName: z.string().max(200).optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        weather: z.string().max(50).optional(),
        temperature: z.string().max(20).optional(),
        images: z.array(z.object({
          imageUrl: z.string(),
          fileKey: z.string(),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, images, ...updateData } = input;
        
        // 检查日记是否存在且属于当前用户
        const diary = await db.getDiaryById(id);
        if (!diary || diary.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: '日记不存在' });
        }
        
        await db.updateDiary(id, ctx.user.id, {
          ...updateData,
          latitude: input.latitude?.toString(),
          longitude: input.longitude?.toString(),
        });
        
        // 更新图片
        if (images !== undefined) {
          await db.deleteDiaryImages(id);
          if (images.length > 0) {
            await db.addDiaryImages(images.map((img, index) => ({
              diaryId: id,
              imageUrl: img.imageUrl,
              fileKey: img.fileKey,
              sortOrder: index,
            })));
          }
        }
        
        return { success: true };
      }),
    
    // 删除日记
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const diary = await db.getDiaryById(input.id);
        if (!diary || diary.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: '日记不存在' });
        }
        
        await db.deleteDiary(input.id, ctx.user.id);
        return { success: true };
      }),
    
    // 获取日记详情
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const diary = await db.getDiaryWithImages(input.id);
        if (!diary || diary.status === 'hidden') {
          throw new TRPCError({ code: 'NOT_FOUND', message: '日记不存在' });
        }
        
        // 获取作者信息
        const author = await db.getUserById(diary.userId);
        
        return { ...diary, author };
      }),
    
    // 获取用户日记列表
    list: protectedProcedure
      .input(z.object({
        page: z.number().default(1),
        pageSize: z.number().default(10),
      }))
      .query(async ({ ctx, input }) => {
        return db.getUserDiaries(ctx.user.id, input.page, input.pageSize);
      }),
    
    // 获取用户足迹
    footprints: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserFootprints(ctx.user.id);
    }),

    // 获取最新公开日记（首页展示）
    recent: publicProcedure
      .input(z.object({
        limit: z.number().default(6),
      }))
      .query(async ({ input }) => {
        return db.getRecentDiaries(input.limit);
      }),
  }),

  // 图片上传
  upload: router({
    image: protectedProcedure
      .input(z.object({
        base64: z.string(),
        filename: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.base64, 'base64');
        const ext = input.filename.split('.').pop() || 'jpg';
        const fileKey = `diaries/${ctx.user.id}/${nanoid()}.${ext}`;
        
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        return { url, fileKey };
      }),
  }),

  // 天气接口 - 使用Open-Meteo免费API
  weather: router({
    current: publicProcedure
      .input(z.object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        city: z.string().optional(),
      }))
      .query(async ({ input }) => {
        let lat = input.latitude || 39.9042;
        let lng = input.longitude || 116.4074;
        let cityName = input.city || '北京';
        
        // 如果提供了城市名，查找对应坐标
        if (input.city && cityCoordinates[input.city]) {
          const coords = cityCoordinates[input.city];
          lat = coords.lat;
          lng = coords.lng;
          cityName = input.city;
        }
        
        try {
          // 调用Open-Meteo API获取真实天气数据
          const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
            params: {
              latitude: lat,
              longitude: lng,
              current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature',
              timezone: 'Asia/Shanghai',
            },
            timeout: 10000,
          });
          
          const current = response.data.current;
          const weatherCode = current.weather_code;
          
          return {
            city: cityName,
            weather: getWeatherDescription(weatherCode),
            weatherCode,
            temperature: `${Math.round(current.temperature_2m)}°C`,
            feelsLike: `${Math.round(current.apparent_temperature)}°C`,
            humidity: `${current.relative_humidity_2m}%`,
            wind: `${Math.round(current.wind_speed_10m)} km/h`,
            updateTime: current.time,
            latitude: lat,
            longitude: lng,
          };
        } catch (error) {
          console.error('Weather API error:', error);
          // 如果API调用失败，返回默认数据
          return {
            city: cityName,
            weather: '数据获取中',
            weatherCode: 0,
            temperature: '--°C',
            feelsLike: '--°C',
            humidity: '--%',
            wind: '-- km/h',
            updateTime: new Date().toISOString(),
            latitude: lat,
            longitude: lng,
          };
        }
      }),

    // 获取天气预报（7天）
    forecast: publicProcedure
      .input(z.object({
        latitude: z.number(),
        longitude: z.number(),
      }))
      .query(async ({ input }) => {
        try {
          const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
            params: {
              latitude: input.latitude,
              longitude: input.longitude,
              daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
              timezone: 'Asia/Shanghai',
              forecast_days: 7,
            },
            timeout: 10000,
          });
          
          const daily = response.data.daily;
          const forecasts = daily.time.map((date: string, index: number) => ({
            date,
            weather: getWeatherDescription(daily.weather_code[index]),
            weatherCode: daily.weather_code[index],
            tempMax: `${Math.round(daily.temperature_2m_max[index])}°C`,
            tempMin: `${Math.round(daily.temperature_2m_min[index])}°C`,
            precipitationProbability: `${daily.precipitation_probability_max[index]}%`,
          }));
          
          return { forecasts };
        } catch (error) {
          console.error('Forecast API error:', error);
          return { forecasts: [] };
        }
      }),
  }),

  // 附近推荐 - 使用Google Maps Places API（通过内置代理）
  nearby: router({
    places: publicProcedure
      .input(z.object({
        latitude: z.number(),
        longitude: z.number(),
        category: z.enum(['restaurant', 'hotel', 'attraction', 'all']).default('all'),
        page: z.number().default(1),
        pageSize: z.number().default(10),
      }))
      .query(async ({ input }) => {
        // 根据分类获取对应的Google Places类型
        const categoryToTypes: Record<string, string[]> = {
          restaurant: ['restaurant', 'cafe', 'bakery', 'bar'],
          hotel: ['lodging', 'hotel'],
          attraction: ['tourist_attraction', 'museum', 'park', 'amusement_park'],
          all: ['restaurant', 'lodging', 'tourist_attraction'],
        };
        
        const types = categoryToTypes[input.category] || categoryToTypes.all;
        
        // 使用模拟数据（因为Google Places API需要通过前端Map组件调用）
        // 这里提供基于位置的模拟数据，前端可以使用Map组件获取真实数据
        const mockPlaces = generateNearbyPlaces(input.latitude, input.longitude, input.category);
        
        return {
          places: mockPlaces.slice((input.page - 1) * input.pageSize, input.page * input.pageSize),
          total: mockPlaces.length,
          searchTypes: types,
        };
      }),
  }),

  // 地理编码 - 城市名转坐标
  geocode: router({
    search: publicProcedure
      .input(z.object({
        query: z.string(),
      }))
      .query(async ({ input }) => {
        // 先从本地城市库查找
        const normalizedQuery = input.query.trim();
        if (cityCoordinates[normalizedQuery]) {
          const coords = cityCoordinates[normalizedQuery];
          return {
            results: [{
              name: normalizedQuery,
              latitude: coords.lat,
              longitude: coords.lng,
              country: '中国',
            }],
          };
        }
        
        // 使用Open-Meteo Geocoding API
        try {
          const response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
            params: {
              name: normalizedQuery,
              count: 5,
              language: 'zh',
            },
            timeout: 10000,
          });
          
          if (response.data.results) {
            return {
              results: response.data.results.map((r: any) => ({
                name: r.name,
                latitude: r.latitude,
                longitude: r.longitude,
                country: r.country,
                admin1: r.admin1,
              })),
            };
          }
          
          return { results: [] };
        } catch (error) {
          console.error('Geocoding API error:', error);
          return { results: [] };
        }
      }),
  }),

  // 管理员接口
  admin: router({
    // 获取统计数据
    statistics: adminProcedure.query(async () => {
      return db.getStatistics();
    }),
    
    // 用户管理
    users: router({
      list: adminProcedure
        .input(z.object({
          page: z.number().default(1),
          pageSize: z.number().default(20),
          search: z.string().optional(),
        }))
        .query(async ({ input }) => {
          return db.getAllUsers(input.page, input.pageSize, input.search);
        }),
      
      updateStatus: adminProcedure
        .input(z.object({
          userId: z.number(),
          status: z.enum(['active', 'disabled']),
        }))
        .mutation(async ({ input }) => {
          await db.updateUserStatus(input.userId, input.status);
          return { success: true };
        }),
    }),
    
    // 内容管理
    diaries: router({
      list: adminProcedure
        .input(z.object({
          page: z.number().default(1),
          pageSize: z.number().default(20),
          status: z.string().optional(),
          search: z.string().optional(),
        }))
        .query(async ({ input }) => {
          return db.getAllDiaries(input.page, input.pageSize, input.status, input.search);
        }),
      
      updateStatus: adminProcedure
        .input(z.object({
          id: z.number(),
          status: z.enum(['published', 'hidden']),
        }))
        .mutation(async ({ input }) => {
          await db.updateDiaryStatus(input.id, input.status);
          return { success: true };
        }),
      
      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.adminDeleteDiary(input.id);
          return { success: true };
        }),
    }),
  }),
});

// 生成基于位置的模拟附近商户数据
function generateNearbyPlaces(lat: number, lng: number, category: string) {
  const restaurantNames = [
    '老北京涮羊肉', '川味小馆', '粤式茶餐厅', '日式料理', '意大利餐厅',
    '海底捞火锅', '西贝莜面村', '外婆家', '绿茶餐厅', '小龙坎火锅',
  ];
  const hotelNames = [
    '如家酒店', '汉庭酒店', '全季酒店', '亚朵酒店', '希尔顿酒店',
    '万豪酒店', '洲际酒店', '香格里拉', '喜来登酒店', '凯悦酒店',
  ];
  const attractionNames = [
    '城市公园', '历史博物馆', '艺术中心', '古城遗址', '自然保护区',
    '主题乐园', '动物园', '植物园', '科技馆', '文化广场',
  ];
  
  const places: any[] = [];
  let id = 1;
  
  const addPlaces = (names: string[], cat: string) => {
    names.forEach((name, index) => {
      const distance = Math.floor(Math.random() * 3000) + 200;
      places.push({
        id: id++,
        name,
        category: cat,
        rating: (4 + Math.random()).toFixed(1),
        distance: distance < 1000 ? `${distance}m` : `${(distance / 1000).toFixed(1)}km`,
        address: `${['中山路', '解放路', '人民路', '建设路', '文化路'][Math.floor(Math.random() * 5)]}${Math.floor(Math.random() * 200) + 1}号`,
        phone: `${['010', '021', '020', '0571', '028'][Math.floor(Math.random() * 5)]}-${Math.floor(Math.random() * 90000000) + 10000000}`,
        latitude: lat + (Math.random() - 0.5) * 0.02,
        longitude: lng + (Math.random() - 0.5) * 0.02,
      });
    });
  };
  
  if (category === 'all' || category === 'restaurant') {
    addPlaces(restaurantNames, 'restaurant');
  }
  if (category === 'all' || category === 'hotel') {
    addPlaces(hotelNames, 'hotel');
  }
  if (category === 'all' || category === 'attraction') {
    addPlaces(attractionNames, 'attraction');
  }
  
  // 按距离排序
  return places.sort((a, b) => {
    const distA = parseFloat(a.distance);
    const distB = parseFloat(b.distance);
    return distA - distB;
  });
}

export type AppRouter = typeof appRouter;
