import { Timestamp } from "firebase/firestore";

export type ClassSchedule = {
  days: ('M' | 'T' | 'W' | 'Th' | 'F' | 'Sa' | 'Su')[];
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
};

export type Class = {
  id: string; // Firestore document ID
  userId: string;
  name: string;
  code: string;
  instructor: string;
  location: string;
  description?: string;
  accentColor: string;
  schedule: ClassSchedule[];
  createdAt: Timestamp;
};

export type Summary = {
  id: string; // Firestore document ID
  userId: string;
  subject: string;
  title: string;
  notes: string;
  summary: string;
  clarificationQuestions: string;
  createdAt: Timestamp;
};

export type Flashcard = {
  front: string;
  back: string;
};

export type FlashcardDeck = {
  id: string; // Firestore document ID
  userId: string;
  name: string;
  subject: string;
  flashcards: Flashcard[];
  createdAt: Timestamp;
};

export type UserProfile = {
  id: string; // Firestore document ID
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  createdAt: Timestamp;
};
