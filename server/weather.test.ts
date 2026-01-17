import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock axios
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

import axios from "axios";

function createPublicContext(): TrpcContext {
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

describe("weather.current", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns weather data for a city from Open-Meteo API", async () => {
    const mockWeatherResponse = {
      data: {
        current: {
          temperature_2m: 15.5,
          relative_humidity_2m: 65,
          weather_code: 3,
          wind_speed_10m: 12.3,
          apparent_temperature: 13.2,
          time: "2024-01-17T10:00",
        },
      },
    };

    (axios.get as any).mockResolvedValueOnce(mockWeatherResponse);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.weather.current({ city: "北京" });

    expect(result).toMatchObject({
      city: "北京",
      weather: "多云",
      temperature: "16°C",
      humidity: "65%",
    });

    expect(axios.get).toHaveBeenCalledWith(
      "https://api.open-meteo.com/v1/forecast",
      expect.objectContaining({
        params: expect.objectContaining({
          latitude: 39.9042,
          longitude: 116.4074,
        }),
      })
    );
  });

  it("returns default data when API fails", async () => {
    (axios.get as any).mockRejectedValueOnce(new Error("API Error"));

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.weather.current({ city: "北京" });

    expect(result).toMatchObject({
      city: "北京",
      weather: "数据获取中",
      temperature: "--°C",
    });
  });

  it("uses coordinates when provided", async () => {
    const mockWeatherResponse = {
      data: {
        current: {
          temperature_2m: 20,
          relative_humidity_2m: 50,
          weather_code: 0,
          wind_speed_10m: 5,
          apparent_temperature: 19,
          time: "2024-01-17T10:00",
        },
      },
    };

    (axios.get as any).mockResolvedValueOnce(mockWeatherResponse);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.weather.current({ 
      latitude: 31.2304, 
      longitude: 121.4737 
    });

    expect(axios.get).toHaveBeenCalledWith(
      "https://api.open-meteo.com/v1/forecast",
      expect.objectContaining({
        params: expect.objectContaining({
          latitude: 31.2304,
          longitude: 121.4737,
        }),
      })
    );
  });
});

describe("weather.forecast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 7-day forecast data", async () => {
    const mockForecastResponse = {
      data: {
        daily: {
          time: ["2024-01-17", "2024-01-18", "2024-01-19"],
          weather_code: [0, 3, 61],
          temperature_2m_max: [10, 12, 8],
          temperature_2m_min: [2, 4, 1],
          precipitation_probability_max: [0, 20, 80],
        },
      },
    };

    (axios.get as any).mockResolvedValueOnce(mockForecastResponse);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.weather.forecast({
      latitude: 39.9042,
      longitude: 116.4074,
    });

    expect(result.forecasts).toHaveLength(3);
    expect(result.forecasts[0]).toMatchObject({
      date: "2024-01-17",
      weather: "晴朗",
      tempMax: "10°C",
      tempMin: "2°C",
    });
    expect(result.forecasts[2]).toMatchObject({
      weather: "小雨",
    });
  });

  it("returns empty array when API fails", async () => {
    (axios.get as any).mockRejectedValueOnce(new Error("API Error"));

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.weather.forecast({
      latitude: 39.9042,
      longitude: 116.4074,
    });

    expect(result.forecasts).toEqual([]);
  });
});

describe("geocode.search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns coordinates for known Chinese cities", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.geocode.search({ query: "上海" });

    expect(result.results).toHaveLength(1);
    expect(result.results[0]).toMatchObject({
      name: "上海",
      latitude: 31.2304,
      longitude: 121.4737,
      country: "中国",
    });
  });

  it("uses Open-Meteo Geocoding API for unknown cities", async () => {
    const mockGeoResponse = {
      data: {
        results: [
          {
            name: "东京",
            latitude: 35.6762,
            longitude: 139.6503,
            country: "日本",
            admin1: "东京都",
          },
        ],
      },
    };

    (axios.get as any).mockResolvedValueOnce(mockGeoResponse);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.geocode.search({ query: "东京" });

    expect(result.results).toHaveLength(1);
    expect(result.results[0]).toMatchObject({
      name: "东京",
      country: "日本",
    });

    expect(axios.get).toHaveBeenCalledWith(
      "https://geocoding-api.open-meteo.com/v1/search",
      expect.objectContaining({
        params: expect.objectContaining({
          name: "东京",
        }),
      })
    );
  });
});
