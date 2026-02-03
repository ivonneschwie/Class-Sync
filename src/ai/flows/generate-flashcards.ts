'use server';
/**
 * @fileOverview Generates flashcards from lecture notes.
 *
 * - generateFlashcards - A function that generates flashcards from notes.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlashcardsInputSchema = z.object({
  notes: z.string().describe('The lecture notes to generate flashcards from.'),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const FlashcardSchema = z.object({
    front: z.string().describe('The question or term for the front of the flashcard. Should be a concise question.'),
    back: z.string().describe('The answer or definition for the back of the flashcard. Should be a concise and direct answer to the question on the front.'),
});

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema).describe('An array of generated flashcards.'),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(
  input: GenerateFlashcardsInput
): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: {schema: GenerateFlashcardsInputSchema},
  output: {schema: GenerateFlashcardsOutputSchema},
  prompt: `You are an AI assistant that creates study materials. Your task is to generate a set of flashcards from the provided lecture notes.

Each flashcard should have a clear, concise question on the "front" and a direct, accurate answer on the "back". Focus on key concepts, definitions, and important relationships within the text.

Generate as many high-quality flashcards as you can from the notes.

Notes:
{{{notes}}}`,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
