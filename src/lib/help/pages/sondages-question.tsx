import { HelpCircle, Info, Lightbulb, MousePointerClick } from 'lucide-react';

import type { HelpPage } from '../types';

export const sondagesQuestion: HelpPage = {
  id: 'sondages_question',
  title: 'Édition d’une question',
  subtitle: '6 types de questions disponibles',
  sections: [
    {
      icon: Info,
      title: 'À quoi sert cette page ?',
      content: (
        <>
          <p>
            Vous y créez ou modifiez une <strong>question réutilisable</strong>. Cette question
            est ensuite disponible dans la banque pour être insérée dans n’importe quel sondage.
          </p>
        </>
      ),
    },
    {
      icon: MousePointerClick,
      title: 'Comment ça marche ?',
      content: (
        <>
          <h4>1. Choisir le type de question</h4>
          <p>6 types disponibles, chacun adapté à un usage différent&nbsp;:</p>
          <ul>
            <li>
              <strong>Choix unique</strong> — Une seule réponse parmi plusieurs (ex&nbsp;:
              «&nbsp;Quelle est votre tranche d’âge&nbsp;?&nbsp;»).
            </li>
            <li>
              <strong>Choix multiple</strong> — Plusieurs réponses possibles (ex&nbsp;: «&nbsp;Quels
              types de formation vous intéressent&nbsp;?&nbsp;»).
            </li>
            <li>
              <strong>Étoiles 1-5</strong> — Une note classique (ex&nbsp;: «&nbsp;Comment évaluez-vous
              votre charge de travail&nbsp;?&nbsp;»).
            </li>
            <li>
              <strong>Smileys 1-5</strong> — Émotion plutôt qu’évaluation rationnelle (😢 → 😍).
              Idéal pour le ressenti.
            </li>
            <li>
              <strong>Oui / Non</strong> — Question binaire simple.
            </li>
            <li>
              <strong>Texte libre</strong> — Pour récolter des verbatims (avec ou sans saut de
              ligne, longueur configurable).
            </li>
          </ul>

          <h4>2. Rédiger la question</h4>
          <p>
            <strong>Titre</strong> = la question telle qu’elle apparaît au salarié.{' '}
            <strong>Description</strong> = précisions optionnelles (contexte, exemples).
          </p>

          <h4>3. Configurer les options spécifiques</h4>
          <p>Selon le type, des options apparaissent&nbsp;:</p>
          <ul>
            <li>
              <strong>Choix unique / multiple</strong>&nbsp;: liste des choix (au moins 2, max 20).
              Chaque choix a un libellé visible et une <em>valeur technique</em> qui sera utilisée
              dans les statistiques.
            </li>
            <li>
              <strong>Étoiles / Smileys</strong>&nbsp;: libellés des extrêmes (par défaut «&nbsp;Pas
              du tout&nbsp;» ↔ «&nbsp;Totalement&nbsp;»).
            </li>
            <li>
              <strong>Oui / Non</strong>&nbsp;: vous pouvez personnaliser les libellés (ex&nbsp;:
              «&nbsp;Plutôt d’accord / Plutôt pas d’accord&nbsp;»).
            </li>
            <li>
              <strong>Texte libre</strong>&nbsp;: longueur max (ex 500 caractères), case
              «&nbsp;multi-lignes&nbsp;» (paragraphe au lieu d’une ligne).
            </li>
          </ul>

          <h4>4. Tags</h4>
          <p>
            Ajoutez 1 à 3 tags pour faciliter le tri (bien-être, planning, formation…). Les tags
            servent uniquement de classement&nbsp;: ils ne sont pas vus par les salariés.
          </p>

          <h4>5. Aperçu visuel</h4>
          <p>
            La colonne de droite affiche en direct comment la question apparaîtra côté salarié.
            Vérifiez avant d’enregistrer.
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
              <strong>Question claire et neutre</strong>. «&nbsp;Êtes-vous satisfait&nbsp;?&nbsp;»
              ⚠️ trop large. Préférez «&nbsp;Comment évaluez-vous votre charge actuelle&nbsp;?&nbsp;».
            </li>
            <li>
              <strong>Pas de double-question</strong>. Évitez «&nbsp;Aimez-vous le planning ET
              l’ambiance&nbsp;?&nbsp;» — séparez en deux questions.
            </li>
            <li>
              <strong>Échelles 1-5</strong> (étoiles ou smileys) pour la lisibilité. Au-delà de 5,
              les salariés peinent à choisir.
            </li>
            <li>
              <strong>Une question = un sujet</strong>. Si vous avez besoin de creuser,
              enchaînez avec une question texte libre.
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
          <dt>Pourquoi je ne peux pas changer le type d’une question&nbsp;?</dt>
          <dd>
            Une fois la question utilisée dans un sondage qui a reçu des réponses, changer le type
            invaliderait toutes ces réponses (les données seraient incohérentes). Le verrouillage
            est volontaire.
          </dd>
          <dt>Que veut dire «&nbsp;valeur technique&nbsp;» pour un choix&nbsp;?</dt>
          <dd>
            C’est l’identifiant interne du choix (ex&nbsp;: <code>choix_1</code>). Il sert dans les
            statistiques et l’export CSV. Le salarié, lui, ne voit que le libellé que vous avez
            écrit.
          </dd>
          <dt>Combien de choix maximum pour un choix unique / multiple&nbsp;?</dt>
          <dd>20. Au-delà, l’UX devient pénible.</dd>
        </dl>
      ),
    },
  ],
};
