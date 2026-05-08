import type { HelpPage } from '../types';

/**
 * Loader paresseux : chaque page d'aide est dans un module séparé,
 * importée à la demande quand l'utilisateur ouvre le panneau d'aide.
 * Évite de charger ~3 MB de help dans le chunk layout admin alors que
 * la plupart des sessions n'ouvrent jamais le panneau.
 */
type Loader = () => Promise<HelpPage>;

const LOADERS: Record<string, Loader> = {
  dashboard: () => import('./dashboard').then((m) => m.dashboard),
  actualites_liste: () => import('./actualites-liste').then((m) => m.actualitesListe),
  actualites_edition: () => import('./actualites-edition').then((m) => m.actualitesEdition),
  notifications: () => import('./notifications').then((m) => m.notifications),
  sondages_liste: () => import('./sondages-liste').then((m) => m.sondagesListe),
  sondages_builder: () => import('./sondages-builder').then((m) => m.sondagesBuilder),
  sondages_banque: () => import('./sondages-banque').then((m) => m.sondagesBanque),
  sondages_question: () => import('./sondages-question').then((m) => m.sondagesQuestion),
  sondages_resultats: () => import('./sondages-resultats').then((m) => m.sondagesResultats),
  documents_liste: () => import('./documents-liste').then((m) => m.documentsListe),
  documents_edition: () => import('./documents-edition').then((m) => m.documentsEdition),
  apropos: () => import('./apropos').then((m) => m.apropos),
  salaries: () => import('./salaries').then((m) => m.salaries),
};

export async function loadHelpPage(id: string): Promise<HelpPage | null> {
  const loader = LOADERS[id];
  if (!loader) return null;
  return loader();
}

export const HELP_PAGE_IDS = Object.keys(LOADERS);
