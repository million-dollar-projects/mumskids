-- 创建practices表
create table if not exists public.practices (
    id uuid default gen_random_uuid() primary key,
    slug text not null unique,  -- 用于URL的唯一标识符
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references auth.users(id) on delete cascade not null,  -- 创建者ID
    is_public boolean default false not null,  -- 是否公开
    difficulty text not null check (difficulty in ('within10', 'within20', 'within50', 'within100')),  -- 难度级别
    question_count integer not null check (question_count between 5 and 30),  -- 题目数量
    metadata jsonb not null default '{}'::jsonb,  -- 存储标题、描述、奖励等信息
    child_info jsonb not null default '{}'::jsonb,  -- 存储小朋友信息
    stats jsonb not null default '{}'::jsonb  -- 存储练习统计信息
);

-- 创建索引
create index practices_created_by_idx on public.practices(created_by);
create index practices_difficulty_idx on public.practices(difficulty);
create index practices_is_public_idx on public.practices(is_public);
create index practices_created_at_idx on public.practices(created_at desc);

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
begin
    for i in 1..8 loop
        result := result || chars[1+random()*(array_length(chars, 1)-1)];
    end loop;
    return result;
end;
$$ language plpgsql; 