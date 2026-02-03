'use client';

import { createContext, useContext, ReactNode } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { UserProfile } from '@/lib/types';

type ProfileContextType = {
  profile: UserProfile | null;
  updateProfile: (data: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'email'>>) => void;
  isLoading: boolean;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const firestore = useFirestore();
  const { user } = useUser();

  const profileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: profile, isLoading } = useDoc<UserProfile>(profileRef);

  const updateProfile = (data: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'email'>>) => {
    if (!profileRef) return;
    updateDocumentNonBlocking(profileRef, data);
  }

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, isLoading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
