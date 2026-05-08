import { HelpCircle, Info, Lightbulb, MousePointerClick } from 'lucide-react';

import type { HelpPage } from '../types';

export const sondagesBuilder: HelpPage = {
  id: 'sondages_builder',
  title: 'Constructeur de sondage',
  subtitle: 'Construire un sondage de A à Z',
  sections: [
    {
      icon: Info,
      title: 'À quoi sert cette page ?',
      content: (
        <>
          <p>
            C’est ici que vous <strong>composez intégralement</strong> un sondage avant de le
            publier&nbsp;: titre, description, questions, ordre, intercalaires (texte, image,
            séparateur de section), dates d’ouverture / fermeture.
          </p>
          <p>
            Tant que le sondage est <strong>brouillon</strong>, vous pouvez tout modifier. Une
            fois <strong>publié</strong>, vous gardez la main pour ajouter ou réordonner — mais
            attention aux questions ayant déjà reçu des réponses.
          </p>
        </>
      ),
    },
    {
      icon: MousePointerClick,
      title: 'Comment ça marche ?',
      content: (
        <>
          <h4>Mise en page</h4>
          <p>
            La page est divisée en deux colonnes&nbsp;:
          </p>
          <ul>
            <li>
              <strong>Colonne gauche</strong>&nbsp;: les <em>Informations</em> (titre, description,
              image de couverture) et la <em>Publication</em> (statut, dates d’ouverture /
              fermeture, boutons d’action).
            </li>
            <li>
              <strong>Colonne droite</strong>&nbsp;: la <em>structure du sondage</em>, c’est-à-dire
              la liste des éléments (questions et intercalaires) que verra le salarié, dans l’ordre
              de lecture.
            </li>
          </ul>

          <h4>Ajouter du contenu</h4>
          <p>
            Au-dessus de la liste, 5 boutons d’ajout&nbsp;:
          </p>
          <ul>
            <li>
              <strong>+ Question (banque)</strong>&nbsp;: choisit une question déjà existante dans
              la banque (ouvre une modale avec recherche/filtres). Idéal pour réutiliser des
              questions standards.
            </li>
            <li>
              <strong>+ Nouvelle question</strong>&nbsp;: création éclair d’une question (titre,
              type, options) directement insérée. Elle est aussi sauvegardée dans la banque pour
              de futurs sondages.
            </li>
            <li>
              <strong>+ Texte</strong>&nbsp;: paragraphe d’introduction, de transition, de
              remerciement entre deux blocs de questions.
            </li>
            <li>
              <strong>+ Image</strong>&nbsp;: image inline (entre 2 sections par exemple).
            </li>
            <li>
              <strong>+ Section</strong>&nbsp;: titre de section, gros bandeau pour structurer un
              sondage long en sous-thèmes.
            </li>
          </ul>

          <h4>Réordonner</h4>
          <p>
            Saisissez la <strong>poignée à 6 points</strong> à gauche d’un élément et glissez-le
            où vous voulez. Vous pouvez aussi utiliser les flèches haut/bas pour les petits
            ajustements.
          </p>

          <h4>Marquer une question comme obligatoire</h4>
          <p>
            Sur chaque question, une case <strong>Obligatoire</strong> permet d’imposer la réponse.
            Le salarié ne pourra pas envoyer le sondage sans répondre. À utiliser avec
            parcimonie&nbsp;: trop d’obligatoires, et les gens abandonnent.
          </p>

          <h4>Dates et publication</h4>
          <p>
            <strong>Date d’ouverture</strong>&nbsp;: optionnelle. Si renseignée, le sondage devient
            disponible à cette date (vous pouvez préparer à l’avance).{' '}
            <strong>Date de fermeture</strong>&nbsp;: optionnelle. Si renseignée, le sondage se
            ferme automatiquement à cette date (un cron tourne toutes les 15 minutes).
          </p>
          <p>
            Quand vous cliquez sur <strong>Publier</strong>, une confirmation apparaît. Si la
            notification automatique est activée dans <em>Notifications &gt; Réglages</em>, un
            push part à toute l’équipe.
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
              <strong>Commencez par un texte d’introduction</strong>. Expliquez en 2-3 lignes
              pourquoi ce sondage existe et combien de temps cela prend (~ 2 minutes).
            </li>
            <li>
              <strong>Mélangez les types de questions</strong> (étoiles, choix multiple, texte
              libre) pour ne pas lasser.
            </li>
            <li>
              <strong>Anonymat 100%</strong>&nbsp;: aucune réponse n’est rattachée à un nom.
              Rassurez vos salariés dans l’introduction.
            </li>
            <li>
              <strong>Testez avant de publier</strong>&nbsp;: laissez en brouillon, ouvrez l’app
              avec un compte salarié de test, et répondez vous-même.
            </li>
            <li>
              Évitez plus de <strong>10 questions</strong>. Au-delà, le taux d’abandon explose.
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
          <dt>Pourquoi je ne peux plus modifier les options d’une question publiée&nbsp;?</dt>
          <dd>
            Modifier le <strong>type</strong> ou les <strong>choix possibles</strong> d’une
            question après publication corromprait les réponses déjà reçues. Vous pouvez en
            revanche corriger le texte du titre ou de la description (ça reste visuel).
          </dd>
          <dt>Comment fermer manuellement un sondage&nbsp;?</dt>
          <dd>
            Dans la colonne <em>Publication</em>, le bouton «&nbsp;Fermer&nbsp;» met fin au
            sondage immédiatement. Les salariés ne peuvent plus répondre. Vous pouvez ensuite le
            ré-ouvrir si besoin.
          </dd>
          <dt>Comment réutiliser une question dans un autre sondage&nbsp;?</dt>
          <dd>
            Toutes les questions créées (que ce soit depuis la banque ou via «&nbsp;Nouvelle
            question&nbsp;» dans le constructeur) sont automatiquement enregistrées dans la
            <em> Banque de questions </em>. Vous les retrouvez via le bouton{' '}
            <em>+ Question (banque)</em>.
          </dd>
          <dt>Que se passe-t-il à la date de fermeture&nbsp;?</dt>
          <dd>
            Le sondage passe automatiquement en statut <strong>Fermé</strong> dans les 15 minutes
            suivant la date prévue. Plus aucune nouvelle réponse n’est acceptée. Les résultats
            restent consultables indéfiniment.
          </dd>
          <dt>Et l’anonymat exactement&nbsp;?</dt>
          <dd>
            Les réponses sont stockées avec un identifiant aléatoire (<em>submission_token</em>)
            <strong> sans aucun lien</strong> avec le nom du salarié. Une autre table garde trace
            de qui a participé (pour empêcher les doublons), mais aucune correspondance n’existe
            entre cette table et les réponses elles-mêmes. Personne — pas même nous — ne peut
            savoir qui a répondu quoi.
          </dd>
        </dl>
      ),
    },
  ],
};
