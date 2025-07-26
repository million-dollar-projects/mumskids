# 🚀 快速开始指南

## 5分钟快速上手

### 1. 克隆项目
```bash
git clone <your-repo-url>
cd mumskids
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境
```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 Supabase 配置：
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. 启动数据库
```bash
# 安装 Supabase CLI (如果还没安装)
npm install -g supabase

# 启动本地 Supabase
supabase start

# 应用数据库迁移
supabase db reset
```

### 5. 启动开发服务器
```bash
npm run dev
```

### 6. 访问应用
打开浏览器访问: http://localhost:3000

## 🎯 核心功能演示

### 用户认证
1. 点击右上角"登录"按钮
2. 使用 Google 账号登录
3. 登录成功后自动跳转到首页

### 创建练习
1. 点击"创建练习"按钮
2. 填写练习信息：
   - 标题：我的第一个练习
   - 描述：10以内的加法练习
   - 难度：10以内
   - 题目数量：10
   - 小朋友信息：姓名和性别
   - 奖励：设置完成奖励
3. 点击"保存"创建练习

### 浏览练习
1. 点击"浏览练习"查看所有练习
2. 切换"公开练习"和"我的练习"标签
3. 点击练习卡片查看详情

## 📁 项目结构速览

```
mumskids/
├── src/
│   ├── app/[locale]/          # 多语言页面
│   │   ├── auth/             # 登录相关
│   │   ├── practice/         # 练习管理
│   │   └── page.tsx          # 首页
│   ├── app/api/              # API接口
│   ├── components/ui/        # UI组件
│   ├── lib/                  # 工具库
│   └── i18n/                 # 国际化
├── supabase/                 # 数据库配置
└── scripts/                  # 脚本文件
```

## 🔧 常用命令

```bash
# 开发
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器

# 数据库
supabase start       # 启动本地数据库
supabase stop        # 停止本地数据库
supabase db reset    # 重置数据库
supabase status      # 查看状态

# 代码质量
npm run lint         # 代码检查
npm run type-check   # 类型检查
```

## 🐛 常见问题

### Q: 登录后页面空白？
A: 检查 `.env.local` 中的 Supabase 配置是否正确

### Q: 数据库连接失败？
A: 确保 Supabase 本地服务已启动：`supabase start`

### Q: 练习列表为空？
A: 先创建几个练习，或检查数据库迁移是否成功

### Q: 页面显示404？
A: 确保访问的是 `http://localhost:3000/zh` 或 `http://localhost:3000/en`

## 📞 获取帮助

- 查看 [DEVELOPMENT.md](./DEVELOPMENT.md) 了解详细开发信息
- 查看 [API.md](./API.md) 了解接口文档
- 查看 [README.md](./README.md) 了解项目概述

## 🎉 下一步

现在你已经成功运行了项目！接下来可以：

1. **探索现有功能**：尝试创建、编辑、删除练习
2. **查看代码结构**：了解项目架构和实现方式
3. **开始开发**：根据 [DEVELOPMENT.md](./DEVELOPMENT.md) 中的待实现功能开始开发
4. **自定义配置**：修改主题、添加新语言等

祝你开发愉快！ 🚀 