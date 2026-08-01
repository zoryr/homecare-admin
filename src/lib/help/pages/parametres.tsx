import { HelpCircle, Info, MousePointerClick } from 'lucide-react';

import type { HelpPage } from '../types';

export const parametres: HelpPage = {
  id: 'parametres',
  title: 'Paramètres',
  subtitle: 'Réglages généraux de l\'app',
  sections: [
    {
      icon: Info,
      title: 'Vidéo de bienvenue',
      content: (
        <>
          <p>
            Vous pouvez diffuser une <strong>vidéo de bienvenue</strong> qui s&apos;affiche en
            plein écran à chaque salarié lors de sa <strong>1re connexion</strong> à l&apos;app,
            juste avant l&apos;accueil.
          </p>
          <p>Le salarié peut la passer après le délai que vous définissez.</p>
        </>
      ),
    },
    {
      icon: MousePointerClick,
      title: 'Comment ça marche ?',
      content: (
        <ul>
          <li>
            <strong>Uploader une vidéo</strong> (MP4 ou MOV, max 100 Mo). Un aperçu s&apos;affiche.
          </li>
          <li>
            <strong>Activer</strong> la vidéo avec la case à cocher.
          </li>
          <li>
            <strong>Délai avant de passer</strong>&nbsp;: nombre de secondes pendant lesquelles le
            bouton «&nbsp;Passer&nbsp;» est masqué (compte à rebours). 5 s par défaut.
          </li>
          <li>
            Cliquez <strong>Enregistrer les modifications</strong>. La prise en compte est immédiate.
          </li>
          <li>
            <strong>Remplacer</strong> ou <strong>Supprimer</strong> la vidéo à tout moment.
          </li>
        </ul>
      ),
    },
    {
      icon: HelpCircle,
      title: 'Questions fréquentes',
      content: (
        <dl>
          <dt>Un salarié revoit-il la vidéo à chaque ouverture&nbsp;?</dt>
          <dd>
            Non&nbsp;: elle n&apos;apparaît qu&apos;à la 1re connexion. Chaque salarié peut la
            <strong> revoir</strong> ensuite depuis son profil.
          </dd>
          <dt>Si je remplace la vidéo, les salariés la revoient-ils&nbsp;?</dt>
          <dd>
            Seuls ceux qui ne l&apos;avaient pas encore vue la verront. (Le suivi est par salarié.)
          </dd>
          <dt>Quel format conseillé&nbsp;?</dt>
          <dd>MP4 (H.264), format paysage ou vertical selon votre montage, moins de 100 Mo.</dd>
        </dl>
      ),
    },
  ],
};
