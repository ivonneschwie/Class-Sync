import { doc, serverTimestamp, CollectionReference, Firestore } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

/**
 * Abstract Base Service implementing the generic Repository Pattern.
 * Encapsulates core Firestore operations inside an Object-Oriented class.
 */
export abstract class BaseService<T> {
  protected firestore: Firestore;
  protected collectionRef: CollectionReference;

  constructor(firestore: Firestore, collectionRef: CollectionReference) {
    this.firestore = firestore;
    this.collectionRef = collectionRef;
  }

  /**
   * Adds a new document to the collection asynchronously.
   */
  public add(data: Omit<T, 'id' | 'createdAt' | 'userId'>, userId: string): void {
    addDocumentNonBlocking(this.collectionRef, {
      ...data,
      userId,
      createdAt: serverTimestamp()
    });
  }

  /**
   * Updates an existing document in the collection.
   */
  public update(id: string, updates: Partial<T>): void {
    const docRef = doc(this.firestore, this.collectionRef.path, id);
    setDocumentNonBlocking(docRef, updates, { merge: true });
  }

  /**
   * Deletes a document from the collection.
   */
  public delete(id: string): void {
    const docRef = doc(this.firestore, this.collectionRef.path, id);
    deleteDocumentNonBlocking(docRef);
  }
}
