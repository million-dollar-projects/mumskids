-- 修改 practices 表，添加测试方式相关的字段
alter table public.practices
    -- 添加 test_mode 字段
    add column if not exists test_mode text not null default 'normal' check (test_mode in ('normal', 'timed')),
    -- 修改 question_count 字段，允许为空（因为计时模式下不需要固定题目数量）
    alter column question_count drop not null,
    alter column question_count drop constraint if exists practices_question_count_check,
    add constraint practices_question_count_check check (
        (test_mode = 'normal' and question_count between 5 and 30) or
        (test_mode = 'timed' and question_count is null)
    ),
    -- 添加 time_limit 字段（单位：分钟）
    add column if not exists time_limit integer check (
        (test_mode = 'timed' and time_limit between 1 and 15) or
        (test_mode = 'normal' and time_limit is null)
    );

-- 创建测试方式的索引
create index if not exists practices_test_mode_idx on public.practices(test_mode);

-- 更新现有记录
update public.practices
set test_mode = 'normal'
where test_mode is null; 