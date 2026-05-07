import { NextResponse, type NextRequest } from 'next/server';

import { getCurrentProfile } from '@/lib/supabase/get-profile';
import type { SearchResponse, SearchResult } from '@/lib/images/types';

type PexelsPhoto = {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  alt: string;
  src: { medium: string; large: string; large2x: string; original: string };
};

type PexelsSearch = {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
};

export async function GET(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const key = process.env.PEXELS_API_KEY?.trim();
  if (!key) {
    return NextResponse.json({ error: 'PEXELS_API_KEY non configurée' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').trim();
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const perPage = Math.min(80, Math.max(1, parseInt(searchParams.get('per_page') ?? '20', 10) || 20));

  if (!q) {
    return NextResponse.json({ results: [], total: 0, total_pages: 0 } satisfies SearchResponse);
  }

  const url = new URL('https://api.pexels.com/v1/search');
  url.searchParams.set('query', q);
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set('orientation', 'landscape');

  const res = await fetch(url, {
    headers: { Authorization: key },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    if (res.status === 401) {
      return NextResponse.json(
        { error: 'Pexels : clé API invalide ou expirée. Vérifie PEXELS_API_KEY.' },
        { status: 502 },
      );
    }
    return NextResponse.json({ error: `Pexels error ${res.status}` }, { status: 502 });
  }

  const json = (await res.json()) as PexelsSearch;

  const results: SearchResult[] = json.photos.map((p) => ({
    id: p.id.toString(),
    thumb_url: p.src.medium,
    full_url: p.src.large2x,
    width: p.width,
    height: p.height,
    description: p.alt || undefined,
    photographer_name: p.photographer,
    photographer_url: p.photographer_url,
    source_url: p.url,
  }));

  return NextResponse.json({
    results,
    total: json.total_results,
    total_pages: Math.ceil(json.total_results / perPage),
  } satisfies SearchResponse);
}
