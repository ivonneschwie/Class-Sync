'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useClasses } from '@/context/classes-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, MapPin, Clock, CalendarDays, Edit, Trash2, FileText, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AddClassForm } from '@/components/add-class-form';
import type { Class } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { formatTimeToAMPM } from '@/lib/time-utils';
import { ShareButton } from '@/components/share-button';

const dayLabels: Record<string, string> = {
  'M': 'Monday',
  'T': 'Tuesday',
  'W': 'Wednesday',
  'Th': 'Thursday',
  'F': 'Friday',
  'Sa': 'Saturday',
  'Su': 'Sunday'
};

export default function ClassDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { classes, isLoading, updateClass, deleteClass } = useClasses();
  const { toast } = useToast();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const classId = params.classId as string;
  const classInfo = classes.find(c => c.id === classId);

  const handleUpdateClass = (data: Omit<Class, 'id' | 'userId' | 'createdAt'>) => {
    if (!classInfo) return;
    updateClass(classInfo.id, data);
    toast({
      title: "Class Updated",
      description: `"${data.name}" has been updated.`,
    });
    setIsEditDialogOpen(false);
  };

  const handleDeleteClass = () => {
      if (!classInfo) return;
      deleteClass(classInfo.id);
      toast({
          title: "Class Deleted",
          description: `The class has been removed from your schedule.`,
      });
      router.push('/');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Button variant="outline" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Schedule
          </Button>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center">
                <Skeleton className="h-6 w-6 rounded-full mr-3" />
                <Skeleton className="h-6 w-1/2" />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4 bg-muted/50 p-6">
            <Skeleton className="h-7 w-1/3 mb-2" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Class Not Found</h1>
        <p>The class you are looking for does not exist or has been removed.</p>
        <Button onClick={() => router.push('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Schedule
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full px-1 md:px-0 overflow-hidden">
       <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
         <Button variant="outline" onClick={() => router.push('/')} className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Schedule
        </Button>
        <div className="flex flex-col sm:flex-row gap-2">
            <ShareButton type="class" data={classInfo} className="w-full sm:w-auto h-11 px-4">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </ShareButton>
            <Button variant="secondary" onClick={() => setIsEditDialogOpen(true)} className="w-full sm:w-auto h-11 px-4">
                <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto h-11 px-4">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the "{classInfo.name}" class. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteClass} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
       </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b-4 pb-4" style={{ borderColor: classInfo.accentColor }}>
          <CardTitle className="font-headline text-3xl md:text-4xl truncate" title={classInfo.name}>{classInfo.name}</CardTitle>
          <CardDescription className="text-lg md:text-xl pt-1 truncate">{classInfo.code}</CardDescription>
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
          <div className="flex items-center text-lg md:text-xl text-muted-foreground min-w-0">
            <User className="mr-4 h-6 w-6 flex-shrink-0" />
            <span className="font-semibold mr-2 shrink-0">Instructor:</span>
            <span className="text-foreground truncate">{classInfo.instructor}</span>
          </div>
          {classInfo.description && (
            <>
              <Separator />
              <div className="flex items-start text-muted-foreground min-w-0">
                <FileText className="mr-4 h-6 w-6 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 min-w-0 flex-1">
                  <span className="font-semibold text-lg md:text-xl text-card-foreground">Description</span>
                  <p className="text-base md:text-lg text-foreground whitespace-pre-wrap leading-relaxed">{classInfo.description}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex-col items-start gap-4 bg-muted/50 p-6 md:p-8 min-w-0">
            <h3 className="font-headline flex items-center text-xl md:text-2xl mb-2 shrink-0"><CalendarDays className="mr-3 h-6 w-6 text-primary"/> Sessions & Rooms</h3>
            {classInfo.schedule.map((slot, index) => (
                <div key={index} className="flex flex-col w-full rounded-xl border bg-background p-4 md:p-5 gap-4 shadow-sm min-w-0 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 min-w-0">
                      <div className="flex items-center font-bold text-base md:text-lg min-w-0">
                          <Clock className="mr-3 h-5 w-5 shrink-0" style={{ color: classInfo.accentColor }} />
                          <span className="whitespace-nowrap">{formatTimeToAMPM(slot.startTime)} - {formatTimeToAMPM(slot.endTime)}</span>
                          <Separator orientation="vertical" className="mx-4 h-6 hidden sm:block" />
                          <div className="flex items-center text-muted-foreground font-medium min-w-0">
                            <MapPin className="mr-2 h-4 w-4 shrink-0" style={{ color: classInfo.accentColor }} />
                            <span className="truncate">{slot.location}</span>
                          </div>
                      </div>
                      <div className="flex gap-2 flex-wrap shrink-0">
                          {slot.days.map(day => (
                              <Badge key={day} variant="secondary" className="px-3 py-1 text-xs font-bold">{dayLabels[day] || day}</Badge>
                          ))}
                      </div>
                    </div>
                </div>
            ))}
        </CardFooter>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Edit Class</DialogTitle>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto -mr-6 pr-6 py-4">
                <AddClassForm onSave={handleUpdateClass} classToEdit={classInfo} />
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
