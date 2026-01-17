// 个人中心页
const app = getApp();
const { showToast, showConfirm } = require('../../utils/util');

Page({
  data: {
    userInfo: null,
    isAdmin: false,
    stats: {
      diaryCount: 0,
      footprintCount: 0,
      cityCount: 0
    }
  },

  onLoad() {
    this.loadUserInfo();
    this.loadStats();
  },

  onShow() {
    this.loadStats();
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = app.globalData.userInfo;
    if (userInfo) {
      this.setData({
        userInfo,
        isAdmin: userInfo.role === 'admin'
      });
    }
  },

  // 加载统计数据
  loadStats() {
    // 模拟数据，实际应调用API
    this.setData({
      stats: {
        diaryCount: 12,
        footprintCount: 8,
        cityCount: 5
      }
    });
  },

  // 登录
  login() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const userInfo = res.userInfo;
        app.globalData.userInfo = userInfo;
        this.setData({ userInfo });
        showToast('登录成功');
      },
      fail: () => {
        showToast('登录取消');
      }
    });
  },

  // 跳转到日记列表
  goToDiaryList() {
    wx.switchTab({
      url: '/pages/diary-list/diary-list'
    });
  },

  // 跳转到足迹
  goToFootprints() {
    wx.switchTab({
      url: '/pages/footprints/footprints'
    });
  },

  // 跳转到天气
  goToWeather() {
    wx.navigateTo({
      url: '/pages/weather/weather'
    });
  },

  // 跳转到附近
  goToNearby() {
    wx.navigateTo({
      url: '/pages/nearby/nearby'
    });
  },

  // 跳转到管理后台
  goToAdmin() {
    wx.navigateTo({
      url: '/pages/admin/admin'
    });
  },

  // 关于我们
  showAbout() {
    wx.showModal({
      title: '关于旅游日记',
      content: '旅游日记是一款帮助您记录旅行足迹、分享旅途故事的小程序。\n\n版本：1.0.0\n开发者：旅游日记团队',
      showCancel: false
    });
  },

  // 意见反馈
  feedback() {
    wx.openSetting({
      success: () => {
        showToast('感谢您的反馈');
      }
    });
  },

  // 清除缓存
  async clearCache() {
    const confirmed = await showConfirm('确定要清除缓存吗？');
    if (confirmed) {
      wx.clearStorage({
        success: () => {
          showToast('缓存已清除');
        }
      });
    }
  },

  // 退出登录
  async logout() {
    const confirmed = await showConfirm('确定要退出登录吗？');
    if (confirmed) {
      app.globalData.userInfo = null;
      this.setData({
        userInfo: null,
        isAdmin: false
      });
      showToast('已退出登录');
    }
  }
});
