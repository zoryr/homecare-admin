import type { HelpPage } from '../types';

import { actualitesEdition } from './actualites-edition';
import { actualitesListe } from './actualites-liste';
import { apropos } from './apropos';
import { dashboard } from './dashboard';
import { documentsEdition } from './documents-edition';
import { documentsListe } from './documents-liste';
import { notifications } from './notifications';
import { salaries } from './salaries';
import { sondagesBanque } from './sondages-banque';
import { sondagesBuilder } from './sondages-builder';
import { sondagesListe } from './sondages-liste';
import { sondagesQuestion } from './sondages-question';
import { sondagesResultats } from './sondages-resultats';

export const HELP_PAGES: Record<string, HelpPage> = {
  dashboard,
  actualites_liste: actualitesListe,
  actualites_edition: actualitesEdition,
  notifications,
  sondages_liste: sondagesListe,
  sondages_builder: sondagesBuilder,
  sondages_banque: sondagesBanque,
  sondages_question: sondagesQuestion,
  sondages_resultats: sondagesResultats,
  documents_liste: documentsListe,
  documents_edition: documentsEdition,
  apropos,
  salaries,
};

export function getHelpPage(id: string): HelpPage | null {
  return HELP_PAGES[id] ?? null;
}
