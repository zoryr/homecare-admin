import { HelpCircle, Info, Lightbulb, MousePointerClick } from 'lucide-react';

import type { HelpPage } from '../types';

export const actualitesListe: HelpPage = {
  id: 'actualites_liste',
  title: 'Actualités',
  subtitle: 'Toutes vos actualités en un coup d’œil',
  sections: [
    {
      icon: Info,
      title: 'À quoi sert cette page ?',
      content: (
        <>
          <p>
            Cette page liste <strong>toutes les actualités</strong> que vous avez créées, publiées
            ou laissées en brouillon. C’est l’endroit pour&nbsp;:
          </p>
          <ul>
            <li>Créer une nouvelle actualité</li>
            <li>Retrouver une actu existante (recherche par titre ou filtre par statut)</li>
            <li>Modifier ou dépublier une actu</li>
          </ul>
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
              <strong>Créer</strong> une actu&nbsp;: cliquez sur «&nbsp;+ Nouvelle actualité&nbsp;»
              en haut à droite.
            </li>
            <li>
              <strong>Filtrer</strong>&nbsp;: utilisez les pills «&nbsp;Tous / Brouillons /
              Publiés&nbsp;» pour ne voir qu’un statut à la fois.
            </li>
            <li>
              <strong>Rechercher</strong>&nbsp;: tapez quelques mots du titre dans le champ de
              recherche.
            </li>
            <li>
              <strong>Modifier</strong>&nbsp;: cliquez sur la card de l’actu — vous arrivez sur
              l’éditeur.
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
              Visez <strong>1 actu par semaine</strong>. Trop, et l’équipe se désintéresse&nbsp;;
              trop peu, et l’app perd son sens.
            </li>
            <li>
              Une <strong>image attractive</strong> dans la card augmente fortement le taux
              d’ouverture côté mobile.
            </li>
            <li>
              La <strong>description courte</strong> (sous le titre dans la liste) doit donner envie
              de cliquer en 1 ligne.
            </li>
            <li>
              Pour les annonces très importantes, <strong>épinglez</strong> l’actu en haut de la
              liste (jusqu’à une date précise).
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
          <dt>Quelle est la différence entre brouillon et publié&nbsp;?</dt>
          <dd>
            Un <strong>brouillon</strong> est invisible pour les salariés&nbsp;: il vous sert
            d’aire de travail. Une fois <strong>publié</strong>, l’actu apparaît dans l’app et
            (selon vos réglages) une notification est envoyée à toute l’équipe.
          </dd>
          <dt>Comment épingler une actu&nbsp;?</dt>
          <dd>
            Ouvrez l’actu, cochez «&nbsp;Épingler en haut&nbsp;» et choisissez la date jusqu’à
            laquelle elle doit rester en avant. Au-delà, elle redescend dans la liste classique.
          </dd>
          <dt>Puis-je supprimer une actu déjà publiée&nbsp;?</dt>
          <dd>
            Oui. Mais préférez la repasser en brouillon si vous comptez la réutiliser plus tard.
          </dd>
        </dl>
      ),
    },
  ],
};
