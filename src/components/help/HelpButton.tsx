'use client';

import { HelpCircle } from 'lucide-react';
import { useState } from 'react';

import { useHelp } from './HelpProvider';

type Props = {
  pageId: string;
  ariaLabel?: string;
};

export default function HelpButton({ pageId, ariaLabel = "Besoin d'aide ?" }: Props) {
  const { openHelp } = useHelp();
  const [hover, setHover] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
      {hover ? (
        <span className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
          Besoin d&apos;aide ?
        </span>
      ) : null}
      <button
        type="button"
        onClick={() => openHelp(pageId)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label={ariaLabel}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/40 transition hover:scale-105 active:scale-95"
      >
        <HelpCircle className="h-7 w-7" strokeWidth={2} />
      </button>
    </div>
  );
}
