// 日记详情页
const app = getApp();
const { diaryApi } = require('../../utils/api');
const { formatDate, showConfirm, showToast } = require('../../utils/util');

Page({
  data: {
    diaryId: null,
    diary: null,
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ diaryId: options.id });
      this.loadDiary(options.id);
    } else {
      this.setData({ loading: false });
    }
  },

  // 加载日记详情
  async loadDiary(id) {
    this.setData({ loading: true });
    try {
      // 模拟数据，实际应调用API
      const mockDiary = {
        id: parseInt(id),
        title: '杭州西湖之旅',
        content: `今天去了西湖，风景真的很美。

断桥残雪、雷峰塔、三潭印月，每一处都让人流连忘返。湖边的柳树随风摇曳，远处的山峦若隐若现，仿佛置身于一幅水墨画中。

中午在湖边的餐厅吃了西湖醋鱼和龙井虾仁，味道很正宗。下午租了一艘小船，在湖上泛舟，感受"欲把西湖比西子，淡妆浓抹总相宜"的意境。

傍晚时分，坐在断桥上看日落，金色的阳光洒在湖面上，波光粼粼，美不胜收。这次西湖之旅真的太值得了，下次一定要带家人再来！`,
        images: [],
        locationName: '杭州西湖',
        latitude: 30.2590,
        longitude: 120.1388,
        weather: '晴',
        temperature: '25°C',
        weatherIcon: '☀️',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      };

      this.setData({
        diary: {
          ...mockDiary,
          createTimeText: formatDate(mockDiary.createdAt, 'YYYY年MM月DD日 HH:mm')
        },
        loading: false
      });
    } catch (err) {
      console.error('加载日记失败:', err);
      showToast('加载失败');
      this.setData({ loading: false });
    }
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    const urls = this.data.diary.images || [];
    wx.previewImage({
      current: url,
      urls: urls.length > 0 ? urls : [url]
    });
  },

  // 打开位置
  openLocation() {
    const { latitude, longitude, locationName } = this.data.diary;
    if (latitude && longitude) {
      wx.openLocation({
        latitude,
        longitude,
        name: locationName,
        scale: 18
      });
    }
  },

  // 编辑日记
  editDiary() {
    wx.navigateTo({
      url: `/pages/diary-edit/diary-edit?id=${this.data.diaryId}`
    });
  },

  // 分享日记
  shareDiary() {
    showToast('分享功能开发中');
  },

  // 删除日记
  async deleteDiary() {
    const confirmed = await showConfirm('确定要删除这篇日记吗？删除后无法恢复。');
    if (confirmed) {
      try {
        // 调用删除API
        // await diaryApi.delete(this.data.diaryId);
        showToast('删除成功');
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } catch (err) {
        console.error('删除失败:', err);
        showToast('删除失败');
      }
    }
  },

  // 返回
  goBack() {
    wx.navigateBack();
  },

  // 分享给朋友
  onShareAppMessage() {
    return {
      title: this.data.diary?.title || '旅游日记',
      path: `/pages/diary-detail/diary-detail?id=${this.data.diaryId}`
    };
  }
});
