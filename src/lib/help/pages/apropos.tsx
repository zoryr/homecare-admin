import { HelpCircle, Info, Lightbulb, MousePointerClick } from 'lucide-react';

import type { HelpPage } from '../types';

export const apropos: HelpPage = {
  id: 'apropos',
  title: 'À propos',
  subtitle: 'Pages publique et interne',
  sections: [
    {
      icon: Info,
      title: 'À quoi sert cette page ?',
      content: (
        <>
          <p>
            Vous éditez ici <strong>deux pages distinctes</strong>&nbsp;:
          </p>
          <ul>
            <li>
              <strong>Page publique</strong>&nbsp;: ce que voient les visiteurs <em>avant</em>{' '}
              connexion sur l’app — typiquement quand un nouveau salarié installe l’app pour la
              première fois.
            </li>
            <li>
              <strong>Page interne</strong>&nbsp;: ce que voient les salariés depuis l’app, dans
              la rubrique «&nbsp;À propos&nbsp;» (présentation de l’agence, contacts directs).
            </li>
          </ul>
        </>
      ),
    },
    {
      icon: MousePointerClick,
      title: 'Comment ça marche ?',
      content: (
        <>
          <p>
            Deux <strong>onglets</strong> en haut de la page&nbsp;: <em>Publique</em> et{' '}
            <em>Interne</em>. Cliquez pour basculer entre les deux versions.
          </p>
          <h4>Pour chaque onglet, vous éditez&nbsp;:</h4>
          <ul>
            <li>
              <strong>Image de couverture</strong>&nbsp;: visuel principal en haut de page.
            </li>
            <li>
              <strong>Titre</strong> et <strong>sous-titre</strong>&nbsp;: la baseline d’accueil.
            </li>
            <li>
              <strong>Contenu riche</strong> (Tiptap)&nbsp;: même éditeur que pour les actualités
              (gras, italique, listes, callouts colorés, images inline…).
            </li>
            <li>
              <strong>Coordonnées de contact</strong>&nbsp;: téléphone, email, adresse, horaires,
              liens vers les réseaux sociaux. Affichés sur la page interne pour que les salariés
              vous joignent en un tap.
            </li>
          </ul>
          <p>
            Bouton <strong>Enregistrer</strong> en bas&nbsp;: les modifications sont visibles
            immédiatement côté app (pas besoin de «&nbsp;publier&nbsp;»).
          </p>
        </>
      ),
    },
    {
      icon: Lightbulb,
      title: 'Conseils & bonnes pratiques',
      content: (
        <>
          <ul>
            <li>
              <strong>Page publique courte et accueillante</strong>. C’est la première impression
              d’un nouvel arrivant. Présentez l’agence en 2-3 paragraphes maximum.
            </li>
            <li>
              <strong>Page interne plus détaillée</strong>. Vos salariés en place peuvent y
              retrouver l’histoire de l’agence, les valeurs, les avantages…
            </li>
            <li>
              <strong>Coordonnées à jour</strong>&nbsp;: vérifiez régulièrement que les téléphones
              et emails sont corrects. Les salariés s’en servent en cas de pépin.
            </li>
            <li>
              <strong>Une belle photo</strong> de l’équipe ou du local rend la page plus humaine
              qu’un visuel générique.
            </li>
          </ul>
        </>
      ),
    },
    {
      icon: HelpCircle,
      title: 'Questions fréquentes',
      content: (
        <dl>
          <dt>Comment voir le rendu côté salarié&nbsp;?</dt>
          <dd>
            Ouvrez l’app sur votre téléphone, connectez-vous, et allez dans <em>Profil →
            Mon profil → À propos</em>. Pour la version publique, déconnectez-vous et regardez
            l’écran d’accueil.
          </dd>
          <dt>Y a-t-il un brouillon&nbsp;?</dt>
          <dd>
            Non, contrairement aux actus. Tout enregistrement est immédiatement visible. Pour
            travailler sur une version sans la diffuser, écrivez le texte ailleurs (ex&nbsp;:
            Notes) et collez quand vous êtes prêt(e).
          </dd>
        </dl>
      ),
    },
  ],
};
