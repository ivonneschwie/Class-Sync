'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import type { Class } from '@/lib/types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from './ui/separator';
import { useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

const daysOfWeek = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'] as const;

const scheduleSchema = z.object({
  days: z.array(z.enum(daysOfWeek)).min(1, "Select at least one day."),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)."),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)."),
}).refine((data) => data.startTime < data.endTime, {
  message: "End time must be after start time.",
  path: ["endTime"],
});

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  code: z.string().min(2, "Code must be at least 2 characters."),
  instructor: z.string().min(2, "Instructor name must be at least 2 characters."),
  location: z.string().min(2, "Location must be at least 2 characters."),
  description: z.string().optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color."),
  schedule: z.array(scheduleSchema).min(1, "Please add at least one time slot."),
});

type AddClassFormProps = {
<<<<<<< HEAD
  onFormSubmit: (data: Omit<Class, 'id' | 'userId' | 'createdAt'>) => void;
  classToEdit?: Class | null;
};

const defaultValues = {
    name: '',
    code: '',
    instructor: '',
    location: '',
    accentColor: '#8B5CF6',
    schedule: [{ days: [], startTime: '', endTime: '' }],
};

export function AddClassForm({ onFormSubmit, classToEdit }: AddClassFormProps) {
=======
  onSave: (data: Omit<Class, 'id' | 'userId' | 'createdAt'>) => void;
  classToEdit?: Class | null;
};

export function AddClassForm({ onSave, classToEdit }: AddClassFormProps) {
>>>>>>> 9d5bf8e (now inside the class details, add buttons for edit and delete)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
<<<<<<< HEAD
    defaultValues: classToEdit || defaultValues,
=======
    defaultValues: {
      name: '',
      code: '',
      instructor: '',
      location: '',
      description: '',
      accentColor: '#8B5CF6',
      schedule: [{ days: [], startTime: '', endTime: '' }],
    },
>>>>>>> b480e44 (add a description category to classes that shows on details page but not)
  });

  useEffect(() => {
    if (classToEdit) {
      form.reset({
        name: classToEdit.name,
        code: classToEdit.code,
        instructor: classToEdit.instructor,
        location: classToEdit.location,
        description: classToEdit.description || '',
        accentColor: classToEdit.accentColor,
        schedule: classToEdit.schedule.map(s => ({...s, days: [...s.days]})) // Ensure deep copy
      });
    } else {
        form.reset({
            name: '',
            code: '',
            instructor: '',
            location: '',
            description: '',
            accentColor: '#8B5CF6',
            schedule: [{ days: [], startTime: '', endTime: '' }],
        });
    }
  }, [classToEdit, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'schedule',
  });
  
  useEffect(() => {
    if (classToEdit) {
      form.reset(classToEdit);
    } else {
      form.reset(defaultValues);
    }
  }, [classToEdit, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
<<<<<<< HEAD
    onFormSubmit(values);
=======
    onSave(values);
>>>>>>> 9d5bf8e (now inside the class details, add buttons for edit and delete)
  }

  const isEditing = !!classToEdit;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Class Name</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Introduction to Psychology" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Class Code</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g., PSY-101" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="instructor"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Instructor</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g., Dr. Evelyn Reed" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Healy Hall, Room 203" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                    control={form.control}
                    name="accentColor"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Accent Color</FormLabel>
                        <FormControl>
                            <div className="relative flex items-center">
                                <Input type="text" {...field} className="pr-12"/>
                                <div className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-10">
                                    <Input 
                                      type="color" 
                                      value={field.value} 
                                      onChange={e => field.onChange(e.target.value)} 
                                      className="w-full h-full p-1 border-0 cursor-pointer bg-transparent"
                                    />
                                </div>
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Course overview, important notes..."
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <Separator />

        <div className="space-y-4">
            <FormLabel>Schedule</FormLabel>
            {form.formState.errors.schedule?.root && <FormMessage className='text-sm text-destructive'>{form.formState.errors.schedule.root.message}</FormMessage>}
            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4 relative bg-muted/50">
                        <div className="flex justify-between items-center mb-4">
                            <FormLabel className="font-semibold">Time Slot #{index + 1}</FormLabel>
                            {fields.length > 1 && (
                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        
                        <FormField
                            control={form.control}
                            name={`schedule.${index}.days`}
                            render={() => (
                                <FormItem>
                                <FormLabel>Days</FormLabel>
                                <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
                                    {daysOfWeek.map((day) => (
                                    <Controller
                                        key={day}
                                        name={`schedule.${index}.days`}
                                        control={form.control}
                                        render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(day)}
                                                onCheckedChange={(checked) => {
                                                const currentDays = field.value || [];
                                                return checked
                                                    ? field.onChange([...currentDays, day])
                                                    : field.onChange(
                                                        currentDays.filter((value) => value !== day)
                                                    );
                                                }}
                                            />
                                            </FormControl>
                                            <FormLabel className="font-normal">{day}</FormLabel>
                                        </FormItem>
                                        )}
                                    />
                                    ))}
                                </div>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name={`schedule.${index}.startTime`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Time</FormLabel>
                                        <FormControl>
                                        <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`schedule.${index}.endTime`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Time</FormLabel>
                                        <FormControl>
                                        <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                ))}
            </div>
             <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => append({ days: [], startTime: '', endTime: '' })}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Another Time Slot
            </Button>
        </div>

<<<<<<< HEAD
        <Button type="submit" className="w-full">{isEditing ? 'Save Changes' : 'Add Class'}</Button>
=======
        <Button type="submit" className="w-full">{classToEdit ? 'Save Changes' : 'Add Class'}</Button>
>>>>>>> 9d5bf8e (now inside the class details, add buttons for edit and delete)
      </form>
    </Form>
  );
}
