import { HelpCircle, Info, Lightbulb, MousePointerClick } from 'lucide-react';

import type { HelpPage } from '../types';

export const documentsListe: HelpPage = {
  id: 'documents_liste',
  title: 'Documents',
  subtitle: 'Règlement, notes de service, procédures',
  sections: [
    {
      icon: Info,
      title: 'À quoi sert cette page ?',
      content: (
        <>
          <p>
            Cette page rassemble tous les <strong>documents officiels</strong> mis à disposition
            de vos salariés&nbsp;: règlement intérieur, notes de service, procédures, modes
            opératoires…
          </p>
          <p>
            Chaque document est associé à une <strong>catégorie</strong> (que vous créez
            librement) et apparaît dans l’app mobile classé par catégorie.
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
              <strong>Créer un document</strong>&nbsp;: bouton «&nbsp;+ Nouveau document&nbsp;».
            </li>
            <li>
              <strong>Gérer les catégories</strong>&nbsp;: bouton «&nbsp;Gérer les catégories&nbsp;»
              en haut. Vous y créez, renommez, recolorez et réordonnez vos catégories par
              glisser-déposer. Les couleurs aident vos salariés à reconnaître les types de
              documents au premier coup d’œil.
            </li>
            <li>
              <strong>Filtrer</strong>&nbsp;: par catégorie, par statut (brouillons / publiés), ou
              par recherche dans le titre.
            </li>
            <li>
              <strong>Modifier</strong>&nbsp;: clic sur la card du document.
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
              <strong>Convertissez en PDF</strong> avant l’upload (depuis Word, Excel…). Cela
              empêche les modifications par les salariés et garantit le rendu identique sur tous
              les téléphones.
            </li>
            <li>
              <strong>Description claire</strong>&nbsp;: une phrase qui résume le contenu (les
              salariés voient cette description dans la liste).
            </li>
            <li>
              <strong>Catégories simples</strong>&nbsp;: 3 à 6 catégories suffisent (Règlement,
              Notes de service, Procédures, Hygiène…). Trop, c’est confus.
            </li>
            <li>
              <strong>Image de couverture</strong> facultative mais utile pour reconnaître un
              document important d’un coup d’œil.
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
          <dt>Quels formats de fichiers sont acceptés&nbsp;?</dt>
          <dd>
            <strong>PDF</strong>, <strong>JPG</strong>, <strong>PNG</strong>,{' '}
            <strong>WEBP</strong>. Taille maximum&nbsp;: <strong>10 Mo</strong>.
          </dd>
          <dt>Pourquoi limiter à 10 Mo&nbsp;?</dt>
          <dd>
            Au-delà, le téléchargement sur mobile devient lent (surtout en 4G dégradée). Pour
            un PDF dense, compressez-le ou découpez-le en plusieurs documents.
          </dd>
          <dt>Que se passe-t-il quand je supprime une catégorie&nbsp;?</dt>
          <dd>
            Les documents associés ne sont pas supprimés&nbsp;: ils restent disponibles, mais
            sans catégorie. Vous pouvez les ré-affecter ensuite à une autre catégorie.
          </dd>
        </dl>
      ),
    },
  ],
};
