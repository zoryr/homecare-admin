-- 31 — La vidéo de bienvenue ne doit se jouer qu'à la première connexion.
--
-- Problème : l'app marquait la vidéo comme vue avec un UPDATE direct sur
-- profiles. Aucune policy n'autorise un salarié à modifier sa propre fiche
-- (seuls les admins peuvent), donc l'écriture ne passait jamais et la vidéo
-- repartait à chaque connexion.
--
-- On n'ouvre pas profiles en UPDATE aux salariés : une policy RLS porte sur la
-- ligne entière, pas sur une colonne, et le salarié pourrait alors changer son
-- rôle ou se réactiver. On passe par une fonction SECURITY DEFINER qui ne
-- touche qu'à la colonne video_bienvenue_vue_le de sa propre ligne.

create or replace function public.marquer_video_bienvenue_vue()
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
     set video_bienvenue_vue_le = coalesce(video_bienvenue_vue_le, now())
   where id = (select auth.uid());
$$;

comment on function public.marquer_video_bienvenue_vue() is
  'Marque la vidéo de bienvenue comme vue pour l''utilisateur courant. Appelée par l''app à la fin de la vidéo.';

revoke all on function public.marquer_video_bienvenue_vue() from public, anon;
grant execute on function public.marquer_video_bienvenue_vue() to authenticated;

-- Les comptes existants ont déjà vu la présentation pendant les tests : on ne
-- la leur rejoue pas. Les comptes créés ensuite la verront une fois.
update public.profiles
   set video_bienvenue_vue_le = now()
 where video_bienvenue_vue_le is null;
