import type { ImageSource } from '@/lib/images/types';

export type DocumentStatut = 'brouillon' | 'publie';

export type DocumentRubrique = 'infos_pro' | 'avantages' | 'conseils';

export type DocumentSousRubrique =
  | 'livret_accueil'
  | 'reglement_interieur'
  | 'notes_service'
  | 'informations_personnel';

export interface DocumentRow {
  id: string;
  titre: string;
  description: string;
  fichier_url: string;
  fichier_nom: string;
  fichier_taille: number;
  mime_type: string;
  image_couverture_url: string | null;
  image_source: ImageSource | null;
  statut: DocumentStatut;
  publie_le: string | null;
  featured_jusqua: string | null;
  notif_envoyee: boolean;
  rubrique: DocumentRubrique;
  sous_rubrique: DocumentSousRubrique | null;
  flipbook_url: string | null;
  ordre: number;
  est_video_verticale: boolean;
  contenu_html: string | null;
  contenu_json: unknown | null;
  est_article: boolean;
  cree_par: string;
  cree_le: string;
  modifie_le: string;
}
