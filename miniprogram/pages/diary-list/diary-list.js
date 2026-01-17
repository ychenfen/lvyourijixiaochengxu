// 日记列表页
const app = getApp();
const { diaryApi } = require('../../utils/api');
const { formatRelativeTime, truncateText } = require('../../utils/util');

Page({
  data: {
    diaries: [],
    searchKeyword: '',
    loading: true,
    loadingMore: false,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad() {
    this.loadDiaries();
  },

  onShow() {
    // 刷新列表
    this.setData({ page: 1 });
    this.loadDiaries();
  },

  onPullDownRefresh() {
    this.setData({ page: 1 });
    this.loadDiaries().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore();
    }
  },

  // 加载日记列表
  async loadDiaries() {
    this.setData({ loading: true });
    try {
      // 模拟数据，实际应调用API
      const mockDiaries = [
        {
          id: 1,
          title: '杭州西湖之旅',
          content: '今天去了西湖，风景真的很美。断桥残雪、雷峰塔、三潭印月，每一处都让人流连忘返。湖边的柳树随风摇曳，远处的山峦若隐若现，仿佛置身于一幅水墨画中。',
          coverImage: '',
          locationName: '杭州西湖',
          weather: '晴',
          temperature: '25°C',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 2,
          title: '三亚海边度假',
          content: '阳光、沙滩、海浪，三亚的海真的太美了！在亚龙湾玩了一整天，海水清澈见底，沙滩细腻柔软。傍晚时分，坐在沙滩上看日落，金色的阳光洒在海面上，美不胜收。',
          coverImage: '',
          locationName: '三亚亚龙湾',
          weather: '多云',
          temperature: '30°C',
          createdAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: 3,
          title: '北京故宫一日游',
          content: '终于来到了心心念念的故宫！红墙黄瓦，雕梁画栋，处处彰显着皇家的气派。从午门进入，一路走过太和殿、中和殿、保和殿，感受着历史的厚重。',
          coverImage: '',
          locationName: '北京故宫',
          weather: '晴',
          temperature: '22°C',
          createdAt: new Date(Date.now() - 259200000).toISOString()
        },
        {
          id: 4,
          title: '成都美食探店',
          content: '来成都怎么能不吃火锅！今天去了一家网红火锅店，麻辣鲜香，味道绝了。还尝试了担担面、龙抄手、钟水饺，每一样都让人回味无穷。',
          coverImage: '',
          locationName: '成都春熙路',
          weather: '阴',
          temperature: '18°C',
          createdAt: new Date(Date.now() - 345600000).toISOString()
        }
      ];

      // 搜索过滤
      let filteredDiaries = mockDiaries;
      if (this.data.searchKeyword) {
        const keyword = this.data.searchKeyword.toLowerCase();
        filteredDiaries = mockDiaries.filter(diary => 
          diary.title.toLowerCase().includes(keyword) || 
          diary.content.toLowerCase().includes(keyword)
        );
      }

      const diaries = filteredDiaries.map(diary => ({
        ...diary,
        summary: truncateText(diary.content, 80),
        createTimeText: formatRelativeTime(diary.createdAt)
      }));

      this.setData({
        diaries,
        loading: false,
        hasMore: diaries.length >= this.data.pageSize
      });
    } catch (err) {
      console.error('加载日记失败:', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 加载更多
  async loadMore() {
    if (this.data.loadingMore) return;
    
    this.setData({ loadingMore: true });
    try {
      const nextPage = this.data.page + 1;
      // 模拟加载更多
      setTimeout(() => {
        this.setData({
          loadingMore: false,
          hasMore: false, // 模拟没有更多数据
          page: nextPage
        });
      }, 1000);
    } catch (err) {
      console.error('加载更多失败:', err);
      this.setData({ loadingMore: false });
    }
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  // 执行搜索
  onSearch() {
    this.setData({ page: 1 });
    this.loadDiaries();
  },

  // 跳转到详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/diary-detail/diary-detail?id=${id}`
    });
  },

  // 跳转到编辑
  goToEdit() {
    wx.navigateTo({
      url: '/pages/diary-edit/diary-edit'
    });
  }
});
