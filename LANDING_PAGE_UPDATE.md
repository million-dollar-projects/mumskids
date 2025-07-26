# 着陆页更新说明

## 更新概述
根据新的设计规范，将原有的数学练习系统着陆页更新为活动管理系统着陆页。

## 主要变更

### 视觉设计
- **背景**: 左侧蓝白渐变 (`#f0f5ff` → `#ffffff`)
- **右侧装饰**: 淡粉色圆形背景 (`#fef5f3`)
- **主标题**: 纯黑色 (`#000000`)
- **强调文字**: 三色渐变 (蓝→紫→红)
- **描述文字**: 中灰色 (`#666666`)
- **按钮**: 黑色背景白色文字

### 内容更新
- **主标题**: "精彩活动"
- **强调语**: "从这里开始。"
- **描述**: "创建活动页面，邀请朋友并售票。今天就来主办一场难忘的活动吧。"
- **按钮**: "创建你的第一个活动"

### 导航更新
- 添加"探索活动"链接
- 登录按钮使用新的黑色样式
- 页脚链接更新

## 技术实现

### 新增CSS类
```css
.landing-bg          /* 主背景渐变 */
.circle-bg           /* 圆形装饰背景 */
.text-primary-black  /* 主标题颜色 */
.text-secondary-gray /* 副标题颜色 */
.text-tertiary-gray  /* 次要文字颜色 */
.gradient-text       /* 渐变强调文字 */
.btn-primary-black   /* 主要按钮样式 */
```

### 文件更改
- `src/app/globals.css` - 新增配色变量和样式
- `src/app/[locale]/page.tsx` - 更新页面结构和样式
- `messages/zh.json` - 更新中文文案
- `messages/en.json` - 更新英文文案

## 使用方法

### 快速应用新配色
```tsx
// 主标题
<h1 className="text-primary-black">精彩活动</h1>

// 强调文字
<span className="gradient-text">从这里开始。</span>

// 描述文字
<p className="text-secondary-gray">描述内容</p>

// 主要按钮
<Button className="btn-primary-black">创建你的第一个活动</Button>

// 页面背景
<div className="landing-bg">...</div>
```

## 相关文档
- `COLOR_SCHEME.md` - 详细配色方案
- `UI_COLOR_IMPLEMENTATION_GUIDE.md` - 完整实施指南

## 更新日期
2025年1月26日