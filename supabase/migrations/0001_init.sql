-- ============================================================
-- BUET CSE 1-1 Academic Calendar — Initial schema
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------
create type user_role as enum ('student', 'admin');

create type event_type as enum (
  'class_test', 'lab_exam', 'quiz', 'assignment', 'presentation',
  'project_deadline', 'viva', 'mid_term', 'final_exam', 'lab_report',
  'holiday', 'registration', 'department_notice', 'seminar', 'workshop', 'other'
);

-- ------------------------------------------------------------
-- PROFILES  (mirrors auth.users, one row per user)
-- ------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null,
  role user_role not null default 'student',
  photo text,
  batch text default '2029',
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, photo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- COURSES
-- ------------------------------------------------------------
create table courses (
  id uuid primary key default uuid_generate_v4(),
  course_code text not null unique,
  course_name text not null,
  course_color text not null default '#6366f1',
  semester text not null default 'Level-1 Term-1',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- EVENTS
-- ------------------------------------------------------------
create table events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text default '',
  course_id uuid references courses(id) on delete set null,
  event_type event_type not null default 'other',
  teacher text default '',
  location text default '',
  start_datetime timestamptz not null,
  end_datetime timestamptz not null,
  reminder_minutes int[] default '{10080, 4320, 1440, 360, 60}', -- 7d,3d,1d,6h,1h in minutes
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_start_idx on events (start_datetime);
create index events_course_idx on events (course_id);

create function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger events_set_updated_at
  before update on events
  for each row execute procedure public.set_updated_at();

-- Lightweight audit history
create table event_history (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  changed_by uuid references profiles(id),
  change_type text not null, -- 'created' | 'updated' | 'deleted'
  snapshot jsonb not null,
  changed_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- ANNOUNCEMENTS
-- ------------------------------------------------------------
create table announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  body text not null,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- HELPER: is the current user an admin?
-- ------------------------------------------------------------
create function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------
alter table profiles enable row level security;
alter table courses enable row level security;
alter table events enable row level security;
alter table event_history enable row level security;
alter table announcements enable row level security;

-- profiles: everyone (logged in) can read all profiles (needed for "added by"); only self can edit own basic fields; only admin can change role
create policy "profiles_select_all" on profiles for select using (auth.role() = 'authenticated');
create policy "profiles_update_self" on profiles for update using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from profiles p where p.id = auth.uid()));
create policy "profiles_admin_update_role" on profiles for update using (public.is_admin());

-- courses: everyone can read, only admin can write
create policy "courses_select_all" on courses for select using (auth.role() = 'authenticated');
create policy "courses_admin_insert" on courses for insert with check (public.is_admin());
create policy "courses_admin_update" on courses for update using (public.is_admin());
create policy "courses_admin_delete" on courses for delete using (public.is_admin());

-- events: everyone can read, only admin can write
create policy "events_select_all" on events for select using (auth.role() = 'authenticated');
create policy "events_admin_insert" on events for insert with check (public.is_admin());
create policy "events_admin_update" on events for update using (public.is_admin());
create policy "events_admin_delete" on events for delete using (public.is_admin());

-- event_history: everyone can read, system/admin inserts
create policy "history_select_all" on event_history for select using (auth.role() = 'authenticated');
create policy "history_admin_insert" on event_history for insert with check (public.is_admin());

-- announcements: everyone can read, only admin can write
create policy "announcements_select_all" on announcements for select using (auth.role() = 'authenticated');
create policy "announcements_admin_insert" on announcements for insert with check (public.is_admin());
create policy "announcements_admin_update" on announcements for update using (public.is_admin());
create policy "announcements_admin_delete" on announcements for delete using (public.is_admin());

-- ------------------------------------------------------------
-- SEED: default courses for CSE Level-1 Term-1
-- ------------------------------------------------------------
insert into courses (course_code, course_name, course_color, semester) values
  ('CSE 101', 'Structured Programming', '#6366f1', 'Level-1 Term-1'),
  ('CSE 102', 'Structured Programming Lab', '#8b5cf6', 'Level-1 Term-1'),
  ('EEE-163', 'Introduction to Electrical Circuits', '#0ea5e9', 'Level-1 Term-1'),
  ('EEE-164', 'Electrical Circuits Lab', '#06b6d4', 'Level-1 Term-1'),
  ('Math-141', 'calculas I', '#f59e0b', 'Level-1 Term-1'),
  ('Physics-129', 'Physics', '#10b981', 'Level-1 Term-1'),
  ('Physics-114', 'Physics Sessional', '#ef4444', 'Level-1 Term-1'),
  ('CSE-103', 'Discrete Math', '#ec4899', 'Level-1 Term-1');

-- ------------------------------------------------------------
-- To promote the first admin, run manually after your first login:
-- update profiles set role = 'admin' where email = 'you@example.com';
-- ------------------------------------------------------------
