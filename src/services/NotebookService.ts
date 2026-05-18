import { Firestore, CollectionReference } from 'firebase/firestore';
import { BaseService } from './BaseService';
import type { Summary } from '@/lib/types';

/**
 * Notebook Service layer encapsulating all business logic related to notebook summaries.
 */
export class NotebookService extends BaseService<Summary> {
  constructor(firestore: Firestore, collectionRef: CollectionReference) {
    super(firestore, collectionRef);
  }

  // Future specific operations for notebooks can be placed here.
}
