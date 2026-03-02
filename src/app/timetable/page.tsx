
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { Class, ClassSchedule } from '@/lib/types';
import { useClasses } from '@/context/classes-context';
import { MapPin, Clock, CalendarDays, Inbox } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// --- Configuration ---
const START_HOUR = 7;
const END_HOUR = 19; // 7 PM
const HOUR_HEIGHT = 120;

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

// --- Helper Functions ---
const timeToMinutes = (time: string) => {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h} ${ampm}`;
}

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    slots.push(hour);
  }
  return slots;
};

export default function TimetablePage() {
  const { classes } = useClasses();
  const isMobile = useIsMobile();
  const timeSlots = generateTimeSlots();
  
  // Default to Monday for mobile view
  const [activeDay, setActiveDay] = useState<string>('M');

  // Desktop View Component
  const DesktopGrid = () => (
    <Card className="flex-1 overflow-hidden shadow-xl border-2">
      <CardContent className="p-0 h-full">
        <ScrollArea className="h-full w-full">
          <div className="min-w-[1200px] relative">
            {/* Header Row */}
            <div className="grid grid-cols-[100px_repeat(7,1fr)] sticky top-0 z-30 bg-primary text-primary-foreground shadow-md">
              <div className="border-r border-b border-primary-foreground/20 bg-primary"></div>
              {orderedDays.map(day => (
                <div key={day} className="text-center font-bold font-headline text-lg p-4 border-r border-b last:border-r-0 border-primary-foreground/20 uppercase tracking-widest">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[100px_repeat(7,1fr)] relative">
              {/* Time Gutter */}
              <div className="bg-muted/30 border-r border-border sticky left-0 z-20">
                {timeSlots.map(hour => (
                  <div key={hour} style={{ height: HOUR_HEIGHT }} className="relative border-b border-border/50">
                    <span className="absolute -top-3 right-3 text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
                        {formatHour(hour)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Timetable Grid Area */}
              <div className="col-start-2 col-span-7 relative">
                <div className="grid grid-cols-7 h-full absolute inset-0">
                    {orderedDays.map(day => (
                      <div key={day} className="col-span-1 border-r last:border-r-0 border-border/50">
                          {timeSlots.map((_, index) => (
                            <div key={index} style={{ height: HOUR_HEIGHT }} className="border-b border-border/30"></div>
                          ))}
                      </div>
                    ))}
                </div>
                
                <div className="relative h-full">
                  {classes.flatMap(classInfo => 
                    classInfo.schedule.flatMap((scheduleItem, scheduleIndex) =>
                      scheduleItem.days.map(day => {
                        const dayIndex = orderedDays.indexOf(day);
                        if (dayIndex === -1) return null;

                        const startMinutes = timeToMinutes(scheduleItem.startTime);
                        const endMinutes = timeToMinutes(scheduleItem.endTime);
                        
                        if(startMinutes < START_HOUR * 60 || endMinutes > (END_HOUR + 1) * 60) return null;

                        const top = ((startMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
                        const height = ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT;

                        return (
                          <div
                            key={`${classInfo.id}-${scheduleIndex}-${day}`}
                            className="absolute p-3 rounded-md border-l-4 shadow-sm transition-all hover:scale-[1.02] hover:shadow-xl hover:z-40 cursor-default overflow-hidden group"
                            style={{
                              top: `${top + 4}px`,
                              height: `${height - 8}px`,
                              left: `calc(${(dayIndex / 7) * 100}% + 8px)`,
                              width: `calc(${(1 / 7) * 100}% - 16px)`,
                              backgroundColor: `${classInfo.accentColor}15`,
                              borderLeftColor: classInfo.accentColor,
                              borderRight: `1px solid ${classInfo.accentColor}30`,
                              borderTop: `1px solid ${classInfo.accentColor}30`,
                              borderBottom: `1px solid ${classInfo.accentColor}30`,
                            }}
                          >
                            <div className="flex flex-col h-full">
                              <p className="font-black text-sm leading-none mb-1 truncate" style={{ color: classInfo.accentColor }}>
                                  {classInfo.name}
                              </p>
                              <p className="text-[10px] font-bold opacity-70 mb-auto" style={{ color: classInfo.accentColor }}>
                                  {scheduleItem.startTime} - {scheduleItem.endTime}
                              </p>
                              {scheduleItem.location && (
                                  <div className="flex items-center gap-1 mt-1 pt-1 border-t border-current/10 overflow-hidden">
                                      <MapPin className="h-3 w-3 shrink-0" style={{ color: classInfo.accentColor }} />
                                      <p className="text-[10px] font-black truncate uppercase tracking-tighter" style={{ color: classInfo.accentColor }}>
                                          {scheduleItem.location}
                                      </p>
                                  </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </CardContent>
    </Card>
  );

  // Mobile Timeline View Component
  const MobileTimeline = () => {
    const dayClasses = useMemo(() => {
        return classes.flatMap(c => 
            c.schedule
                .filter(s => s.days.includes(activeDay as any))
                .map(s => ({ ...c, currentSchedule: s }))
        ).sort((a, b) => timeToMinutes(a.currentSchedule.startTime) - timeToMinutes(b.currentSchedule.startTime));
    }, [classes, activeDay]);

    return (
        <div className="flex flex-col flex-1 gap-4 overflow-hidden">
            <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full">
                <ScrollArea className="w-full whitespace-nowrap pb-2">
                    <TabsList className="inline-flex w-full justify-start md:justify-center p-1 bg-muted/50">
                        {orderedDays.map(day => (
                            <TabsTrigger key={day} value={day} className="px-4 py-2 text-xs font-bold uppercase tracking-widest">
                                {day}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>

                <div className="mt-4 px-1">
                    <h2 className="text-xl font-bold font-headline mb-4 flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        {dayLabels[activeDay]}
                    </h2>

                    {dayClasses.length > 0 ? (
                        <div className="space-y-4">
                            {dayClasses.map((item, idx) => (
                                <Card key={`${item.id}-${idx}`} className="border-l-4 overflow-hidden" style={{ borderLeftColor: item.accentColor }}>
                                    <CardContent className="p-4 flex gap-4 items-center">
                                        <div className="flex flex-col items-center justify-center min-w-[70px] border-r pr-4 border-border/50">
                                            <span className="text-sm font-bold">{item.currentSchedule.startTime}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase">to</span>
                                            <span className="text-sm font-bold">{item.currentSchedule.endTime}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-base truncate">{item.name}</h3>
                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                                                <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: item.accentColor }} />
                                                <span className="truncate font-medium">{item.currentSchedule.location || 'No location set'}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-muted/10">
                            <Inbox className="h-10 w-10 text-muted-foreground mb-3 opacity-20" />
                            <p className="text-muted-foreground font-medium">No classes scheduled</p>
                        </div>
                    )}
                </div>
            </Tabs>
        </div>
    );
  };

  if (isMobile === undefined) return null; // Wait for hydration

  return (
    <div className="flex flex-col h-full lg:h-[calc(100vh-8rem)] gap-4 overflow-hidden">
      <div className="space-y-1 shrink-0 px-1 md:px-0">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Time Table</h1>
        <p className="text-muted-foreground">Your weekly schedule at a glance.</p>
      </div>

      {isMobile ? <MobileTimeline /> : <DesktopGrid />}
    </div>
  );
}
