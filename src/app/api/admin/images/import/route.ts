import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/supabase/get-profile';
import type { ImageProvider, ImportResponse } from '@/lib/images/types';

type Body = {
  provider?: ImageProvider;
  full_url?: string;
  photographer_name?: string;
  photographer_url?: string;
  source_url?: string;
  download_location?: string;
};

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function detectMime(buf: Uint8Array): { mime: string; ext: string } | null {
  if (buf.length < 4) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8) return { mime: 'image/jpeg', ext: 'jpg' };
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)
    return { mime: 'image/png', ext: 'png' };
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return { mime: 'image/gif', ext: 'gif' };
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) {
    return { mime: 'image/webp', ext: 'webp' };
  }
  return null;
}

export async function POST(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller || caller.role !== 'admin' || !caller.actif) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body?.full_url || (body.provider !== 'unsplash' && body.provider !== 'pexels')) {
    return NextResponse.json({ error: 'provider et full_url requis' }, { status: 400 });
  }

  // 1. Ping Unsplash download_location (CGU)
  if (body.provider === 'unsplash' && body.download_location) {
    const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
    if (key) {
      try {
        const dlUrl = new URL(body.download_location);
        dlUrl.searchParams.set('client_id', key);
        await fetch(dlUrl, { method: 'GET' });
      } catch {
        // best-effort, on n'échoue pas l'import si le ping rate
      }
    }
  }

  // 2. Fetch image
  let buffer: ArrayBuffer;
  try {
    const imgRes = await fetch(body.full_url, { redirect: 'follow' });
    if (!imgRes.ok) {
      return NextResponse.json(
        { error: `Téléchargement échoué (${imgRes.status})` },
        { status: 400 },
      );
    }
    buffer = await imgRes.arrayBuffer();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Téléchargement échoué' },
      { status: 400 },
    );
  }

  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: 'Image trop grosse (>10MB)' }, { status: 400 });
  }

  // 3. Mime detection
  const u8 = new Uint8Array(buffer);
  const detected = detectMime(u8);
  if (!detected) {
    return NextResponse.json({ error: 'Format image non supporté' }, { status: 400 });
  }

  // 4. Upload to Supabase Storage
  const admin = createAdminClient();
  const path = `imports/${body.provider}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${detected.ext}`;

  const { error: upErr } = await admin.storage
    .from('actus-images')
    .upload(path, u8, { contentType: detected.mime, upsert: false });

  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  const { data: pub } = admin.storage.from('actus-images').getPublicUrl(path);

  const response: ImportResponse = {
    url: pub.publicUrl,
    image_source: {
      provider: body.provider,
      photographer_name: body.photographer_name,
      photographer_url: body.photographer_url,
      source_url: body.source_url,
    },
  };

  return NextResponse.json(response);
}
