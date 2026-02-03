'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { Class } from '@/lib/types';
import { useClasses } from '@/context/classes-context';

// --- Configuration ---
const START_HOUR = 7;
const END_HOUR = 17; // 5 PM
const HOUR_HEIGHT = 80; // pixels

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
    <div className="flex flex-col h-full gap-4">
      <div>
        <h1 className="text-3xl font-bold font-headline">Time Table</h1>
        <p className="text-muted-foreground">Your weekly schedule at a glance.</p>
      </div>

      <Card className="flex-1 overflow-auto">
        <CardContent className="p-0">
          <div className="min-w-[900px]">
            {/* Header Row */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] sticky top-0 z-10 bg-gray-800 text-white">
              {/* Top-left empty cell */}
              <div className="border-r border-b border-gray-600"></div>
              {/* Day Headers */}
              {orderedDays.map(day => (
                <div key={day} className="text-center font-bold p-2 border-r border-b last:border-r-0 border-gray-600">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[60px_repeat(7,1fr)]">

              {/* Time Gutter */}
              <div className="row-start-1 border-r">
                {timeSlots.map(hour => (
                  <div key={hour} style={{ height: HOUR_HEIGHT }} className="relative">
                    <span className="absolute -top-3.5 right-2 text-sm text-muted-foreground z-[8]">{formatHour(hour)}</span>
                  </div>
                ))}
              </div>

              {/* Timetable Grid */}
              <div className="col-start-2 col-span-7 row-start-1 relative">
                {/* Background Lines */}
                <div className="grid grid-cols-7 h-full">
                    {orderedDays.map(day => (
                    <div key={day} className="col-span-1 border-r last:border-r-0">
                        {timeSlots.map((_, index) => (
                        <div key={index} style={{ height: HOUR_HEIGHT }} className="border-b"></div>
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
                            className="absolute p-2 rounded-lg border overflow-hidden"
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                              left: `calc(${(dayIndex / 7) * 100}% + 4px)`,
                              width: `calc(${(1 / 7) * 100}% - 8px)`,
                              backgroundColor: `${classInfo.accentColor}20`,
                              borderColor: classInfo.accentColor,
                            }}
                          >
                            <p className="font-bold text-sm leading-tight" style={{ color: classInfo.accentColor }}>{classInfo.name}</p>
                            <p className="text-xs" style={{ color: classInfo.accentColor }}>{scheduleItem.startTime} - {scheduleItem.endTime}</p>
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

    