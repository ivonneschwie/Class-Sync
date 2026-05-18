'use client';

import { useState } from 'react';
import { useDecks } from '@/context/decks-context';
import type { Flashcard as FlashcardType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClasses } from '@/context/classes-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type FlashcardGeneratorProps = {
    onDeckCreated: () => void;
}

export function FlashcardGenerator({ onDeckCreated }: FlashcardGeneratorProps) {
  const { addDeck } = useDecks();
  const { classes } = useClasses();
  const { toast } = useToast();
  
  const subjects = Array.from(new Set(classes.map(c => c.name))).sort();

  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [deckName, setDeckName] = useState('');
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([{ front: '', back: '' }]);

  const handleAddCard = () => {
      setFlashcards(prev => [...prev, { front: '', back: '' }]);
  };

  const handleRemoveCard = (index: number) => {
      setFlashcards(prev => prev.filter((_, i) => i !== index));
  };

  const handleCardChange = (index: number, field: 'front' | 'back', value: string) => {
      const updated = [...flashcards];
      updated[index][field] = value;
      setFlashcards(updated);
  };

  const handleSaveDeck = () => {
    const validFlashcards = flashcards.filter(card => card.front.trim() !== '' && card.back.trim() !== '');
    
    if (validFlashcards.length === 0) {
      toast({ variant: 'destructive', title: 'Empty Deck', description: 'Please add at least one complete flashcard.' });
      return;
    }
    if (!deckName.trim()) {
      toast({ variant: 'destructive', title: 'Missing Name', description: 'Deck name is required.' });
      return;
    }
    if (!selectedSubject) {
        toast({ variant: 'destructive', title: 'Missing Subject', description: 'A subject is required.' });
        return;
    }
    
    addDeck({
        name: deckName,
        subject: selectedSubject,
        flashcards: validFlashcards,
    });
    
    onDeckCreated();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="subject-select">Subject</Label>
                <Select onValueChange={setSelectedSubject} defaultValue={selectedSubject}>
                    <SelectTrigger id="subject-select">
                        <SelectValue placeholder="Choose a subject..." />
                    </SelectTrigger>
                    <SelectContent>
                        {subjects.length === 0 && <SelectItem value="General" disabled>No subjects found</SelectItem>}
                        {subjects.map(subject => (
                            <SelectItem key={subject} value={subject}>
                                {subject}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="deck-name">Deck Name</Label>
                <Input 
                    id="deck-name" 
                    placeholder="e.g., Midterm Review" 
                    value={deckName} 
                    onChange={(e) => setDeckName(e.target.value)} 
                />
            </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <Label>Flashcards</Label>
            <Button variant="outline" size="sm" onClick={handleAddCard}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Card
            </Button>
        </div>
        
        <ScrollArea className="h-[40vh] pr-4 rounded-md border p-4">
            <div className="space-y-4">
                {flashcards.map((card, index) => (
                    <Card key={index}>
                        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between bg-muted/50">
                            <CardTitle className="text-sm font-medium">Card {index + 1}</CardTitle>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveCard(index)}
                                disabled={flashcards.length === 1}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs">Front (Question)</Label>
                                <Textarea 
                                    placeholder="Enter question or term..." 
                                    value={card.front}
                                    onChange={(e) => handleCardChange(index, 'front', e.target.value)}
                                    className="min-h-[80px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Back (Answer)</Label>
                                <Textarea 
                                    placeholder="Enter answer or definition..." 
                                    value={card.back}
                                    onChange={(e) => handleCardChange(index, 'back', e.target.value)}
                                    className="min-h-[80px]"
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </ScrollArea>
      </div>

      <Button onClick={handleSaveDeck} className="w-full">
         <Save className="mr-2 h-4 w-4" />
         Save Deck
      </Button>
    </div>
  );
}