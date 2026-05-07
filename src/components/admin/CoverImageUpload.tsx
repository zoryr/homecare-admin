'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

import { createClient } from '@/lib/supabase/client';

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  bucket?: string;
  folder?: string;
};

export default function CoverImageUpload({
  value,
  onChange,
  bucket = 'actus-images',
  folder = 'couvertures',
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);

    const supabase = createClient();
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePick}
      />

      {value ? (
        <div className="space-y-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-md border border-slate-200">
            <Image
              src={value}
              alt="Couverture"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              {uploading ? 'Upload…' : 'Changer'}
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={uploading}
              className="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
            >
              Supprimer
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-video w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 bg-slate-50 text-sm text-slate-600 transition hover:border-slate-400 hover:bg-slate-100 disabled:opacity-50"
        >
          {uploading ? (
            <span>Upload en cours…</span>
          ) : (
            <>
              <span className="font-medium">Cliquer pour ajouter une image de couverture</span>
              <span className="mt-1 text-xs text-slate-500">JPG, PNG, WEBP</span>
            </>
          )}
        </button>
      )}

      {error && <p className="mt-2 text-sm text-rose-700">Erreur upload : {error}</p>}
    </div>
  );
}
