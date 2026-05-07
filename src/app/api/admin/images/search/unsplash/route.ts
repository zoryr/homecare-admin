import { NextResponse, type NextRequest } from 'next/server';

import { getCurrentProfile } from '@/lib/supabase/get-profile';
import type { SearchResponse, SearchResult } from '@/lib/images/types';

type UnsplashUser = { name: string; links: { html: string } };
type UnsplashPhoto = {
  id: string;
  urls: { small: string; regular: string; full: string };
  width: number;
  height: number;
  alt_description: string | null;
  description: string | null;
  user: UnsplashUser;
  links: { html: string; download_location: string };
};
type UnsplashSearch = {
  results: UnsplashPhoto[];
  total: number;
  total_pages: number;
};

export async function GET(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    return NextResponse.json({ error: 'UNSPLASH_ACCESS_KEY non configurée' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').trim();
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get('per_page') ?? '20', 10) || 20));

  if (!q) {
    return NextResponse.json({ results: [], total: 0, total_pages: 0 } satisfies SearchResponse);
  }

  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', q);
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set('orientation', 'landscape');

  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${key}` },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Unsplash error ${res.status}` },
      { status: 502 },
    );
  }

  const json = (await res.json()) as UnsplashSearch;

  const results: SearchResult[] = json.results.map((p) => ({
    id: p.id,
    thumb_url: p.urls.small,
    full_url: p.urls.regular,
    width: p.width,
    height: p.height,
    description: p.alt_description ?? p.description ?? undefined,
    photographer_name: p.user.name,
    photographer_url: `${p.user.links.html}?utm_source=homecare&utm_medium=referral`,
    source_url: p.links.html,
    download_location: p.links.download_location,
  }));

  return NextResponse.json({
    results,
    total: json.total,
    total_pages: json.total_pages,
  } satisfies SearchResponse);
}
