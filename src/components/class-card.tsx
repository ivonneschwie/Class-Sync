
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
        </CardContent>
        <CardFooter className="flex-col items-start bg-muted/50 px-6 py-4 mt-auto gap-4">
          {classInfo.schedule.slice(0, 2).map((slot, index) => (
              <div key={index} className="flex flex-col w-full gap-1.5">
                  <div className="flex justify-between w-full items-center text-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex items-center font-semibold shrink-0">
                            <Clock className="mr-2 h-4 w-4" style={{ color: classInfo.accentColor }} />
                            <span>{slot.startTime}</span>
                        </div>
                        {slot.location && (
                            <div className="flex items-center text-[11px] text-muted-foreground truncate border-l pl-2 ml-1">
                                <MapPin className="mr-1 h-3 w-3 shrink-0" />
                                <span className="truncate max-w-[80px] md:max-w-[100px]">{slot.location}</span>
                            </div>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                          {slot.days.map(day => (
                              <Badge key={day} variant="secondary" className="px-1.5">{day}</Badge>
                          ))}
                      </div>
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
