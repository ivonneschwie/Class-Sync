'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { summarizeLectureNotes } from '@/ai/flows/summarize-lecture-notes';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
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

export function SummarizerForm() {
  const [summaryOutput, setSummaryOutput] = useState<SummaryOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addSummary } = useSummaries();
  const { classes } = useClasses();
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: '',
      subject: undefined,
    },
  });

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
  
  const handleToggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            if (!base64Audio) return;

            try {
              toast({ title: 'Transcribing...', description: 'Please wait while we process your speech.' });
              const { text: transcribedText } = await transcribeAudio({ audioDataUri: base64Audio });
              const currentNotes = form.getValues('notes');
              form.setValue('notes', (currentNotes ? currentNotes + '\n\n' : '') + transcribedText, { shouldValidate: true });
            } catch (error) {
              console.error('Error transcribing audio:', error);
              let description = 'Failed to transcribe audio. Please try again.';
              if (error instanceof Error && (error.message.includes('429') || error.message.includes('Too Many Requests'))) {
                description = 'You\'ve made too many requests in a short period. Please wait a minute and try again.';
              }
              toast({
                variant: 'destructive',
                title: 'Transcription Failed',
                description: description,
              });
            } finally {
              stream.getTracks().forEach(track => track.stop());
            }
          };
          setIsRecording(false);
        };

        recorder.start();
        setIsRecording(true);
        toast({ title: 'Recording started...', description: 'Click the square icon to stop.' });
      } catch (error) {
        console.error("Error accessing microphone:", error);
        toast({
            variant: "destructive",
            title: "Microphone Error",
            description: "Could not access microphone. Please check your browser permissions.",
        });
      }
    }
  };


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
                <div className="relative">
                  <FormControl>
                    <Textarea
                      placeholder="Paste your notes here, or use the microphone to dictate..."
                      className="min-h-[200px] resize-y pr-12"
                      {...field}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8 text-muted-foreground"
                    onClick={handleToggleRecording}
                  >
                    {isRecording ? <Square className="h-4 w-4 text-red-500 fill-current" /> : <Mic className="h-4 w-4" />}
                    <span className="sr-only">{isRecording ? 'Stop recording' : 'Start recording'}</span>
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading || isRecording} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Summarizing...
              </>
            ) : (
              'Summarize Notes'
            )}
          </Button>
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

    