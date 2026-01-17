# API集成笔记

## Open-Meteo 天气API

免费天气API，无需API Key，支持全球天气数据。

### API端点
```
https://api.open-meteo.com/v1/forecast
```

### 参数
- latitude: 纬度
- longitude: 经度
- current: 当前天气变量 (temperature_2m, relative_humidity_2m, weather_code, wind_speed_10m等)
- hourly: 每小时预报变量
- daily: 每日预报变量
- timezone: 时区

### 示例请求
```
https://api.open-meteo.com/v1/forecast?latitude=39.9&longitude=116.4&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia/Shanghai
```

### Weather Code 天气代码对照
- 0: 晴朗
- 1, 2, 3: 多云
- 45, 48: 雾
- 51, 53, 55: 毛毛雨
- 61, 63, 65: 雨
- 71, 73, 75: 雪
- 80, 81, 82: 阵雨
- 95: 雷暴
- 96, 99: 冰雹雷暴

## Google Maps Places API

使用项目内置的Map组件，通过Manus代理访问Google Maps服务。

### 可用服务
- Places API: 搜索附近地点
- Geocoding: 地址转坐标
- Directions: 路线规划
