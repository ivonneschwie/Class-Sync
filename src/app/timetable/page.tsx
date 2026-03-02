'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { Class } from '@/lib/types';
import { useClasses } from '@/context/classes-context';
import { MapPin } from 'lucide-react';

// --- Configuration ---
const START_HOUR = 7;
const END_HOUR = 17; // 5 PM
const HOUR_HEIGHT = 110; // Slightly taller for larger text

const orderedDays: Class['schedule'][number]['days'][number][] = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];

// --- Helper Functions ---
const timeToMinutes = (time: string) => {
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


// --- Main Component ---
export default function TimetablePage() {
  const { classes } = useClasses();
  const timeSlots = generateTimeSlots();

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Time Table</h1>
        <p className="text-lg text-muted-foreground">Your weekly schedule at a glance.</p>
      </div>

      <Card className="flex-1 overflow-auto shadow-md">
        <CardContent className="p-0">
          <div className="min-w-[1100px]">
            {/* Header Row */}
            <div className="grid grid-cols-[80px_repeat(7,1fr)] sticky top-0 z-10 bg-slate-900 text-white">
              {/* Top-left empty cell */}
              <div className="border-r border-b border-slate-700"></div>
              {/* Day Headers */}
              {orderedDays.map(day => (
                <div key={day} className="text-center font-bold font-headline text-lg p-4 border-r border-b last:border-r-0 border-slate-700">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[80px_repeat(7,1fr)]">

              {/* Time Gutter */}
              <div className="row-start-1 border-r border-muted bg-muted/10">
                {timeSlots.map(hour => (
                  <div key={hour} style={{ height: HOUR_HEIGHT }} className="relative">
                    <span className="absolute -top-3.5 right-3 text-xs font-bold text-muted-foreground z-[8] uppercase tracking-tighter">
                        {formatHour(hour)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Timetable Grid */}
              <div className="col-start-2 col-span-7 row-start-1 relative">
                {/* Background Lines */}
                <div className="grid grid-cols-7 h-full">
                    {orderedDays.map(day => (
                    <div key={day} className="col-span-1 border-r last:border-r-0 border-muted">
                        {timeSlots.map((_, index) => (
                        <div key={index} style={{ height: HOUR_HEIGHT }} className="border-b border-muted/50"></div>
                        ))}
                    </div>
                    ))}
                </div>
                
                {/* Class Blocks */}
                <div className="absolute inset-0">
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
                            className="absolute p-3 rounded-lg border-2 overflow-hidden shadow-sm transition-all hover:scale-[1.03] hover:shadow-lg hover:z-20 cursor-default"
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                              left: `calc(${(dayIndex / 7) * 100}% + 6px)`,
                              width: `calc(${(1 / 7) * 100}% - 12px)`,
                              backgroundColor: `${classInfo.accentColor}25`,
                              borderColor: classInfo.accentColor,
                            }}
                          >
                            <p className="font-black text-base leading-tight mb-1" style={{ color: classInfo.accentColor }}>
                                {classInfo.name}
                            </p>
                            <p className="text-sm font-bold opacity-80 mb-2" style={{ color: classInfo.accentColor }}>
                                {scheduleItem.startTime} - {scheduleItem.endTime}
                            </p>
                            {scheduleItem.location && (
                                <div className="flex items-center gap-1.5 opacity-90 border-t border-current/20 pt-1.5">
                                    <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: classInfo.accentColor }} />
                                    <p className="text-xs font-black truncate uppercase tracking-widest" style={{ color: classInfo.accentColor }}>
                                        {scheduleItem.location}
                                    </p>
                                </div>
                            )}
                          </div>
                        );
                      })
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
