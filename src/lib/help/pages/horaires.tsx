import { HelpCircle, Info, Lightbulb, MousePointerClick } from 'lucide-react';

import type { HelpPage } from '../types';

export const horaires: HelpPage = {
  id: 'horaires',
  title: 'Horaires',
  subtitle: "Horaires d'ouverture du bureau",
  sections: [
    {
      icon: Info,
      title: 'À quoi sert cette page ?',
      content: (
        <>
          <p>
            Ces horaires alimentent le <strong>widget de l&apos;accueil de l&apos;app</strong> qui
            indique en temps réel si l&apos;agence est <strong>ouverte</strong>, en{' '}
            <strong>pause déjeuner</strong> ou <strong>fermée</strong>, avec l&apos;heure de
            réouverture.
          </p>
          <p>
            Les <strong>jours fériés français</strong> sont fermés automatiquement — vous n&apos;avez
            rien à faire pour eux.
          </p>
        </>
      ),
    },
    {
      icon: MousePointerClick,
      title: 'Comment ça marche ?',
      content: (
        <>
          <h4>Horaires hebdomadaires</h4>
          <p>
            Pour chaque jour&nbsp;: cochez <strong>Ouvert</strong> et renseignez les plages du{' '}
            <strong>matin</strong> et de l&apos;<strong>après-midi</strong> (laissez la pause entre
            les deux). Cliquez <strong>Enregistrer</strong> sur la ligne. Un jour «&nbsp;Fermé&nbsp;»
            n&apos;a pas d&apos;horaires.
          </p>
          <h4>Fermetures exceptionnelles</h4>
          <p>
            Ajoutez une <strong>plage de dates</strong> (congés, pont, travaux…) avec une raison
            facultative. Pendant cette période, l&apos;agence est affichée comme fermée.
          </p>
        </>
      ),
    },
    {
      icon: Lightbulb,
      title: 'Bonnes pratiques',
      content: (
        <ul>
          <li>La modification est prise en compte <strong>immédiatement</strong> dans l&apos;app (temps réel).</li>
          <li>Pour un même horaire tous les jours ouvrés, renseignez-les une fois et reportez-les.</li>
          <li>Pas besoin de gérer les jours fériés : ils sont automatiques.</li>
        </ul>
      ),
    },
    {
      icon: HelpCircle,
      title: 'Questions fréquentes',
      content: (
        <dl>
          <dt>Le widget ne reflète pas mon changement&nbsp;?</dt>
          <dd>Vérifiez que la ligne du jour a bien été «&nbsp;Enregistrée&nbsp;». La mise à jour est instantanée côté app.</dd>
          <dt>Comment fermer juste un après-midi&nbsp;?</dt>
          <dd>Laissez les champs de l&apos;après-midi vides pour ce jour (seul le matin sera ouvert).</dd>
        </dl>
      ),
    },
  ],
};
