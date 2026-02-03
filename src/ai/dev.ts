import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-lecture-notes.ts';
import '@/ai/flows/transcribe-audio.ts';
import '@/ai/flows/generate-flashcards.ts';
