'use client';

import { useState, useMemo } from 'react';
import { useDecks } from '@/context/decks-context';
import type { Flashcard as FlashcardType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  PlusCircle, 
  Trash2, 
  Save, 
  BookOpen, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Bookmark
} from 'lucide-react';
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
  
  // Card view mode per card index: 'edit' or 'preview'
  const [cardModes, setCardModes] = useState<Record<number, 'edit' | 'preview'>>({});
  // Card flipping state for the 3D preview cards
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  // Statistics helper
  const stats = useMemo(() => {
    const total = flashcards.length;
    const completed = flashcards.filter(c => c.front.trim() !== '' && c.back.trim() !== '').length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    const isValid = completed > 0 && deckName.trim() !== '' && selectedSubject !== '';
    return { total, completed, progress, isValid };
  }, [flashcards, deckName, selectedSubject]);

  const handleAddCard = () => {
    setFlashcards(prev => [...prev, { front: '', back: '' }]);
  };

  const handleRemoveCard = (index: number) => {
    if (flashcards.length === 1) return;
    setFlashcards(prev => prev.filter((_, i) => i !== index));
    // Clean up mode and flip state
    setCardModes(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
    setFlippedCards(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const handleCardChange = (index: number, field: 'front' | 'back', value: string) => {
    const updated = [...flashcards];
    updated[index][field] = value;
    setFlashcards(updated);
  };

  const toggleCardMode = (index: number, mode: 'edit' | 'preview') => {
    setCardModes(prev => ({ ...prev, [index]: mode }));
  };

  const toggleFlip = (index: number) => {
    setFlippedCards(prev => ({ ...prev, [index]: !prev[index] }));
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
    <div className="space-y-6 py-2">
      
      {/* 1. Header Information Panel */}
      <Card className="border border-primary/10 bg-card/45 backdrop-blur-md shadow-md overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500" />
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Subject Selector */}
            <div className="space-y-2">
              <Label htmlFor="subject-select" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-primary" /> Subject
              </Label>
              <Select onValueChange={setSelectedSubject} defaultValue={selectedSubject}>
                <SelectTrigger id="subject-select" className="bg-background/50 border-primary/10 focus:ring-primary/20 rounded-xl transition-all h-10">
                  <SelectValue placeholder="Choose a subject..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-primary/10 shadow-lg">
                  {subjects.length === 0 && <SelectItem value="General" disabled>No subjects found</SelectItem>}
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject} className="rounded-lg">
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Deck Title */}
            <div className="space-y-2">
              <Label htmlFor="deck-name" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Bookmark className="h-3.5 w-3.5 text-violet-500" /> Deck Name
              </Label>
              <Input 
                id="deck-name" 
                placeholder="e.g., Midterm Review, Anatomy 101" 
                value={deckName} 
                onChange={(e) => setDeckName(e.target.value)}
                className="bg-background/50 border-primary/10 focus-visible:ring-primary/20 rounded-xl transition-all h-10"
              />
            </div>

          </div>
        </CardContent>
      </Card>

      {/* 2. Deck Completeness Metrics Progress Panel */}
      <Card className="border border-primary/5 bg-muted/20 shadow-sm rounded-xl">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deck Build Status</p>
              <h4 className="text-sm font-bold text-foreground">
                {stats.completed} of {stats.total} Card{stats.total !== 1 && 's'} Completed
              </h4>
            </div>
          </div>

          <div className="flex-1 w-full max-w-[200px] space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
              <span>Progress</span>
              <span>{Math.round(stats.progress)}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-muted-foreground/5 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 rounded-full transition-all duration-500" 
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>

          <div>
            {stats.isValid ? (
              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                <CheckCircle2 className="h-3.5 w-3.5" /> Ready to Save
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-500 border border-amber-500/25 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                <AlertCircle className="h-3.5 w-3.5" /> Incomplete
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3. Flashcards Scrolling List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-bold text-foreground font-headline">Flashcards Collection</Label>
            <span className="bg-primary/10 text-primary border border-primary/20 text-xs px-2 py-0.5 rounded-full font-bold">
              {stats.total}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddCard}
            className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 hover:text-primary transition-all shadow-sm flex items-center gap-1.5"
          >
            <PlusCircle className="h-4 w-4" /> Add New Card
          </Button>
        </div>
        
        <ScrollArea className="h-[43vh] pr-2 rounded-xl border border-primary/5 bg-background/35 p-1">
          <div className="space-y-4">
            {flashcards.map((card, index) => {
              const mode = cardModes[index] || 'edit';
              const isFlipped = flippedCards[index] || false;
              
              const isCardValid = card.front.trim() !== '' && card.back.trim() !== '';

              return (
                <Card 
                  key={index} 
                  className="group border border-primary/10 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden relative"
                  style={{
                    borderLeft: '4px solid',
                    borderImage: 'linear-gradient(to bottom, var(--primary), #8b5cf6, #d946ef) 1'
                  }}
                >
                  {/* Card Actions Header */}
                  <CardHeader className="py-3 px-4 flex flex-row items-center justify-between bg-muted/40 border-b border-primary/5">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-primary to-violet-500 text-primary-foreground text-xs font-extrabold flex items-center justify-center shadow-sm">
                        {index + 1}
                      </div>
                      <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {isCardValid ? (
                          <span className="text-emerald-500 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="h-3 w-3" /> Valid Card
                          </span>
                        ) : (
                          <span>Flashcard</span>
                        )}
                      </CardTitle>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Edit vs Preview Toggle Group */}
                      <div className="flex items-center bg-background border border-primary/10 rounded-lg p-0.5 shadow-inner">
                        <button
                          type="button"
                          onClick={() => toggleCardMode(index, 'edit')}
                          className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all focus:outline-none ${
                            mode === 'edit' 
                              ? 'bg-primary text-primary-foreground shadow-sm' 
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <FileText className="h-3 w-3" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            toggleCardMode(index, 'preview');
                            // Auto reset flip to front side
                            setFlippedCards(prev => ({ ...prev, [index]: false }));
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all focus:outline-none ${
                            mode === 'preview' 
                              ? 'bg-primary text-primary-foreground shadow-sm' 
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Eye className="h-3 w-3" /> 3D Preview
                        </button>
                      </div>

                      {/* Delete Button */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                        onClick={() => handleRemoveCard(index)}
                        disabled={flashcards.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4">
                    {mode === 'edit' ? (
                      /* EDIT MODE: Split layout / Text inputs */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Front (Question)
                          </Label>
                          <Textarea 
                            placeholder="Enter the question or concept..." 
                            value={card.front}
                            onChange={(e) => handleCardChange(index, 'front', e.target.value)}
                            className="min-h-[85px] bg-background/35 border-primary/5 focus:border-primary/20 rounded-xl placeholder:text-muted-foreground/45 transition-all text-sm leading-relaxed"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> Back (Answer)
                          </Label>
                          <Textarea 
                            placeholder="Enter the definition or response..." 
                            value={card.back}
                            onChange={(e) => handleCardChange(index, 'back', e.target.value)}
                            className="min-h-[85px] bg-background/35 border-primary/5 focus:border-primary/20 rounded-xl placeholder:text-muted-foreground/45 transition-all text-sm leading-relaxed"
                          />
                        </div>
                      </div>
                    ) : (
                      /* 3D PREVIEW FLIP CARD MODE */
                      <div className="flex items-center justify-center py-4 bg-muted/15 rounded-xl border border-dashed border-primary/5">
                        <div style={{ perspective: '1000px', width: '100%', maxWidth: '380px', height: '140px' }} className="relative">
                          <div 
                            style={{
                              width: '100%',
                              height: '100%',
                              position: 'relative',
                              transformStyle: 'preserve-3d',
                              transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                              cursor: 'pointer'
                            }}
                            onClick={() => toggleFlip(index)}
                            title="Click to flip card"
                          >
                            {/* Front Side */}
                            <div 
                              style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                              }}
                              className="bg-card border border-primary/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-md select-none"
                            >
                              <span className="text-[9px] text-primary/70 font-extrabold uppercase tracking-wider mb-2">Front (Question)</span>
                              <p className="text-xs font-semibold text-foreground line-clamp-3 px-2">
                                {card.front.trim() || <span className="text-muted-foreground/35 italic">No question entered yet...</span>}
                              </p>
                              <span className="text-[8px] text-muted-foreground/50 mt-3 font-mono">Tap Card to Flip 🔄</span>
                            </div>

                            {/* Back Side */}
                            <div 
                              style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)'
                              }}
                              className="bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 border border-primary/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-md select-none"
                            >
                              <span className="text-[9px] text-pink-500 font-extrabold uppercase tracking-wider mb-2">Back (Answer)</span>
                              <p className="text-xs font-semibold text-foreground line-clamp-3 px-2">
                                {card.back.trim() || <span className="text-muted-foreground/35 italic">No answer entered yet...</span>}
                              </p>
                              <span className="text-[8px] text-muted-foreground/50 mt-3 font-mono">Tap Card to Flip 🔄</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* 4. Action Save Button */}
      <Button 
        onClick={handleSaveDeck} 
        disabled={!stats.isValid}
        className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/95 hover:shadow-lg focus:ring-primary/20 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 font-headline font-bold text-sm mt-2"
      >
        <Save className="h-4.5 w-4.5" /> Save Flashcard Deck
      </Button>
    </div>
  );
}