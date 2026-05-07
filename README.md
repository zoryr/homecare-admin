# homecare-admin

Espace administration Home & Care — Next.js 14 (App Router) + Supabase, déployé sur Vercel.

## Démarrer en local

```bash
npm install
cp .env.local.example .env.local
# remplir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

L'app tourne sur http://localhost:3000.

## Stack

- Next.js 14 App Router, TypeScript strict, Tailwind CSS
- Supabase (auth magic link, Postgres, Storage, RLS) via `@supabase/ssr`

## Structure

- `src/app/` — pages App Router
- `src/lib/supabase/client.ts` — client Supabase navigateur
- `src/lib/supabase/server.ts` — client Supabase Server Components / Route Handlers
- `src/middleware.ts` — refresh de session sur chaque requête
