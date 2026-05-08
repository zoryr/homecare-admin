import { HelpCircle, Info, Lightbulb, MousePointerClick } from 'lucide-react';

import type { HelpPage } from '../types';

export const sondagesResultats: HelpPage = {
  id: 'sondages_resultats',
  title: 'Résultats d’un sondage',
  subtitle: 'Analyser les réponses anonymes',
  sections: [
    {
      icon: Info,
      title: 'À quoi sert cette page ?',
      content: (
        <>
          <p>
            Cette page affiche les <strong>résultats agrégés</strong> du sondage&nbsp;: graphiques
            par question, taux de réponse, et participants ayant répondu.
          </p>
          <p>
            ⚠️ Les réponses sont <strong>anonymes</strong>&nbsp;: vous voyez les chiffres globaux
            (ex&nbsp;: «&nbsp;30% ont choisi «&nbsp;Oui&nbsp;»&nbsp;») mais jamais qui a répondu
            quoi.
          </p>
        </>
      ),
    },
    {
      icon: MousePointerClick,
      title: 'Comment ça marche ?',
      content: (
        <>
          <h4>Bandeau KPI en haut</h4>
          <p>
            Trois cards résument l’essentiel&nbsp;:
          </p>
          <ul>
            <li>
              <strong>Réponses reçues</strong>&nbsp;: nombre de salariés ayant répondu / nombre
              total de salariés actifs (avec un anneau de progression).
            </li>
            <li>
              <strong>Date d’ouverture</strong>&nbsp;: quand le sondage a été publié.
            </li>
            <li>
              <strong>Statut</strong>&nbsp;: publié, fermé… avec la date de fermeture si applicable.
            </li>
          </ul>

          <h4>Filtres (barre sticky)</h4>
          <ul>
            <li>
              <strong>Période</strong>&nbsp;: filtrer les réponses sur une plage de dates précise.
            </li>
            <li>
              <strong>Recherche</strong>&nbsp;: chercher un mot dans les réponses libres.
            </li>
            <li>
              Bouton <strong>Rafraîchir</strong>&nbsp;: récupère les nouvelles réponses arrivées
              entre temps.
            </li>
            <li>
              Boutons <strong>Export PDF</strong> et <strong>Export CSV</strong>.
            </li>
          </ul>

          <h4>Graphiques par question</h4>
          <p>Selon le type de question&nbsp;:</p>
          <ul>
            <li>
              <strong>Choix unique / multiple</strong>&nbsp;: graphique en barres horizontales
              avec les pourcentages.
            </li>
            <li>
              <strong>Étoiles / Smileys</strong>&nbsp;: graphique en barres verticales (1 à 5)
              avec la moyenne affichée en gros.
            </li>
            <li>
              <strong>Oui / Non</strong>&nbsp;: donut avec le pourcentage central.
            </li>
            <li>
              <strong>Texte libre</strong>&nbsp;: liste des verbatims paginée. La recherche
              surligne les correspondances.
            </li>
          </ul>

          <h4>Section «&nbsp;Participants&nbsp;» (repliable)</h4>
          <p>
            Tout en bas, vous pouvez voir <strong>qui</strong> a participé (avec la date de
            soumission). Mais vous ne savez pas <em>quelles réponses</em> ils ont données.
          </p>

          <h4>Exports</h4>
          <ul>
            <li>
              <strong>PDF</strong>&nbsp;: rapport mis en page avec un tableau par question.
              Pratique à partager en réunion ou par email.
            </li>
            <li>
              <strong>CSV</strong>&nbsp;: données brutes, à ouvrir dans Excel ou Google Sheets.
              Une ligne par réponse, avec le <em>submission_token</em> qui permet de regrouper
              les réponses d’un même salarié (sans son nom).
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
              <strong>Attendez quelques jours</strong> avant d’analyser. Les résultats avec
              5 réponses ne sont pas représentatifs.
            </li>
            <li>
              <strong>Partagez les résultats avec l’équipe</strong> en réunion. Cela renforce
              l’engagement pour le prochain sondage.
            </li>
            <li>
              <strong>Verbatims = or</strong>. Les réponses libres sont souvent les plus
              précieuses. Lisez-les toutes, même si elles sont nombreuses.
            </li>
            <li>
              Pour comparer dans le temps, <strong>réutilisez les mêmes questions</strong> d’un
              sondage à l’autre (depuis la banque).
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
          <dt>Comment savoir qui n’a pas répondu&nbsp;?</dt>
          <dd>
            La section <em>Participants</em> liste ceux qui ont répondu. Comparez avec votre liste
            de salariés actifs (page <em>Équipe</em>) pour identifier les non-répondants. Vous
            pouvez ensuite leur envoyer un message manuel via le module Notifications.
          </dd>
          <dt>Différence entre l’export PDF et l’export CSV&nbsp;?</dt>
          <dd>
            Le <strong>PDF</strong> est lisible directement (graphiques, tableaux mis en page).
            Le <strong>CSV</strong> contient les données brutes et permet de faire vos propres
            analyses dans Excel ou Google Sheets.
          </dd>
          <dt>Pourquoi le PDF n’a-t-il pas de graphiques&nbsp;?</dt>
          <dd>
            Volontairement&nbsp;: les graphiques restent côté admin (web), et le PDF se concentre
            sur des tableaux clairs et imprimables. Une version V2 pourra inclure les graphiques.
          </dd>
          <dt>Et l’anonymat — vraiment vraiment&nbsp;?</dt>
          <dd>
            Oui. Les réponses sont stockées avec un identifiant aléatoire. La table de
            participation (qui a répondu) ne contient aucune réponse. Aucune jointure possible
            entre les deux. Personne — pas même nous — ne peut savoir qui a répondu quoi.
          </dd>
        </dl>
      ),
    },
  ],
};
