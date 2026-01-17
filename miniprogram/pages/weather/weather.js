// 天气查询页
const app = getApp();
const { weatherCodeToText, weatherCodeToIcon, showLoading, hideLoading } = require('../../utils/util');

// 热门城市
const HOT_CITIES = [
  { name: '北京', latitude: 39.9042, longitude: 116.4074 },
  { name: '上海', latitude: 31.2304, longitude: 121.4737 },
  { name: '广州', latitude: 23.1291, longitude: 113.2644 },
  { name: '深圳', latitude: 22.5431, longitude: 114.0579 },
  { name: '杭州', latitude: 30.2741, longitude: 120.1551 },
  { name: '三亚', latitude: 18.2528, longitude: 109.5119 },
  { name: '成都', latitude: 30.5728, longitude: 104.0668 },
  { name: '西安', latitude: 34.3416, longitude: 108.9398 }
];

// 星期映射
const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

Page({
  data: {
    currentCity: '北京',
    currentLocation: { latitude: 39.9042, longitude: 116.4074 },
    hotCities: HOT_CITIES,
    weather: null,
    forecast: [],
    tips: {
      clothing: '温度适宜，建议穿着轻便舒适的衣物',
      umbrella: '天气晴好，无需携带雨具',
      sport: '适宜户外运动，注意防晒'
    }
  },

  onLoad() {
    this.getCurrentLocation();
  },

  // 获取当前位置
  getCurrentLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          currentCity: '当前位置',
          currentLocation: {
            latitude: res.latitude,
            longitude: res.longitude
          }
        });
        this.loadWeather(res.latitude, res.longitude);
      },
      fail: () => {
        // 使用默认城市
        this.loadWeather(39.9042, 116.4074);
      }
    });
  },

  // 选择城市
  selectCity(e) {
    const city = e.currentTarget.dataset.city;
    this.setData({
      currentCity: city.name,
      currentLocation: {
        latitude: city.latitude,
        longitude: city.longitude
      }
    });
    this.loadWeather(city.latitude, city.longitude);
  },

  // 选择其他城市
  chooseCity() {
    // 可以跳转到城市选择页面
    wx.showActionSheet({
      itemList: HOT_CITIES.map(c => c.name),
      success: (res) => {
        const city = HOT_CITIES[res.tapIndex];
        this.selectCity({ currentTarget: { dataset: { city } } });
      }
    });
  },

  // 加载天气数据
  async loadWeather(latitude, longitude) {
    showLoading('获取天气中');
    try {
      const data = await this.fetchWeatherFromOpenMeteo(latitude, longitude);
      this.setData({
        weather: data.current,
        forecast: data.forecast,
        tips: this.generateTips(data.current)
      });
    } catch (err) {
      console.error('获取天气失败:', err);
      wx.showToast({
        title: '获取天气失败',
        icon: 'none'
      });
    } finally {
      hideLoading();
    }
  },

  // 从Open-Meteo获取天气
  fetchWeatherFromOpenMeteo(latitude, longitude) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://api.open-meteo.com/v1/forecast',
        data: {
          latitude,
          longitude,
          current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure',
          daily: 'weather_code,temperature_2m_max,temperature_2m_min',
          timezone: 'Asia/Shanghai',
          forecast_days: 7
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data) {
            const { current, daily } = res.data;
            
            // 当前天气
            const currentWeather = {
              temperature: Math.round(current.temperature_2m),
              feelsLike: Math.round(current.apparent_temperature),
              humidity: current.relative_humidity_2m,
              windSpeed: current.wind_speed_10m,
              pressure: Math.round(current.surface_pressure),
              description: weatherCodeToText(current.weather_code),
              icon: weatherCodeToIcon(current.weather_code)
            };

            // 7天预报
            const forecast = daily.time.map((date, index) => {
              const d = new Date(date);
              const isToday = index === 0;
              return {
                date,
                dayText: isToday ? '今天' : WEEKDAYS[d.getDay()],
                dateText: `${d.getMonth() + 1}/${d.getDate()}`,
                tempMax: Math.round(daily.temperature_2m_max[index]),
                tempMin: Math.round(daily.temperature_2m_min[index]),
                description: weatherCodeToText(daily.weather_code[index]),
                icon: weatherCodeToIcon(daily.weather_code[index])
              };
            });

            resolve({
              current: currentWeather,
              forecast
            });
          } else {
            reject(new Error('获取天气数据失败'));
          }
        },
        fail: reject
      });
    });
  },

  // 生成旅行建议
  generateTips(weather) {
    const temp = weather.temperature;
    const humidity = weather.humidity;
    const desc = weather.description;

    // 穿衣建议
    let clothing = '';
    if (temp < 5) {
      clothing = '天气寒冷，建议穿羽绒服、厚外套，注意保暖';
    } else if (temp < 15) {
      clothing = '天气较凉，建议穿外套、毛衣等保暖衣物';
    } else if (temp < 25) {
      clothing = '温度适宜，建议穿长袖衬衫、薄外套';
    } else if (temp < 30) {
      clothing = '天气温暖，建议穿短袖、薄裤等轻便衣物';
    } else {
      clothing = '天气炎热，建议穿短袖短裤，注意防暑降温';
    }

    // 雨伞建议
    let umbrella = '';
    if (desc.includes('雨') || desc.includes('雷')) {
      umbrella = '有降雨，建议携带雨具出行';
    } else if (desc.includes('阴') || desc.includes('云')) {
      umbrella = '天气多云，可备一把伞以防万一';
    } else {
      umbrella = '天气晴好，无需携带雨具';
    }

    // 运动建议
    let sport = '';
    if (desc.includes('雨') || desc.includes('雷') || desc.includes('雪')) {
      sport = '天气不佳，建议室内活动';
    } else if (temp < 5 || temp > 35) {
      sport = '温度较极端，建议减少户外活动';
    } else if (humidity > 80) {
      sport = '湿度较高，户外活动注意补水';
    } else {
      sport = '适宜户外运动，享受美好天气';
    }

    return { clothing, umbrella, sport };
  }
});
