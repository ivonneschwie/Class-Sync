'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import type { Flashcard as FlashcardType } from '@/lib/types';

interface FlashcardProps {
  flashcard: FlashcardType;
}

export function Flashcard({ flashcard }: FlashcardProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <Card
      onClick={() => setShowAnswer(!showAnswer)}
      className="w-full h-80 cursor-pointer flex flex-col justify-center items-center text-center p-6 relative group"
    >
      <CardContent className="flex flex-col items-center justify-center gap-4">
        {!showAnswer ? (
          <p className="text-xl md:text-2xl font-semibold">{flashcard.front}</p>
        ) : (
          <p className="text-lg md:text-xl">{flashcard.back}</p>
        )}
      </CardContent>
      <div className="absolute bottom-4 right-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm">
        <RefreshCw className="h-3 w-3" />
        Click to flip
      </div>
    </Card>
  );
}
