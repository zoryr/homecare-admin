export type ActuStatut = 'brouillon' | 'publie';

export interface Actualite {
  id: string;
  titre: string;
  description: string;
  corps: string;
  image_couverture_url: string | null;
  tags: string[];
  statut: ActuStatut;
  publie_le: string | null;
  featured_jusqua: string | null;
  cree_par: string;
  cree_le: string;
  modifie_le: string;
}
