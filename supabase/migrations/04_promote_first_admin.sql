-- À exécuter APRÈS qu'Elodie ait fait sa 1re connexion magic link
-- (sinon la ligne profiles n'existe pas encore et le UPDATE est no-op)
update public.profiles
set role = 'admin', actif = true
where email = 'elodie.jaussaud@homeandcare.fr';
