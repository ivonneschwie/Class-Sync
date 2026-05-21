'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FlashcardGenerator } from "./flashcard-generator";
import { useDecks } from '@/context/decks-context';
import type { FlashcardDeck } from '@/lib/types';
import { Layers, PlusCircle, Trash2, ArrowLeft, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { FlashcardViewer } from './flashcard-viewer';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ShareButton } from '@/components/share-button';
import { RedeemCodeDialog } from '@/components/redeem-code-dialog';

export default function FlashcardsPage() {
  const [createDeckOpen, setCreateDeckOpen] = useState(false);
  const { decks, deleteDeck } = useDecks();
  const { toast } = useToast();
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);

  const handleDeckCreated = () => {
    setCreateDeckOpen(false);
    toast({
      title: "Deck Saved!",
      description: "Your new flashcard deck has been saved.",
    });
  }

  const handleDeleteDeck = (deckId: string) => {
    deleteDeck(deckId);
    toast({
        title: "Deck Deleted",
        description: "The flashcard deck has been removed.",
    });
  };

  if (selectedDeck) {
    return (
        <div className="space-y-8">
            <Button variant="outline" onClick={() => setSelectedDeck(null)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Decks
            </Button>
            <FlashcardViewer deck={selectedDeck} />
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
            <h1 className="text-3xl font-bold font-headline tracking-tight">My Decks</h1>
            <p className="text-muted-foreground">
            Review your saved decks or create a new one.
            </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <RedeemCodeDialog expectedType="deck" />
            <Dialog open={createDeckOpen} onOpenChange={setCreateDeckOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Deck
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[720px] max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="font-headline flex items-center gap-1.5">
                            <Sparkles className="h-5 w-5 text-primary animate-pulse" /> Generate AI Flashcard Deck
                        </DialogTitle>
                        <CardDescription>
                            Specify a lecture note or a custom topic, and our AI will automatically extract key concepts to build your smart study cards.
                        </CardDescription>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto pr-6 -mr-6">
                        <FlashcardGenerator onDeckCreated={handleDeckCreated} />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {decks.map(deck => (
            <Card key={deck.id} className="flex flex-col group">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="font-headline text-xl">{deck.name}</CardTitle>
                            <CardDescription>{deck.subject} - {deck.flashcards.length} cards</CardDescription>
                        </div>
                         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ShareButton type="deck" data={deck} className="h-8 w-auto px-2" />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete the "{deck.name}" deck.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteDeck(deck.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                         </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">
                        Created on {deck.createdAt?.toDate ? format(deck.createdAt.toDate(), "MMMM d, yyyy") : 'Just now'}
                    </p>
                </CardContent>
                <CardContent>
                     <Button className="w-full" onClick={() => setSelectedDeck(deck)}>
                        <Layers className="mr-2 h-4 w-4"/>
                        Study Deck
                    </Button>
                </CardContent>
            </Card>
        ))}
      </div>
       {decks.length === 0 && (
          <Card className="flex flex-col items-center justify-center py-20 text-center border-dashed">
            <CardHeader>
                <div className="mx-auto bg-secondary rounded-full p-3">
                    <Layers className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4 font-headline">No Decks Yet</CardTitle>
                <CardDescription className="mt-2">
                Click "Create New Deck" to get started.
                </CardDescription>
            </CardHeader>
          </Card>
        )}
    </div>
  );
}
