'use client';
import { useState, useEffect } from 'react';
import { RefreshCw, HelpCircle, Sparkles } from 'lucide-react';
import type { Flashcard as FlashcardType } from '@/lib/types';

interface FlashcardProps {
  flashcard: FlashcardType;
}

export function Flashcard({ flashcard }: FlashcardProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  // Reset to front side when the flashcard changes (e.g. clicking next/prev)
  useEffect(() => {
    setShowAnswer(false);
  }, [flashcard]);

  return (
    <div 
      style={{ perspective: '1000px', width: '100%', height: '320px' }} 
      className="relative select-none"
    >
      <div 
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: showAnswer ? 'rotateY(180deg)' : 'rotateY(0deg)',
          cursor: 'pointer'
        }}
        onClick={() => setShowAnswer(!showAnswer)}
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
          className="bg-card border border-primary/20 hover:border-primary/45 rounded-3xl p-8 flex flex-col items-center justify-between text-center shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-primary/5 blur-3xl" />
          
          <div className="flex items-center gap-1.5 text-[10px] text-primary/70 font-extrabold uppercase tracking-wider select-none">
            <HelpCircle className="h-3.5 w-3.5 animate-pulse" /> Question
          </div>

          <div className="flex-1 flex items-center justify-center py-4">
            <p className="text-xl md:text-2xl font-bold text-foreground leading-relaxed max-w-md px-2">
              {flashcard.front}
            </p>
          </div>

          <div className="text-muted-foreground/60 flex items-center gap-1.5 text-xs font-semibold select-none">
            <RefreshCw className="h-3.5 w-3.5" />
            Click card to flip
          </div>
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
          className="bg-gradient-to-br from-violet-500/5 via-background to-fuchsia-500/5 border border-primary/30 hover:border-primary/50 rounded-3xl p-8 flex flex-col items-center justify-between text-center shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-pink-500/5 blur-3xl" />

          <div className="flex items-center gap-1.5 text-[10px] text-pink-500/90 font-extrabold uppercase tracking-wider select-none">
            <Sparkles className="h-3.5 w-3.5" /> Answer
          </div>

          <div className="flex-1 flex items-center justify-center py-4">
            <p className="text-lg md:text-xl font-semibold text-foreground leading-relaxed max-w-md px-2">
              {flashcard.back}
            </p>
          </div>

          <div className="text-muted-foreground/60 flex items-center gap-1.5 text-xs font-semibold select-none">
            <RefreshCw className="h-3.5 w-3.5" />
            Click card to return
          </div>
        </div>
      </div>
    </div>
  );
}
