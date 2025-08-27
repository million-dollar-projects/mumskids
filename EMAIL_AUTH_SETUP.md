# 邮箱验证码登录配置指南

## 1. 环境变量配置

创建 `.env.local` 文件并添加以下配置：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 2. Supabase 配置

### 2.1 启用邮箱认证

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 进入你的项目
3. 前往 `Authentication` > `Settings`
4. 在 `Auth Providers` 中启用 `Email`
5. 确保 `Enable email confirmations` 已启用

### 2.2 配置邮箱模板（重要！）

**这一步是必需的，否则只会收到确认链接而不是验证码**

1. 前往 `Authentication` > `Email Templates`
2. 选择 `Magic Link` 模板
3. **重要**：修改邮件模板以包含验证码，使用以下模板：

```html
<h2>邮箱验证码</h2>
<p>您的验证码是：</p>
<h1 style="font-size: 32px; color: #333; letter-spacing: 5px;">{{ .Token }}</h1>
<p>验证码有效期为10分钟，请及时使用。</p>
<p>如果您没有请求此验证码，请忽略此邮件。</p>
```

4. 点击 `Save` 保存模板

**注意**：`{{ .Token }}` 是Supabase提供的验证码变量，这样用户就能收到6位数字验证码而不是链接。

### 2.3 配置重定向URL

1. 前往 `Authentication` > `URL Configuration`
2. 在 `Redirect URLs` 中添加：
   - `http://localhost:3000/zh/auth/callback`
   - `http://localhost:3000/en/auth/callback`
   - 如果部署到生产环境，添加对应的生产域名

## 3. 功能特性

### 3.1 已实现功能

- ✅ 邮箱验证码发送
- ✅ 验证码验证和登录
- ✅ 用户界面完整流程
- ✅ 错误处理和用户反馈
- ✅ 重发验证码功能（60秒倒计时）
- ✅ 表单验证
- ✅ 响应式设计

### 3.2 用户流程

1. 用户输入邮箱地址
2. 点击"发送验证码"
3. 系统发送6位数字验证码到邮箱
4. 用户输入验证码
5. 点击"验证并登录"
6. 登录成功后跳转到主页

### 3.3 API端点

- `POST /api/auth/email-otp` - 发送验证码
- `POST /api/auth/verify-otp` - 验证验证码
- `GET /[locale]/auth/callback` - 认证回调处理

## 4. 测试

### 4.1 本地测试

1. 确保环境变量配置正确
2. 启动开发服务器：`npm run dev`
3. 访问：`http://localhost:3000/zh/auth/login`
4. 测试邮箱验证码登录流程

### 4.2 验证要点

- [ ] 邮箱格式验证
- [ ] 验证码发送成功
- [ ] 验证码格式验证（6位数字）
- [ ] 验证码过期处理
- [ ] 验证码错误处理
- [ ] 登录成功跳转
- [ ] 重发验证码功能

## 5. 故障排除

### 5.1 常见问题

**验证码收不到？**
- 检查邮箱地址是否正确
- 查看垃圾邮件文件夹
- 确认Supabase邮箱配置正确

**验证码无效？**
- 确认验证码是6位数字
- 检查验证码是否过期（通常10分钟）
- 尝试重新发送验证码

**登录后没有跳转？**
- 检查回调URL配置
- 查看浏览器控制台错误
- 确认路由配置正确

### 5.2 调试

查看浏览器开发者工具的网络面板和控制台，检查API请求和响应。

## 6. 生产环境部署

1. 更新环境变量中的 `NEXT_PUBLIC_SITE_URL`
2. 在Supabase中添加生产域名到重定向URL列表
3. 配置自定义SMTP服务器（可选，提高邮件送达率）
4. 测试完整的邮箱验证流程
