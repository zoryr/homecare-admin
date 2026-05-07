export type ImageProvider = 'unsplash' | 'pexels' | 'upload' | 'default';

export interface ImageSource {
  provider: ImageProvider;
  photographer_name?: string;
  photographer_url?: string;
  /** URL canonique sur la plateforme d'origine (audit) */
  source_url?: string;
}

export interface SearchResult {
  id: string;
  thumb_url: string;
  full_url: string;
  width: number;
  height: number;
  description?: string;
  photographer_name: string;
  photographer_url: string;
  source_url: string;
  /** Unsplash uniquement — endpoint à pinger après import (CGU) */
  download_location?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  total_pages: number;
}

export interface ImportResponse {
  url: string;
  image_source: ImageSource;
}
