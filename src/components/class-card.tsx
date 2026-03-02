
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Clock } from 'lucide-react';
import type { Class } from '@/lib/types';

type ClassCardProps = {
  classInfo: Class;
};

export function ClassCard({ classInfo }: ClassCardProps) {
  // Get unique locations to show a summary if multiple exist
  const uniqueLocations = Array.from(new Set(classInfo.schedule.map(s => s.location)));
  const locationDisplay = uniqueLocations.length > 1 
    ? `${uniqueLocations[0]} & others` 
    : uniqueLocations[0] || 'No location set';

  return (
    <Link href={`/class/${classInfo.id}`} className="block h-full group focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
      <Card 
        className="flex flex-col h-full transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 group-focus:shadow-lg group-focus:-translate-y-1 border-t-4"
        style={{ borderTopColor: classInfo.accentColor }}
      >
        <CardHeader>
          <CardTitle className="font-headline text-xl">{classInfo.name}</CardTitle>
          <CardDescription>{classInfo.code}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="mr-2 h-4 w-4 flex-shrink-0" />
            <span>{classInfo.instructor}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">{locationDisplay}</span>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start bg-muted/50 px-6 py-4 mt-auto gap-3">
          {classInfo.schedule.slice(0, 2).map((slot, index) => (
              <div key={index} className="flex justify-between w-full items-center text-sm">
                  <div className="flex items-center font-semibold">
                      <Clock className="mr-2 h-4 w-4" style={{ color: classInfo.accentColor }} />
                      <span>{slot.startTime}</span>
                  </div>
                  <div className="flex gap-1">
                      {slot.days.map(day => (
                          <Badge key={day} variant="secondary" className="px-1.5">{day}</Badge>
                      ))}
                  </div>
              </div>
          ))}
          {classInfo.schedule.length > 2 && (
            <p className="text-[10px] text-muted-foreground uppercase font-bold self-center pt-1">+ {classInfo.schedule.length - 2} more slots</p>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
