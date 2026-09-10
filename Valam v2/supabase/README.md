# VALAM Supabase setup

1. Create a Supabase project.
2. In **SQL Editor**, paste and run `migrations/20260910_001_valam_mvp.sql`.
3. In **Authentication → Providers**, enable Email and require email confirmation.
4. Add your local address (`http://localhost:5173`) and Vercel URL to **Authentication → URL Configuration**.
5. Configure custom SMTP before accepting real registrations. Do not use the default email sender in production.
6. In **Storage**, create private buckets named `receipts` and `farm-files` only once the upload feature is enabled.

Never put a Supabase service-role key in the Vite app or in `.env.example`.
