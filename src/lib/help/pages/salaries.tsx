import { HelpCircle, Info, Lightbulb, MousePointerClick } from 'lucide-react';

import type { HelpPage } from '../types';

export const salaries: HelpPage = {
  id: 'salaries',
  title: 'Équipe',
  subtitle: 'Gérer salariés et administrateurs',
  sections: [
    {
      icon: Info,
      title: 'À quoi sert cette page ?',
      content: (
        <>
          <p>
            C’est ici que vous gérez <strong>qui a accès à l’app</strong>. Deux vues, basculables
            via les pills en haut&nbsp;:
          </p>
          <ul>
            <li>
              <strong>Salariés</strong>&nbsp;: les utilisateurs «&nbsp;classiques&nbsp;» qui ont
              accès à l’app mobile uniquement.
            </li>
            <li>
              <strong>Administrateurs</strong>&nbsp;: ceux qui ont aussi accès à cette interface
              admin web (pour gérer le contenu).
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
          <h4>Inviter un membre</h4>
          <p>
            Bouton «&nbsp;+ Inviter…&nbsp;» en haut à droite. Vous renseignez&nbsp;:
          </p>
          <ul>
            <li>L’<strong>email</strong> du salarié (vérifiez bien&nbsp;!)</li>
            <li>Son <strong>prénom</strong> et son <strong>nom</strong></li>
          </ul>
          <p>
            Un email avec le mode d’emploi est envoyé automatiquement. Le salarié n’a qu’à ouvrir
            l’app et entrer son email&nbsp;: il recevra un code à 6 chiffres pour se connecter.
          </p>

          <h4>Activer / Désactiver</h4>
          <p>
            Sur chaque ligne, un toggle <strong>Actif</strong>&nbsp;:
          </p>
          <ul>
            <li>
              <strong>Actif ON</strong>&nbsp;: le salarié peut se connecter et reçoit les
              notifications.
            </li>
            <li>
              <strong>Actif OFF</strong>&nbsp;: l’accès est bloqué, mais l’historique de
              l’utilisateur (réponses sondages, etc.) est conservé.
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
              <strong>Désactiver plutôt que supprimer</strong>. La désactivation bloque l’accès
              tout en gardant les statistiques cohérentes (sondages, vues, etc.).
            </li>
            <li>
              <strong>Vérifiez l’email avant invitation</strong>. Une faute de frappe et le
              salarié ne reçoit jamais son code.
            </li>
            <li>
              <strong>Limitez le nombre d’admins</strong>. 2 à 3 personnes max. Trop d’admins =
              risque de modifications conflictuelles.
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
          <dt>Le salarié n’a pas reçu son email d’invitation, que faire&nbsp;?</dt>
          <dd>
            Vérifier les <strong>spams / courriers indésirables</strong>. Si rien&nbsp;: relancer
            l’invitation depuis cette page (rouvrez la fiche du salarié et cliquez sur «&nbsp;Renvoyer
            l’invitation&nbsp;»). Si le salarié n’a toujours rien&nbsp;: vérifier l’email saisi
            (faute de frappe&nbsp;?), et si OK contacter le support.
          </dd>
          <dt>Comment changer l’email d’un salarié&nbsp;?</dt>
          <dd>
            L’email est lié à l’authentification et ne peut pas être modifié directement.
            Désactivez le compte actuel et créez-en un nouveau avec le bon email.
          </dd>
          <dt>Que se passe-t-il quand je désactive un salarié&nbsp;?</dt>
          <dd>
            Il ne peut plus se connecter à l’app (s’il est déjà connecté, sa prochaine action
            sera bloquée). Il ne reçoit plus de notifications. Mais ses anciennes participations
            aux sondages, vues d’actus, etc. restent dans l’historique.
          </dd>
          <dt>Différence salarié / administrateur&nbsp;?</dt>
          <dd>
            Un <strong>salarié</strong> a accès à l’app mobile uniquement (lecture). Un{' '}
            <strong>administrateur</strong> a accès en plus à cette interface admin web pour
            gérer tout le contenu.
          </dd>
        </dl>
      ),
    },
  ],
};
