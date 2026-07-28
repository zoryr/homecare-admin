import { HelpCircle, Info, KeyRound, Lightbulb, UserPlus, UserX } from 'lucide-react';

import type { HelpPage } from '../types';

export const salaries: HelpPage = {
  id: 'salaries',
  title: 'Salariés',
  subtitle: 'Gérer les comptes (matricule + mot de passe)',
  sections: [
    {
      icon: Info,
      title: 'À quoi sert cette page ?',
      content: (
        <>
          <p>
            C’est ici que vous gérez <strong>les comptes des salariés</strong> qui accèdent à
            l’app mobile. Chaque salarié se connecte avec un <strong>matricule</strong> et un{' '}
            <strong>mot de passe</strong> que vous lui communiquez. <strong>Aucun email n’est
            envoyé</strong>&nbsp;: tout se transmet à l’oral.
          </p>
        </>
      ),
    },
    {
      icon: UserPlus,
      title: 'Créer un nouveau salarié',
      content: (
        <>
          <ul>
            <li>Récupérez le <strong>matricule</strong> dans votre logiciel RH.</li>
            <li>Cliquez «&nbsp;<strong>+ Nouveau salarié</strong>&nbsp;».</li>
            <li>
              Saisissez le <strong>matricule</strong> et un <strong>mot de passe</strong> (le
              prénom est optionnel, pour votre gestion interne).
            </li>
            <li>
              À la validation, une fenêtre affiche le matricule et le mot de passe{' '}
              <strong>en grand</strong>. <strong>Communiquez-les au salarié à l’oral</strong>{' '}
              (téléphone ou face-à-face). Vous pouvez copier les identifiants d’un clic.
            </li>
          </ul>
          <p>
            ⚠ Une fois la fenêtre fermée, le mot de passe n’est plus affiché nulle part.
          </p>
        </>
      ),
    },
    {
      icon: KeyRound,
      title: 'Réinitialiser un mot de passe',
      content: (
        <>
          <p>
            Sur la ligne du salarié, cliquez l’icône <strong>clé</strong>, saisissez un nouveau
            mot de passe, puis <strong>dictez-le</strong> au salarié. Utile quand un salarié a
            oublié son mot de passe&nbsp;: il vous appelle, vous en générez un nouveau.
          </p>
        </>
      ),
    },
    {
      icon: UserX,
      title: 'Désactiver un salarié',
      content: (
        <>
          <p>
            Cliquez l’icône <strong>désactiver</strong> sur la ligne du salarié&nbsp;: il perd{' '}
            <strong>immédiatement</strong> l’accès à l’app. Ses données (réponses aux sondages,
            etc.) sont conservées. Vous pourrez le <strong>réactiver</strong> plus tard si besoin.
          </p>
        </>
      ),
    },
    {
      icon: Lightbulb,
      title: 'Bonnes pratiques',
      content: (
        <ul>
          <li>
            Choisissez un mot de passe <strong>simple à dicter</strong> (évitez les caractères
            spéciaux compliqués).
          </li>
          <li>
            Ne transmettez <strong>jamais</strong> les identifiants par SMS ou email, pour éviter
            les fuites. À l’oral uniquement.
          </li>
          <li>
            En cas de <strong>départ d’un salarié</strong>&nbsp;: désactivez son compte
            immédiatement.
          </li>
        </ul>
      ),
    },
    {
      icon: HelpCircle,
      title: 'Questions fréquentes',
      content: (
        <dl>
          <dt>Un salarié a perdu son mot de passe&nbsp;?</dt>
          <dd>
            Utilisez «&nbsp;Réinitialiser le mot de passe&nbsp;» (icône clé), puis dictez-lui le
            nouveau.
          </dd>
          <dt>Un salarié a quitté l’entreprise&nbsp;?</dt>
          <dd>
            <strong>Désactivez</strong> son compte (ne le supprimez pas)&nbsp;: l’accès est coupé
            et l’historique reste cohérent.
          </dd>
          <dt>Je veux réutiliser un matricule&nbsp;?</dt>
          <dd>
            Impossible tant que l’ancien compte existe (la suppression définitive de compte est
            prévue pour une version ultérieure).
          </dd>
        </dl>
      ),
    },
  ],
};
