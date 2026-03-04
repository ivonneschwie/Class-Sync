
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Class } from '@/lib/types';

type ClassesContextType = {
  classes: Class[];
  addClass: (newClass: Omit<Class, 'id' | 'createdAt' | 'userId'>) => void;
  updateClass: (id: string, data: Partial<Omit<Class, 'id' | 'createdAt' | 'userId'>>) => void;
  deleteClass: (id: string) => void;
  overwriteClasses: (newClasses: Omit<Class, 'id' | 'createdAt' | 'userId'>[]) => Promise<void>;
  isLoading: boolean;
};

const ClassesContext = createContext<ClassesContextType | undefined>(undefined);

export function ClassesProvider({ children }: { children: ReactNode }) {
  const firestore = useFirestore();
  const { user } = useUser();

  const classesRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'classes');
  }, [user, firestore]);

  const { data: classes, isLoading } = useCollection<Class>(classesRef);

  const addClass = (classData: Omit<Class, 'id' | 'createdAt' | 'userId'>) => {
    if (!classesRef || !user) return;
    addDocumentNonBlocking(classesRef, {
      ...classData,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
  };
  
  const updateClass = (id: string, classData: Partial<Omit<Class, 'id' | 'createdAt' | 'userId'>>) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, 'users', user.uid, 'classes', id);
    updateDocumentNonBlocking(docRef, classData);
  }

  const deleteClass = (id: string) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, 'users', user.uid, 'classes', id);
    deleteDocumentNonBlocking(docRef);
  };

  const overwriteClasses = async (newClasses: Omit<Class, 'id' | 'createdAt' | 'userId'>[]) => {
    if (!user || !firestore || !classes) return;
    
    const batch = writeBatch(firestore);
    
    // 1. Delete all current classes
    classes.forEach((c) => {
      const docRef = doc(firestore, 'users', user.uid, 'classes', c.id);
      batch.delete(docRef);
    });
    
    // 2. Add all new classes
    newClasses.forEach((c) => {
      const newDocRef = doc(collection(firestore, 'users', user.uid, 'classes'));
      batch.set(newDocRef, {
        ...c,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
    });
    
    await batch.commit();
  };

  return (
    <ClassesContext.Provider value={{ classes: classes || [], addClass, updateClass, deleteClass, overwriteClasses, isLoading }}>
      {children}
    </ClassesContext.Provider>
  );
}

export function useClasses() {
  const context = useContext(ClassesContext);
  if (context === undefined) {
    throw new Error('useClasses must be used within a ClassesProvider');
  }
  return context;
}
