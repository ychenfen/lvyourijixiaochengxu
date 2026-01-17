// 首页
const app = getApp();
const { diaryApi, weatherApi } = require('../../utils/api');
const { formatRelativeTime, truncateText, weatherCodeToText, weatherCodeToIcon } = require('../../utils/util');

Page({
  data: {
    weather: null,
    diaries: [],
    loading: true
  },

  onLoad() {
    this.loadWeather();
    this.loadRecentDiaries();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadRecentDiaries();
  },

  onPullDownRefresh() {
    Promise.all([
      this.loadWeather(),
      this.loadRecentDiaries()
    ]).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载天气数据
  async loadWeather() {
    try {
      // 获取当前位置
      const location = app.globalData.location || await this.getLocation();
      
      if (location) {
        // 调用天气API（使用Open-Meteo，免费无需API Key）
        const res = await this.fetchWeatherFromOpenMeteo(location.latitude, location.longitude);
        this.setData({ weather: res });
      }
    } catch (err) {
      console.error('获取天气失败:', err);
      // 使用默认天气数据
      this.setData({
        weather: {
          temperature: '--',
          description: '获取中...',
          icon: '🌤️',
          humidity: '--',
          windSpeed: '--',
          city: '未知位置'
        }
      });
    }
  },

  // 从Open-Meteo获取天气
  fetchWeatherFromOpenMeteo(latitude, longitude) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://api.open-meteo.com/v1/forecast`,
        data: {
          latitude,
          longitude,
          current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
          timezone: 'Asia/Shanghai'
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.current) {
            const current = res.data.current;
            resolve({
              temperature: Math.round(current.temperature_2m),
              description: weatherCodeToText(current.weather_code),
              icon: weatherCodeToIcon(current.weather_code),
              humidity: current.relative_humidity_2m,
              windSpeed: current.wind_speed_10m,
              city: '当前位置'
            });
          } else {
            reject(new Error('天气数据获取失败'));
          }
        },
        fail: reject
      });
    });
  },

  // 获取位置
  getLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          const location = {
            latitude: res.latitude,
            longitude: res.longitude
          };
          app.globalData.location = location;
          resolve(location);
        },
        fail: (err) => {
          console.error('获取位置失败:', err);
          // 使用默认位置（北京）
          resolve({ latitude: 39.9042, longitude: 116.4074 });
        }
      });
    });
  },

  // 加载最新日记
  async loadRecentDiaries() {
    try {
      // 模拟数据，实际应调用API
      const mockDiaries = [
        {
          id: 1,
          title: '杭州西湖之旅',
          content: '今天去了西湖，风景真的很美。断桥残雪、雷峰塔、三潭印月，每一处都让人流连忘返...',
          coverImage: '',
          locationName: '杭州西湖',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 2,
          title: '三亚海边度假',
          content: '阳光、沙滩、海浪，三亚的海真的太美了！在亚龙湾玩了一整天...',
          coverImage: '',
          locationName: '三亚亚龙湾',
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ];

      const diaries = mockDiaries.map(diary => ({
        ...diary,
        summary: truncateText(diary.content, 50),
        createTimeText: formatRelativeTime(diary.createdAt)
      }));

      this.setData({ diaries, loading: false });
    } catch (err) {
      console.error('获取日记失败:', err);
      this.setData({ loading: false });
    }
  },

  // 跳转到写日记
  goToDiaryEdit() {
    wx.navigateTo({
      url: '/pages/diary-edit/diary-edit'
    });
  },

  // 跳转到足迹地图
  goToFootprints() {
    wx.switchTab({
      url: '/pages/footprints/footprints'
    });
  },

  // 跳转到天气查询
  goToWeather() {
    wx.navigateTo({
      url: '/pages/weather/weather'
    });
  },

  // 跳转到附近推荐
  goToNearby() {
    wx.navigateTo({
      url: '/pages/nearby/nearby'
    });
  },

  // 跳转到日记列表
  goToDiaryList() {
    wx.switchTab({
      url: '/pages/diary-list/diary-list'
    });
  },

  // 跳转到日记详情
  goToDiaryDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/diary-detail/diary-detail?id=${id}`
    });
  }
});
