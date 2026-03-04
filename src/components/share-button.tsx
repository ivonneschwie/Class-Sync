'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs, limit, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  type: 'summary' | 'deck' | 'class' | 'schedule';
  data: any;
  className?: string;
  children?: React.ReactNode;
}

export function ShareButton({ type, data, className, children }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleShare = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // 1. Redundancy Check: See if this user has already shared this specific item
      // We use the 'originalId' to track if the same item is being shared again
      const q = query(
        collection(firestore, 'shares'),
        where('createdBy', '==', user.uid),
        where('originalId', '==', data.id || 'bulk-schedule'),
        where('type', '==', type),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Reuse existing share code
        const existingShare = querySnapshot.docs[0];
        setShareCode(existingShare.id);
        toast({
          title: "Share Code Restored",
          description: "Reusing your existing share code for this item.",
        });
        setIsLoading(false);
        return;
      }

      // 2. If not found, create a new one
      // Destructure to remove local-only fields before sharing
      const { id: originalId, userId, createdAt, ...payload } = data;
      
      let code = generateCode();
      let exists = true;
      let attempts = 0;

      // Ensure code is unique globally
      while (exists && attempts < 5) {
        const shareRef = doc(firestore, 'shares', code);
        const snap = await getDoc(shareRef);
        if (!snap.exists()) {
          exists = false;
        } else {
          code = generateCode();
          attempts++;
        }
      }

      const shareRef = doc(firestore, 'shares', code);
      setDocumentNonBlocking(shareRef, {
        type,
        data: payload,
        originalId: data.id || 'bulk-schedule',
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      }, { merge: true });

      setShareCode(code);
      toast({
        title: "Code Generated!",
        description: "Your unique share code is ready to use.",
      });
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        variant: 'destructive',
        title: 'Sharing Failed',
        description: 'Could not create a share code. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!shareCode) return;
    navigator.clipboard.writeText(shareCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({
        title: "Copied!",
        description: "Code copied to clipboard.",
    });
  };

  const getTitle = () => {
    switch (type) {
        case 'summary': return 'Lesson';
        case 'deck': return 'Deck';
        case 'class': return 'Class';
        case 'schedule': return 'Full Schedule';
        default: return 'Resource';
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2", className)}>
          {children || (
            <>
              <Share2 className="h-4 w-4" />
              Share
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share {getTitle()}</DialogTitle>
          <DialogDescription>
            Create a unique short code that others can use to import this content.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {!shareCode ? (
            <Button onClick={handleShare} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Code...
                </>
              ) : (
                'Generate Share Code'
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Input
                    readOnly
                    value={shareCode}
                    className="text-center text-2xl font-bold tracking-widest uppercase h-12"
                  />
                </div>
                <Button size="icon" className="h-12 w-12 px-3" onClick={copyToClipboard}>
                  {isCopied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Give this code to your classmate. They can use the "Import" button in their sidebar or respective dashboard.
              </p>
              <Button variant="ghost" className="w-full text-xs" onClick={() => setShareCode(null)}>
                Generate a different code?
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
