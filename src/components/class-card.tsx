import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Clock } from 'lucide-react';
import type { Class } from '@/lib/types';

type ClassCardProps = {
  classInfo: Class;
};

export function ClassCard({ classInfo }: ClassCardProps) {
  return (
    <Link href={`/class/${classInfo.id}`} className="block h-full group focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
      <Card 
        className="flex flex-col h-full transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1.5 group-focus:shadow-xl group-focus:-translate-y-1.5 border-t-[6px]"
        style={{ borderTopColor: classInfo.accentColor }}
      >
        <CardHeader className="pb-4">
          <CardTitle className="font-headline text-3xl mb-1">{classInfo.name}</CardTitle>
          <CardDescription className="text-lg font-medium">{classInfo.code}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div className="flex items-center text-lg text-muted-foreground">
            <User className="mr-3 h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{classInfo.instructor}</span>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start bg-muted/50 px-6 py-4 mt-auto gap-4">
          {classInfo.schedule.slice(0, 2).map((slot, index) => (
              <div key={index} className="flex flex-col w-full gap-1.5">
                  <div className="flex justify-between w-full items-center text-sm">
                      <div className="flex items-center font-semibold">
                          <Clock className="mr-2 h-4 w-4" style={{ color: classInfo.accentColor }} />
                          <span>{slot.startTime}</span>
                      </div>
                      <div className="flex gap-1">
                          {slot.days.map(day => (
                              <Badge key={day} variant="secondary" className="px-2.5 py-1 text-xs font-bold">{day}</Badge>
                          ))}
                      </div>
                  </div>
                  {slot.location && (
                      <div className="flex items-center text-[11px] text-muted-foreground ml-6">
                          <MapPin className="mr-1.5 h-3 w-3" />
                          <span className="truncate">{slot.location}</span>
                      </div>
                  )}
              </div>
          ))}
          {classInfo.schedule.length > 3 && (
            <p className="text-xs text-muted-foreground uppercase font-black self-center pt-2 tracking-widest">+ {classInfo.schedule.length - 3} more sessions</p>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
