-- ArchiveAI — Initial Schema (v1.1)
-- Run this in your Supabase SQL Editor or save as a migration
-- ──────────────────────────────────────────────────────────

-- 1. PROFILES
-- Extends Supabase Auth. One row per user.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  subscription_status text not null default 'trial' check (subscription_status in ('trial', 'active', 'cancelled', 'past_due')),
  stripe_customer_id text,
  generation_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. POSTS
-- Every post from the user's LinkedIn archive.
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  published_at timestamptz,
  likes integer not null default 0,
  comments integer not null default 0,
  shares integer not null default 0,
  post_type text check (post_type in ('hook-driven-story', 'framework', 'hot-take', 'listicle', 'question', 'other')),
  hook_style text,
  performance_percentile integer check (performance_percentile between 0 and 100),
  is_reused boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_posts_user_id on public.posts(user_id);
create index idx_posts_performance on public.posts(user_id, performance_percentile desc);

alter table public.posts enable row level security;
create policy "Users can read own posts" on public.posts for select using (auth.uid() = user_id);
create policy "Users can insert own posts" on public.posts for insert with check (auth.uid() = user_id);
create policy "Users can update own posts" on public.posts for update using (auth.uid() = user_id);
create policy "Users can delete own posts" on public.posts for delete using (auth.uid() = user_id);


-- 3. VOICE PROFILES
-- AI-generated voice analysis. One row per user.
create table public.voice_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  profile_summary text not null,
  traits text[] not null default '{}',
  post_count_analyzed integer not null default 0,
  confidence_level text not null default 'limited' check (confidence_level in ('full', 'limited', 'bootstrap-only')),
  structural_patterns jsonb,
  last_updated_at timestamptz not null default now()
);

alter table public.voice_profiles enable row level security;
create policy "Users can read own voice profile" on public.voice_profiles for select using (auth.uid() = user_id);
create policy "Users can upsert own voice profile" on public.voice_profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own voice profile" on public.voice_profiles for update using (auth.uid() = user_id);


-- 4. GENERATED POSTS
-- Every post ArchiveAI creates.
create table public.generated_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source_post_id uuid references public.posts(id) on delete set null,
  prompt text not null,
  output text not null,
  format text not null,
  model_used text not null default 'claude-haiku-3.5',
  rating text check (rating in ('sounds_like_me', 'doesnt_sound_like_me')),
  created_at timestamptz not null default now()
);

create index idx_generated_posts_user_id on public.generated_posts(user_id);

alter table public.generated_posts enable row level security;
create policy "Users can read own generated posts" on public.generated_posts for select using (auth.uid() = user_id);
create policy "Users can insert own generated posts" on public.generated_posts for insert with check (auth.uid() = user_id);
create policy "Users can update own generated posts" on public.generated_posts for update using (auth.uid() = user_id);


-- 5. VOICE QUESTIONNAIRE RESPONSES (NEW in v1.1)
-- Bootstrap path for users with < 30 posts.
create table public.voice_questionnaire_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  responses jsonb not null default '[]',
  selected_archetype text,
  created_at timestamptz not null default now()
);

alter table public.voice_questionnaire_responses enable row level security;
create policy "Users can read own questionnaire" on public.voice_questionnaire_responses for select using (auth.uid() = user_id);
create policy "Users can upsert own questionnaire" on public.voice_questionnaire_responses for insert with check (auth.uid() = user_id);
create policy "Users can update own questionnaire" on public.voice_questionnaire_responses for update using (auth.uid() = user_id);


-- 6. WRITING SAMPLES (NEW in v1.1)
-- External writing samples to supplement voice profile.
create table public.writing_samples (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  source_label text,
  created_at timestamptz not null default now()
);

create index idx_writing_samples_user_id on public.writing_samples(user_id);

alter table public.writing_samples enable row level security;
create policy "Users can read own samples" on public.writing_samples for select using (auth.uid() = user_id);
create policy "Users can insert own samples" on public.writing_samples for insert with check (auth.uid() = user_id);
create policy "Users can delete own samples" on public.writing_samples for delete using (auth.uid() = user_id);


-- 7. ENGAGEMENT SELF-REPORTS (NEW in v1.1)
-- Monthly self-reported engagement tracking.
create table public.engagement_self_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  engagement_trend text not null check (engagement_trend in ('increased', 'decreased', 'same')),
  posts_per_week integer,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_engagement_reports_user_id on public.engagement_self_reports(user_id);

alter table public.engagement_self_reports enable row level security;
create policy "Users can read own reports" on public.engagement_self_reports for select using (auth.uid() = user_id);
create policy "Users can insert own reports" on public.engagement_self_reports for insert with check (auth.uid() = user_id);


-- Updated_at trigger (reusable)
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
