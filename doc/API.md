# API 接口文档

## 基础信息

- **基础URL**: `http://localhost:3000/api`
- **认证方式**: Supabase JWT Token (Cookie)
- **数据格式**: JSON

## 认证相关

### 获取当前用户
```http
GET /api/auth/user
```

**响应**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "user_metadata": {
      "full_name": "用户名"
    }
  }
}
```

## 练习管理

### 获取练习列表

#### 公开练习
```http
GET /api/practices?type=public
```

#### 用户练习
```http
GET /api/practices?type=user&userId={userId}
```

**响应**:
```json
[
  {
    "id": "uuid",
    "slug": "random-slug",
    "created_at": "2024-01-17T00:00:00Z",
    "updated_at": "2024-01-17T00:00:00Z",
    "created_by": "user-uuid",
    "is_public": true,
    "difficulty": "within10",
    "question_count": 10,
    "metadata": {
      "title": "练习标题",
      "description": "练习描述",
      "rewards": ["奖励1", "奖励2"]
    },
    "child_info": {
      "name": "小朋友名字",
      "gender": "boy"
    },
    "stats": {
      "completed_count": 0,
      "average_score": 0
    }
  }
]
```

### 创建练习
```http
POST /api/practices
Content-Type: application/json

{
  "title": "练习标题",
  "description": "练习描述",
  "difficulty": "within10",
  "questionCount": 10,
  "isPublic": true,
  "rewards": ["奖励1", "奖励2"],
  "childInfo": {
    "name": "小朋友名字",
    "gender": "boy"
  }
}
```

**响应**:
```json
{
  "id": "uuid",
  "slug": "random-slug",
  "created_at": "2024-01-17T00:00:00Z"
}
```

### 获取练习详情
```http
GET /api/practices/{slug}
```

**响应**: 同练习列表中的单个练习对象

### 更新练习
```http
PUT /api/practices/{slug}
Content-Type: application/json

{
  "title": "新标题",
  "description": "新描述",
  "difficulty": "within20",
  "questionCount": 15,
  "isPublic": false,
  "rewards": ["新奖励1", "新奖励2"],
  "childInfo": {
    "name": "新名字",
    "gender": "girl"
  }
}
```

### 删除练习
```http
DELETE /api/practices/{slug}
```

## 数据库测试

### 测试数据库连接
```http
GET /api/test-db
```

**响应**:
```json
{
  "status": "success",
  "connection": "ok",
  "practiceCount": 5,
  "practices": [...],
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

## 错误响应格式

```json
{
  "error": "错误描述",
  "details": "详细错误信息"
}
```

## 状态码

- `200`: 成功
- `400`: 请求参数错误
- `401`: 未认证
- `403`: 无权限
- `404`: 资源不存在
- `500`: 服务器错误

## 数据模型

### Practice (练习)
```typescript
interface Practice {
  id: string;
  slug: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_public: boolean;
  difficulty: 'within10' | 'within20' | 'within50' | 'within100';
  question_count: number;
  metadata: {
    title: string;
    description: string;
    rewards: string[];
  };
  child_info: {
    name: string;
    gender: 'boy' | 'girl';
  };
  stats: {
    completed_count: number;
    average_score: number;
  };
}
```

### PracticeFormData (练习表单数据)
```typescript
interface PracticeFormData {
  title: string;
  description: string;
  difficulty: 'within10' | 'within20' | 'within50' | 'within100';
  questionCount: number;
  isPublic: boolean;
  rewards: string[];
  childInfo: {
    name: string;
    gender: 'boy' | 'girl';
  };
}
```

## 环境变量

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
``` 