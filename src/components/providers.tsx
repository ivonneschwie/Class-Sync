'use client';

import { SummariesProvider } from '@/context/summaries-context';
import { DecksProvider } from '@/context/decks-context';
import { ClassesProvider } from '@/context/classes-context';
import { ProfileProvider } from '@/context/profile-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <ClassesProvider>
        <SummariesProvider>
          <DecksProvider>
            {children}
          </DecksProvider>
        </SummariesProvider>
      </ClassesProvider>
    </ProfileProvider>
  );
}
