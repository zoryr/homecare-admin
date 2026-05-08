import { HelpCircle, Info, Lightbulb, MousePointerClick } from 'lucide-react';

import type { HelpPage } from '../types';

export const sondagesListe: HelpPage = {
  id: 'sondages_liste',
  title: 'Sondages',
  subtitle: 'Liste de tous vos sondages',
  sections: [
    {
      icon: Info,
      title: 'À quoi sert cette page ?',
      content: (
        <>
          <p>
            Cette page liste <strong>tous les sondages</strong> que vous avez créés, qu’ils soient
            en brouillon, publiés ou fermés. Vous pouvez aussi accéder ici à la{' '}
            <em>Banque de questions</em>, qui vous permet de réutiliser des questions déjà rédigées.
          </p>
        </>
      ),
    },
    {
      icon: MousePointerClick,
      title: 'Comment ça marche ?',
      content: (
        <>
          <ul>
            <li>
              <strong>Créer un sondage</strong>&nbsp;: bouton «&nbsp;+ Nouveau sondage&nbsp;» en
              haut à droite. Vous arrivez sur le constructeur (voir la page d’aide dédiée).
            </li>
            <li>
              <strong>Filtrer par statut</strong>&nbsp;: pills «&nbsp;Tous / Brouillons / Publiés /
              Fermés&nbsp;».
            </li>
            <li>
              <strong>Rechercher</strong> par titre via le champ de recherche.
            </li>
            <li>
              <strong>Ouvrir un sondage</strong>&nbsp;: clic sur la card. S’il est publié ou fermé,
              le bouton «&nbsp;Voir les résultats&nbsp;» apparaît dans le constructeur.
            </li>
            <li>
              Les onglets <em>Mes sondages</em> et <em>Banque de questions</em> permettent de
              basculer entre les sondages eux-mêmes et les questions réutilisables.
            </li>
          </ul>
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
              <strong>Sondages courts</strong> (5 à 10 questions). Au-delà, le taux de réponse
              chute&nbsp;: vos salariés abandonnent.
            </li>
            <li>
              <strong>Régularité</strong>&nbsp;: 1 sondage trimestriel court vaut mieux qu’un gros
              sondage annuel. Vous comparez les évolutions.
            </li>
            <li>
              <strong>Anonymat</strong>&nbsp;: rappelez systématiquement dans la description que
              les réponses sont anonymes. Cela libère la parole.
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
          <dt>Brouillon, publié, fermé — quelle différence&nbsp;?</dt>
          <dd>
            <strong>Brouillon</strong>&nbsp;: en construction, invisible pour les salariés.{' '}
            <strong>Publié</strong>&nbsp;: les salariés peuvent y répondre.{' '}
            <strong>Fermé</strong>&nbsp;: les réponses sont closes, mais les résultats restent
            consultables.
          </dd>
          <dt>Comment voir les résultats d’un sondage&nbsp;?</dt>
          <dd>
            Cliquez sur la card du sondage publié ou fermé&nbsp;: dans la page d’édition, un bouton
            «&nbsp;Voir les résultats&nbsp;» apparaît en haut à droite.
          </dd>
          <dt>Puis-je supprimer un sondage&nbsp;?</dt>
          <dd>
            Seulement les <strong>brouillons</strong>. Une fois publié, le sondage est conservé
            (avec ses réponses) pour préserver l’historique.
          </dd>
        </dl>
      ),
    },
  ],
};
