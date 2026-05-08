# Home & Care · Admin

Interface d'administration de la plateforme de communication interne **Home & Care** (agence d'aide à domicile, Pays de Grasse). Permet à la direction de gérer les actualités, sondages, documents officiels, notifications push, et l'équipe (salariés + administrateurs).

## Stack

- **Framework** : Next.js 14 (App Router) — TypeScript strict
- **Style** : Tailwind CSS + design system maison (palette turquoise H&C, Poppins/Inter)
- **Backend** : Supabase (PostgreSQL + Auth OTP + Storage + Edge Functions)
- **Éditeur riche** : Tiptap (callouts colorés, médias)
- **Charts** : Recharts (résultats sondages)
- **PDF** : @react-pdf/renderer (export résultats sondages)
- **Drag & drop** : @dnd-kit (constructeur sondage, catégories documents)
- **Hébergement** : Vercel (auto-deploy sur push `main`)

## Modules disponibles

| Module | Description |
|---|---|
| **Authentification** | OTP code 6 chiffres (pas de mot de passe), invitations admin |
| **Tableau de bord** | Synthèse des activités récentes |
| **Actualités** | Articles riches avec couverture, callouts, épingle temporelle |
| **Notifications** | Push automatiques + manuelles, heures silencieuses, stats |
| **Sondages** | Banque de questions + constructeur drag&drop + résultats anonymes (graphiques + export PDF/CSV) |
| **Documents** | Règlement, notes de service, procédures (PDF + images, catégories libres) |
| **À propos** | Page éditable (versions publique + interne), coordonnées agence |
| **Équipe** | Gestion combinée des salariés et administrateurs |

## Prérequis

- Node.js **20+** et npm
- Accès au projet Supabase `homecare` (ref `sgpfvzlyhdzfgdceisnx`)
- Comptes API : Unsplash (gratuit, 50 req/h) et Pexels (gratuit)

## Setup local

```bash
# 1. Cloner
git clone https://github.com/zoryr/homecare-admin.git
cd homecare-admin

# 2. Installer
npm install

# 3. Variables d'env
cp .env.local.example .env.local
# Puis remplir les valeurs (voir section ci-dessous)

# 4. Lancer en dev
npm run dev
# → http://localhost:3000
```

Pour appliquer les migrations Supabase, deux options :
- via le **MCP `supabase-homecare`** (recommandé, automatique)
- ou en collant les fichiers `supabase/migrations/*.sql` manuellement dans le SQL Editor Supabase, dans l'ordre numérique

## Variables d'environnement

À placer dans `.env.local` (jamais commit). Exemple :

```env
# Supabase (publiques côté client)
NEXT_PUBLIC_SUPABASE_URL=https://sgpfvzlyhdzfgdceisnx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# URL canonique (utilisée pour les emails, deeplinks, défaults)
NEXT_PUBLIC_SITE_URL=https://homecare-admin.vercel.app

# Server-only (fuite = compromission totale)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Image picker (server-only, pas EXPO_PUBLIC ni NEXT_PUBLIC)
UNSPLASH_ACCESS_KEY=...
PEXELS_API_KEY=...

# Cron Vercel (auth des appels /api/cron/*)
CRON_SECRET=$(openssl rand -hex 32)
```

Sur Vercel, ces variables sont à définir dans **Settings → Environment Variables** (Production + Preview).

## Scripts

```bash
npm run dev     # serveur dev avec hot reload
npm run build   # build de production (passage tsc + lint)
npm run start   # serve le build
npm run lint    # eslint
```

**Avant chaque commit** : `npm run build` doit passer sans erreur.

## Cron jobs Vercel

Configurés dans `vercel.json`. Actifs en production seulement.

| Path | Schedule | Rôle |
|---|---|---|
| `/api/cron/close-expired-surveys` | `*/15 * * * *` | Ferme les sondages dont `close_at` est dépassé |

Le header `Authorization: Bearer ${CRON_SECRET}` est ajouté automatiquement par Vercel quand la route est listée dans `vercel.json`.

## Documentation projet

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — vue d'ensemble du système (admin + app + DB + storage + intégrations)
- [`docs/CLAUDE.md`](./docs/CLAUDE.md) — contexte projet pour Claude Code (à lire avant toute session)
- [`CHANGELOG.md`](./CHANGELOG.md) — historique des versions

## Liens

- Production : https://homecare-admin.vercel.app
- Repo app mobile : https://github.com/zoryr/homecare-app
- Dashboard Supabase : https://supabase.com/dashboard/project/sgpfvzlyhdzfgdceisnx

## Convention de commits

Style **Conventional Commits** :

- `feat(scope): …` — nouvelle fonctionnalité
- `fix(scope): …` — bug fix
- `chore: …` — tâche d'outillage / dépendances / config
- `docs: …` — documentation seulement
- `refactor: …` — refactor sans changement fonctionnel

Le scope est généralement le module concerné : `actus`, `sondages`, `documents`, `notifs`, `auth`, `ui`, `admin`.

## Licence

Privé. Tous droits réservés.
