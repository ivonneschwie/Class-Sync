
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, Hash, BookOpen, Layers, CheckCircle2, Calendar, LayoutGrid, AlertTriangle } from 'lucide-react';
import { useSummaries } from '@/context/summaries-context';
import { useDecks } from '@/context/decks-context';
import { useClasses } from '@/context/classes-context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface RedeemCodeDialogProps {
  expectedType: 'summary' | 'deck' | 'class' | 'schedule';
  children?: React.ReactNode;
}

export function RedeemCodeDialog({ expectedType, children }: RedeemCodeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sharedItem, setSharedItem] = useState<any>(null);
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);
  
  const { toast } = useToast();
  const firestore = useFirestore();
  const { addSummary } = useSummaries();
  const { addDeck } = useDecks();
  const { addClass, overwriteClasses } = useClasses();

  const reset = () => {
    setCode('');
    setSharedItem(null);
    setIsLoading(false);
    setShowOverwriteWarning(false);
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
          const typeLabels: Record<string, string> = {
            summary: 'Lesson',
            deck: 'Flashcard Deck',
            class: 'Class',
            schedule: 'Full Schedule'
          };
          toast({
            variant: 'destructive',
            title: 'Invalid Code Type',
            description: `This code is for a ${typeLabels[data.type] || data.type}, but you are trying to import it here.`,
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

  const handleImport = async () => {
    if (!sharedItem) return;

    if (sharedItem.type === 'schedule') {
      setShowOverwriteWarning(true);
      return;
    }

    performImport();
  };

  const performImport = async () => {
    if (!sharedItem) return;

    try {
      if (sharedItem.type === 'summary') {
        addSummary(sharedItem.data);
      } else if (sharedItem.type === 'deck') {
        addDeck(sharedItem.data);
      } else if (sharedItem.type === 'class') {
        addClass(sharedItem.data);
      } else if (sharedItem.type === 'schedule') {
        await overwriteClasses(sharedItem.data.classes);
      }

      toast({
        title: 'Success!',
        description: `The ${expectedType === 'summary' ? 'lesson' : expectedType === 'deck' ? 'deck' : 'resource'} has been added to your library.`,
      });
      setIsOpen(false);
      reset();
    } catch (error) {
      console.error('Import error:', error);
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description: 'An error occurred while saving the data.',
      });
    }
  };

  const typeLabels: Record<string, string> = {
    summary: 'Lesson',
    deck: 'Flashcard Deck',
    class: 'Class',
    schedule: 'Full Schedule'
  };

  const typeLabel = typeLabels[expectedType];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(val) => {
          setIsOpen(val);
          if(!val) reset();
      }}>
        <DialogTrigger asChild>
          {children || (
            <Button variant="outline" className="w-full sm:w-auto h-11">
              <Hash className="mr-2 h-4 w-4" />
              Import {typeLabel}
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Import {typeLabel}</DialogTitle>
            <DialogDescription>
              Enter a 6-digit code to import shared resources.
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
                                  {sharedItem.type === 'summary' && <BookOpen className="h-4 w-4 text-primary"/>}
                                  {sharedItem.type === 'deck' && <Layers className="h-4 w-4 text-primary"/>}
                                  {sharedItem.type === 'class' && <Calendar className="h-4 w-4 text-primary"/>}
                                  {sharedItem.type === 'schedule' && <LayoutGrid className="h-4 w-4 text-primary"/>}
                                  <Badge variant="outline" className="capitalize">{sharedItem.type}</Badge>
                              </div>
                              <h3 className="font-bold text-lg">{sharedItem.data.name || sharedItem.data.title || (sharedItem.type === 'schedule' ? 'Full Schedule Export' : 'Untitled')}</h3>
                              <p className="text-sm text-muted-foreground">{sharedItem.data.subject || sharedItem.data.code || ''}</p>
                          </div>
                      </div>
                      {sharedItem.type === 'deck' && (
                          <p className="text-xs text-muted-foreground">Contains {sharedItem.data.flashcards.length} flashcards.</p>
                      )}
                      {sharedItem.type === 'schedule' && (
                          <p className="text-xs text-muted-foreground">Contains {sharedItem.data.classes.length} classes.</p>
                      )}
                  </CardContent>
              </Card>

              <DialogFooter>
                  <Button variant="ghost" onClick={() => setSharedItem(null)}>Clear</Button>
                  <Button onClick={handleImport} className="w-full">
                    {sharedItem.type === 'schedule' ? 'Overwrite & Import' : 'Add to My Library'}
                  </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showOverwriteWarning} onOpenChange={setShowOverwriteWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Overwrite
            </AlertDialogTitle>
            <AlertDialogDescription>
              Importing a full schedule will **permanently delete** your current schedule and replace it with the new one. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={performImport} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Overwrite & Import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
