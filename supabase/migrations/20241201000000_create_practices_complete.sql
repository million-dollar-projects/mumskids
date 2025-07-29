-- 创建完整的practices表
create table if not exists public.practices (
    -- 基础字段
    id uuid default gen_random_uuid() primary key,
    slug text not null unique,  -- 用于URL的唯一标识符
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references auth.users(id) on delete cascade not null,  -- 创建者ID
    
    -- 练习基本信息
    title text not null,  -- 练习标题
    description text not null default '',  -- 练习描述
    
    -- 小朋友信息
    child_name text not null,  -- 小朋友姓名
    gender text not null check (gender in ('boy', 'girl')),  -- 性别
    
    -- 练习设置
    difficulty text not null check (difficulty in ('within10', 'within20', 'within50', 'within100')),  -- 难度级别
    calculation_type text not null check (calculation_type in ('add', 'sub', 'addsub')),  -- 计算类型
    test_mode text not null default 'normal' check (test_mode in ('normal', 'timed')),  -- 测试模式
    question_count integer check (
        (test_mode = 'normal' and question_count between 5 and 50) or
        (test_mode = 'timed' and question_count is null)
    ),  -- 题目数量（一般模式下必填，计时模式下为空）
    time_limit integer check (
        (test_mode = 'timed' and time_limit between 1 and 30) or
        (test_mode = 'normal' and time_limit is null)
    ),  -- 时间限制（分钟，计时模式下必填，一般模式下为空）
    
    -- 可见性设置
    is_public boolean default false not null,  -- 是否公开
    
    -- 主题和奖励设置
    selected_theme text not null default 'default',  -- 选择的主题
    reward_distribution_mode text not null default 'random' check (reward_distribution_mode in ('random', 'choice')),  -- 奖励分配模式
    rewards jsonb not null default '[]'::jsonb,  -- 奖励列表
    
    -- 统计信息
    stats jsonb not null default '{}'::jsonb  -- 存储练习统计信息
);

-- 创建索引
create index practices_created_by_idx on public.practices(created_by);
create index practices_difficulty_idx on public.practices(difficulty);
create index practices_calculation_type_idx on public.practices(calculation_type);
create index practices_test_mode_idx on public.practices(test_mode);
create index practices_is_public_idx on public.practices(is_public);
create index practices_created_at_idx on public.practices(created_at desc);
create index practices_child_name_idx on public.practices(child_name);

-- 启用RLS (Row Level Security)
alter table public.practices enable row level security;

-- 创建RLS策略
create policy "Practices are viewable by everyone if public"
    on public.practices for select
    using (is_public = true);

create policy "Users can view their own practices"
    on public.practices for select
    using (auth.uid() = created_by);

create policy "Users can insert their own practices"
    on public.practices for insert
    with check (auth.uid() = created_by);

create policy "Users can update their own practices"
    on public.practices for update
    using (auth.uid() = created_by)
    with check (auth.uid() = created_by);

create policy "Users can delete their own practices"
    on public.practices for delete
    using (auth.uid() = created_by);

-- 创建更新updated_at的触发器
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger update_practices_updated_at
    before update on public.practices
    for each row
    execute function update_updated_at_column();

-- 创建生成随机slug的函数
create or replace function generate_practice_slug()
returns text as $$
declare
    chars text[] := '{a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,0,1,2,3,4,5,6,7,8,9}';
    result text := '';
    i integer := 0;
    max_attempts integer := 10;
    attempt integer := 0;
begin
    loop
        result := '';
        for i in 1..8 loop
            result := result || chars[1+random()*(array_length(chars, 1)-1)];
        end loop;
        
        -- 检查slug是否已存在
        if not exists (select 1 from public.practices where slug = result) then
            exit;
        end if;
        
        attempt := attempt + 1;
        if attempt >= max_attempts then
            -- 如果尝试太多次，增加长度
            for i in 1..4 loop
                result := result || chars[1+random()*(array_length(chars, 1)-1)];
            end loop;
            exit;
        end if;
    end loop;
    
    return result;
end;
$$ language plpgsql;

-- 创建自动生成slug的触发器
create or replace function auto_generate_slug()
returns trigger as $$
begin
    if new.slug is null or new.slug = '' then
        new.slug = generate_practice_slug();
    end if;
    return new;
end;
$$ language plpgsql;

create trigger auto_generate_practice_slug
    before insert on public.practices
    for each row
    execute function auto_generate_slug(); 