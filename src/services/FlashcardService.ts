import { Firestore, CollectionReference } from 'firebase/firestore';
import { BaseService } from './BaseService';
import type { FlashcardDeck } from '@/lib/types';

/**
 * Flashcard Service layer encapsulating logic related to Flashcard Decks.
 */
export class FlashcardService extends BaseService<FlashcardDeck> {
  constructor(firestore: Firestore, collectionRef: CollectionReference) {
    super(firestore, collectionRef);
  }

  // Future custom deck operations (e.g. duplicating a deck, sharing) can be added here.
}
