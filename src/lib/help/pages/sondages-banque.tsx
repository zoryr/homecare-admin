import { HelpCircle, Info, Lightbulb, MousePointerClick } from 'lucide-react';

import type { HelpPage } from '../types';

export const sondagesBanque: HelpPage = {
  id: 'sondages_banque',
  title: 'Banque de questions',
  subtitle: 'Bibliothèque réutilisable',
  sections: [
    {
      icon: Info,
      title: 'À quoi sert cette page ?',
      content: (
        <>
          <p>
            La <strong>banque</strong> regroupe toutes les questions que vous avez écrites, pour
            que vous puissiez les <strong>réutiliser</strong> d’un sondage à l’autre.
          </p>
          <p>
            Une question créée ici peut servir dans plusieurs sondages — pratique pour comparer
            les évolutions d’une période à l’autre.
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
              <strong>Créer</strong>&nbsp;: bouton «&nbsp;+ Nouvelle question&nbsp;».
            </li>
            <li>
              <strong>Filtrer</strong>&nbsp;: par tag (bien-être, planning, formation…) ou par
              type (choix unique, étoiles, smileys…).
            </li>
            <li>
              <strong>Modifier</strong>&nbsp;: clic sur la card. Attention, le type d’une question
              déjà utilisée dans un sondage est verrouillé.
            </li>
            <li>
              <strong>Supprimer</strong>&nbsp;: uniquement les questions non utilisées dans un
              sondage.
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
              <strong>Construisez votre banque en avance</strong>. C’est plus efficace que
              d’écrire à la dernière minute en construisant un sondage.
            </li>
            <li>
              <strong>Tags cohérents</strong>&nbsp;: utilisez les mêmes tags d’un sondage à
              l’autre pour pouvoir filtrer facilement.
            </li>
            <li>
              <strong>Testez vos formulations</strong>. Une question mal écrite donne des résultats
              inutilisables.
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
          <dt>Pourquoi je ne peux pas supprimer une question&nbsp;?</dt>
          <dd>
            Cette question est utilisée dans un ou plusieurs sondages. Si vous la supprimez, les
            réponses déjà collectées seraient invalidées. Retirez-la d’abord du / des sondages
            concernés (en mode brouillon), puis revenez ici pour la supprimer.
          </dd>
          <dt>Puis-je créer une question directement depuis le constructeur&nbsp;?</dt>
          <dd>
            Oui, via le bouton <em>+ Nouvelle question</em> dans le constructeur. Elle sera
            automatiquement ajoutée à la banque pour réutilisation future.
          </dd>
        </dl>
      ),
    },
  ],
};
