-- ============================================================
-- 케어스크립트 Supabase 설정  (한 번만 실행하면 됩니다)
-- Supabase 대시보드 → 프로젝트 → 왼쪽 메뉴 "SQL Editor" → 붙여넣고 Run
-- ============================================================

create table if not exists public.carescript (
  id         text primary key,
  content    jsonb       not null default '{}'::jsonb,
  rev        bigint      not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.carescript (id, content, rev)
values ('default', '{}'::jsonb, 0)
on conflict (id) do nothing;

alter table public.carescript enable row level security;

-- 케어노트와 동일: 링크를 아는 사람은 누구나 읽고 쓸 수 있음
drop policy if exists carescript_read   on public.carescript;
drop policy if exists carescript_insert on public.carescript;
drop policy if exists carescript_update on public.carescript;

create policy carescript_read   on public.carescript for select using (true);
create policy carescript_insert on public.carescript for insert with check (true);
create policy carescript_update on public.carescript for update using (true) with check (true);

-- 실시간 구독 등록 (이미 등록돼 있으면 조용히 넘어감)
do $$
begin
  alter publication supabase_realtime add table public.carescript;
exception
  when duplicate_object then null;
  when others then null;
end $$;

-- 확인용
select id, rev, updated_at from public.carescript;
