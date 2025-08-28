# Supabase OTP验证码配置指南

## 🚨 重要：解决"只收到确认链接，没有验证码"的问题

如果您收到的邮件只有"Confirm your mail"链接而没有验证码，这是因为Supabase的邮件模板需要配置。

## 📧 配置步骤

### 1. 登录Supabase控制台

访问 [https://supabase.com/dashboard](https://supabase.com/dashboard) 并选择您的项目。

### 2. 进入邮件模板设置

1. 在左侧菜单中点击 `Authentication`
2. 点击 `Email Templates`

### 3. 修改Magic Link模板

1. 在Email Templates页面，找到 `Magic Link` 模板
2. 点击编辑按钮
3. 将模板内容替换为以下代码：

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>邮箱验证码</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; background: #f8f9fa; padding: 40px; border-radius: 10px;">
        <h1 style="color: #333; margin-bottom: 20px;">邮箱验证码</h1>
        <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
            您正在登录 LittlePlus，请使用以下验证码：
        </p>
        
        <!-- 验证码显示 -->
        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #e9ecef;">
            <h2 style="font-size: 36px; color: #007bff; letter-spacing: 8px; margin: 0; font-weight: bold;">
                {{ .Token }}
            </h2>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
            验证码有效期为 <strong>10分钟</strong>，请及时使用。
        </p>
        
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
            如果您没有请求此验证码，请忽略此邮件。
        </p>
    </div>
</body>
</html>
```

### 4. 保存模板

点击 `Save` 按钮保存模板。

### 5. 测试验证码功能

1. 返回您的应用登录页面
2. 输入邮箱地址
3. 点击"发送验证码"
4. 检查邮箱，现在应该收到包含6位数字验证码的邮件

## 🔧 模板变量说明

- `{{ .Token }}` - 6位数字验证码
- `{{ .SiteURL }}` - 网站URL
- `{{ .Email }}` - 用户邮箱地址

## 📱 邮件效果预览

配置后，用户将收到类似以下内容的邮件：

```
邮箱验证码

您正在登录 LittlePlus，请使用以下验证码：

┌─────────────┐
│   123456    │
└─────────────┘

验证码有效期为 10分钟，请及时使用。

如果您没有请求此验证码，请忽略此邮件。
```

## 🚨 常见问题

### Q: 修改模板后还是收到链接？
A: 请确保：
1. 模板已正确保存
2. 使用的是 `Magic Link` 模板而不是其他模板
3. 清除浏览器缓存后重新测试

### Q: 验证码格式不对？
A: 确保模板中使用的是 `{{ .Token }}` 而不是其他变量。

### Q: 邮件样式显示异常？
A: 可以使用简化版本的模板：

```html
<h2>邮箱验证码</h2>
<p>您的验证码是：</p>
<h1 style="font-size: 32px; color: #333; letter-spacing: 5px;">{{ .Token }}</h1>
<p>验证码有效期为10分钟，请及时使用。</p>
<p>如果您没有请求此验证码，请忽略此邮件。</p>
```

## ✅ 验证配置成功

配置成功后，用户体验流程：
1. 输入邮箱地址 → 点击"发送验证码"
2. 收到包含6位数字的验证码邮件
3. 输入验证码 → 点击"验证并登录"
4. 登录成功！

现在您的邮箱验证码功能应该正常工作了！
