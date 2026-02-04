'use client';

import { useState, useRef, useEffect } from 'react';
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
  
  const [liveTranscript, setLiveTranscript] = useState('');
  
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const liveTextRef = useRef<HTMLSpanElement | null>(null);


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

  useEffect(() => {
    if (scrollContainerRef.current && liveTextRef.current) {
        const container = scrollContainerRef.current;
        const text = liveTextRef.current;

        const isClient = typeof window !== 'undefined';
        const isMobile = isClient && window.innerWidth < 768;
        const scrollThreshold = isMobile ? 0.8 : 0.9;
        
        const isOverflowing = text.scrollWidth > container.clientWidth * scrollThreshold;
        
        if (isOverflowing) {
            container.scrollLeft = text.scrollWidth;
        }
    }
  }, [liveTranscript]);


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

    let finalTranscriptForSession = '';

    recognition.onstart = () => {
      setIsTranscribing(true);
      setLiveTranscript('');
      toast({ title: 'Transcription started...', description: 'Start speaking. Click the stop button when you are done.' });
    };

    recognition.onend = () => {
      setIsTranscribing(false);
      
      const textToAppend = (finalTranscriptForSession.trim() ? finalTranscriptForSession.trim() + ' ' : '');

      setNotesContent(prev => 
        (prev.trim() ? prev.trim() + ' ' : '') + textToAppend
      );
      setLiveTranscript('');
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
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      finalTranscriptForSession = finalTranscript.replace(/\.([^ \n])/g, '. $1');
      setLiveTranscript(finalTranscriptForSession + interimTranscript);
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
                    }}
                    disabled={isTranscribing}
                  />
                </FormControl>
                {isTranscribing && (
                  <div className="mt-2 rounded-md bg-[hsl(154,50%,55%)] font-headline text-lg animate-in fade-in-50 overflow-hidden px-6 py-4 animation-pulse-glow">
                    <div
                      ref={scrollContainerRef}
                      className="no-scrollbar overflow-x-auto"
                    >
                      <span className="whitespace-nowrap text-slate-100" ref={liveTextRef}>
                        {liveTranscript || 'Listening...'}
                      </span>
                    </div>
                  </div>
                )}
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
