import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Clock, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import type { Class } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from './ui/button';

type ClassCardProps = {
  classInfo: Class;
  onEdit: () => void;
  onDelete: () => void;
};

export function ClassCard({ classInfo, onEdit, onDelete }: ClassCardProps) {
  return (
<<<<<<< HEAD
    <Card 
      className="flex flex-col h-full transition-shadow duration-300 hover:shadow-lg hover:-translate-y-1 border-t-4"
      style={{ borderTopColor: classInfo.accentColor }}
    >
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle className="font-headline text-xl">{classInfo.name}</CardTitle>
          <CardDescription>{classInfo.code}</CardDescription>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4"/>
                    <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4"/>
                    <span>Delete</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <User className="mr-2 h-4 w-4 flex-shrink-0" />
          <span>{classInfo.instructor}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
          <span>{classInfo.location}</span>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start bg-muted/50 px-6 py-4 mt-auto gap-3">
        {classInfo.schedule.map((slot, index) => (
            <div key={index} className="flex justify-between w-full items-center text-sm">
                <div className="flex items-center font-semibold">
                    <Clock className="mr-2 h-4 w-4" style={{ color: classInfo.accentColor }} />
                    <span>{slot.startTime} - {slot.endTime}</span>
                </div>
                <div className="flex gap-1">
                    {slot.days.map(day => (
                        <Badge key={day} variant="secondary">{day}</Badge>
                    ))}
                </div>
            </div>
        ))}
      </CardFooter>
    </Card>
=======
    <Link href={`/class/${classInfo.id}`} className="block h-full group focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
      <Card 
        className="flex flex-col h-full transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 group-focus:shadow-lg group-focus:-translate-y-1 border-t-4"
        style={{ borderTopColor: classInfo.accentColor }}
      >
        <CardHeader>
          <CardTitle className="font-headline text-xl">{classInfo.name}</CardTitle>
          <CardDescription>{classInfo.code}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="mr-2 h-4 w-4 flex-shrink-0" />
            <span>{classInfo.instructor}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
            <span>{classInfo.location}</span>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start bg-muted/50 px-6 py-4 mt-auto gap-3">
          {classInfo.schedule.map((slot, index) => (
              <div key={index} className="flex justify-between w-full items-center text-sm">
                  <div className="flex items-center font-semibold">
                      <Clock className="mr-2 h-4 w-4" style={{ color: classInfo.accentColor }} />
                      <span>{slot.startTime} - {slot.endTime}</span>
                  </div>
                  <div className="flex gap-1">
                      {slot.days.map(day => (
                          <Badge key={day} variant="secondary">{day}</Badge>
                      ))}
                  </div>
              </div>
          ))}
        </CardFooter>
      </Card>
    </Link>
>>>>>>> 832bc03 (make the classes clickable and directs to the details of the class)
  );
}
