# Architecture du projet Home & Care

Vue d'ensemble du système (admin + app + DB + storage + intégrations).

## Repos

| Repo | Rôle | Stack | Hébergement |
|---|---|---|---|
| `homecare-admin/` | Interface d'administration web | Next.js 14 App Router | Vercel (auto-deploy) |
| `homecare-app/` | Application mobile salariés | Expo SDK 54 (iOS + Android) | EAS Build / stores |

## Stack technique

- **Backend** : Supabase (PostgreSQL + Auth OTP + Storage + Edge Functions + Realtime)
- **Admin web** : Next.js 14 App Router, TypeScript strict, Tailwind CSS, Tiptap, Recharts, @react-pdf/renderer, @dnd-kit
- **App mobile** : Expo SDK 54, expo-router (file-based, tabs avec routes cachées via `href: null`), NativeWind, TypeScript strict
- **Authentification** : Supabase Auth en **OTP code 6 chiffres** (pas de mots de passe)
- **Notifications push** : Expo Push Service via Edge Function Supabase
- **Hébergement** : Vercel (admin), Supabase (DB + storage)

## Modules fonctionnels

| Module | Description | Tables principales |
|---|---|---|
| Auth | OTP code 6 chiffres, invitations admin uniquement | `profiles`, `invitations` |
| Actualités | Articles riches (Tiptap, callouts colorés), images Unsplash/Pexels/Upload, épingle temporelle | `actualites` |
| Notifications | Push automatiques + manuelles, heures silencieuses, stats Vu/Cliqué | `notifications`, `notification_deliveries`, `device_tokens`, `notification_settings` |
| À propos | 2 versions éditables (publique avant login / interne), coordonnées agence | `apropos` |
| Sondages | Anonymes avec contrôle de doublon, 6 types de questions, résultats agrégés | `survey_questions`, `surveys`, `survey_items`, `survey_participations`, `survey_responses` |
| Documents | PDFs + images, catégories libres avec couleurs, visionneuse via OS | `documents`, `document_categories` |

## Tables Supabase (résumé)

### Auth & équipe
- **`profiles`** : ligne par utilisateur (lié à `auth.users`). Champs clés : `email`, `prenom`, `nom`, `role` (`'admin' | 'salarie'`), `actif`. RLS : self-read, admins-all.
- **`invitations`** : invitations envoyées par les admins. Trigger `mark_invitation_accepted` lors du signup.

### Actualités
- **`actualites`** : `titre`, `description`, `corps` (HTML Tiptap), `image_couverture_url`, `image_source` (jsonb pour attribution), `tags[]`, `statut` (`brouillon | publie`), `featured_jusqua`. RLS : actives lecture des `publie`.

### Notifications
- **`notifications`** : enveloppe d'envoi (titre, message, source, audience, scheduled_at, sent_at).
- **`notification_deliveries`** : 1 ligne par destinataire avec `read_at`, `clicked_at` (stats).
- **`device_tokens`** : tokens Expo Push par appareil.
- **`notification_settings`** : singleton (id=1) avec toggles auto, heures silencieuses.

### À propos
- **`apropos`** : 2 lignes (version `publique` / `interne`) avec contenu + coordonnées.

### Sondages
- **`survey_questions`** : banque réutilisable (type, titre, options jsonb, tags).
- **`surveys`** : enveloppe (titre, description, statut, dates).
- **`survey_items`** : éléments du sondage (question / texte / image / section_break) avec ordre.
- **`survey_participations`** : `(survey_id, user_id)` UNIQUE → anti-doublon. **Aucune réponse stockée ici.**
- **`survey_responses`** : réponses brutes avec `submission_token` (UUID client). **Aucun `user_id` stocké ici.**

### Documents
- **`document_categories`** : catégories libres (nom, couleur, ordre).
- **`documents`** : fichier (URL + nom + taille + mime), catégorie, statut, épingle, notif_envoyee.

## Buckets Storage

| Bucket | Contenu | Public ? |
|---|---|---|
| `actus-images` | Images des actualités (imports Unsplash/Pexels + uploads + couvertures de sondages/documents) | oui |
| `apropos-images` | Images de la page À propos | oui |
| `sondages-images` | Images intercalaires des sondages (V1 — usage limité) | oui |
| `documents-fichiers` | PDFs et images du module Documents | oui |

Les buckets sont **publics en lecture** (URL longues, accès par devinette difficile). RLS strictes sur **insert / update / delete** : seuls les admins authentifiés peuvent écrire.

## Migrations Supabase

État actuel (12 migrations appliquées, dossier `homecare-admin/supabase/migrations/`) :

1. `01_init_profiles.sql` — Table `profiles` + RLS + trigger `handle_new_user`
2. `02_fix_admin_rls_recursion.sql` — Fonction `is_admin()` + correction RLS récursion
3. `03_invitations.sql` — Table `invitations` + trigger `mark_invitation_accepted`
4. `04_promote_first_admin.sql` — UPDATE pour promouvoir Élodie en admin
5. `05_lockdown_definer_functions.sql` — Verrouillage `SECURITY DEFINER` (search_path explicite)
6. `06_actualites.sql` — Module Actualités + bucket `actus-images`
7. `07_notifications.sql` — Tables notifs + Edge Function send-notification
8. `08_apropos.sql` — Module À propos + bucket `apropos-images`
9. `09_actualites_image_source.sql` — Colonne `image_source jsonb` pour attribution
10. `10_sondages.sql` — Module Sondages (5 tables) + bucket `sondages-images`
11. `11_survey_questions_read_policy.sql` — Policy salariés peuvent lire les questions des sondages publiés
12. `12_documents.sql` — Module Documents + bucket `documents-fichiers`

Application via le **MCP `supabase-homecare`** (préféré) ou collage manuel dans le SQL Editor.

## Variables d'environnement

### homecare-admin (Next.js / Vercel)

| Variable | Côté | Rôle |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + serveur | URL projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + serveur | Clé anon (RLS appliquée) |
| `NEXT_PUBLIC_SITE_URL` | client + serveur | URL canonique (emails, deeplinks) |
| `SUPABASE_SERVICE_ROLE_KEY` | **serveur uniquement** | Bypass RLS — fuite = compromission |
| `UNSPLASH_ACCESS_KEY` | **serveur uniquement** | API Unsplash (50 req/h en gratuit) |
| `PEXELS_API_KEY` | **serveur uniquement** | API Pexels |
| `CRON_SECRET` | **serveur uniquement** | Auth des routes `/api/cron/*` |

### homecare-app (Expo / EAS)

| Variable | Rôle |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | URL projet Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Clé anon |

Préfixe `EXPO_PUBLIC_` = embarqué dans le bundle JS livré aux téléphones. **N'y mettre que ce qui est sûr d'être public.** L'`anon key` est conçue pour l'être.

## Intégrations externes

- **Unsplash API** — Recherche d'images dans l'éditeur d'actualités. Route proxy `/api/admin/images/search/unsplash` (clé serveur).
- **Pexels API** — Recherche alternative. Route proxy `/api/admin/images/search/pexels`.
- **Expo Push Service** — Envoi des notifications push (gratuit, illimité, pas de Firebase ni APN à gérer). Edge Function `send-notification` traite l'envoi en batch.
- **Vercel Cron** — `/api/cron/close-expired-surveys` toutes les 15 min (fermeture auto des sondages avec `close_at` dépassé). Auth via header `Authorization: Bearer ${CRON_SECRET}`.

## Flux d'authentification

1. L'admin invite un salarié (email + prénom + nom) depuis `/admin/equipe`
2. Supabase envoie un email avec un **code à 6 chiffres**
3. Sur l'app mobile, le salarié saisit son email puis le code reçu
4. Une session est créée, le profil `profiles` est rempli automatiquement (trigger `handle_new_user`), l'invitation est marquée `accepted_at` (trigger `mark_invitation_accepted`)
5. Accès complet à l'app si `actif = true`

Les inscriptions ouvertes sont **désactivées** côté Supabase : seules les invitations admin créent des comptes.

## Flux d'anonymat des sondages (CRITIQUE)

Le module sondages garantit un anonymat de niveau B (anonyme avec contrôle de doublon, façon Typeform/Tally) :

- **`survey_responses`** ne contient **AUCUN `user_id`**. Chaque réponse est marquée d'un `submission_token` (UUID v4 généré client-side au moment du submit).
- **`survey_participations`** ne contient **AUCUNE réponse**. Juste `(survey_id, user_id)` UNIQUE pour empêcher un même salarié de répondre 2 fois.
- Aucune jointure n'est possible entre les deux tables.

Côté admin, la page résultats affiche les agrégats par question + la liste des participants (qui a répondu). **Mais jamais qui a répondu quoi.**

L'ordre des inserts côté mobile (`responses` puis `participation`) garantit qu'un crash entre les deux laisse au pire des réponses orphelines (acceptable) plutôt qu'une participation sans réponse (bloquerait le user).

## Décisions structurantes

- **Pas de mots de passe** : authentification OTP exclusivement (UX mobile + sécurité)
- **Pas de système de groupes/équipes** : tous les salariés actifs sont destinataires des notifs (sélection ad hoc possible pour les notifs manuelles)
- **Anonymat sondages niveau B** : préserve la franchise des réponses tout en évitant les doublons
- **Storage public** : URL longues + RLS sur `INSERT`/`UPDATE`/`DELETE` uniquement. Lecture libre (le contenu n'est pas confidentiel)
- **Notifications via Expo Push Service** : gratuit, illimité, pas de Firebase ni APN à gérer directement
- **Pages "modales" hébergées dans `(tabs)/` côté app** avec `href: null` → la tab bar reste visible partout
- **Layout admin full-width** (pas de `max-w-6xl mx-auto`) → logo collé à gauche, nav directement à droite

## Cron jobs

| Path | Schedule | Rôle |
|---|---|---|
| `/api/cron/close-expired-surveys` | `*/15 * * * *` | Ferme les sondages dont `close_at` est dépassé |

Définis dans `homecare-admin/vercel.json`. Auth via `CRON_SECRET`.

## Edge Functions Supabase

- **`send-notification`** : reçoit un `notification_id`, lit la table `notifications` + `device_tokens`, envoie en batch via Expo Push, met à jour `notification_deliveries`.
- **`process-scheduled-notifications`** (cron interne Supabase) : toutes les 5 min, scanne les notifications avec `scheduled_at` dépassé et appelle `send-notification` pour chacune.

## Limites volontaires V1

- Pas de visionneuse PDF intégrée mobile (passe par l'OS via `expo-sharing`)
- Pas de graphiques dans les exports PDF des sondages (tableaux only)
- Pas de mode sombre
- Pas de recherche full-text dans les actus / documents
- Pas d'accusé de lecture sur les documents
- Pas de versioning des documents

Toutes ces limitations sont documentées dans les CHANGELOGs et adressables en V2.
