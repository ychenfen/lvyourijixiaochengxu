// 地图足迹页
const app = getApp();
const { diaryApi } = require('../../utils/api');
const { formatDate } = require('../../utils/util');

// 标记点颜色
const MARKER_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

Page({
  data: {
    center: {
      latitude: 39.9042,
      longitude: 116.4074
    },
    scale: 5,
    markers: [],
    footprints: [],
    cities: [],
    provinces: []
  },

  onLoad() {
    this.loadFootprints();
    this.getCurrentLocation();
  },

  onShow() {
    this.loadFootprints();
  },

  // 获取当前位置
  getCurrentLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          center: {
            latitude: res.latitude,
            longitude: res.longitude
          }
        });
      }
    });
  },

  // 加载足迹数据
  async loadFootprints() {
    try {
      // 模拟数据，实际应调用API
      const mockFootprints = [
        {
          id: 1,
          diaryId: 1,
          locationName: '杭州西湖',
          latitude: 30.2590,
          longitude: 120.1388,
          city: '杭州',
          province: '浙江',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 2,
          diaryId: 2,
          locationName: '三亚亚龙湾',
          latitude: 18.2028,
          longitude: 109.6375,
          city: '三亚',
          province: '海南',
          createdAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: 3,
          diaryId: 3,
          locationName: '北京故宫',
          latitude: 39.9163,
          longitude: 116.3972,
          city: '北京',
          province: '北京',
          createdAt: new Date(Date.now() - 259200000).toISOString()
        },
        {
          id: 4,
          diaryId: 4,
          locationName: '成都春熙路',
          latitude: 30.6571,
          longitude: 104.0817,
          city: '成都',
          province: '四川',
          createdAt: new Date(Date.now() - 345600000).toISOString()
        }
      ];

      // 处理足迹数据
      const footprints = mockFootprints.map((item, index) => ({
        ...item,
        color: MARKER_COLORS[index % MARKER_COLORS.length],
        dateText: formatDate(item.createdAt, 'YYYY-MM-DD')
      }));

      // 生成地图标记
      const markers = footprints.map((item, index) => ({
        id: item.id,
        latitude: item.latitude,
        longitude: item.longitude,
        title: item.locationName,
        iconPath: '/images/marker.png',
        width: 32,
        height: 40,
        callout: {
          content: item.locationName,
          color: '#333',
          fontSize: 12,
          borderRadius: 8,
          bgColor: '#fff',
          padding: 8,
          display: 'BYCLICK'
        },
        label: {
          content: String(index + 1),
          color: '#fff',
          fontSize: 10,
          anchorX: 0,
          anchorY: -20,
          bgColor: item.color,
          borderRadius: 10,
          padding: 4
        }
      }));

      // 统计城市和省份
      const cities = [...new Set(footprints.map(f => f.city))];
      const provinces = [...new Set(footprints.map(f => f.province))];

      this.setData({
        footprints,
        markers,
        cities,
        provinces
      });

      // 调整地图视野
      if (footprints.length > 0) {
        this.fitMapBounds(footprints);
      }
    } catch (err) {
      console.error('加载足迹失败:', err);
    }
  },

  // 调整地图视野以显示所有标记
  fitMapBounds(footprints) {
    if (footprints.length === 0) return;

    const lats = footprints.map(f => f.latitude);
    const lngs = footprints.map(f => f.longitude);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    // 计算合适的缩放级别
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);
    
    let scale = 5;
    if (maxDiff < 1) scale = 10;
    else if (maxDiff < 5) scale = 7;
    else if (maxDiff < 10) scale = 5;
    else scale = 4;

    this.setData({
      center: {
        latitude: centerLat,
        longitude: centerLng
      },
      scale
    });
  },

  // 点击标记
  onMarkerTap(e) {
    const markerId = e.markerId;
    const footprint = this.data.footprints.find(f => f.id === markerId);
    if (footprint) {
      wx.navigateTo({
        url: `/pages/diary-detail/diary-detail?id=${footprint.diaryId}`
      });
    }
  },

  // 地图区域变化
  onRegionChange(e) {
    // 可以在这里处理地图移动事件
  },

  // 移动到当前位置
  moveToLocation() {
    const mapCtx = wx.createMapContext('footprintMap');
    mapCtx.moveToLocation();
  },

  // 跳转到日记详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/diary-detail/diary-detail?id=${id}`
    });
  }
});
