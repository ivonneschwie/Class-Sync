'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useClasses } from '@/context/classes-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, MapPin, Clock, CalendarDays, Edit, Trash2, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AddClassForm } from '@/components/add-class-form';
import type { Class } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';


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
            <div className="flex items-center">
                <Skeleton className="h-6 w-6 rounded-full mr-3" />
                <Skeleton className="h-6 w-2/3" />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4 bg-muted/50 p-6">
            <Skeleton className="h-7 w-1/3 mb-2" />
            <div className="w-full space-y-2">
                <Skeleton className="h-16 w-full" />
            </div>
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
    <div className="space-y-6">
       <div className="flex flex-wrap gap-2 justify-between items-center">
         <Button variant="outline" onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Schedule
        </Button>
        <div className="flex gap-2">
            <Button onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
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

      <Card>
        <CardHeader className="border-b-4 pb-4" style={{ borderColor: classInfo.accentColor }}>
          <CardTitle className="font-headline text-3xl">{classInfo.name}</CardTitle>
          <CardDescription className="text-lg pt-1">{classInfo.code}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center text-muted-foreground">
            <User className="mr-3 h-5 w-5 flex-shrink-0" />
            <span className="font-semibold mr-2">Instructor:</span>
            <span>{classInfo.instructor}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="mr-3 h-5 w-5 flex-shrink-0" />
             <span className="font-semibold mr-2">Location:</span>
            <span>{classInfo.location}</span>
          </div>
          {classInfo.description && (
            <>
              <Separator className="my-4" />
              <div className="flex items-start text-muted-foreground">
                <FileText className="mr-3 h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-card-foreground">Description</span>
                  <p className="text-foreground whitespace-pre-wrap">{classInfo.description}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex-col items-start gap-4 bg-muted/50 p-6">
            <h3 className="font-headline flex items-center text-lg"><CalendarDays className="mr-2 h-5 w-5"/> Schedule</h3>
            {classInfo.schedule.map((slot, index) => (
                <div key={index} className="flex justify-between w-full items-center rounded-md border bg-background p-4 gap-4">
                    <div className="flex items-center font-semibold">
                        <Clock className="mr-3 h-5 w-5" style={{ color: classInfo.accentColor }} />
                        <span>{slot.startTime} - {slot.endTime}</span>
                    </div>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                        {slot.days.map(day => (
                            <Badge key={day} variant="secondary" className="text-sm">{day}</Badge>
                        ))}
                    </div>
                </div>
            ))}
        </CardFooter>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle className="font-headline">Edit Class</DialogTitle>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto -mr-6 pr-6">
                <AddClassForm onSave={handleUpdateClass} classToEdit={classInfo} />
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
