'use client';

import type { FlashcardDeck } from '@/lib/types';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Flashcard } from './flashcard';


interface FlashcardViewerProps {
    deck: FlashcardDeck;
}

export function FlashcardViewer({ deck }: FlashcardViewerProps) {
    return (
        <div className="w-full flex flex-col items-center">
            <CardHeader className="px-0 text-center">
                <CardTitle className="font-headline">{deck.name}</CardTitle>
                <CardDescription>Click a card to flip it. Use the arrows to navigate.</CardDescription>
            </CardHeader>
            <Carousel
                opts={{
                align: 'start',
                }}
                className="w-full max-w-[90vw] sm:max-w-sm md:w-1/2 md:max-w-lg md:min-w-[500px]"
            >
                <CarouselContent>
                {deck.flashcards.map((flashcard, index) => (
                    <CarouselItem key={index}>
                        <Flashcard flashcard={flashcard} />
                    </CarouselItem>
                ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
    )
}
