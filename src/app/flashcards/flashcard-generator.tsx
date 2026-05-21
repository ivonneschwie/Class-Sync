'use client';

import { useState, useMemo, useEffect } from 'react';
import { useDecks } from '@/context/decks-context';
import { useSummaries } from '@/context/summaries-context';
import { useClasses } from '@/context/classes-context';
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
  Bookmark,
  ArrowLeft,
  Loader2,
  HelpCircle
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type FlashcardGeneratorProps = {
  onDeckCreated: () => void;
}

const LOADING_QUOTES = [
  "Reading your materials with academic precision...",
  "Extracting essential formulas, facts, and ideas...",
  "Filtering out the fluff, retaining pure knowledge...",
  "Formulating expert question-and-answer pairs...",
  "Polishing concepts for maximum memory retention...",
  "Almost ready! Just double-checking the smart cards..."
];

export function FlashcardGenerator({ onDeckCreated }: FlashcardGeneratorProps) {
  const { addDeck } = useDecks();
  const { classes } = useClasses();
  const { summaries: notes } = useSummaries();
  const { toast } = useToast();
  
  const subjects = useMemo(() => Array.from(new Set(classes.map(c => c.name))).sort(), [classes]);

  // View steps: 'setup' | 'review'
  const [step, setStep] = useState<'setup' | 'review'>('setup');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingQuoteIdx, setLoadingQuoteIdx] = useState(0);

  // Setup form states
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [deckName, setDeckName] = useState('');
  const [cardNumber, setCardNumber] = useState<string>('5');

  // Review states (holds generated cards ready for save)
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [cardModes, setCardModes] = useState<Record<number, 'edit' | 'preview'>>({});
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  // Loading quotes cycle timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingQuoteIdx((prev) => (prev + 1) % LOADING_QUOTES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Filter notes by subject
  const filteredNotes = useMemo(() => {
    if (!selectedSubject) return [];
    return notes.filter(
      n => n.subject && n.subject.toLowerCase() === selectedSubject.toLowerCase()
    );
  }, [selectedSubject, notes]);

  // Selected notes list
  const selectedNotes = useMemo(() => {
    return notes.filter(n => selectedNoteIds.includes(n.id));
  }, [selectedNoteIds, notes]);

  // Dynamic recommendation based on cumulative note text size
  const recommendedCardCount = useMemo(() => {
    if (selectedNotes.length === 0) return 5;
    const totalLength = selectedNotes.reduce((acc, note) => acc + note.title.length + note.notes.length, 0);
    // ~1 card per 350 characters of note text, between 5 and 30
    return Math.max(5, Math.min(30, Math.ceil(totalLength / 350)));
  }, [selectedNotes]);

  // Reset selected note checklist when subject changes
  useEffect(() => {
    setSelectedNoteIds([]);
  }, [selectedSubject]);

  // Smart Pre-fill deckName based on chosen notes
  useEffect(() => {
    if (selectedSubject) {
      if (selectedNotes.length > 0) {
        const titles = selectedNotes.map(n => n.title).join(' & ');
        const prefill = titles.length > 40 ? `${selectedSubject} Notes Deck` : `${titles} Review`;
        setDeckName(prefill);
      } else {
        setDeckName(`${selectedSubject} Study Deck`);
      }
    } else {
      setDeckName('');
    }
  }, [selectedNoteIds, selectedSubject, selectedNotes]);

  // Update card number default based on dynamic recommendation
  useEffect(() => {
    if (selectedNotes.length > 0) {
      setCardNumber(String(recommendedCardCount));
    } else {
      setCardNumber('5');
    }
  }, [selectedNoteIds, recommendedCardCount, selectedNotes]);

  const handleToggleNote = (noteId: string) => {
    setSelectedNoteIds(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId) 
        : [...prev, noteId]
    );
  };

  // Review statistics helper
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

  const handleGenerateFlashcards = async () => {
    if (!selectedSubject) {
      toast({ variant: 'destructive', title: 'Missing Subject', description: 'Please select a subject first.' });
      return;
    }
    if (selectedNoteIds.length === 0) {
      toast({ variant: 'destructive', title: 'Missing Material', description: 'Please select at least one lecture note to proceed.' });
      return;
    }
    if (!deckName.trim()) {
      toast({ variant: 'destructive', title: 'Missing Name', description: 'Please specify a deck name.' });
      return;
    }
    const countVal = parseInt(cardNumber, 10);
    if (isNaN(countVal) || countVal < 1 || countVal > 40) {
      toast({ variant: 'destructive', title: 'Invalid Count', description: 'Please enter a valid card count between 1 and 40.' });
      return;
    }

    setIsGenerating(true);
    setLoadingQuoteIdx(0);

    const concatenatedContent = selectedNotes.map(n => `--- NOTE: ${n.title} ---\n${n.notes}`).join('\n\n');

    try {
      const response = await fetch('/api/ai/openrouter/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: concatenatedContent,
          count: countVal,
        })
      });

      if (!response.ok) {
        throw new Error('API server request failed.');
      }

      const data = await response.json();
      if (data.flashcards && data.flashcards.length > 0) {
        setFlashcards(data.flashcards);
        setStep('review');
        toast({
          title: 'Success!',
          description: `AI successfully formulated ${data.flashcards.length} smart study cards!`,
        });
      } else {
        throw new Error('AI returned an empty card array.');
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: err.message || 'An unexpected error occurred during generation.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDeck = () => {
    const validFlashcards = flashcards.filter(card => card.front.trim() !== '' && card.back.trim() !== '');
    
    if (validFlashcards.length === 0) {
      toast({ variant: 'destructive', title: 'Empty Deck', description: 'Please make sure there is at least one valid flashcard.' });
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

  // STEP 1: LOADING STATE
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center min-h-[400px]">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
          <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center shadow-xl animate-spin [animation-duration:3s]">
            <Sparkles className="h-8 w-8 text-primary-foreground animate-pulse" />
          </div>
        </div>
        <h3 className="text-xl font-bold font-headline text-foreground mb-2 flex items-center gap-1.5 justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" /> Thinking Deeply...
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm font-medium leading-relaxed italic transition-opacity duration-300">
          "{LOADING_QUOTES[loadingQuoteIdx]}"
        </p>
        <div className="mt-8 w-full max-w-xs space-y-1">
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden border border-muted-foreground/5 shadow-inner">
            <div className="h-full bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: SETUP GENERATION FORM
  if (step === 'setup') {
    return (
      <div className="space-y-6 py-2">
        {/* Sparkles Ribbon */}
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5 shadow-sm text-primary">
          <Sparkles className="h-5 w-5 text-primary shrink-0 animate-pulse" />
          <div className="text-xs font-semibold leading-relaxed">
            Configure the multi-note generator. Select a subject to view related notes, check the ones you want to study, and AI will compile a master deck.
          </div>
        </div>

        {/* Subject Selection */}
        <div className="space-y-2">
          <Label htmlFor="subject-select" className="text-sm font-bold font-headline text-foreground flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-primary" /> Select a Subject / Class
          </Label>
          <Select onValueChange={setSelectedSubject} value={selectedSubject}>
            <SelectTrigger id="subject-select" className="bg-background/50 border-primary/10 focus:ring-primary/20 rounded-xl transition-all h-10">
              <SelectValue placeholder="Choose a subject first..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-primary/10 shadow-lg">
              {subjects.length === 0 && <SelectItem value="General" disabled>No active classes found</SelectItem>}
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject} className="rounded-lg">
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes Checklist Scrollable block */}
        {selectedSubject && (
          <div className="space-y-2.5 border border-primary/10 rounded-xl p-3 bg-muted/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary to-pink-500" />
            <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" /> Select Lecture Notes
            </Label>
            
            {filteredNotes.length === 0 ? (
              <div className="text-xs text-muted-foreground italic py-6 text-center">
                No saved notes found for "{selectedSubject}". Open the Notebook page to write notes under this subject.
              </div>
            ) : (
              <ScrollArea className="h-[160px] pr-2">
                <div className="space-y-2">
                  {filteredNotes.map(note => {
                    const isChecked = selectedNoteIds.includes(note.id);
                    return (
                      <div 
                        key={note.id} 
                        onClick={() => handleToggleNote(note.id)}
                        className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                          isChecked 
                            ? 'border-primary/40 bg-primary/5 shadow-sm' 
                            : 'border-primary/5 hover:bg-muted/40 bg-background/40'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => {}} // parent onClick is the driver
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary shrink-0"
                        />
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-foreground truncate">{note.title}</h5>
                          <p className="text-[10px] text-muted-foreground line-clamp-1 truncate leading-normal">
                            {note.notes ? note.notes.replace(/[#*`\-]/g, '').slice(0, 100) : 'No note text...'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        {/* Configurations Fields */}
        {selectedNoteIds.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
            {/* Number of Cards Textbox Input */}
            <div className="space-y-2">
              <Label htmlFor="cards-count" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <PlusCircle className="h-3.5 w-3.5 text-pink-500" /> Flashcards Count
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="cards-count"
                  type="number"
                  min={1}
                  max={40}
                  value={cardNumber}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      setCardNumber(String(Math.max(1, Math.min(40, val))));
                    } else {
                      setCardNumber('');
                    }
                  }}
                  className="w-20 bg-background/50 border-primary/10 focus-visible:ring-primary/20 rounded-xl transition-all h-10 text-center font-bold"
                />
                <span className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary px-3 py-2 rounded-xl text-xs font-bold shadow-sm select-none">
                  <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse shrink-0" /> Rec: {recommendedCardCount}
                </span>
              </div>
            </div>

            {/* Deck Title Input */}
            <div className="space-y-2">
              <Label htmlFor="deck-name" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Bookmark className="h-3.5 w-3.5 text-violet-500" /> Deck Name
              </Label>
              <Input 
                id="deck-name" 
                placeholder="Deck name..." 
                value={deckName} 
                onChange={(e) => setDeckName(e.target.value)}
                className="bg-background/50 border-primary/10 focus-visible:ring-primary/20 rounded-xl transition-all h-10"
              />
            </div>
          </div>
        )}

        {/* Generation Button */}
        <Button 
          onClick={handleGenerateFlashcards}
          disabled={selectedNoteIds.length === 0}
          className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/95 hover:shadow-lg focus:ring-primary/20 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 font-headline font-bold text-sm mt-4 relative overflow-hidden"
        >
          <Sparkles className="h-4.5 w-4.5 animate-pulse" /> Generate Deck with AI
        </Button>
      </div>
    );
  }

  // STEP 3: REVIEW AND EDIT FLOW
  return (
    <div className="space-y-6 py-2">
      {/* Back to Setup Button */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setStep('setup')}
          className="text-muted-foreground hover:text-foreground text-xs font-bold rounded-xl flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Setup
        </Button>
        <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold shadow-sm">
          <Sparkles className="h-3 w-3 animate-pulse" /> AI Draft
        </span>
      </div>

      {/* Deck Metadata Header Info */}
      <Card className="border border-primary/10 bg-card/45 backdrop-blur-md shadow-md overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500" />
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject Selector */}
            <div className="space-y-2">
              <Label htmlFor="subject-select" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-primary" /> Subject
              </Label>
              <Select onValueChange={setSelectedSubject} value={selectedSubject}>
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
                placeholder="Deck Name" 
                value={deckName} 
                onChange={(e) => setDeckName(e.target.value)}
                className="bg-background/50 border-primary/10 focus-visible:ring-primary/20 rounded-xl transition-all h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats progress */}
      <Card className="border border-primary/5 bg-muted/20 shadow-sm rounded-xl">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Review Status</p>
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

      {/* Cards collection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-bold text-foreground font-headline">Review Flashcards</Label>
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
                      {/* Mode toggle */}
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

                      {/* Remove card */}
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

      {/* Save Button */}
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