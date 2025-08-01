-- 添加允许通过slug访问练习的策略
-- 这个策略允许任何人通过slug访问练习，无论是否登录或练习是否公开

create policy "Anyone can view practices by slug"
    on public.practices for select
    using (true);  -- 允许所有查询，因为API层会处理访问控制 