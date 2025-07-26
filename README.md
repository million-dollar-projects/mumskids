# 儿童数学练习系统 (Kids Math Practice System)

一个专为3-8岁儿童设计的数学练习系统，帮助提升口算和心算能力。

## 🚀 功能特性

- **多语言支持**: 中文/英文切换
- **个性化UI**: 男孩/女孩主题配色
- **练习管理**: 创建、浏览、管理数学练习
- **奖励机制**: 完成练习获得正向反馈
- **用户认证**: Google登录支持
- **响应式设计**: 适配各种设备

## 🛠 技术栈

- **前端**: Next.js 14/15 (App Router, SSR)
- **UI组件**: shadcn/ui + Tailwind CSS
- **国际化**: next-intl
- **后端**: Supabase (Auth, Database, Storage)
- **语言**: TypeScript

## 📦 安装和运行

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd mumskids
```

### 2. 安装依赖

```bash
npm install
```

### 3. 环境配置

复制环境变量模板：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，填入你的 Supabase 配置：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 站点配置
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. 数据库设置

#### 本地开发 (推荐)

```bash
# 安装 Supabase CLI
npm install -g supabase

# 初始化本地 Supabase
supabase init

# 启动本地服务
supabase start

# 应用数据库迁移
supabase db reset
```

#### 生产环境

1. 在 [Supabase](https://supabase.com) 创建项目
2. 获取项目 URL 和 API 密钥
3. 在 Supabase Studio 中运行迁移文件

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 📁 项目结构

```
mumskids/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/          # 国际化路由
│   │   ├── api/               # API 路由
│   │   └── auth/              # 认证相关页面
│   ├── components/            # UI 组件
│   │   └── ui/               # shadcn/ui 组件
│   ├── lib/                   # 工具库
│   │   ├── auth/             # 认证相关
│   │   ├── supabase/         # Supabase 客户端
│   │   └── services/         # 业务逻辑服务
│   ├── i18n/                 # 国际化配置
│   └── types/                # TypeScript 类型定义
├── supabase/                 # Supabase 配置
│   └── migrations/           # 数据库迁移文件
├── scripts/                  # 脚本文件
└── public/                   # 静态资源
```

## 🔧 开发指南

### 添加新语言

1. 在 `src/i18n/messages.ts` 中添加新的语言配置
2. 在 `src/middleware.ts` 中更新支持的语言列表

### 创建新组件

使用 shadcn/ui 添加组件：

```bash
npx shadcn@latest add button
```

### 数据库迁移

```bash
# 创建新迁移
supabase migration new migration_name

# 应用迁移
supabase db reset
```

## 🌐 部署

### Vercel 部署

1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 部署

### 其他平台

确保设置以下环境变量：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如有问题，请创建 Issue 或联系开发团队。
