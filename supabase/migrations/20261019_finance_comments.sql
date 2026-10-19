-- Finance notes comment thread (moderation via approved flag)
create table if not exists public.finance_comments (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  author_name text not null,
  author_email text,
  body text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists finance_comments_slug_approved_idx
  on public.finance_comments (slug, approved, created_at);

alter table public.finance_comments enable row level security;

-- Public read of approved comments only
drop policy if exists "finance_comments_public_read" on public.finance_comments;
create policy "finance_comments_public_read"
  on public.finance_comments
  for select
  using (approved = true);

-- Inserts go through service role / server; optional anon insert of pending rows
drop policy if exists "finance_comments_anon_insert" on public.finance_comments;
create policy "finance_comments_anon_insert"
  on public.finance_comments
  for insert
  to anon, authenticated
  with check (approved = false);
