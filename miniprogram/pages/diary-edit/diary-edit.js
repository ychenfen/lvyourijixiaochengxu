// 日记编辑页
const app = getApp();
const { diaryApi, uploadImage } = require('../../utils/api');
const { showToast, showLoading, hideLoading, chooseImage, chooseLocation, getLocation, weatherCodeToText, weatherCodeToIcon } = require('../../utils/util');

Page({
  data: {
    diaryId: null,
    isEdit: false,
    title: '',
    content: '',
    images: [],
    location: null,
    weather: null,
    saving: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ diaryId: options.id, isEdit: true });
      this.loadDiary(options.id);
      wx.setNavigationBarTitle({ title: '编辑日记' });
    } else {
      wx.setNavigationBarTitle({ title: '写日记' });
      this.loadWeather();
    }
  },

  // 加载日记（编辑模式）
  async loadDiary(id) {
    showLoading('加载中');
    try {
      // 模拟数据，实际应调用API
      const diary = {
        id: parseInt(id),
        title: '杭州西湖之旅',
        content: '今天去了西湖，风景真的很美。',
        images: [],
        location: {
          name: '杭州西湖',
          latitude: 30.2590,
          longitude: 120.1388
        },
        weather: {
          icon: '☀️',
          description: '晴',
          temperature: 25
        }
      };

      this.setData({
        title: diary.title,
        content: diary.content,
        images: diary.images || [],
        location: diary.location,
        weather: diary.weather
      });
    } catch (err) {
      console.error('加载日记失败:', err);
      showToast('加载失败');
    } finally {
      hideLoading();
    }
  },

  // 加载天气
  async loadWeather() {
    try {
      const location = app.globalData.location || await getLocation();
      if (location) {
        const weather = await this.fetchWeather(location.latitude, location.longitude);
        this.setData({ weather });
      }
    } catch (err) {
      console.error('获取天气失败:', err);
    }
  },

  // 获取天气
  fetchWeather(latitude, longitude) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://api.open-meteo.com/v1/forecast',
        data: {
          latitude,
          longitude,
          current: 'temperature_2m,weather_code',
          timezone: 'Asia/Shanghai'
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.current) {
            const current = res.data.current;
            resolve({
              icon: weatherCodeToIcon(current.weather_code),
              description: weatherCodeToText(current.weather_code),
              temperature: Math.round(current.temperature_2m)
            });
          } else {
            reject(new Error('获取天气失败'));
          }
        },
        fail: reject
      });
    });
  },

  // 标题输入
  onTitleInput(e) {
    this.setData({ title: e.detail.value });
  },

  // 内容输入
  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  // 选择图片
  async chooseImage() {
    try {
      const count = 9 - this.data.images.length;
      const tempFiles = await chooseImage(count);
      this.setData({
        images: [...this.data.images, ...tempFiles]
      });
    } catch (err) {
      console.error('选择图片失败:', err);
    }
  },

  // 预览图片
  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.images[index],
      urls: this.data.images
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = [...this.data.images];
    images.splice(index, 1);
    this.setData({ images });
  },

  // 选择位置
  async chooseLocation() {
    try {
      const location = await chooseLocation();
      this.setData({ location });
      // 更新天气
      if (location.latitude && location.longitude) {
        const weather = await this.fetchWeather(location.latitude, location.longitude);
        this.setData({ weather });
      }
    } catch (err) {
      console.error('选择位置失败:', err);
    }
  },

  // 保存日记
  async saveDiary() {
    // 验证
    if (!this.data.title.trim()) {
      showToast('请输入标题');
      return;
    }
    if (!this.data.content.trim()) {
      showToast('请输入内容');
      return;
    }

    this.setData({ saving: true });
    showLoading('保存中');

    try {
      // 上传图片
      const imageUrls = [];
      for (const image of this.data.images) {
        if (image.startsWith('http')) {
          imageUrls.push(image);
        } else {
          // 上传本地图片
          // const url = await uploadImage(image);
          // imageUrls.push(url);
          imageUrls.push(image); // 模拟
        }
      }

      // 构建数据
      const diaryData = {
        title: this.data.title.trim(),
        content: this.data.content.trim(),
        images: imageUrls,
        locationName: this.data.location?.name || '',
        latitude: this.data.location?.latitude || null,
        longitude: this.data.location?.longitude || null,
        weather: this.data.weather?.description || '',
        temperature: this.data.weather?.temperature ? `${this.data.weather.temperature}°C` : ''
      };

      // 保存
      if (this.data.isEdit) {
        // await diaryApi.update(this.data.diaryId, diaryData);
        showToast('修改成功');
      } else {
        // await diaryApi.create(diaryData);
        showToast('发布成功');
      }

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      console.error('保存失败:', err);
      showToast('保存失败');
    } finally {
      this.setData({ saving: false });
      hideLoading();
    }
  }
});
