'use client';

import { useState, useMemo, useEffect } from 'react';
import { generateFlashcards } from '@/ai/flows/generate-flashcards';
import { useSummaries } from '@/context/summaries-context';
import { useDecks } from '@/context/decks-context';
import type { Flashcard as FlashcardType, Summary } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { FlashcardViewer } from './flashcard-viewer';
import { Loader2, Inbox, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

type FlashcardGeneratorProps = {
    onDeckCreated: () => void;
}

export function FlashcardGenerator({ onDeckCreated }: FlashcardGeneratorProps) {
  const { summaries } = useSummaries();
  const { addDeck } = useDecks();
  const { toast } = useToast();
  
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<FlashcardType[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deckName, setDeckName] = useState('');

  const groupedSummaries = useMemo(() => {
    return summaries.reduce((acc, summary) => {
      const { subject } = summary;
      if (!acc[subject]) {
        acc[subject] = [];
      }
      acc[subject].push(summary);
      return acc;
    }, {} as Record<string, Summary[]>);
  }, [summaries]);

  const subjects = Object.keys(groupedSummaries).sort();
  const lessonsForSubject = selectedSubject ? groupedSummaries[selectedSubject] : [];

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    setSelectedLessonIds([]);
    setGeneratedFlashcards(null);
  };
  
  useEffect(() => {
    if (selectedSubject && lessonsForSubject.length > 0 && selectedLessonIds.length === 1) {
        const selectedLesson = lessonsForSubject.find(l => l.id === selectedLessonIds[0]);
        setDeckName(selectedLesson?.title || `${selectedSubject} Review`);
    } else if (selectedSubject) {
        setDeckName(`${selectedSubject} Review`);
    } else {
        setDeckName('');
    }
  }, [selectedLessonIds, selectedSubject, lessonsForSubject]);


  const handleLessonSelection = (lessonId: string, checked: boolean) => {
    setSelectedLessonIds(prev =>
      checked ? [...prev, lessonId] : prev.filter(id => id !== lessonId)
    );
  };

  const handleGenerate = async () => {
    if (selectedLessonIds.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No lessons selected',
        description: 'Please select at least one lesson to generate flashcards.',
      });
      return;
    }

    setIsLoading(true);
    setGeneratedFlashcards(null);
    
    try {
      const selectedLessons = summaries.filter(summary => selectedLessonIds.includes(summary.id));
      const notesToProcess = selectedLessons.map(lesson => `Topic: ${lesson.title}\nNotes:\n${lesson.notes}`).join('\n\n---\n\n');
      
      const result = await generateFlashcards({ notes: notesToProcess });

      if (result.flashcards.length === 0) {
        toast({
            variant: 'destructive',
            title: 'No flashcards generated',
            description: 'The AI could not generate flashcards from the selected notes. Try different lessons.',
        });
      } else {
        toast({
            title: 'Flashcards Generated!',
            description: `Created ${result.flashcards.length} flashcards. Review and save your deck.`,
        });
      }
      setGeneratedFlashcards(result.flashcards);

    } catch (error) {
      console.error('Error generating flashcards:', error);
      let description = 'Failed to generate flashcards. Please try again.';
      if (error instanceof Error && (error.message.includes('429') || error.message.includes('Too Many Requests'))) {
        description = 'You\'ve made too many requests in a short period. Please wait a minute and try again.';
      }
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDeck = () => {
    if (!generatedFlashcards || generatedFlashcards.length === 0) {
      toast({ variant: 'destructive', title: 'No flashcards to save.' });
      return;
    }
    if (!deckName.trim()) {
      toast({ variant: 'destructive', title: 'Deck name is required.' });
      return;
    }
    if (!selectedSubject) {
        toast({ variant: 'destructive', title: 'A subject is required.' });
        return;
    }
    
    addDeck({
        name: deckName,
        subject: selectedSubject,
        flashcards: generatedFlashcards,
    });
    
    onDeckCreated();
  };

  const isAllSelected = lessonsForSubject.length > 0 && selectedLessonIds.length === lessonsForSubject.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedLessonIds([]);
    } else {
      setSelectedLessonIds(lessonsForSubject.map(l => l.id));
    }
  };
  
  const currentDeckForViewer = useMemo(() => {
    if (!generatedFlashcards) return null;
    return {
        id: 'temp',
        name: deckName || 'Preview Deck',
        subject: selectedSubject || 'Unsaved',
        createdAt: new Date().toISOString(), // this is a string, but the type wants a timestamp. fine for preview.
        flashcards: generatedFlashcards
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedFlashcards, deckName, selectedSubject]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subject-select">1. Select a Subject</Label>
          <Select onValueChange={handleSubjectChange} defaultValue={selectedSubject ?? undefined}>
            <SelectTrigger id="subject-select">
              <SelectValue placeholder="Choose a subject..." />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
           <div className="flex justify-between items-center">
            <Label>2. Select Lessons</Label>
            {lessonsForSubject.length > 0 && (
                <div className="flex items-center space-x-2">
                    <Checkbox id="select-all" checked={isAllSelected} onCheckedChange={toggleSelectAll} />
                    <label htmlFor="select-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Select All
                    </label>
                </div>
            )}
          </div>
          <Card className="h-40">
            <ScrollArea className="h-full p-4">
              {selectedSubject ? (
                lessonsForSubject.length > 0 ? (
                    <div className="space-y-2">
                    {lessonsForSubject.map(lesson => (
                        <div key={lesson.id} className="flex items-center space-x-2">
                        <Checkbox
                            id={lesson.id}
                            checked={selectedLessonIds.includes(lesson.id)}
                            onCheckedChange={(checked) => handleLessonSelection(lesson.id, !!checked)}
                        />
                        <label htmlFor={lesson.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate" title={lesson.title}>
                            {lesson.title}
                        </label>
                        </div>
                    ))}
                    </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    <p>No lessons found for this subject.</p>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  <p>Please select a subject first.</p>
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>
      </div>
      
      <Button onClick={handleGenerate} disabled={isLoading || selectedLessonIds.length === 0} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Flashcards...
          </>
        ) : (
          '3. Generate Flashcards'
        )}
      </Button>

      <div className="mt-6">
        {isLoading && (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground space-y-2 py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                <p className="font-semibold">The AI is thinking...</p>
                <p className="text-sm">This may take a moment, especially for large notes.</p>
            </div>
        )}
        {!isLoading && currentDeckForViewer && (
          <div className="space-y-4 animate-in fade-in-50 duration-500">
            <div className="space-y-2">
                <Label htmlFor='deck-name'>4. Name and Save Your Deck</Label>
                <div className="flex gap-2">
                    <Input id="deck-name" placeholder="Enter a name for your deck" value={deckName} onChange={(e) => setDeckName(e.target.value)} />
                    <Button onClick={handleSaveDeck}><Save className="mr-2 h-4 w-4" /> Save Deck</Button>
                </div>
            </div>
            <FlashcardViewer deck={currentDeckForViewer as FlashcardDeck} />
          </div>
        )}
        {!isLoading && !generatedFlashcards && selectedSubject && (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground space-y-2 py-10 border-dashed border-2 rounded-lg">
                <Inbox className="h-10 w-10"/>
                <h3 className="text-lg font-semibold font-headline">Ready to Generate</h3>
                <p className="text-sm max-w-sm">Select one or more lessons from the list above and click the "Generate Flashcards" button to create your study deck.</p>
            </div>
        )}
      </div>
    </div>
  );
}

    