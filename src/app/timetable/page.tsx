
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { Class, ClassSchedule } from '@/lib/types';
import { useClasses } from '@/context/classes-context';
import { MapPin, CalendarDays, Inbox, Clock, Coffee } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

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

type TimetableItem = 
  | { type: 'class', data: Class & { currentSchedule: ClassSchedule } } 
  | { type: 'break', startTime: string, endTime: string, durationMinutes: number };

export default function TimetablePage() {
  const { classes } = useClasses();
  const [activeDay, setActiveDay] = useState<string>('M');

  const dayItems = useMemo(() => {
    const sortedClasses = classes.flatMap(c => 
      c.schedule
        .filter(s => s.days.includes(activeDay as any))
        .map(s => ({ ...c, currentSchedule: s }))
    ).sort((a, b) => timeToMinutes(a.currentSchedule.startTime) - timeToMinutes(b.currentSchedule.startTime));

    const items: TimetableItem[] = [];
    
    for (let i = 0; i < sortedClasses.length; i++) {
        const currentClass = sortedClasses[i];
        
        // Check for break before this class (if it's not the first class)
        if (i > 0) {
            const previousClass = sortedClasses[i-1];
            const prevEnd = timeToMinutes(previousClass.currentSchedule.endTime);
            const currStart = timeToMinutes(currentClass.currentSchedule.startTime);
            
            if (currStart > prevEnd) {
                const duration = currStart - prevEnd;
                // Only show significant breaks (e.g. >= 5 mins)
                if (duration >= 5) {
                    items.push({
                        type: 'break',
                        startTime: previousClass.currentSchedule.endTime,
                        endTime: currentClass.currentSchedule.startTime,
                        durationMinutes: duration
                    });
                }
            }
        }
        
        items.push({ type: 'class', data: currentClass });
    }
    
    return items;
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

            {dayItems.length > 0 ? (
              <div className="space-y-4">
                {dayItems.map((item, idx) => {
                  if (item.type === 'break') {
                    return (
                      <div key={`break-${idx}`} className="flex items-center gap-4 px-5 py-3 border-2 border-dashed rounded-xl bg-muted/20 opacity-70">
                        <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                          <Coffee className="h-4 w-4" />
                          <span className="text-sm uppercase tracking-wider">{item.durationMinutes} min break</span>
                        </div>
                        <Separator orientation="vertical" className="h-4 mx-2" />
                        <span className="text-xs text-muted-foreground">{item.startTime} - {item.endTime}</span>
                      </div>
                    );
                  }

                  const classData = item.data;
                  return (
                    <Card key={`${classData.id}-${idx}`} className="border-l-[6px] overflow-hidden transition-all hover:shadow-md" style={{ borderLeftColor: classData.accentColor }}>
                      <CardContent className="p-5">
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <h3 className="font-bold text-xl truncate">{classData.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                <span className="bg-muted px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight">{classData.code}</span>
                                <span>• {classData.instructor}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center flex-wrap gap-y-2 text-muted-foreground font-semibold">
                            <div className="flex items-center gap-2 pr-4">
                              <Clock className="h-4 w-4 shrink-0" style={{ color: classData.accentColor }} />
                              <span className="text-base">{classData.currentSchedule.startTime} - {classData.currentSchedule.endTime}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 pl-4 border-l">
                              <MapPin className="h-4 w-4 shrink-0" style={{ color: classData.accentColor }} />
                              <span className="text-base text-foreground">{classData.currentSchedule.location || 'No location set'}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-2xl bg-muted/5">
                <Inbox className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-xl font-bold font-headline">No Classes Scheduled</h3>
                <p className="text-muted-foreground text-lg">Enjoy your free time!</p>
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
