'use server';
/**
 * @fileOverview A flow for transcribing audio to text.
 *
 * - transcribeAudio - A function that takes audio data and returns transcribed text.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const TranscribeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "Audio data as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

const TranscribeAudioOutputSchema = z.object({
  text: z.string().describe('The transcribed text from the audio.'),
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;

export async function transcribeAudio(
  input: TranscribeAudioInput
): Promise<TranscribeAudioOutput> {
  return transcribeAudioFlow(input);
}

const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async ({audioDataUri}) => {
    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: [
        {media: {url: audioDataUri}},
        {text: 'Transcribe the audio.'},
      ],
    });

    return {text: response.text};
  }
);
