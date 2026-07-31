'use client';

import { Download, FileText, Film, Loader2, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import { useToast } from '@/components/Toast';
import {
  ACCEPTED_EXTENSIONS,
  MAX_FILE_SIZE_VIDEO,
  formatFileSize,
  getMaxFileSize,
  isAcceptedMime,
  isImage,
  isVideo,
} from '@/lib/documents/constants';
import { createClient } from '@/lib/supabase/client';

export type UploadedFile = {
  url: string;
  nom: string;
  taille: number;
  mime_type: string;
};

type Props = {
  value: UploadedFile | null;
  onChange: (next: UploadedFile | null) => void;
  /** Slug pour préfixer le nom du fichier dans le bucket. */
  slugTitre?: string;
  /** Catégorie slugifiée pour le sous-dossier (default: sans-cat). */
  folderSlug?: string;
};

export default function FileUpload({ value, onChange, slugTitre, folderSlug }: Props) {
  const { notify } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  async function handleFile(file: File) {
    if (!isAcceptedMime(file.type)) {
      notify('error', `Type non supporté. Accepté : ${ACCEPTED_EXTENSIONS.join(', ').toUpperCase()}`);
      return;
    }
    const maxSize = getMaxFileSize(file.type);
    if (file.size > maxSize) {
      notify('error', `Fichier trop volumineux (max ${formatFileSize(maxSize)})`);
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
      const slug = (slugTitre || file.name.replace(/\.[^.]+$/, '') || 'document')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 60);
      const folder = folderSlug || 'sans-cat';
      const path = `${folder}/${Date.now()}-${slug}.${ext}`;

      const supabase = createClient();
      const { error: upErr } = await supabase.storage
        .from('documents-fichiers')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from('documents-fichiers').getPublicUrl(path);

      onChange({
        url: data.publicUrl,
        nom: file.name,
        taille: file.size,
        mime_type: file.type,
      });
    } catch (err) {
      notify('error', err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) void handleFile(f);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void handleFile(f);
  }

  if (!value) {
    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        className={`relative flex aspect-[3/1] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white p-6 text-center transition ${
          dragActive
            ? 'border-brand-500 bg-brand-50'
            : 'border-ink-300 hover:border-brand-300 hover:bg-brand-50/30'
        } ${uploading ? 'opacity-60' : ''}`}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.mp4,.mov,application/pdf,image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
          className="hidden"
          onChange={onPick}
          disabled={uploading}
        />
        {uploading ? (
          <>
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-brand-500" />
            <p className="text-sm text-ink-700">Téléversement en cours…</p>
          </>
        ) : (
          <>
            <Upload className="mb-3 h-8 w-8 text-ink-400" />
            <p className="font-medium text-ink-700">Glisser un fichier ici ou cliquer</p>
            <p className="mt-1 text-xs text-ink-500">
              PDF, JPG, PNG, WEBP, MP4, MOV — max 10 MB (50 MB vidéo)
            </p>
          </>
        )}
      </div>
    );
  }

  // Aperçu
  const vid = isVideo(value.mime_type);
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-4">
      <div className="flex flex-col gap-4">
        {isImage(value.mime_type) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value.url}
            alt={value.nom}
            className="max-h-64 w-full rounded-lg object-contain"
          />
        ) : vid ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={value.url} controls className="max-h-80 w-full rounded-lg bg-black object-contain" />
        ) : (
          <div className="flex aspect-[3/1] w-full items-center justify-center rounded-lg bg-gradient-to-br from-rose-50 to-rose-100">
            <FileText className="h-16 w-16 text-rose-400" strokeWidth={1.5} />
          </div>
        )}
        {vid ? (
          <p className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs text-purple-800">
            <Film className="h-4 w-4 shrink-0" />
            Cette vidéo sera affichée en format vertical dans l&apos;app (lecteur intégré disponible
            en Phase 2.7). Taille max {formatFileSize(MAX_FILE_SIZE_VIDEO)}.
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-ink-900" title={value.nom}>
              {value.nom}
            </p>
            <p className="text-xs text-ink-500">
              {formatFileSize(value.taille)} · {value.mime_type}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={value.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:border-brand-300"
            >
              <Download className="h-4 w-4" />
              Télécharger
            </a>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:border-brand-300 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Upload…' : 'Remplacer'}
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </button>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.mp4,.mov,application/pdf,image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
          className="hidden"
          onChange={onPick}
          disabled={uploading}
        />
      </div>
    </div>
  );
}
