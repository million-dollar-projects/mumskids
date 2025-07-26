#!/bin/bash

# 检查是否安装了Supabase CLI
if ! command -v supabase &> /dev/null
then
    echo "Supabase CLI 未安装。请先安装 Supabase CLI:"
    echo "npm install -g supabase"
    exit 1
fi

# 检查是否已经初始化了Supabase项目
if [ ! -d "supabase" ]; then
    echo "初始化Supabase项目..."
    supabase init
fi

# 启动本地Supabase服务
echo "启动本地Supabase服务..."
supabase start

# 应用数据库迁移
echo "应用数据库迁移..."
supabase db reset

echo "数据库设置完成！"
echo "请确保在.env.local文件中设置了正确的Supabase配置："
echo "NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>"
echo "SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>" 