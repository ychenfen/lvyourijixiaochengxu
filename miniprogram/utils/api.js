// API 接口封装
const app = getApp();

// 日记相关接口
const diaryApi = {
  // 获取日记列表
  getList(params = {}) {
    return app.request({
      url: '/trpc/diary.list',
      method: 'GET',
      data: params
    });
  },

  // 获取日记详情
  getDetail(id) {
    return app.request({
      url: '/trpc/diary.get',
      method: 'GET',
      data: { id }
    });
  },

  // 创建日记
  create(data) {
    return app.request({
      url: '/trpc/diary.create',
      method: 'POST',
      data
    });
  },

  // 更新日记
  update(id, data) {
    return app.request({
      url: '/trpc/diary.update',
      method: 'POST',
      data: { id, ...data }
    });
  },

  // 删除日记
  delete(id) {
    return app.request({
      url: '/trpc/diary.delete',
      method: 'POST',
      data: { id }
    });
  },

  // 获取用户足迹
  getFootprints() {
    return app.request({
      url: '/trpc/diary.footprints',
      method: 'GET'
    });
  },

  // 获取最新日记
  getRecent(limit = 5) {
    return app.request({
      url: '/trpc/diary.recent',
      method: 'GET',
      data: { limit }
    });
  }
};

// 天气相关接口
const weatherApi = {
  // 获取当前天气
  getCurrent(params) {
    return app.request({
      url: '/trpc/weather.current',
      method: 'GET',
      data: params
    });
  },

  // 获取天气预报
  getForecast(params) {
    return app.request({
      url: '/trpc/weather.forecast',
      method: 'GET',
      data: params
    });
  }
};

// 管理员相关接口
const adminApi = {
  // 获取统计数据
  getStats() {
    return app.request({
      url: '/trpc/admin.stats',
      method: 'GET'
    });
  },

  // 获取用户列表
  getUsers(params = {}) {
    return app.request({
      url: '/trpc/admin.users',
      method: 'GET',
      data: params
    });
  },

  // 切换用户状态
  toggleUserStatus(userId) {
    return app.request({
      url: '/trpc/admin.toggleUserStatus',
      method: 'POST',
      data: { userId }
    });
  },

  // 获取日记审核列表
  getDiaries(params = {}) {
    return app.request({
      url: '/trpc/admin.diaries',
      method: 'GET',
      data: params
    });
  },

  // 更新日记状态
  updateDiaryStatus(diaryId, status) {
    return app.request({
      url: '/trpc/admin.updateDiaryStatus',
      method: 'POST',
      data: { diaryId, status }
    });
  }
};

// 图片上传
const uploadImage = (filePath) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    wx.uploadFile({
      url: `${app.globalData.baseUrl}/upload`,
      filePath,
      name: 'file',
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          if (data.success) {
            resolve(data.data.url);
          } else {
            reject(new Error(data.message || '上传失败'));
          }
        } catch (e) {
          reject(new Error('解析响应失败'));
        }
      },
      fail: reject
    });
  });
};

module.exports = {
  diaryApi,
  weatherApi,
  adminApi,
  uploadImage
};
