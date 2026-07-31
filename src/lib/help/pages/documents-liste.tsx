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
            Cette page est organisée en <strong>rubriques</strong> (onglets en haut). Seule «&nbsp;
            <strong>Infos professionnelles</strong>&nbsp;» est active&nbsp;; «&nbsp;Avantages&nbsp;»
            et «&nbsp;Conseils&nbsp;» arrivent bientôt.
          </p>
          <p>La rubrique «&nbsp;Infos professionnelles&nbsp;» contient 4 sections&nbsp;:</p>
          <ul>
            <li>
              <strong>Livret d’accueil</strong> et <strong>Règlement intérieur</strong>&nbsp;: un
              <strong> flipbook</strong> (feuilletable) via une URL Heyzine.
            </li>
            <li>
              <strong>Notes de service</strong> et <strong>Informations pour le personnel</strong>
              &nbsp;: des <strong>documents</strong> classiques (PDF ou image).
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
          <ul>
            <li>
              <strong>Livret / Règlement (flipbook)</strong>&nbsp;: collez l’<strong>URL Heyzine</strong>
              (format attendu <em>https://heyzine.com/flip-book/xxxxx.html</em>), cochez
              «&nbsp;Publié&nbsp;» puis «&nbsp;Enregistrer&nbsp;». «&nbsp;Prévisualiser&nbsp;» l’ouvre
              dans un onglet. Côté salarié, le flipbook s’ouvre désormais <strong>directement dans
              l’app</strong> (plus dans le navigateur).
            </li>
            <li>
              <strong>Ajouter une note / une info personnel</strong>&nbsp;: bouton «&nbsp;+ Ajouter&nbsp;»
              de la section. Le document est automatiquement rangé dans la bonne section.
            </li>
            <li>
              <strong>Réordonner</strong>&nbsp;: glissez-déposez les documents (poignée à gauche) —
              l’ordre est repris dans l’app.
            </li>
            <li>
              <strong>Modifier / supprimer</strong>&nbsp;: bouton «&nbsp;Modifier&nbsp;» sur la ligne.
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
