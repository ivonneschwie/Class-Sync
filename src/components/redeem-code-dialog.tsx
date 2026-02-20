'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, Hash, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { useSummaries } from '@/context/summaries-context';
import { useDecks } from '@/context/decks-context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RedeemCodeDialogProps {
  expectedType: 'summary' | 'deck';
}

export function RedeemCodeDialog({ expectedType }: RedeemCodeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sharedItem, setSharedItem] = useState<any>(null);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { addSummary } = useSummaries();
  const { addDeck } = useDecks();

  const reset = () => {
    setCode('');
    setSharedItem(null);
    setIsLoading(false);
  };

  const handleLookup = async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setSharedItem(null);

    try {
      const shareRef = doc(firestore, 'shares', code.trim().toUpperCase());
      const snap = await getDoc(shareRef);
      
      if (!snap.exists()) {
        toast({
          variant: 'destructive',
          title: 'Code Not Found',
          description: 'The code you entered is invalid or has expired.',
        });
      } else {
        const data = snap.data();
        if (data.type !== expectedType) {
          toast({
            variant: 'destructive',
            title: 'Invalid Code Type',
            description: `This code is for a ${data.type === 'summary' ? 'Lesson' : 'Flashcard Deck'}, but you are trying to import it here.`,
          });
        } else {
          setSharedItem(data);
        }
      }
    } catch (error) {
      console.error('Error looking up code:', error);
      toast({
        variant: 'destructive',
        title: 'Lookup Failed',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (!sharedItem) return;

    if (sharedItem.type === 'summary') {
      addSummary(sharedItem.data);
    } else {
      addDeck(sharedItem.data);
    }

    toast({
      title: 'Success!',
      description: `The ${sharedItem.type === 'summary' ? 'lesson' : 'deck'} has been added to your library.`,
    });
    setIsOpen(false);
    reset();
  };

  const typeLabel = expectedType === 'summary' ? 'Lesson' : 'Flashcard Deck';

  return (
    <Dialog open={isOpen} onOpenChange={(val) => {
        setIsOpen(val);
        if(!val) reset();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Hash className="mr-2 h-4 w-4" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import {typeLabel}</DialogTitle>
          <DialogDescription>
            Enter a 6-digit code to import shared {expectedType === 'summary' ? 'lessons' : 'flashcard decks'}.
          </DialogDescription>
        </DialogHeader>

        {!sharedItem ? (
          <div className="flex gap-2 py-4">
            <Input
              placeholder="E.G. XJ39A1"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="text-center font-bold tracking-widest uppercase h-12"
            />
            <Button onClick={handleLookup} disabled={isLoading || !code} className="h-12">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Find'}
            </Button>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 p-2 rounded-md">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Resource found! Preview below:</span>
            </div>
            
            <Card>
                <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                             <div className="flex items-center gap-2 mb-1">
                                {sharedItem.type === 'summary' ? <BookOpen className="h-4 w-4 text-primary"/> : <Layers className="h-4 w-4 text-primary"/>}
                                <Badge variant="outline" className="capitalize">{sharedItem.type}</Badge>
                            </div>
                            <h3 className="font-bold text-lg">{sharedItem.data.title || sharedItem.data.name}</h3>
                            <p className="text-sm text-muted-foreground">{sharedItem.data.subject}</p>
                        </div>
                    </div>
                    {sharedItem.type === 'deck' && (
                        <p className="text-xs text-muted-foreground">Contains {sharedItem.data.flashcards.length} flashcards.</p>
                    )}
                </CardContent>
            </Card>

            <DialogFooter>
                <Button variant="ghost" onClick={() => setSharedItem(null)}>Clear</Button>
                <Button onClick={handleImport} className="w-full">Add to My Library</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}