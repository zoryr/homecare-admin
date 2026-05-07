# homecare-admin

Espace administration Home & Care — Next.js 14 (App Router) + Supabase, déployé sur Vercel.

## Variables d'environnement

```
NEXT_PUBLIC_SUPABASE_URL=https://sgpfvzlyhdzfgdceisnx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000   # ou l'URL Vercel en prod
SUPABASE_SERVICE_ROLE_KEY=<service role key — JAMAIS exposer>
```

`SUPABASE_SERVICE_ROLE_KEY` n'est lue que dans des Route Handlers / Server Components. Elle ne
porte pas le préfixe `NEXT_PUBLIC_` exprès — Next.js refuse alors de l'inliner côté client.

## Démarrer en local

```bash
npm install
cp .env.local.example .env.local
# remplir les 4 variables
npm run dev
# http://localhost:3000
```

## Flow d'authentification

1. Un admin invite un salarié depuis `/admin/salaries` (modal "Inviter un salarié").
2. Le salarié reçoit un email avec un lien magique.
3. Le clic l'envoie sur `/auth/callback` qui échange le code contre une session.
4. La ligne `profiles` est créée automatiquement (trigger `handle_new_user`).
5. L'invitation est marquée `accepted_at` (trigger `mark_invitation_accepted`).

Connexion d'un admin déjà existant : `/login` → email → lien magique → `/admin/dashboard`.

## Structure

- `src/app/` — pages App Router
- `src/app/login/` — page de connexion magic link
- `src/app/auth/callback/` — Route Handler qui termine l'auth flow
- `src/app/admin/` — espace admin protégé (layout vérifie `role='admin'` + `actif=true`)
- `src/app/api/admin/invite` — POST, invite un salarié via service role
- `src/app/api/admin/toggle-actif` — POST, active/désactive un salarié
- `src/lib/supabase/client.ts` — client navigateur
- `src/lib/supabase/server.ts` — client Server Components / Route Handlers
- `src/lib/supabase/admin.ts` — client service role (server-only)
- `src/lib/supabase/get-profile.ts` — helper qui lit le profile courant
- `src/middleware.ts` — refresh session + protection `/admin/*`
- `src/components/Toast.tsx` — provider + hook `useToast`
- `supabase/migrations/` — SQL à coller dans le SQL Editor de Supabase
