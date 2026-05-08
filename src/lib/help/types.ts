import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface HelpSection {
  icon: LucideIcon;
  title: string;
  content: ReactNode;
}

export interface HelpPage {
  id: string;
  title: string;
  subtitle?: string;
  sections: HelpSection[];
}
