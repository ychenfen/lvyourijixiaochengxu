// 管理员后台页
const app = getApp();
const { showToast, showConfirm, formatDate } = require('../../utils/util');

Page({
  data: {
    activeTab: 'stats',
    // 统计数据
    stats: {
      totalUsers: 0,
      totalDiaries: 0,
      totalFootprints: 0,
      todayDiaries: 0,
      todayUsers: 0,
      activeUsers: 0
    },
    // 用户管理
    userSearch: '',
    users: [],
    // 内容审核
    contentFilter: 'all',
    diaries: []
  },

  onLoad() {
    this.loadStats();
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    
    if (tab === 'stats') {
      this.loadStats();
    } else if (tab === 'users') {
      this.loadUsers();
    } else if (tab === 'content') {
      this.loadDiaries();
    }
  },

  // 加载统计数据
  loadStats() {
    // 模拟数据，实际应调用API
    this.setData({
      stats: {
        totalUsers: 1256,
        totalDiaries: 3842,
        totalFootprints: 2156,
        todayDiaries: 28,
        todayUsers: 15,
        activeUsers: 486
      }
    });
  },

  // 加载用户列表
  loadUsers() {
    // 模拟数据
    const mockUsers = [
      {
        id: 1,
        name: '旅行者小明',
        avatar: '',
        status: 'active',
        diaryCount: 12,
        createdAt: '2024-01-15'
      },
      {
        id: 2,
        name: '背包客小红',
        avatar: '',
        status: 'active',
        diaryCount: 8,
        createdAt: '2024-02-20'
      },
      {
        id: 3,
        name: '摄影师阿杰',
        avatar: '',
        status: 'disabled',
        diaryCount: 25,
        createdAt: '2024-01-08'
      }
    ];

    let users = mockUsers;
    if (this.data.userSearch) {
      users = mockUsers.filter(u => 
        u.name.toLowerCase().includes(this.data.userSearch.toLowerCase())
      );
    }

    this.setData({ users });
  },

  // 用户搜索输入
  onUserSearchInput(e) {
    this.setData({ userSearch: e.detail.value });
  },

  // 搜索用户
  searchUsers() {
    this.loadUsers();
  },

  // 切换用户状态
  async toggleUserStatus(e) {
    const { id, status } = e.currentTarget.dataset;
    const newStatus = status === 'active' ? 'disabled' : 'active';
    const action = newStatus === 'disabled' ? '禁用' : '启用';
    
    const confirmed = await showConfirm(`确定要${action}该用户吗？`);
    if (confirmed) {
      // 调用API更新状态
      const users = this.data.users.map(u => {
        if (u.id === id) {
          return { ...u, status: newStatus };
        }
        return u;
      });
      this.setData({ users });
      showToast(`${action}成功`);
    }
  },

  // 设置内容筛选
  setContentFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ contentFilter: filter });
    this.loadDiaries();
  },

  // 加载日记列表
  loadDiaries() {
    // 模拟数据
    const mockDiaries = [
      {
        id: 1,
        title: '杭州西湖之旅',
        content: '今天去了西湖，风景真的很美。断桥残雪、雷峰塔、三潭印月，每一处都让人流连忘返...',
        authorName: '旅行者小明',
        status: 'normal',
        createdAt: '2024-03-15 10:30'
      },
      {
        id: 2,
        title: '三亚海边度假',
        content: '阳光、沙滩、海浪，三亚的海真的太美了！在亚龙湾玩了一整天...',
        authorName: '背包客小红',
        status: 'pending',
        createdAt: '2024-03-14 15:20'
      },
      {
        id: 3,
        title: '违规内容测试',
        content: '这是一条被屏蔽的内容...',
        authorName: '测试用户',
        status: 'blocked',
        createdAt: '2024-03-13 09:00'
      }
    ];

    let diaries = mockDiaries;
    if (this.data.contentFilter !== 'all') {
      const statusMap = {
        pending: 'pending',
        blocked: 'blocked'
      };
      diaries = mockDiaries.filter(d => d.status === statusMap[this.data.contentFilter]);
    }

    this.setData({ diaries });
  },

  // 查看日记
  viewDiary(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/diary-detail/diary-detail?id=${id}`
    });
  },

  // 切换日记状态
  async toggleDiaryStatus(e) {
    const { id, status } = e.currentTarget.dataset;
    const newStatus = status === 'blocked' ? 'normal' : 'blocked';
    const action = newStatus === 'blocked' ? '屏蔽' : '恢复';
    
    const confirmed = await showConfirm(`确定要${action}该日记吗？`);
    if (confirmed) {
      // 调用API更新状态
      const diaries = this.data.diaries.map(d => {
        if (d.id === id) {
          return { ...d, status: newStatus };
        }
        return d;
      });
      this.setData({ diaries });
      showToast(`${action}成功`);
    }
  },

  // 删除日记
  async deleteDiary(e) {
    const id = e.currentTarget.dataset.id;
    
    const confirmed = await showConfirm('确定要删除该日记吗？删除后无法恢复。');
    if (confirmed) {
      // 调用API删除
      const diaries = this.data.diaries.filter(d => d.id !== id);
      this.setData({ diaries });
      showToast('删除成功');
    }
  }
});
