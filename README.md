# 旅游日记系统

基于微信小程序的旅游日记系统，帮助用户记录旅行足迹、分享旅途故事。本项目包含微信小程序前端和Web后台管理系统两部分。

## 项目简介

旅游日记系统是一个完整的旅行记录应用，用户可以通过微信小程序记录旅行日记、查看地图足迹、获取实时天气、发现附近推荐商户；管理员可以通过Web后台或小程序管理端进行用户管理、内容审核和数据统计。

## 功能特性

### 用户端功能

**日记管理**：支持创建、编辑、删除旅游日记，支持图文混排，可添加多张图片，自动记录位置和天气信息。

**地图足迹**：在地图上展示所有日记发布地点，支持点击标记查看详情，统计已到访的城市和省份数量。

**天气查询**：接入Open-Meteo免费天气API，获取实时天气数据和7天预报，支持热门城市快速切换，提供穿衣、雨伞、运动等旅行建议。

**附近推荐**：展示附近的餐厅、酒店、景点等商户信息，支持分类筛选，提供电话和导航功能。

**个人中心**：展示用户统计数据，提供各功能入口，支持登录退出和缓存清理。

### 管理员后台

**数据统计**：展示总用户数、总日记数、总足迹数、今日新增等核心运营数据。

**用户管理**：查看用户列表，支持搜索，可禁用或启用用户账号。

**内容审核**：查看所有日记内容，支持按状态筛选，可屏蔽或删除违规内容。

## 项目结构

```
├── miniprogram/           # 微信小程序前端（原生开发）
│   ├── pages/            # 小程序页面
│   │   ├── index/       # 首页
│   │   ├── diary-list/  # 日记列表
│   │   ├── diary-detail/# 日记详情
│   │   ├── diary-edit/  # 日记编辑
│   │   ├── footprints/  # 地图足迹
│   │   ├── weather/     # 天气查询
│   │   ├── nearby/      # 附近推荐
│   │   ├── profile/     # 个人中心
│   │   └── admin/       # 管理后台
│   ├── utils/            # 工具函数
│   ├── images/           # 图片资源
│   ├── app.js            # 小程序入口
│   ├── app.json          # 小程序配置
│   └── app.wxss          # 全局样式
│
├── client/               # Web前端（React + TypeScript）
│   ├── src/
│   │   ├── pages/       # 页面组件
│   │   ├── components/  # 公共组件
│   │   └── lib/         # 工具库
│   └── public/          # 静态资源
│
├── server/               # 后端服务（Express + tRPC）
│   ├── routers.ts       # API路由
│   ├── db.ts            # 数据库操作
│   └── _core/           # 核心框架
│
├── drizzle/              # 数据库Schema
│   └── schema.ts        # 表结构定义
│
└── database/             # 数据库脚本
    └── init.sql         # 初始化SQL
```

## 技术栈

### 微信小程序前端

| 技术 | 说明 |
|------|------|
| WXML | 微信小程序模板语言 |
| WXSS | 微信小程序样式语言 |
| JavaScript | 逻辑层开发语言 |
| 微信API | 地图、定位、网络请求等 |

### Web后台

| 技术 | 说明 |
|------|------|
| React 19 | 前端框架 |
| TypeScript | 类型安全 |
| Tailwind CSS 4 | 样式框架 |
| Express 4 | 后端框架 |
| tRPC 11 | 类型安全的API |
| Drizzle ORM | 数据库ORM |
| MySQL | 数据库 |

## 快速开始

### 微信小程序

1. 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

2. 打开微信开发者工具，选择"导入项目"

3. 项目目录选择 `miniprogram` 文件夹

4. 填入你的小程序 AppID（测试可使用测试号）

5. 在 `utils/api.js` 中配置后端API地址

详细说明请参考 [miniprogram/README.md](./miniprogram/README.md)

### Web后台

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test

# 数据库迁移
pnpm db:push
```

## 数据库设计

### 用户表 (users)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| openId | VARCHAR(64) | 微信OpenID |
| name | TEXT | 用户昵称 |
| email | VARCHAR(320) | 邮箱 |
| avatar | TEXT | 头像URL |
| status | ENUM | 状态：active/disabled |
| role | ENUM | 角色：user/admin |
| createdAt | TIMESTAMP | 创建时间 |
| updatedAt | TIMESTAMP | 更新时间 |

### 日记表 (diaries)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| userId | INT | 用户ID |
| title | VARCHAR(100) | 标题 |
| content | TEXT | 内容 |
| locationName | VARCHAR(200) | 位置名称 |
| latitude | DECIMAL | 纬度 |
| longitude | DECIMAL | 经度 |
| weather | VARCHAR(50) | 天气 |
| temperature | VARCHAR(20) | 温度 |
| status | ENUM | 状态：normal/blocked |
| createdAt | TIMESTAMP | 创建时间 |
| updatedAt | TIMESTAMP | 更新时间 |

### 日记图片表 (diary_images)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| diaryId | INT | 日记ID |
| imageUrl | TEXT | 图片URL |
| sortOrder | INT | 排序 |
| createdAt | TIMESTAMP | 创建时间 |

## API接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/trpc/diary.list | GET | 获取日记列表 |
| /api/trpc/diary.detail | GET | 获取日记详情 |
| /api/trpc/diary.create | POST | 创建日记 |
| /api/trpc/diary.update | POST | 更新日记 |
| /api/trpc/diary.delete | POST | 删除日记 |
| /api/trpc/weather.current | GET | 获取当前天气 |
| /api/trpc/weather.forecast | GET | 获取天气预报 |
| /api/trpc/admin.stats | GET | 获取统计数据 |
| /api/trpc/admin.users | GET | 获取用户列表 |
| /api/trpc/admin.diaries | GET | 获取日记审核列表 |

## 环境变量

项目需要以下环境变量（参考 `.env.example`）：

| 变量名 | 说明 |
|--------|------|
| DATABASE_URL | 数据库连接字符串 |
| JWT_SECRET | JWT签名密钥 |
| VITE_APP_ID | OAuth应用ID |
| OAUTH_SERVER_URL | OAuth服务器地址 |

## 注意事项

1. 微信小程序需要在微信公众平台注册并获取AppID才能发布上线
2. 地图功能需要在小程序后台配置腾讯地图密钥
3. 网络请求需要在小程序后台配置合法域名
4. 天气API使用的是Open-Meteo免费接口，无需申请密钥
5. 图片上传需要配置云存储服务

## 测试

项目包含20个单元测试，覆盖日记CRUD操作、天气API调用、用户认证流程等核心功能。

```bash
pnpm test
```

## 版本信息

当前版本：1.0.0

## 开源协议

MIT License

## 开发者

旅游日记团队
