create table if not exists profiles (
  id uuid primary key,
  email text unique not null,
  role text check (role in ('owner', 'influencer')) not null,
  created_at timestamptz default now()
);

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id),
  business_name text not null,
  business_type text not null,
  location text,
  neighborhood text,
  phone text,
  language text,
  instagram_handle text,
  buffer_token text,
  customer_emails text[],
  customer_phones text[],
  created_at timestamptz default now()
);

create table if not exists creators (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  name text,
  instagram_handle text,
  niche text,
  location text,
  followers int,
  engagement_rate numeric,
  rate_per_post numeric,
  bio text,
  is_available boolean default true
);

create table if not exists posts_generated (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id),
  prompt_used text,
  instagram_caption text,
  whatsapp_message text,
  email_subject text,
  email_body text,
  sms_text text,
  image_url text,
  platform text,
  created_at timestamptz default now()
);

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id),
  type text check (type in ('email', 'sms', 'both')),
  subject text,
  message text,
  sent_count int default 0,
  status text check (status in ('draft', 'sent', 'scheduled')) default 'draft',
  created_at timestamptz default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id),
  creator_id uuid references creators(id),
  match_score int,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamptz default now()
);

create table if not exists outreach_messages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id),
  creator_id uuid references creators(id),
  message_text text,
  status text check (status in ('draft', 'sent')) default 'draft',
  created_at timestamptz default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date text,
  location text,
  neighborhood text,
  expected_attendance int,
  relevant_niches text[],
  description text
);
