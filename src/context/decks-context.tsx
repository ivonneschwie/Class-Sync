'use client';

import { createContext, useContext, ReactNode } from 'react';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { FlashcardDeck } from '@/lib/types';

type DecksContextType = {
  decks: FlashcardDeck[];
  addDeck: (newDeck: Omit<FlashcardDeck, 'id' | 'createdAt' | 'userId'>) => void;
  deleteDeck: (id: string) => void;
};

const DecksContext = createContext<DecksContextType | undefined>(undefined);

export function DecksProvider({ children }: { children: ReactNode }) {
  const firestore = useFirestore();
  const { user } = useUser();

  const decksRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'decks');
  }, [user, firestore]);
  
  const { data: decks } = useCollection<FlashcardDeck>(decksRef);

  const addDeck = (deck: Omit<FlashcardDeck, 'id' | 'createdAt' | 'userId'>) => {
    if (!decksRef || !user) return;
    addDocumentNonBlocking(decksRef, { 
        ...deck,
        userId: user.uid,
        createdAt: serverTimestamp() 
    });
  };

  const deleteDeck = (id: string) => {
    if (!decksRef || !firestore) return;
    const docRef = doc(firestore, decksRef.path, id);
    deleteDocumentNonBlocking(docRef);
  };

  return (
    <DecksContext.Provider value={{ decks: decks || [], addDeck, deleteDeck }}>
      {children}
    </DecksContext.Provider>
  );
}

export function useDecks() {
  const context = useContext(DecksContext);
  if (context === undefined) {
    throw new Error('useDecks must be used within a DecksProvider');
  }
  return context;
}

    