# Bootstrap hugo@cypheme.com as admin

One-off data insert into `public.site_config` so your existing account becomes admin without re-running Setup.

## What I'll insert

- `admin_user_id` = `8b204d52-ab25-449b-bfcd-c9ef19ea8eef` (hugo@cypheme.com)
- `admin_leaderboard_token` = freshly generated 32-byte base64url random string (server-side via `gen_random_bytes`, never hardcoded)

After this, the Admin button shows up in your dashboard header and the leaderboard links work.
