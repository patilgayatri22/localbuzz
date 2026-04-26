# LocalBuzz

AI marketing platform for small businesses with owner and influencer dashboards.

## Stack

- Next.js + Tailwind CSS
- Supabase-ready client and schema
- Gemini (`gemini-2.0-flash`) route integration
- Pollinations AI image generation
- Resend email route integration
- Twilio SMS route integration
- Buffer social posting route integration

## Setup

1. Copy `.env.example` to `.env.local`
2. Fill in API keys
3. Run:

```bash
npm install
npm run dev
```

## Key Routes

- `/` landing page
- `/owner/dashboard`
- `/owner/ai-assistant`
- `/owner/events`
- `/owner/influencers`
- `/owner/campaign`
- `/influencer/dashboard`
- `/influencer/opportunities`
- `/influencer/collaborations`

## Supabase

Run SQL from `supabase-schema.sql` in your Supabase SQL editor.
