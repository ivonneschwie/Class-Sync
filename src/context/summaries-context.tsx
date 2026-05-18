'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { NotebookService } from '@/services/NotebookService';
import type { Summary } from '@/lib/types';

type SummariesContextType = {
  summaries: Summary[];
  addSummary: (newSummary: Omit<Summary, 'id' | 'createdAt' | 'userId'>) => void;
  deleteSummary: (id: string) => void;
  updateSummary: (id: string, updates: Partial<Summary>) => void;
};

const SummariesContext = createContext<SummariesContextType | undefined>(undefined);

export function SummariesProvider({ children }: { children: ReactNode }) {
  const firestore = useFirestore();
  const { user } = useUser();

  const summariesRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'summaries');
  }, [user, firestore]);

  const { data: summaries } = useCollection<Summary>(summariesRef);

  // Initialize Object-Oriented Notebook Service
  const notebookService = useMemo(() => {
    if (!firestore || !summariesRef) return null;
    return new NotebookService(firestore, summariesRef);
  }, [firestore, summariesRef]);

  const addSummary = (summary: Omit<Summary, 'id' | 'createdAt' | 'userId'>) => {
    if (!notebookService || !user) return;
    notebookService.add(summary, user.uid);
  };

  const deleteSummary = (id: string) => {
    if (!notebookService) return;
    notebookService.delete(id);
  };

  const updateSummary = (id: string, updates: Partial<Summary>) => {
    if (!notebookService) return;
    notebookService.update(id, updates);
  };

  return (
    <SummariesContext.Provider value={{ summaries: summaries || [], addSummary, deleteSummary, updateSummary }}>
      {children}
    </SummariesContext.Provider>
  );
}

export function useSummaries() {
  const context = useContext(SummariesContext);
  if (context === undefined) {
    throw new Error('useSummaries must be used within a SummariesProvider');
  }
  return context;
}

    