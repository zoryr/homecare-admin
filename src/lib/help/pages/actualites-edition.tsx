import { HelpCircle, Info, Lightbulb, MousePointerClick } from 'lucide-react';

import type { HelpPage } from '../types';

export const actualitesEdition: HelpPage = {
  id: 'actualites_edition',
  title: 'Édition d’une actualité',
  subtitle: 'Composer un article complet',
  sections: [
    {
      icon: Info,
      title: 'À quoi sert cette page ?',
      content: (
        <>
          <p>
            C’est ici que vous <strong>écrivez et mettez en forme</strong> une actualité. Tout ce
            que vous saisissez sera lu par les salariés sur leur téléphone (et visible aussi côté
            web).
          </p>
          <p>
            Tant que le statut est <strong>Brouillon</strong>, rien n’est diffusé&nbsp;: vous
            pouvez expérimenter sans risque.
          </p>
        </>
      ),
    },
    {
      icon: MousePointerClick,
      title: 'Comment ça marche ?',
      content: (
        <>
          <h4>1. Le titre et la description courte</h4>
          <p>
            Le <strong>titre</strong> est ce que voient les salariés en premier. La{' '}
            <strong>description courte</strong> (1-2 lignes) apparaît sous le titre dans la liste
            mobile. Soignez les deux.
          </p>

          <h4>2. L’image de couverture</h4>
          <p>
            4 sources possibles, via l’onglet correspondant&nbsp;:
          </p>
          <ul>
            <li>
              <strong>Unsplash</strong>&nbsp;: bibliothèque gratuite et professionnelle (recherche
              par mot-clé).
            </li>
            <li>
              <strong>Pexels</strong>&nbsp;: alternative à Unsplash.
            </li>
            <li>
              <strong>Téléverser</strong>&nbsp;: votre propre photo (JPG, PNG, WEBP). Idéal pour
              une photo de l’équipe, d’un évènement Home & Care…
            </li>
            <li>
              <strong>Réinitialiser au logo</strong>&nbsp;: image par défaut H&C si vous n’en avez
              pas en tête.
            </li>
          </ul>

          <h4>3. L’éditeur de contenu (Tiptap)</h4>
          <p>La barre d’outils en haut de l’éditeur regroupe&nbsp;:</p>
          <ul>
            <li><strong>Mise en forme du texte</strong>&nbsp;: gras, italique, souligné, barré.</li>
            <li><strong>Titres</strong>&nbsp;: H1 (gros titre), H2 (sous-titre), H3 (intertitre).</li>
            <li><strong>Listes</strong>&nbsp;: à puces ou numérotées.</li>
            <li><strong>Alignements</strong>&nbsp;: gauche / centre / droite.</li>
            <li><strong>Citation</strong>&nbsp;: paragraphe encadré en italique.</li>
            <li><strong>Lien</strong>&nbsp;: insertion d’un lien (URL).</li>
            <li><strong>Image inline</strong>&nbsp;: image à l’intérieur de l’article (différente
              de la couverture).</li>
            <li><strong>Palette de couleurs</strong>&nbsp;: pour mettre en évidence un mot.</li>
            <li>
              <strong>4 callouts colorés</strong> (les blocs ✨ encadrés)&nbsp;:
              <ul>
                <li><em>Info</em> (bleu) — pour une information neutre.</li>
                <li><em>Conseil</em> (vert) — pour une recommandation.</li>
                <li><em>Attention</em> (orange) — pour un avertissement modéré.</li>
                <li><em>Important</em> (rouge) — pour un point critique à ne pas manquer.</li>
              </ul>
            </li>
          </ul>

          <h4>4. Les tags</h4>
          <p>
            Choisissez 1 ou 2 tags maximum (Vie d’équipe, Info pratique, Évènement…). Ils aident
            les salariés à filtrer.
          </p>

          <h4>5. Le statut et l’épingle</h4>
          <p>
            Quand vous êtes prêt(e), passez le statut à <strong>Publié</strong>. Si l’option
            «&nbsp;Notifier l’équipe&nbsp;» est cochée, une notification push part automatiquement.
            L’option <strong>Épingler en haut</strong> (avec date) garde l’actu en avant pendant
            quelques jours.
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
              <strong>Toujours une image</strong>. Une actu sans visuel passe inaperçue dans la
              liste.
            </li>
            <li>
              <strong>Description courte = teaser</strong>. Une phrase qui donne envie d’ouvrir.
            </li>
            <li>
              <strong>Callouts pour les infos clés</strong>. N’écrivez pas un mur de texte&nbsp;:
              utilisez les blocs colorés pour mettre en valeur l’essentiel.
            </li>
            <li>
              <strong>Relisez à froid</strong>. Restez en brouillon, repassez 10 minutes plus tard
              avant de publier.
            </li>
            <li>
              Brouillon → vous pouvez tout modifier librement. Publié → la notification est déjà
              partie&nbsp;; les modifications restent visibles mais aucune nouvelle notif ne
              s’ajoute.
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
          <dt>Qu’est-ce qu’un callout&nbsp;?</dt>
          <dd>
            C’est un <strong>bloc encadré coloré</strong> qui met en valeur une information
            importante. On en a 4&nbsp;: Info (bleu), Conseil (vert), Attention (orange), Important
            (rouge). Vous les insérez via la barre d’outils de l’éditeur.
          </dd>
          <dt>Comment ajouter une vidéo YouTube&nbsp;?</dt>
          <dd>
            Collez simplement le lien YouTube dans l’éditeur via le bouton <em>Lien</em>. Pour
            l’instant, l’app n’embarque pas le lecteur vidéo&nbsp;: les salariés cliquent sur le
            lien pour l’ouvrir dans YouTube.
          </dd>
          <dt>Mon image est trop grande / lourde…</dt>
          <dd>
            Redimensionnez-la à <strong>1600 px de large maximum</strong> avant l’upload (avec
            l’app Photos de votre Mac/PC ou un site comme tinypng.com). Un fichier JPG ≤ 500 Ko se
            charge instantanément.
          </dd>
          <dt>Comment épingler une actu&nbsp;?</dt>
          <dd>
            Cochez <em>Épingler en haut</em> et choisissez une date de fin (par défaut +7 jours).
          </dd>
          <dt>Puis-je modifier une actu après l’avoir publiée&nbsp;?</dt>
          <dd>
            Oui. Vos modifications sont immédiatement visibles côté salarié. En revanche, la
            notification de publication a déjà été envoyée — elle ne sera pas renvoyée.
          </dd>
        </dl>
      ),
    },
  ],
};
