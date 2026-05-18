'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { FlashcardService } from '@/services/FlashcardService';
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

  // Initialize Object-Oriented Flashcard Service
  const flashcardService = useMemo(() => {
    if (!firestore || !decksRef) return null;
    return new FlashcardService(firestore, decksRef);
  }, [firestore, decksRef]);

  const addDeck = (deck: Omit<FlashcardDeck, 'id' | 'createdAt' | 'userId'>) => {
    if (!flashcardService || !user) return;
    flashcardService.add(deck, user.uid);
  };

  const deleteDeck = (id: string) => {
    if (!flashcardService) return;
    flashcardService.delete(id);
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

    