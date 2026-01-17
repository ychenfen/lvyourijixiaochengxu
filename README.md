# 旅游日记系统

基于 React + Express + tRPC + MySQL 的旅游日记管理系统，支持用户端和管理员后台。

## 功能特性

### 用户端功能
- **旅游日记**：创建、编辑、删除日记，支持图文混排和图片上传
- **地图足迹**：在地图上展示所有日记发布地点，点击查看详情
- **实时天气**：接入 Open-Meteo API，查询任意城市天气和7天预报
- **附近推荐**：展示周边餐厅、酒店、景点等高评价商户

### 管理员后台
- **数据统计**：用户总数、日记总数、今日新增等核心数据
- **用户管理**：查看用户列表，支持禁用/启用用户
- **内容审核**：审核日记内容，支持屏蔽/删除违规内容

## 技术栈

- **前端**：React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui
- **后端**：Express 4 + tRPC 11 + Drizzle ORM
- **数据库**：MySQL / TiDB
- **认证**：Manus OAuth
- **地图**：Google Maps API
- **天气**：Open-Meteo API（免费无需API Key）

## 项目结构

```
├── client/                 # 前端代码
│   ├── src/
│   │   ├── components/    # 通用组件
│   │   ├── pages/         # 页面组件
│   │   ├── contexts/      # React Context
│   │   ├── hooks/         # 自定义 Hooks
│   │   └── lib/           # 工具库
├── server/                 # 后端代码
│   ├── _core/             # 核心框架代码
│   ├── db.ts              # 数据库查询
│   └── routers.ts         # tRPC 路由
├── drizzle/               # 数据库 Schema
│   └── schema.ts          # 表结构定义
└── shared/                # 前后端共享代码
```

## 数据库表结构

### users 用户表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| openId | varchar(64) | OAuth ID |
| name | text | 用户名 |
| email | varchar(320) | 邮箱 |
| avatar | text | 头像URL |
| role | enum | 角色(user/admin) |
| status | enum | 状态(active/disabled) |
| createdAt | timestamp | 创建时间 |

### diaries 日记表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| userId | int | 用户ID |
| title | varchar(200) | 标题 |
| content | text | 内容 |
| locationName | varchar(200) | 地点名称 |
| latitude | decimal | 纬度 |
| longitude | decimal | 经度 |
| weather | varchar(50) | 天气 |
| temperature | varchar(20) | 温度 |
| status | enum | 状态(published/hidden/deleted) |
| createdAt | timestamp | 创建时间 |

### diary_images 日记图片表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| diaryId | int | 日记ID |
| imageUrl | text | 图片URL |
| sortOrder | int | 排序 |
| createdAt | timestamp | 创建时间 |

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test

# 数据库迁移
pnpm db:push

# 构建生产版本
pnpm build
```

## 环境变量

项目需要以下环境变量（由平台自动注入）：

- `DATABASE_URL` - 数据库连接字符串
- `JWT_SECRET` - JWT 签名密钥
- `VITE_APP_ID` - OAuth 应用ID
- `OAUTH_SERVER_URL` - OAuth 服务器地址

## API 接口

### 日记相关
- `diary.list` - 获取日记列表
- `diary.get` - 获取日记详情
- `diary.create` - 创建日记
- `diary.update` - 更新日记
- `diary.delete` - 删除日记

### 天气相关
- `weather.current` - 获取当前天气
- `weather.forecast` - 获取7天预报

### 管理员相关
- `admin.stats` - 获取统计数据
- `admin.users` - 获取用户列表
- `admin.toggleUserStatus` - 切换用户状态
- `admin.diaries` - 获取日记审核列表
- `admin.updateDiaryStatus` - 更新日记状态

## 测试

项目包含 20 个单元测试，覆盖：
- 日记 CRUD 操作
- 天气 API 调用
- 用户认证流程

```bash
pnpm test
```

## 许可证

MIT License
