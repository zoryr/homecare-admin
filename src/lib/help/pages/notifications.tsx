import { HelpCircle, Info, Lightbulb, MousePointerClick } from 'lucide-react';

import type { HelpPage } from '../types';

export const notifications: HelpPage = {
  id: 'notifications',
  title: 'Notifications',
  subtitle: 'Messages push à vos salariés',
  sections: [
    {
      icon: Info,
      title: 'À quoi sert cette page ?',
      content: (
        <>
          <p>
            C’est le centre des notifications push envoyées sur le téléphone des salariés. Trois
            volets&nbsp;:
          </p>
          <ul>
            <li>
              <strong>Réglages automatiques</strong>&nbsp;: décide si une notification doit partir
              automatiquement quand vous publiez une actu, un sondage ou un document.
            </li>
            <li>
              <strong>Composer un message</strong>&nbsp;: envoyer un message ponctuel, immédiat ou
              programmé.
            </li>
            <li>
              <strong>Historique</strong>&nbsp;: voir ce qui a été envoyé, qui l’a vu/cliqué.
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
          <h4>Notifications automatiques</h4>
          <p>
            Trois interrupteurs (toggle on/off)&nbsp;:
          </p>
          <ul>
            <li><strong>Sur publication d’une actualité</strong></li>
            <li><strong>Sur publication d’un sondage</strong></li>
            <li><strong>Sur publication d’un document</strong> (règlement, note de service)</li>
          </ul>
          <p>
            Quand l’interrupteur est activé, la notification part <em>automatiquement</em> dès que
            vous cliquez sur «&nbsp;Publier&nbsp;» dans le module concerné. Pas besoin de venir ici.
          </p>

          <h4>Heures silencieuses</h4>
          <p>
            Activez l’option <strong>Heures silencieuses</strong> (par défaut 21h-7h) pour ne
            jamais déranger vos salariés en soirée ou tôt le matin. Toute notification programmée
            pour cette plage est automatiquement décalée au prochain créneau autorisé.
          </p>

          <h4>Composer un message ponctuel</h4>
          <p>Cliquez sur «&nbsp;Nouveau message&nbsp;»&nbsp;:</p>
          <ul>
            <li>
              <strong>Titre</strong>&nbsp;: court (jusqu’à 50 caractères), c’est ce qui s’affiche
              en premier sur le téléphone verrouillé.
            </li>
            <li>
              <strong>Message</strong>&nbsp;: jusqu’à 200 caractères, le corps du message.
            </li>
            <li>
              <strong>Audience</strong>&nbsp;: tous les salariés actifs OU une sélection précise.
            </li>
            <li>
              <strong>Quand</strong>&nbsp;: maintenant ou à une date/heure programmée.
            </li>
            <li>
              <strong>Aperçu téléphone</strong>&nbsp;: simulateur visuel avant d’envoyer.
            </li>
          </ul>

          <h4>Historique</h4>
          <p>
            La liste détaille chaque envoi avec le statut «&nbsp;Vu par X / Y&nbsp;» et la date.
            Pour les envois programmés non encore partis, vous pouvez les <strong>annuler</strong>.
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
              <strong>1 à 2 notifications par jour maximum</strong>. Au-delà, les salariés
              désactivent les notifs dans les réglages de leur téléphone — et plus rien ne passe.
            </li>
            <li>
              <strong>Heures silencieuses TOUJOURS activées</strong>. Personne ne veut être
              dérangé à 22h pour une note de service.
            </li>
            <li>
              <strong>Faites un test</strong> avant un envoi groupé important&nbsp;: cliquez
              sur «&nbsp;Envoyer une notification de test à mon téléphone&nbsp;».
            </li>
            <li>
              Le titre doit donner le <em>quoi</em>, le message le <em>pourquoi</em>. Évitez le
              clickbait, vos salariés s’en lassent vite.
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
          <dt>Pourquoi mon message n’est jamais arrivé&nbsp;?</dt>
          <dd>
            Plusieurs raisons possibles&nbsp;:
            <ul>
              <li>Heures silencieuses actives (consultez l’historique → date d’envoi décalée).</li>
              <li>Le salarié a refusé les notifications dans les réglages de son téléphone.</li>
              <li>Le salarié n’a pas ouvert l’app récemment et son token push a expiré.</li>
              <li>L’app a été désinstallée puis réinstallée → le token est à régénérer.</li>
            </ul>
          </dd>
          <dt>Comment annuler un envoi programmé&nbsp;?</dt>
          <dd>
            Dans l’<em>Historique</em>, repérez la ligne avec le statut «&nbsp;Programmé&nbsp;» et
            cliquez sur «&nbsp;Annuler&nbsp;». Une fois envoyé, l’annulation n’est plus possible.
          </dd>
          <dt>Différence entre notification automatique et manuelle&nbsp;?</dt>
          <dd>
            <strong>Automatique</strong> = part toute seule quand vous publiez une actu/sondage/doc
            (si l’interrupteur correspondant est ON). <strong>Manuelle</strong> = vous écrivez le
            titre et le message vous-même, indépendamment de toute publication.
          </dd>
          <dt>Pourquoi 200 caractères max&nbsp;?</dt>
          <dd>
            C’est la limite affichée sur l’écran verrouillé d’un iPhone/Android. Au-delà, le
            message est tronqué. Soyez direct.
          </dd>
        </dl>
      ),
    },
  ],
};
