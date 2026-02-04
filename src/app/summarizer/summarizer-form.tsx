'use client';

import { useState, useRef, useEffect } from 'react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { summarizeLectureNotes } from '@/ai/flows/summarize-lecture-notes';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lightbulb, ClipboardList, Mic, Square } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSummaries } from '@/context/summaries-context';
import { useClasses } from '@/context/classes-context';

const formSchema = z.object({
  subject: z.string({ required_error: 'Please select a subject.' }),
  notes: z.string().min(50, 'Please enter at least 50 characters to summarize.'),
});

type SummaryOutput = {
  title: string;
  summary: string;
  clarificationQuestions: string;
};

// For Web Speech API, which might not be fully typed in all environments
interface CustomSpeechRecognition extends SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export function SummarizerForm() {
  const [summaryOutput, setSummaryOutput] = useState<SummaryOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addSummary } = useSummaries();
  const { classes } = useClasses();
  
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recognitionRef = useRef<CustomSpeechRecognition | null>(null);
  const [notesContent, setNotesContent] = useState('');
  
  // This ref will hold the transcript content that exists *before* transcription starts.
  const baseTranscriptRef = useRef<string>('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: '',
      subject: undefined,
    },
  });

  // Sync local state back to the form for validation and submission
  useEffect(() => {
    form.setValue('notes', notesContent, { shouldValidate: true });
  }, [notesContent, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSummaryOutput(null);
    try {
      const result = await summarizeLectureNotes({notes: values.notes});
      setSummaryOutput(result);
      addSummary({
        title: result.title,
        notes: values.notes,
        summary: result.summary,
        clarificationQuestions: result.clarificationQuestions,
        subject: values.subject,
      });
      toast({
        title: 'Summary Generated!',
        description: 'Your summary has been saved to the Lesson Catalog.',
      });
    } catch (error) {
      console.error('Error summarizing notes:', error);
      let description = 'Failed to summarize notes. Please try again.';
      if (error instanceof Error && (error.message.includes('429') || error.message.includes('Too Many Requests'))) {
        description = 'You\'ve made too many requests in a short period. Please wait a minute and try again.';
      }
      toast({
        variant: 'destructive',
        title: 'Summarization Failed',
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleToggleTranscription = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast({
        variant: 'destructive',
        title: 'Browser Not Supported',
        description: 'Live transcription is not supported in your browser.',
      });
      return;
    }

    if (isTranscribing) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition() as CustomSpeechRecognition;
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsTranscribing(true);
      // When starting, store whatever is already in the box.
      baseTranscriptRef.current = notesContent ? notesContent + ' ' : '';
      toast({ title: 'Transcription started...', description: 'Start speaking. Click the stop button when you are done.' });
    };

    recognition.onend = () => {
      setIsTranscribing(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
       let errorMsg = `An error occurred: ${event.error}`;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          errorMsg = "Microphone access was denied. Please allow microphone access in your browser settings.";
      } else if (event.error === 'no-speech') {
          errorMsg = "No speech was detected. Please try again.";
      }
      toast({
        variant: 'destructive',
        title: 'Transcription Error',
        description: errorMsg,
      });
      setIsTranscribing(false);
    };

    recognition.onresult = (event) => {
        let interim_transcript = '';
        let final_transcript = '';

        // Iterate through all the results from the beginning of the speech
        for (let i = 0; i < event.results.length; ++i) {
            const transcriptPart = event.results[i][0].transcript;
            // If the result is final, append it to the final transcript
            if (event.results[i].isFinal) {
                final_transcript += transcriptPart;
            } else {
                // Otherwise, it's part of the interim transcript
                interim_transcript += transcriptPart;
            }
        }
        
        // Add a space after a period if it's the end of the final part
        if (final_transcript.endsWith('.')) {
            final_transcript += ' ';
        }
        
        // Update the content by combining the base text with the new transcript
        setNotesContent(baseTranscriptRef.current + final_transcript + interim_transcript);
    };

    recognition.start();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const formattedQuestions = summaryOutput?.clarificationQuestions.split('\n').filter(q => q.trim() !== '' && q.trim() !== '-');

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject for your notes" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name} ({c.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Paste your notes here, or use the microphone for live transcription..."
                    className="min-h-[200px] resize-y"
                    {...field}
                    value={notesContent}
                    onChange={(e) => {
                        setNotesContent(e.target.value);
                        if (!isTranscribing) {
                            baseTranscriptRef.current = e.target.value;
                        }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleToggleTranscription}
              disabled={isLoading}
            >
              {isTranscribing ? (
                <>
                  <Square className="mr-2 h-4 w-4 text-red-500 fill-current" />
                  Stop Transcription
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Start Transcription
                </>
              )}
            </Button>
            <Button type="submit" disabled={isLoading || isTranscribing}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Summarizing...
                </>
              ) : (
                'Summarize Notes'
              )}
            </Button>
          </div>
        </form>
      </Form>

      {isLoading && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <ClipboardList className="text-primary"/> Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[75%]" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Lightbulb className="text-primary"/> Clarification Questions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[80%]" />
            </CardContent>
          </Card>
        </div>
      )}

      {summaryOutput && (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{summaryOutput.title}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 font-headline">
                  <ClipboardList className="text-primary"/>
                  Summary
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap leading-relaxed">{summaryOutput.summary}</p>
            </CardContent>
          </Card>

          <Card className="bg-accent/10 border-accent/20">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 font-headline">
                  <Lightbulb className="text-primary"/>
                  Clarification Questions
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5">
                {formattedQuestions?.map((question, index) => (
                  <li key={index}>{question.replace(/^- /, '')}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
