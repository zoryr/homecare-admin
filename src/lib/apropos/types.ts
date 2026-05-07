export type AproposKey = 'public' | 'interne';

export interface Apropos {
  cle: AproposKey;
  image_url: string | null;
  corps: string;
  email_contact: string | null;
  telephone: string | null;
  adresse: string | null;
  site_web: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  modifie_le: string;
  modifie_par: string | null;
}
