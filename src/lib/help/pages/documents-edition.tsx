import { HelpCircle, Info, Lightbulb, MousePointerClick } from 'lucide-react';

import type { HelpPage } from '../types';

export const documentsEdition: HelpPage = {
  id: 'documents_edition',
  title: 'Édition d’un document',
  subtitle: 'Uploader et publier',
  sections: [
    {
      icon: Info,
      title: 'À quoi sert cette page ?',
      content: (
        <>
          <p>
            C’est ici que vous <strong>déposez le fichier</strong> du document, choisissez sa
            catégorie, et décidez quand le publier (avec ou sans notification).
          </p>
        </>
      ),
    },
    {
      icon: MousePointerClick,
      title: 'Comment ça marche ?',
      content: (
        <>
          <h4>1. Le fichier</h4>
          <p>
            Glissez-déposez votre fichier sur la zone dédiée, ou cliquez pour ouvrir le sélecteur.
            Formats acceptés&nbsp;: <strong>PDF, JPG, PNG, WEBP</strong>. Max{' '}
            <strong>10 Mo</strong>. Une fois uploadé, vous pouvez le télécharger pour vérifier, le
            remplacer ou le supprimer.
          </p>

          <h4>2. Les informations</h4>
          <p>
            <strong>Titre</strong> (obligatoire), <strong>Description</strong> (résumé court qui
            apparaît dans la liste), <strong>Catégorie</strong> (à choisir parmi celles que vous
            avez créées — bouton «&nbsp;Gérer&nbsp;» pour en créer une nouvelle sans quitter la
            page).
          </p>

          <h4>3. L’image de couverture (optionnelle)</h4>
          <p>
            Si vous ne mettez rien&nbsp;: l’app affichera un placeholder selon le type (icône PDF
            rouge / icône image bleue). Sinon, choisissez via Unsplash, Pexels ou en téléversant
            une image. Pour les documents qui sont eux-mêmes des images, un bouton spécial
            «&nbsp;Utiliser l’image du document comme couverture&nbsp;» est disponible.
          </p>

          <h4>4. La publication</h4>
          <ul>
            <li>
              <strong>Épingler en haut</strong>&nbsp;: le document apparaît en avant dans la liste
              côté salarié (jusqu’à la date que vous choisissez, +7 jours par défaut).
            </li>
            <li>
              <strong>Notifier l’équipe à la publication</strong>&nbsp;: si coché, une notification
              push partira au moment du clic sur «&nbsp;Publier&nbsp;».
            </li>
            <li>
              Bouton <strong>Publier</strong>&nbsp;: rend le document visible aux salariés. Vous
              pouvez le repasser en brouillon plus tard si nécessaire.
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
              <strong>Titre clair</strong>. Pas de «&nbsp;Document_v3_FINAL.pdf&nbsp;» mais
              «&nbsp;Procédure de prise de service — édition mai 2026&nbsp;».
            </li>
            <li>
              <strong>Indiquez la version dans le titre</strong> si vous remplacez un document
              existant (ex&nbsp;: «&nbsp;Règlement intérieur — v3 — mai 2026&nbsp;»).
            </li>
            <li>
              <strong>Image de couverture</strong> conseillée pour les documents importants&nbsp;:
              elle aide à les retrouver dans la liste.
            </li>
            <li>
              <strong>Cochez «&nbsp;Notifier l’équipe&nbsp;»</strong> uniquement pour les
              documents importants. Pour une mise à jour mineure, laissez décoché.
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
          <dt>Comment supprimer un document&nbsp;?</dt>
          <dd>
            En mode édition, bouton <strong>Supprimer</strong> en bas (rouge). Confirmation
            demandée. Le fichier est aussi supprimé du stockage Supabase.
          </dd>
          <dt>Puis-je remplacer le fichier sans changer le titre&nbsp;?</dt>
          <dd>
            Oui&nbsp;: en mode édition, bouton «&nbsp;Remplacer&nbsp;» dans la zone de fichier.
            L’ancien fichier est remplacé par le nouveau.
          </dd>
          <dt>Que se passe-t-il si je repasse un document publié en brouillon&nbsp;?</dt>
          <dd>
            Il disparaît immédiatement de la liste côté salariés. Vous pouvez ensuite le republier
            quand vous voulez.
          </dd>
        </dl>
      ),
    },
  ],
};
