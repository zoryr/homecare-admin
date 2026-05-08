import { HelpCircle, Info, Lightbulb, MousePointerClick } from 'lucide-react';

import type { HelpPage } from '../types';

export const dashboard: HelpPage = {
  id: 'dashboard',
  title: 'Tableau de bord',
  subtitle: 'Vue d’ensemble de votre application',
  sections: [
    {
      icon: Info,
      title: 'À quoi sert cette page ?',
      content: (
        <>
          <p>
            Le tableau de bord est votre <strong>point de départ</strong>. Il vous donne en un
            coup d’œil les informations clés sur votre application&nbsp;: nombre de salariés
            inscrits, dernières actualités publiées, sondages en cours, notifications récentes.
          </p>
          <p>Pensez-y comme à la première page de votre journal&nbsp;: vous voyez l’essentiel,
            puis vous cliquez pour aller plus loin.</p>
        </>
      ),
    },
    {
      icon: MousePointerClick,
      title: 'Comment ça marche ?',
      content: (
        <>
          <ul>
            <li>Les <strong>compteurs</strong> en haut affichent les chiffres clés (salariés actifs,
              actus publiées, sondages ouverts…).</li>
            <li>Les <strong>raccourcis</strong> vous emmènent directement vers les actions les plus
              fréquentes (créer une actu, envoyer un message, voir les sondages).</li>
            <li>Le <strong>menu en haut</strong> permet de basculer entre les modules&nbsp;:
              Actualités, Notifications, Sondages, Documents, À propos, Équipe.</li>
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
            <li>Consultez le tableau de bord <strong>une fois par jour</strong> en début de matinée
              pour suivre l’activité.</li>
            <li>Si le nombre de salariés actifs vous semble faible, allez dans <em>Équipe</em> pour
              relancer ceux qui n’ont pas encore activé leur compte.</li>
            <li>Les compteurs ne mentent jamais&nbsp;: utilisez-les comme baromètre de l’engagement
              de l’équipe.</li>
          </ul>
        </>
      ),
    },
    {
      icon: HelpCircle,
      title: 'Questions fréquentes',
      content: (
        <dl>
          <dt>Pourquoi je ne vois pas tous mes salariés&nbsp;?</dt>
          <dd>
            Le compteur affiche uniquement les salariés <strong>actifs</strong>. Ceux qui ont été
            désactivés ou qui n’ont pas encore activé leur compte n’apparaissent pas. Allez dans
            <em> Équipe </em>pour voir la liste complète.
          </dd>
          <dt>Les chiffres ne sont pas à jour&nbsp;?</dt>
          <dd>Rafraîchissez la page (F5 ou ⌘R). Les données sont calculées en direct.</dd>
        </dl>
      ),
    },
  ],
};
