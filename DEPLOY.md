# Deploy Automated Next js app Opt A

Built with ZipForge.

## Vercel
1. Push this folder to GitHub
2. Import in Vercel → Framework: Next.js
3. Add env vars (see .env.example):
   - NEXT_PUBLIC_SUPABASE_URL=https://orlbbnausqmpkjwtkvvn.supabase.co
   - NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase Dashboard → API>
4. Deploy

## Supabase
1. Supabase Dashboard → SQL Editor → paste supabase/migration.sql → Run
2. Authentication → enable Email if your app uses auth
3. Storage → create buckets listed in migration.sql if needed

## Local
```bash
npm install
npm run build
npm start
```
