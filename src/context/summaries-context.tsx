'use client';

import { createContext, useContext, ReactNode } from 'react';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
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

  const addSummary = (summary: Omit<Summary, 'id' | 'createdAt' | 'userId'>) => {
    if (!summariesRef || !user) return;
    addDocumentNonBlocking(summariesRef, { 
      ...summary, 
      userId: user.uid,
      createdAt: serverTimestamp() 
    });
  };

  const deleteSummary = (id: string) => {
    if (!summariesRef || !firestore) return;
    const docRef = doc(firestore, summariesRef.path, id);
    deleteDocumentNonBlocking(docRef);
  };

  const updateSummary = (id: string, updates: Partial<Summary>) => {
    if (!summariesRef || !firestore) return;
    const docRef = doc(firestore, summariesRef.path, id);
    setDocumentNonBlocking(docRef, updates, { merge: true });
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

    