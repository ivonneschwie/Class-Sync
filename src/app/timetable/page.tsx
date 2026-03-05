'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useClasses } from '@/context/classes-context';
import { MapPin, CalendarDays, Inbox, Clock, Coffee, User } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { formatTimeToAMPM } from '@/lib/time-utils';
import type { Class, ClassSchedule } from '@/lib/types';

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
<<<<<<< HEAD
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto px-4 py-4 md:px-0 overflow-x-hidden">
=======
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto px-2 py-6 md:px-0 overflow-x-hidden">
>>>>>>> 2e713f7 (ive rolled it back to version 121e66f, lessen the horizontal margins for)
      {/* Header section with strict containment */}
      <div className="mb-4 shrink-0 min-w-0 w-full overflow-hidden">
        <h1 className="text-3xl font-bold font-headline tracking-tight truncate">Time Table</h1>
        <p className="text-muted-foreground text-lg truncate">Your daily schedule at a glance.</p>
      </div>

      {/* Main interactive area */}
      <div className="flex flex-col flex-1 min-w-0 w-full overflow-hidden">
        <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full">
          {/* Compact Day Selector */}
          <ScrollArea className="w-full rounded-md border bg-muted/30 p-1 mb-4">
            <TabsList className="flex h-10 w-full bg-transparent p-0">
              {orderedDays.map(day => (
                <TabsTrigger 
                  key={day} 
                  value={day} 
                  className="flex-1 px-2 py-1.5 text-xs font-bold uppercase data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  {day}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Daily Schedule Content */}
          <div className="space-y-4 w-full min-w-0 overflow-hidden">
            <h2 className="text-2xl font-bold font-headline flex items-center gap-3 truncate">
              <CalendarDays className="h-6 w-6 text-primary shrink-0" />
              {dayLabels[activeDay]}
            </h2>

            {dayItems.length > 0 ? (
              <div className="grid gap-3 w-full min-w-0 overflow-hidden">
                {dayItems.map((item, idx) => {
                  if (item.type === 'break') {
                    return (
                      <div key={`break-${idx}`} className="flex items-center gap-3 px-3 py-1.5 border-2 border-dashed rounded-lg bg-muted/10 opacity-60 w-full min-w-0 overflow-hidden">
                        <Coffee className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                          {item.durationMinutes} min break
                        </span>
                        <Separator orientation="vertical" className="h-4 mx-1" />
                        <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                          {formatTimeToAMPM(item.startTime)} - {formatTimeToAMPM(item.endTime)}
                        </span>
                      </div>
                    );
                  }

                  const classData = item.data;
                  return (
                    <Card 
                      key={`${classData.id}-${idx}`} 
                      className="border-l-[6px] w-full min-w-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      style={{ borderLeftColor: classData.accentColor }}
                    >
                      <CardContent className="p-3 sm:p-4 flex flex-col gap-2 min-w-0 overflow-hidden">
                        {/* Title & Code Row */}
                        <div className="flex items-start justify-between gap-3 min-w-0 overflow-hidden">
                          <h3 className="font-bold text-lg sm:text-xl truncate flex-1 leading-tight" title={classData.name}>
                            {classData.name}
                          </h3>
                          <span className="shrink-0 bg-muted px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-tight self-start mt-1">
                            {classData.code}
                          </span>
                        </div>
                        
                        {/* Instructor Row */}
                        <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm min-w-0 overflow-hidden">
                          <User className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate flex-1 min-w-0">{classData.instructor}</span>
                        </div>

                        {/* Separator to define space */}
                        <Separator className="my-1" />

                        {/* Time & Location Details */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm font-medium min-w-0 overflow-hidden">
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Clock className="h-4 w-4 shrink-0" style={{ color: classData.accentColor }} />
                            <span className="tabular-nums whitespace-nowrap">
                              {formatTimeToAMPM(classData.currentSchedule.startTime)} - {formatTimeToAMPM(classData.currentSchedule.endTime)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                            <MapPin className="h-4 w-4 shrink-0" style={{ color: classData.accentColor }} />
                            <span className="truncate flex-1 min-w-0" title={classData.currentSchedule.location}>
                              {classData.currentSchedule.location || 'No location set'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-muted/5 w-full">
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
