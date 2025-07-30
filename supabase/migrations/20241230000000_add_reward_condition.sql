-- 添加奖励条件字段到practices表
alter table public.practices 
add column reward_condition jsonb default null;

-- 添加注释
comment on column public.practices.reward_condition is '奖励获得条件，包含mode、targetCorrect、maxTime、minCorrect、maxErrorRate等字段';