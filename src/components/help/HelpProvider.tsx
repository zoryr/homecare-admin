'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import HelpPanel from './HelpPanel';

type HelpContextValue = {
  open: boolean;
  pageId: string | null;
  openHelp: (pageId: string) => void;
  closeHelp: () => void;
};

const HelpContext = createContext<HelpContextValue | null>(null);

export function useHelp(): HelpContextValue {
  const ctx = useContext(HelpContext);
  if (!ctx) throw new Error('useHelp must be used inside <HelpProvider>');
  return ctx;
}

export default function HelpProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);

  const openHelp = useCallback((id: string) => {
    setPageId(id);
    setOpen(true);
  }, []);

  const closeHelp = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo<HelpContextValue>(
    () => ({ open, pageId, openHelp, closeHelp }),
    [open, pageId, openHelp, closeHelp],
  );

  return (
    <HelpContext.Provider value={value}>
      {children}
      <HelpPanel pageId={pageId} open={open} onClose={closeHelp} />
    </HelpContext.Provider>
  );
}
