# Contexte projet pour Claude Code

⚠️ Si tu es Claude Code et que tu lis ce fichier&nbsp;: tu travailles sur le projet **Home & Care**. Lis ce fichier en entier avant de commencer n'importe quelle tâche.

---

## Identité du projet

**Home & Care** — Application de communication interne pour Home & Care, agence d'aide à domicile basée sur le **Pays de Grasse** (Mouans-Sartoux, 06).

- Directrice / admin principal : **Élodie Jaussaud** (`elodie.jaussaud@homeandcare.fr`)
- Admin technique : Raphaël Zory (`raphzory@yahoo.fr`)
- URL admin (Vercel) : https://homecare-admin.vercel.app
- Reference Supabase : `sgpfvzlyhdzfgdceisnx`

## Architecture

2 repos dans le dossier parent `homecare/` :

```
homecare/
├── homecare-admin/   # Next.js 14, déployé sur Vercel
└── homecare-app/     # Expo SDK 54 (iOS + Android)
```

Backend partagé : Supabase (DB + Auth + Storage + Edge Functions).

Pour la vue technique complète, lire `docs/ARCHITECTURE.md`.

## Modules construits (à jour)

| Module | Statut |
|---|---|
| Auth OTP + invitations | ✅ Live |
| Actualités (Tiptap, image picker Unsplash/Pexels/Upload) | ✅ Live |
| Notifications (auto + manuelles + heures silencieuses + stats) | ✅ Live |
| À propos (publique + interne) | ✅ Live |
| Sondages anonymes (banque + constructeur + résultats + export PDF/CSV) | ✅ Live |
| Documents (PDF + images, catégories libres, visionneuse via OS) | ✅ Live |
| Help contextuel admin (13 pages) | ✅ Live |

12 migrations Supabase appliquées (jusqu'à `12_documents.sql`).

## Conventions de code

### TypeScript
- **Strict mode** activé partout (`tsconfig.json` → `strict: true`)
- **PAS de `any`** (sauf cas extrême documenté avec commentaire)
- Préférer les types explicites aux inférences silencieuses

### Style
- **Pas de `console.log` oubliés** (ESLint warning)
- **Pas de fichiers inutiles** : suppression au refactor
- **Code minimal**, pas de sur-ingénierie
- Avant chaque commit côté admin : `npm run build` doit passer
- Avant chaque commit côté app : `npx tsc --noEmit` doit passer
- Les `// TODO` sont OK mais doivent être tracés (issue, ticket, ou commentaire de la session)

### Design system

**Couleurs** (mêmes valeurs côté admin et app) :
- Primary turquoise `#3DB5C5` (palette `brand-50` → `brand-900` côté Tailwind, `colors.primary.*` côté RN)
- Gray (palette `ink-*` côté admin, `colors.gray.*` côté app)
- Success `#10B981`, warning `#F59E0B`, danger `#EF4444`

**Polices** :
- Titres : **Poppins** (`Poppins_600SemiBold`, `Poppins_700Bold`)
- Body : **Inter** (`Inter_400Regular`, `Inter_500Medium`, `Inter_600SemiBold`)

**Composants UI partagés** :
- Admin : `Card`, `Button` (`btn-primary`, `btn-secondary`), `Toast`, `BrandHeader`-équivalent
- App : `BrandHeader`, `Card`, `Button`, `Badge`, `EmptyState`, `Avatar`, `ScreenContainer`, `QuickAction`, `ContactRow`, `Separator`, `ModalHeader`, `PressableRow`, `HeaderCloseButton`

**Spacing** : multiples de 4 (4, 8, 12, 16, 24, 32, 48, 64).
**Border radius** : `sm` 6 / `md` 12 / `lg` 16 / `xl` 24 / `full` 9999.
**Shadows** : turquoise pour les cards primary, gray pour les autres (cf `theme/spacing.ts`).

### Navigation app mobile (expo-router)

```
app/
├── (public)/          # avant login (index, login)
└── (tabs)/            # après login, tab bar visible partout
    ├── _layout.tsx    # Tabs avec 4 visibles + plusieurs href:null
    ├── home.tsx
    ├── actualites/    # Stack : index + [id]
    ├── notifications.tsx
    ├── profil.tsx
    ├── sondages/      # Stack masqué de la tab bar
    ├── documents/     # idem
    ├── apropos.tsx    # masqué
    └── parametres.tsx # masqué
```

⚠️ **Le groupe `(modal)` n'existe plus** — il a été supprimé dans la restructuration de mai 2026. Toutes les "modales" sont maintenant dans `(tabs)/` avec `href: null` pour ne pas apparaître dans la tab bar tout en gardant celle-ci visible.

Helper `safeBack()` dans `src/lib/nav.ts` : utilise `router.canGoBack()` puis fallback sur `/home`. **Toujours préférer `safeBack()` à `router.back()` direct** pour éviter les erreurs `GO_BACK not handled` sur deeplink/refresh web.

### Vocabulaire utilisateur

Toujours en français, vouvoiement systématique (Élodie n'est pas dev) :
- **"Salariés"** (pas "users", "utilisateurs", "employees")
- **"Notifications"** (pas "Push notifications")
- **"Sondages"** (pas "Surveys" ni "Enquêtes")
- **"Documents"** (pour le règlement et les notes de service)
- **"Actualités"** (pas "Articles" ni "News")
- **"Équipe"** (regroupe Salariés + Administrateurs depuis mai 2026)
- **"Brouillon" / "Publié" / "Fermé"** (statuts)

Évite le jargon technique dans les UI : pas de "rate limit", "RLS", "uuid"… mais "limite", "accès", "identifiant".

## Décisions structurantes

### Authentification
- **OTP code 6 chiffres uniquement** (pas de mot de passe)
- Code valable 60 min, généré par Supabase
- **Inscriptions désactivées** : seules les invitations admin créent des comptes
- Templates email à modifier dans le dashboard Supabase (Auth → Email Templates)

### Anonymat sondages — CRITIQUE
La table `survey_responses` n'a **JAMAIS** de `user_id`.
- `survey_participations` lie `user_id` ↔ `survey_id` (anti-doublon UNIQUEMENT)
- `survey_responses` utilise un `submission_token` (UUID v4 généré côté client au moment du submit)
- Aucune jointure possible entre les deux tables
- Niveau d'anonymat : **B** (anonyme avec contrôle de doublon, façon Typeform/Tally)

Côté code mobile : insert des `responses` AVANT la `participation`. Si crash entre les deux → réponses orphelines (acceptable). L'inverse bloquerait le user (participation sans réponses → impossible de re-répondre).

### Notifications push
- **Expo Push Service** (pas Firebase ni APN direct)
- 3 toggles globaux : `auto_on_actu_publish`, `auto_on_reglement_publish`, `auto_on_sondage_create`
- **Heures silencieuses 21h-7h** activées par défaut (configurables)
- Edge Function `send-notification` traite l'envoi en batch
- Cron Supabase `process-scheduled-notifications` toutes les 5 min pour les envois programmés

### Storage
- Buckets Supabase **publics en lecture** (URL longues, RLS sur INSERT/UPDATE/DELETE)
- Sous-dossiers organisés par catégorie ou par id
- **Limite 10 MB** pour les documents (PDFs, images)

### Image picker (actus + couvertures de docs/sondages)
- 3 sources : Unsplash, Pexels, Upload
- **Téléchargement automatique vers Supabase Storage** (pas de référence URL externe — protège contre les disparitions)
- Attribution photographe stockée dans `image_source jsonb` (`{ provider, photographer_name, photographer_url, source_url }`)
- Variables d'env : `UNSPLASH_ACCESS_KEY`, `PEXELS_API_KEY` (server-only, jamais en `NEXT_PUBLIC_*`)
- Routes proxy : `/api/admin/images/search/{provider}`, `/api/admin/images/import`

## Workflow Claude Code

### Quand on commence une tâche
1. **Lire ce fichier** (`docs/CLAUDE.md`) en entier
2. Lire `docs/ARCHITECTURE.md` pour la vue technique
3. Si on touche à la DB : vérifier l'état des migrations existantes (`ls supabase/migrations/`) avant d'en créer une nouvelle
4. **Demander si doute, NE PAS inventer** — vaut mieux 1 question que 1 jour de refactor

### Quand on push
1. **MONTRER le diff** avant push (`git diff --stat` puis `git diff` ciblé si gros)
2. Attendre **"GO PUSH"** explicite de l'utilisateur
3. Commit message clair, style Conventional Commits (`feat(scope):`, `fix(scope):`, `chore:`, `docs:`, `refactor:`)
4. Push sur `main` du / des repos concernés
5. Vercel redéploie automatiquement l'admin sur push `main`

### MCP disponibles
- **`supabase-homecare`** (ref `sgpfvzlyhdzfgdceisnx`) : peut appliquer les migrations directement, exécuter du SQL, voir les logs / advisors
- **Vercel** : déploiements automatiques, logs runtime

### Variables d'env (à ne PAS commit)
Voir `docs/ARCHITECTURE.md` section "Variables d'environnement". Les `.env.local` (admin) et `.env` (app) sont dans `.gitignore`.

## Limitations connues / TODO V2

- **Visionneuse PDF intégrée** mobile (actuellement via `expo-sharing` → l'OS choisit l'app ; à remplacer par `react-native-pdf` après dev build EAS)
- **Module Médias** (galerie photos/vidéos) volontairement non implémenté V1
- **Graphiques dans les exports PDF** des sondages (actuellement tableaux only ; canvas → image base64 prévu V2)
- **Accusé de lecture** sur les documents (V2 si demandé)
- **Système de groupes/équipes** pour les notifs ciblées (V2)
- **Recherche full-text** dans les actus et documents (V2)
- **Mode sombre** (V2)

## Roadmap

À faire dans l'ordre :

1. ✅ Setup + Auth + Modules de base
2. ✅ Help contextuel + Documentation (cette session)
3. ⏳ Dev build EAS (iOS + Android) + tests sur téléphones réels
4. ⏳ Soumission App Store + Google Play Store
5. ⏳ Modules optionnels V2 (Médias, accusé lecture, groupes…)

## Pièges connus / leçons apprises

- **`.maybeSingle()` qui hangait sur web** (Supabase JS + react-native-url-polyfill) → utiliser `.limit(1)` puis filtre JS. Cf commit `3bba37c`.
- **HEAD requests CORS hang** (`select('*', { count: 'exact', head: true })`) → utiliser `.select('id', { count: 'exact' }).limit(1)`. Cf commit `b67741d`.
- **expo-router strict typed routes** : `/sondages/index` est interprété comme la route `[id]` avec `id="index"`. Toujours utiliser `'/sondages' as Href`. Cf commit `13b74d7`.
- **expo-file-system v19** a une nouvelle API. Pour la compatibilité, utiliser l'export legacy : `import * as FileSystem from 'expo-file-system/legacy';`.
- **react-pdf renderToBuffer** demande `ReactElement<DocumentProps>`. Si on wrappe le `<Document>` dans un autre composant, caster `as unknown as ReactElement<DocumentProps>` (cf `src/app/api/admin/sondages/[id]/export/pdf/route.ts`).
- **RLS oubliée** : la table `survey_questions` n'avait initialement aucune policy salarié → migration 11 ajoutée pour permettre la lecture des questions des sondages publiés.
- **Colonne `submitted_at`** (pas `created_at`) sur `survey_participations`. Toujours vérifier le SQL de la migration avant de coder les queries.

## Contact & support

- Bugs critiques / questions techniques : `raphzory@yahoo.fr`
- Problèmes utilisateurs Élodie : `support@homeandcare.fr` (placeholder, à confirmer)
