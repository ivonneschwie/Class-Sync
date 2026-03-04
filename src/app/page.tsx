'use client';

import { useState } from 'react';
import { PlusCircle, AlertTriangle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddClassForm } from '@/components/add-class-form';
import type { Class } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ClassCard } from '@/components/class-card';
import { useClasses } from '@/context/classes-context';
import { ShareButton } from '@/components/share-button';
import { RedeemCodeDialog } from '@/components/redeem-code-dialog';

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

  // Prepare full schedule data for sharing
  const fullScheduleData = {
    id: 'bulk-schedule',
    classes: classes.map(({ id, userId, createdAt, ...rest }) => rest)
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold font-headline tracking-tight">My Schedule</h1>
            <p className="text-xl text-muted-foreground">Your weekly class overview.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <RedeemCodeDialog expectedType="schedule" />
            {classes.length > 0 && (
              <ShareButton type="schedule" data={fullScheduleData} className="flex-1 sm:flex-initial h-11 px-4">
                <Share2 className="mr-2 h-4 w-4" />
                Share All
              </ShareButton>
            )}
            <Button onClick={() => setIsAddDialogOpen(true)} className="flex-1 sm:flex-initial text-base h-11 px-4">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Class
            </Button>
          </div>
        </div>

        {sortedClasses.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {sortedClasses.map((c) => (
              <ClassCard 
                key={c.id} 
                classInfo={c} 
              />
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center py-24 text-center border-dashed">
              <CardHeader>
                  <div className="mx-auto bg-secondary rounded-full p-4">
                      <AlertTriangle className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <CardTitle className="mt-6 font-headline text-3xl">No Classes Yet</CardTitle>
                  <CardDescription className="mt-3 text-xl">
                  Your schedule is empty. Click "Add Class" to get started.
                  </CardDescription>
              </CardHeader>
              <CardContent className="mt-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <RedeemCodeDialog expectedType="schedule" />
                    <Button onClick={() => setIsAddDialogOpen(true)} size="lg" className="text-base h-12 px-8">
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Add Class
                    </Button>
                  </div>
              </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[520px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Add New Class</DialogTitle>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto -mr-6 pr-6 py-4">
                <AddClassForm onSave={handleAddClass} />
            </div>
          </DialogContent>
      </Dialog>
    </>
  );
}
