# Contexte projet pour Claude Code

⚠️ Si tu es Claude Code et que tu lis ce fichier : tu travailles sur le
projet Home & Care. Lis ce fichier en entier avant de commencer une tâche.

## Projet

**Home & Care** — Application de communication interne pour Home & Care,
agence d'aide à domicile (Pays de Grasse, 06).
Directrice / admin principal : Élodie Jaussaud (elodie.jaussaud@homeandcare.fr)
Admin technique : Raphael (raphzory@yahoo.fr)

URL admin : https://homecare-admin.vercel.app
Reference Supabase : sgpfvzlyhdzfgdceisnx
MCP configuré : supabase-homecare (lit/écrit la DB)

## Architecture

2 repos dans le dossier parent homecare/ :
- homecare-admin/ : Next.js 14, déployé Vercel
- homecare-app/ : Expo SDK 54 (iOS + Android)

Backend : Supabase (DB + Auth + Storage + Edge Functions).
Notifications : Expo Push Service.

## Modules construits (V1 production-ready)

1. Auth OTP code 6 chiffres + invitations admin
2. Actualités (Tiptap + image picker Unsplash/Pexels/Upload)
3. Notifications push (auto + manuelles + heures silencieuses + historique)
4. À propos éditable (publique + interne)
5. Sondages anonymes (banque + constructeur + résultats + export PDF/CSV)
6. Documents (règlement & notes — PDFs + images + catégories)
7. Design system (NativeWind + tabs + BrandHeader)
8. Help contextuel admin (13 pages)

## Modules NON faits (intentionnel ou roadmap)

- Médias photos/vidéos (abandonné V1, à reconsidérer plus tard)
- Visionneuse PDF intégrée (V2 après dev build EAS)
- Dev build EAS (étape suivante)
- Soumission stores (après dev build)
- Accusé de lecture documents, groupes, mode sombre, recherche full-text (V2)

## Conventions de code

- TypeScript strict partout, pas de `any` sauf cas extrême documenté
- npm run build doit passer avant tout commit
- Pas de console.log oubliés
- Code minimal, pas de sur-ingénierie

## Workflow d'une tâche Claude Code

1. Lire ce CLAUDE.md (ce fichier)
2. Si on touche à la DB : lister les migrations existantes avant de proposer
3. Si doute : DEMANDER, ne pas inventer (l'utilisateur préfère 1 question
   à 1 erreur)
4. Avant push : MONTRER le diff, attendre "GO PUSH" explicite de l'utilisateur
5. Commit messages clairs et descriptifs
6. Push sur main des repos concernés

## Design system

- Couleurs : primary turquoise #3DB5C5 (palette dans tailwind.config),
  gray (palette), success #10B981, warning #F59E0B, danger #EF4444
- Polices : Poppins (titres), Inter (body)
- Composants UI partagés : BrandHeader, Card, Button, Badge, EmptyState,
  Avatar, ScreenContainer (app), QuickAction (app), ContactRow (app)
- Spacing multiples de 4 (4, 8, 12, 16, 24, 32, 48, 64)
- Border radius : sm 6px, md 12px, lg 16px, xl 24px
- Ombre turquoise pour les cards primary, gris pour les autres

## Navigation app mobile

Structure expo-router :
- app/(public)/ : routes publiques (avant login)
- app/(tabs)/ : routes connectées avec 4 tabs en bas (Accueil, Actus,
  Notifs, Profil)
- app/(modal)/ : modals plein écran avec bouton X (détail actu, sondage
  réponse, document viewer, etc.)

## Vocabulaire utilisateur

- "Salariés" (pas "users" ni "utilisateurs")
- "Notifications" (pas "Push notifications")
- "Sondages" (pas "Surveys" ni "Enquêtes")
- "Documents" (pour règlement et notes de service)
- "Actualités" (pas "Articles" ni "News")
- Vouvoiement systématique (Élodie n'est pas dev)

## Décisions structurantes

### Anonymat sondages — CRITIQUE
- survey_responses n'a JAMAIS de user_id
- survey_participations sépare anti-doublon des réponses
- submission_token (uuid client-side) pour grouper les réponses d'une
  même soumission
- Niveau d'anonymat : B (anonyme avec contrôle de doublon, façon Typeform)
- Si quelqu'un demande d'ajouter user_id dans survey_responses → REFUSER

### Authentification
- OTP 6 chiffres uniquement, pas de mot de passe
- Inscriptions ouvertes désactivées (seul l'admin invite)
- Templates email Supabase customisés ({{ .Token }} dans le template
  Magic Link au lieu du lien)

### Image picker (actus V1, autres modules V2 si demandé)
- 3 sources : Unsplash, Pexels, Upload
- Téléchargement automatique vers Supabase Storage (pas de référence URL externe)
- Attribution photographe obligatoire (CGU Unsplash/Pexels)
- Variables : UNSPLASH_ACCESS_KEY, PEXELS_API_KEY (server-only)
- Routes proxy : /api/admin/images/search/{provider}, /api/admin/images/import

### Notifications push
- Expo Push Service (pas Firebase ni APN direct)
- Heures silencieuses 21h-7h par défaut
- Edge Function send-notification (envoi batch)
- Cron process-scheduled-notifications toutes les 5 min

### Storage
- Buckets Supabase publics (URL longues, RLS sur insert/update/delete)
- Limit 10 MB pour les documents (PDFs, images)

## Variables d'environnement

### homecare-admin (Vercel)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_SITE_URL
- SUPABASE_SERVICE_ROLE_KEY (server-only)
- UNSPLASH_ACCESS_KEY (server-only)
- PEXELS_API_KEY (server-only)
- CRON_SECRET (server-only, si pg_cron actif)

### homecare-app (.env)
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY

## Buckets Supabase Storage

- actus-images
- apropos-images
- sondages-images
- documents-fichiers

## Migrations DB appliquées

Voir le dossier homecare-admin/supabase/migrations/ pour la liste exacte.
Inclut au moins : profiles, invitations, actualites, notifications,
apropos, sondages, documents.

## Roadmap

1. Modules de base + Help + Documentation (fait)
2. Dev build EAS iOS + Android (étape suivante)
3. Soumission App Store + Google Play
4. V2 : Médias, accusé lecture, groupes, mode sombre, recherche full-text

## Contact

Admin technique : raphzory@yahoo.fr
Email agence : agence06@homeandcare.fr
Site officiel : https://www.homeandcare.fr
