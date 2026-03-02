
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { ClassSchedule } from '@/lib/types';
import { useClasses } from '@/context/classes-context';
import { MapPin, CalendarDays, Inbox, Clock } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const orderedDays: ClassSchedule['days'][number][] = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];
const dayLabels: Record<string, string> = {
  'M': 'Monday',
  'T': 'Tuesday',
  'W': 'Wednesday',
  'Th': 'Thursday',
  'F': 'Friday',
  'Sa': 'Saturday',
  'Su': 'Sunday'
};

const timeToMinutes = (time: string) => {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export default function TimetablePage() {
  const { classes } = useClasses();
  const [activeDay, setActiveDay] = useState<string>('M');

  const dayClasses = useMemo(() => {
    return classes.flatMap(c => 
      c.schedule
        .filter(s => s.days.includes(activeDay as any))
        .map(s => ({ ...c, currentSchedule: s }))
    ).sort((a, b) => timeToMinutes(a.currentSchedule.startTime) - timeToMinutes(b.currentSchedule.startTime));
  }, [classes, activeDay]);

  return (
    <div className="flex flex-col h-full gap-6 max-w-4xl mx-auto w-full px-1 md:px-0">
      <div className="space-y-1 shrink-0">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Time Table</h1>
        <p className="text-muted-foreground text-lg">Your daily schedule at a glance.</p>
      </div>

      <div className="flex flex-col flex-1 gap-4 overflow-hidden">
        <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full">
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <TabsList className="inline-flex w-full justify-start md:justify-center p-1 bg-muted/50 h-auto">
              {orderedDays.map(day => (
                <TabsTrigger 
                  key={day} 
                  value={day} 
                  className="px-6 py-3 text-sm font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {day}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <div className="mt-6">
            <h2 className="text-2xl font-bold font-headline mb-6 flex items-center gap-3">
              <CalendarDays className="h-6 w-6 text-primary" />
              {dayLabels[activeDay]}
            </h2>

            {dayClasses.length > 0 ? (
              <div className="space-y-4">
                {dayClasses.map((item, idx) => (
                  <Card key={`${item.id}-${idx}`} className="border-l-[6px] overflow-hidden transition-all hover:shadow-md" style={{ borderLeftColor: item.accentColor }}>
                    <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center gap-3 min-w-[180px] font-bold text-lg">
                        <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                        <span>{item.currentSchedule.startTime} - {item.currentSchedule.endTime}</span>
                      </div>
                      
                      <div className="hidden md:block h-8 w-px bg-border mx-2" />

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <h3 className="font-bold text-xl truncate">{item.name}</h3>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-4 w-4 shrink-0" style={{ color: item.accentColor }} />
                            <span className="text-base font-medium truncate">{item.currentSchedule.location || 'No location set'}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">{item.code} • {item.instructor}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-2xl bg-muted/5">
                <Inbox className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-xl font-bold font-headline">No Classes Scheduled</h3>
                <p className="text-muted-foreground">Enjoy your free time!</p>
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
