'use server';
/**
 * @fileOverview Summarizes lecture notes into a concise study guide.
 *
 * - summarizeLectureNotes - A function that summarizes lecture notes.
 * - SummarizeLectureNotesInput - The input type for the summarizeLectureNotes function.
 * - SummarizeLectureNotesOutput - The return type for the summarizeLectureNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeLectureNotesInputSchema = z.object({
  notes: z.string().describe('The lecture notes to summarize.'),
});
export type SummarizeLectureNotesInput = z.infer<typeof SummarizeLectureNotesInputSchema>;

const SummarizeLectureNotesOutputSchema = z.object({
  title: z.string().describe('A short, descriptive title for the lecture notes, based on the main topic.'),
  summary: z.string().describe('A concise summary of the lecture notes.'),
  clarificationQuestions: z
    .string()
    .describe('Questions to clarify any ambiguous points in the notes.'),
});
export type SummarizeLectureNotesOutput = z.infer<typeof SummarizeLectureNotesOutputSchema>;

export async function summarizeLectureNotes(
  input: SummarizeLectureNotesInput
): Promise<SummarizeLectureNotesOutput> {
  return summarizeLectureNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeLectureNotesPrompt',
  input: {schema: SummarizeLectureNotesInputSchema},
  output: {schema: SummarizeLectureNotesOutputSchema},
  prompt: `You are an AI assistant designed to help students study.

You will be given lecture notes and your task is to create a short, descriptive title for the notes, a concise summary of the notes, and also provide clarification questions to help the student understand the material better.

Notes: {{{notes}}}`,
});

const summarizeLectureNotesFlow = ai.defineFlow(
  {
    name: 'summarizeLectureNotesFlow',
    inputSchema: SummarizeLectureNotesInputSchema,
    outputSchema: SummarizeLectureNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
