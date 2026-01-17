// 附近推荐页
const app = getApp();
const { showToast, makePhoneCall, openLocation } = require('../../utils/util');

// 分类映射
const CATEGORY_MAP = {
  all: '推荐',
  restaurant: '餐厅',
  hotel: '酒店',
  scenic: '景点'
};

Page({
  data: {
    category: 'all',
    categoryText: '推荐',
    places: [],
    loading: true,
    location: null
  },

  onLoad() {
    this.getLocation();
  },

  // 获取位置
  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          }
        });
        this.loadPlaces();
      },
      fail: () => {
        // 使用默认位置
        this.setData({
          location: {
            latitude: 39.9042,
            longitude: 116.4074
          }
        });
        this.loadPlaces();
      }
    });
  },

  // 刷新位置
  refreshLocation() {
    this.setData({ loading: true });
    this.getLocation();
  },

  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      category,
      categoryText: CATEGORY_MAP[category],
      loading: true
    });
    this.loadPlaces();
  },

  // 加载商户列表
  loadPlaces() {
    // 模拟数据，实际应调用微信小程序周边搜索API或后端API
    setTimeout(() => {
      const mockPlaces = this.getMockPlaces();
      let filteredPlaces = mockPlaces;
      
      if (this.data.category !== 'all') {
        filteredPlaces = mockPlaces.filter(p => p.category === this.data.category);
      }

      this.setData({
        places: filteredPlaces,
        loading: false
      });
    }, 500);
  },

  // 模拟数据
  getMockPlaces() {
    return [
      {
        id: 1,
        name: '外婆家（西湖店）',
        category: 'restaurant',
        categoryText: '餐厅',
        rating: 4.8,
        priceLevel: '¥¥',
        address: '杭州市西湖区龙井路1号',
        phone: '0571-12345678',
        distance: '500m',
        latitude: 30.2590,
        longitude: 120.1388,
        image: ''
      },
      {
        id: 2,
        name: '西湖国宾馆',
        category: 'hotel',
        categoryText: '酒店',
        rating: 4.9,
        priceLevel: '¥¥¥¥',
        address: '杭州市西湖区杨公堤18号',
        phone: '0571-87654321',
        distance: '800m',
        latitude: 30.2480,
        longitude: 120.1290,
        image: ''
      },
      {
        id: 3,
        name: '雷峰塔',
        category: 'scenic',
        categoryText: '景点',
        rating: 4.7,
        priceLevel: '¥',
        address: '杭州市西湖区南山路15号',
        phone: '0571-11111111',
        distance: '1.2km',
        latitude: 30.2310,
        longitude: 120.1480,
        image: ''
      },
      {
        id: 4,
        name: '楼外楼（孤山店）',
        category: 'restaurant',
        categoryText: '餐厅',
        rating: 4.6,
        priceLevel: '¥¥¥',
        address: '杭州市西湖区孤山路30号',
        phone: '0571-22222222',
        distance: '1.5km',
        latitude: 30.2650,
        longitude: 120.1350,
        image: ''
      },
      {
        id: 5,
        name: '杭州香格里拉饭店',
        category: 'hotel',
        categoryText: '酒店',
        rating: 4.8,
        priceLevel: '¥¥¥¥',
        address: '杭州市西湖区北山路78号',
        phone: '0571-33333333',
        distance: '2km',
        latitude: 30.2720,
        longitude: 120.1420,
        image: ''
      },
      {
        id: 6,
        name: '断桥残雪',
        category: 'scenic',
        categoryText: '景点',
        rating: 4.9,
        priceLevel: '免费',
        address: '杭州市西湖区白堤',
        phone: '',
        distance: '600m',
        latitude: 30.2620,
        longitude: 120.1510,
        image: ''
      }
    ];
  },

  // 拨打电话
  callPhone(e) {
    const phone = e.currentTarget.dataset.phone;
    if (phone) {
      makePhoneCall(phone);
    } else {
      showToast('暂无联系电话');
    }
  },

  // 导航
  navigate(e) {
    const place = e.currentTarget.dataset.place;
    openLocation(place.latitude, place.longitude, place.name, place.address);
  }
});
