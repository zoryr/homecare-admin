# Changelog

Toutes les modifications notables de **homecare-admin** sont documentées ici.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) et le projet suit (de loin) [Semantic Versioning](https://semver.org/lang/fr/).

## [Non publié]

### Ajouté
- **Système de help contextuel** sur toutes les pages admin
  - Bouton flottant turquoise en bas à droite (visible partout)
  - Drawer slide-in 480px avec 4 sections collapsibles (À quoi sert / Comment / Conseils / FAQ)
  - 13 pages d'aide rédigées en français bienveillant (dashboard, actualités, notifs, sondages, documents, à propos, équipe…)
  - `AutoHelpButton` qui détecte la route via `usePathname()` — aucune modif des pages cibles
  - Lien support email dans le footer du panneau
- **Documentation projet** : `README.md` réécrit, `CHANGELOG.md`, `docs/ARCHITECTURE.md` (vue d'ensemble système), `docs/CLAUDE.md` (contexte pour Claude Code)

## [0.10.0] — 2026-05-08

### Ajouté
- **Module Documents** : règlement intérieur, notes de service, procédures
  - Tables `documents` + `document_categories` (migration 12) + bucket Storage `documents-fichiers`
  - Page liste `/admin/documents` avec grille de cards, filtres titre/catégorie/statut sticky
  - Page éditeur `/admin/documents/[id]` : drag&drop d'upload (PDF, JPG, PNG, WEBP — max 10 MB), description, choix de catégorie, image de couverture optionnelle, épingle temporelle
  - `CategoriesModal` : gestion drag&drop des catégories (palette 7 couleurs, suppression `SET NULL` sur les docs liés)
  - 9 routes API : CRUD documents, publish/unpublish (avec auto-notification `auto_reglement`), CRUD catégories, reorder
  - `ImagePicker` rendu paramétrable (`bucket` + `folder`)

### Modifié
- **AdminNav** : fusion des onglets Salariés + Admins en un seul onglet **Équipe** (`/admin/equipe?role=…`) avec toggle pills
- **Layout admin** : header passé en pleine largeur, logo collé à gauche, nav alignée à gauche, actions à droite via `ml-auto`

## [0.9.0] — 2026-05-08

### Ajouté
- **Module Sondages — Résultats admin**
  - Page `/admin/sondages/[id]/resultats` : KPI bar (taux de réponse + donut SVG), filtres date + recherche sticky, section participants collapse
  - Charts Recharts : `ChoiceBarChart`, `RatingBarChart` (avec moyenne + étoiles dorées), `YesNoPieChart` (donut + % central), `TextResponsesList` (pagination + highlight)
  - API `/results` (agrégation JS), `/export/csv` (RFC 4180 + BOM utf-8 pour Excel), `/export/pdf` (`@react-pdf/renderer`)
  - Bouton "Voir les résultats" sur SurveyBuilder (visible si `statut !== 'brouillon'`)

### Corrigé
- Colonne `survey_participations.submitted_at` (pas `created_at`) dans les routes results et export PDF
- Migration 11 : RLS `salaries_read_used_questions` pour autoriser les salariés à lire les questions des sondages publiés
- Notifications : deeplinks corrigés (sans préfixe `(modal)` après restructuration mobile)

## [0.8.0] — 2026-05-08

### Ajouté
- **Module Sondages — Constructeur**
  - Page liste `/admin/sondages` (cards + filtres titre/statut + sub-tabs)
  - Page constructeur `/admin/sondages/[id]` (2 colonnes : Infos+Publication / Items dnd-kit)
  - 4 types d'items : question (depuis banque ou création éclair), texte, image, section_break
  - `QuestionPickerModal` (banque) + `QuickQuestionModal` (création éclair)
  - 8 routes API : CRUD sondages, items, reorder, publish/close/reopen
  - Auto-notification `auto_sondage` à la première publication
  - Cron Vercel `/api/cron/close-expired-surveys` (`*/15 * * * *`) avec `CRON_SECRET`

## [0.7.0] — 2026-05-08

### Ajouté
- **Module Sondages — Banque de questions**
  - Migration 10 (5 tables : survey_questions, surveys, survey_items, survey_participations, survey_responses) + bucket sondages-images
  - Page banque de questions avec 6 types (choix unique/multiple, étoiles, smileys, oui/non, texte libre)
  - `QuestionEditor` complet avec preview live et tags

## [0.6.0] — 2026-05-07

### Ajouté
- **Image picker Unsplash + Pexels + Upload** dans l'éditeur d'actualités
  - Routes proxy server-only `/api/admin/images/search/{provider}` (clés API protégées)
  - Route `/api/admin/images/import` : télécharge l'image originale dans le bucket `actus-images`, retourne URL + attribution
  - Attribution photographe stockée dans `image_source jsonb` (migration 09)

### Corrigé
- Trim des clés API server-side et messages d'erreur 401 plus clairs

## [0.5.0] — 2026-05-07

### Modifié
- **Refonte design** : palette turquoise H&C (`#3DB5C5`), polices Poppins/Inter, composants Card/Button/Badge/BrandHeader homogénéisés

### Ajouté
- **Aperçu mobile live** dans l'éditeur d'actualités (iframe avec rendu identique)

## [0.4.0] — 2026-05-07

### Ajouté
- **Module Notifications** complet
  - Composer manuel (audience all/sélection, scheduled_at)
  - Auto-notifications sur publish actu / sondage / règlement (toggles dans `notification_settings`)
  - Heures silencieuses 21h-7h (configurables)
  - Edge Function `send-notification` (Expo Push Service) + cron `process-scheduled-notifications`
  - Historique avec stats "Vu par X / Y"
- **Module À propos** : page éditable (versions publique + interne), coordonnées agence

### Corrigé
- Deeplink des notifications : passage à `/(modal)/...` (puis simplifié plus tard sans le groupe)

## [0.3.0] — 2026-05-07

### Ajouté
- **Module Actualités** avec éditeur Tiptap (callouts colorés Info / Conseil / Attention / Important)
- Statut brouillon/publié, épingle temporelle (`featured_jusqua`)
- Modal édition / désactivation d'un membre (`EditMemberModal`)
- Email d'invitation via Supabase Auth Admin API

## [0.2.0] — 2026-05-07

### Modifié
- **Authentification** : passage de magic link à **OTP code 6 chiffres** (UX mobile bien meilleure, pas de redirection email→app à gérer)

## [0.1.0] — 2026-05-07

### Ajouté
- Setup initial Next.js 14 (App Router) + Supabase
- Authentification magic link
- Migration 01 : table `profiles` + RLS
- Migration 02 : fonction `is_admin()` + correction RLS récursion
- Migration 03 : système d'invitations + trigger `mark_invitation_accepted`
- Gestion des salariés et admins (séparés à l'origine, fusionnés en 0.10.0)

### Sécurité
- Migration 05 : verrouillage `SECURITY DEFINER` des fonctions trigger (search_path explicite)
