import type { ImageSource } from '@/lib/images/types';

export type DocumentStatut = 'brouillon' | 'publie';

export type DocumentCategorieCouleur =
  | 'gray'
  | 'blue'
  | 'green'
  | 'amber'
  | 'red'
  | 'purple'
  | 'rose';

export interface DocumentCategorie {
  id: string;
  nom: string;
  ordre: number;
  couleur: DocumentCategorieCouleur;
  cree_par: string;
  cree_le: string;
}

export interface DocumentRow {
  id: string;
  titre: string;
  description: string;
  categorie_id: string | null;
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
  cree_par: string;
  cree_le: string;
  modifie_le: string;
}

export interface DocumentWithCategorie extends DocumentRow {
  categorie: DocumentCategorie | null;
}
