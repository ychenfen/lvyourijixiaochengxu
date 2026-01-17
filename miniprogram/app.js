// app.js
App({
  globalData: {
    userInfo: null,
    isLogin: false,
    baseUrl: 'https://your-api-server.com/api', // 后端API地址，部署后需要修改
    location: null, // 用户当前位置
    weatherData: null // 缓存的天气数据
  },

  onLaunch() {
    // 检查登录状态
    this.checkLoginStatus();
    // 获取用户位置
    this.getLocation();
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('token');
    if (userInfo && token) {
      this.globalData.userInfo = userInfo;
      this.globalData.isLogin = true;
    }
  },

  // 微信登录
  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            // 发送 code 到后端换取 openId 和 session_key
            wx.request({
              url: `${this.globalData.baseUrl}/auth/wx-login`,
              method: 'POST',
              data: { code: res.code },
              success: (response) => {
                if (response.data.success) {
                  const { token, userInfo } = response.data.data;
                  wx.setStorageSync('token', token);
                  wx.setStorageSync('userInfo', userInfo);
                  this.globalData.userInfo = userInfo;
                  this.globalData.isLogin = true;
                  resolve(userInfo);
                } else {
                  reject(new Error(response.data.message || '登录失败'));
                }
              },
              fail: (err) => {
                reject(err);
              }
            });
          } else {
            reject(new Error('获取登录凭证失败'));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  // 获取用户信息
  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          const userInfo = res.userInfo;
          // 更新用户信息到后端
          this.updateUserInfo(userInfo).then(() => {
            this.globalData.userInfo = { ...this.globalData.userInfo, ...userInfo };
            wx.setStorageSync('userInfo', this.globalData.userInfo);
            resolve(userInfo);
          }).catch(reject);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  // 更新用户信息到后端
  updateUserInfo(userInfo) {
    return new Promise((resolve, reject) => {
      const token = wx.getStorageSync('token');
      wx.request({
        url: `${this.globalData.baseUrl}/user/update`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`
        },
        data: {
          name: userInfo.nickName,
          avatar: userInfo.avatarUrl
        },
        success: (res) => {
          if (res.data.success) {
            resolve(res.data);
          } else {
            reject(new Error(res.data.message || '更新失败'));
          }
        },
        fail: reject
      });
    });
  },

  // 获取用户位置
  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.globalData.location = {
          latitude: res.latitude,
          longitude: res.longitude
        };
      },
      fail: (err) => {
        console.log('获取位置失败:', err);
      }
    });
  },

  // 退出登录
  logout() {
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    this.globalData.userInfo = null;
    this.globalData.isLogin = false;
  },

  // 封装请求方法
  request(options) {
    const token = wx.getStorageSync('token');
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.globalData.baseUrl}${options.url}`,
        method: options.method || 'GET',
        data: options.data,
        header: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.header
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else if (res.statusCode === 401) {
            // 未授权，跳转登录
            this.logout();
            wx.showToast({
              title: '请先登录',
              icon: 'none'
            });
            reject(new Error('未授权'));
          } else {
            reject(new Error(res.data.message || '请求失败'));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }
});
