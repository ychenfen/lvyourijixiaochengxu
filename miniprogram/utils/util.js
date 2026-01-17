// 工具函数

// 格式化日期
const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
};

// 格式化相对时间
const formatRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diff = now - d;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return formatDate(date, 'YYYY-MM-DD');
  } else if (days > 0) {
    return `${days}天前`;
  } else if (hours > 0) {
    return `${hours}小时前`;
  } else if (minutes > 0) {
    return `${minutes}分钟前`;
  } else {
    return '刚刚';
  }
};

// 截取文本
const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// 天气代码转描述
const weatherCodeToText = (code) => {
  const weatherMap = {
    0: '晴天',
    1: '晴间多云',
    2: '多云',
    3: '阴天',
    45: '雾',
    48: '雾凇',
    51: '小毛毛雨',
    53: '毛毛雨',
    55: '大毛毛雨',
    61: '小雨',
    63: '中雨',
    65: '大雨',
    71: '小雪',
    73: '中雪',
    75: '大雪',
    80: '阵雨',
    81: '中阵雨',
    82: '大阵雨',
    95: '雷暴',
    96: '雷暴伴冰雹',
    99: '强雷暴伴冰雹'
  };
  return weatherMap[code] || '未知';
};

// 天气代码转图标
const weatherCodeToIcon = (code) => {
  if (code === 0) return '☀️';
  if (code >= 1 && code <= 2) return '⛅';
  if (code === 3) return '☁️';
  if (code >= 45 && code <= 48) return '🌫️';
  if (code >= 51 && code <= 55) return '🌧️';
  if (code >= 61 && code <= 65) return '🌧️';
  if (code >= 71 && code <= 75) return '❄️';
  if (code >= 80 && code <= 82) return '🌦️';
  if (code >= 95) return '⛈️';
  return '🌤️';
};

// 风向转换
const windDirectionToText = (degree) => {
  const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
  const index = Math.round(degree / 45) % 8;
  return directions[index] + '风';
};

// 显示加载提示
const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title,
    mask: true
  });
};

// 隐藏加载提示
const hideLoading = () => {
  wx.hideLoading();
};

// 显示提示
const showToast = (title, icon = 'none') => {
  wx.showToast({
    title,
    icon,
    duration: 2000
  });
};

// 显示确认对话框
const showConfirm = (content, title = '提示') => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm);
      }
    });
  });
};

// 选择图片
const chooseImage = (count = 9) => {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFiles = res.tempFiles.map(file => file.tempFilePath);
        resolve(tempFiles);
      },
      fail: reject
    });
  });
};

// 选择位置
const chooseLocation = () => {
  return new Promise((resolve, reject) => {
    wx.chooseLocation({
      success: (res) => {
        resolve({
          name: res.name,
          address: res.address,
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail: reject
    });
  });
};

// 获取当前位置
const getLocation = () => {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        resolve({
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail: reject
    });
  });
};

// 打开地图导航
const openLocation = (latitude, longitude, name, address) => {
  wx.openLocation({
    latitude,
    longitude,
    name,
    address,
    scale: 18
  });
};

// 拨打电话
const makePhoneCall = (phoneNumber) => {
  wx.makePhoneCall({
    phoneNumber
  });
};

module.exports = {
  formatDate,
  formatRelativeTime,
  truncateText,
  weatherCodeToText,
  weatherCodeToIcon,
  windDirectionToText,
  showLoading,
  hideLoading,
  showToast,
  showConfirm,
  chooseImage,
  chooseLocation,
  getLocation,
  openLocation,
  makePhoneCall
};
