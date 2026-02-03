'use client';

import { SummariesProvider } from '@/context/summaries-context';
import { DecksProvider } from '@/context/decks-context';
import { ClassesProvider } from '@/context/classes-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClassesProvider>
      <SummariesProvider>
        <DecksProvider>
          {children}
        </DecksProvider>
      </SummariesProvider>
    </ClassesProvider>
  );
}

    