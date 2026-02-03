'use client';

import { useState } from 'react';
import { PlusCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddClassForm } from '@/components/add-class-form';
import type { Class } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ClassCard } from '@/components/class-card';
import { useClasses } from '@/context/classes-context';

export default function SchedulePage() {
  const { classes, addClass } = useClasses();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const { toast } = useToast();

  const handleAddClass = (data: Omit<Class, 'id' | 'userId' | 'createdAt'>) => {
    // Conflict detection logic
    for (const existingClass of classes) {
      for (const newScheduleItem of data.schedule) {
        for (const existingScheduleItem of existingClass.schedule) {
          const daysOverlap = newScheduleItem.days.some(day => existingScheduleItem.days.includes(day));
          if (daysOverlap) {
            const newStartTime = newScheduleItem.startTime;
            const newEndTime = newScheduleItem.endTime;
            const existingStartTime = existingScheduleItem.startTime;
            const existingEndTime = existingScheduleItem.endTime;

            if (newStartTime < existingEndTime && newEndTime > existingStartTime) {
              toast({
                variant: "destructive",
                title: "Time Conflict Detected",
                description: `A time slot for "${data.name}" conflicts with "${existingClass.name}".`,
              });
              return;
            }
          }
        }
      }
    }

    addClass(data);
    toast({
      title: "Class Added",
      description: `"${data.name}" has been added to your schedule.`,
    });
    
    setIsAddDialogOpen(false);
  };
  
  const sortedClasses = [...classes].sort((a, b) => a.schedule[0].startTime.localeCompare(b.schedule[0].startTime));

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">My Schedule</h1>
            <p className="text-muted-foreground">Your weekly class overview.</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Class
          </Button>
        </div>

        {sortedClasses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedClasses.map((c) => (
              <ClassCard 
                key={c.id} 
                classInfo={c} 
              />
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center py-20 text-center border-dashed">
              <CardHeader>
                  <div className="mx-auto bg-secondary rounded-full p-3">
                      <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <CardTitle className="mt-4 font-headline">No Classes Yet</CardTitle>
                  <CardDescription className="mt-2">
                  Your schedule is empty. Click "Add Class" to get started.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Class
                  </Button>
              </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[480px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="font-headline">Add New Class</DialogTitle>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto -mr-6 pr-6">
                <AddClassForm onSave={handleAddClass} />
            </div>
          </DialogContent>
      </Dialog>
    </>
  );
}
