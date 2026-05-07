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
- `supabase/migrations/` — migrations SQL à coller dans le SQL Editor de Supabase

## Promouvoir un compte en admin

La table `profiles` est peuplée par un trigger sur `auth.users` : la ligne d'un nouvel
utilisateur n'existe **qu'après sa première connexion magic link**. Donc pour promouvoir
quelqu'un en admin :

1. Le futur admin se connecte une 1re fois via magic link (cela crée sa ligne `profiles`).
2. Exécuter dans le SQL Editor :
   ```sql
   update public.profiles set role = 'admin' where email = 'son@email.fr';
   ```

Si on lance le `update` avant la 1re connexion, il ne touche aucune ligne (silencieusement).
