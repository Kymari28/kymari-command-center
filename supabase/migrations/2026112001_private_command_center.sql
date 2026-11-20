create table public.command_center_tasks (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null,
  task jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.command_center_tasks enable row level security;
grant select, insert, update, delete on public.command_center_tasks to authenticated;

create policy "Users read their own Command Center tasks" on public.command_center_tasks
  for select to authenticated using (auth.uid() = user_id);
create policy "Users create their own Command Center tasks" on public.command_center_tasks
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update their own Command Center tasks" on public.command_center_tasks
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete their own Command Center tasks" on public.command_center_tasks
  for delete to authenticated using (auth.uid() = user_id);

create table public.command_center_meta (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.command_center_meta enable row level security;
grant select, insert, update, delete on public.command_center_meta to authenticated;

create policy "Users read their own Command Center settings" on public.command_center_meta
  for select to authenticated using (auth.uid() = user_id);
create policy "Users create their own Command Center settings" on public.command_center_meta
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update their own Command Center settings" on public.command_center_meta
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete their own Command Center settings" on public.command_center_meta
  for delete to authenticated using (auth.uid() = user_id);

alter publication supabase_realtime add table public.command_center_tasks;
alter publication supabase_realtime add table public.command_center_meta;
