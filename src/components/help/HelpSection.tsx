'use client';

import { ChevronDown, ChevronUp, type LucideIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';

type Props = {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export default function HelpSection({ icon: Icon, title, children, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-xl border-l-[3px] border-l-brand-500 bg-white shadow-sm ring-1 ring-ink-100">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-brand-50/40"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50">
          <Icon className="h-4 w-4 text-brand-700" strokeWidth={2} />
        </span>
        <h3 className="flex-1 font-display text-sm font-semibold text-ink-900">{title}</h3>
        {open ? (
          <ChevronUp className="h-4 w-4 text-ink-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-ink-400" />
        )}
      </button>
      {open ? <div className="prose-help px-4 pb-4 pt-1 text-sm text-ink-700">{children}</div> : null}
    </section>
  );
}
