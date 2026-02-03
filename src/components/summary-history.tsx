'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Summary } from "@/lib/types";
import { format } from 'date-fns';
import { Book, FileText, Lightbulb, ClipboardPaste, Inbox, ClipboardList, Trash2, PanelLeft, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSummaries } from '@/context/summaries-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

export function SummaryHistory() {
    const { summaries, deleteSummary } = useSummaries();
    const { toast } = useToast();
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [summaryIdToDelete, setSummaryIdToDelete] = useState<string | null>(null);
    
    const isMobile = useIsMobile();
    const [subjectsCollapsed, setSubjectsCollapsed] = useState(true);
    const [lessonsCollapsed, setLessonsCollapsed] = useState(true);

    useEffect(() => {
        if (isMobile === undefined) return;
        setSubjectsCollapsed(!isMobile);
        setLessonsCollapsed(!isMobile);
    }, [isMobile]);

    const summaryToDelete = summaries.find(s => s.id === summaryIdToDelete);

    // Group summaries by subject
    const groupedSummaries = useMemo(() => summaries.reduce((acc, summary) => {
        const { subject } = summary;
        if (!acc[subject]) {
            acc[subject] = [];
        }
        acc[subject].push(summary);
        return acc;
    }, {} as Record<string, Summary[]>), [summaries]);

    const subjects = Object.keys(groupedSummaries).sort();
    
    useEffect(() => {
        if (subjects.length > 0 && !selectedSubject) {
            setSelectedSubject(subjects[0]);
        }
    }, [subjects, selectedSubject]);

    useEffect(() => {
        if(selectedSubject && groupedSummaries[selectedSubject]?.length > 0) {
            if(!selectedSummary || selectedSummary.subject !== selectedSubject) {
                setSelectedSummary(groupedSummaries[selectedSubject][0]);
            }
        } else if (selectedSubject && groupedSummaries[selectedSubject]?.length === 0) {
            setSelectedSummary(null);
        }
    }, [selectedSubject, groupedSummaries, selectedSummary]);


    const handleSelectSubject = (subject: string) => {
        setSelectedSubject(subject);
        if (isMobile && lessonsCollapsed) {
            setLessonsCollapsed(false);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSummaryIdToDelete(id);
        setDialogOpen(true);
    };

    const confirmDelete = () => {
        if (summaryIdToDelete) {
            deleteSummary(summaryIdToDelete);
            toast({
                title: "Lesson Deleted",
                description: `The lesson has been removed.`,
            });
        }
        setDialogOpen(false);
        setSummaryIdToDelete(null);
    };
    
    if (summaries.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="font-headline">Summary History</CardTitle>
                    <CardDescription>Review your past summaries here, grouped by subject.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-[50vh] text-center text-muted-foreground">
                        <Inbox className="h-16 w-16 mb-4"/>
                        <h3 className="text-xl font-semibold font-headline">No Summaries Yet</h3>
                        <p className="text-sm">Your history will appear here after you summarize your first set of notes.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-[auto_auto_1fr] h-full gap-4">
                {/* Subjects (Notebooks) Panel */}
                <div className={cn("transition-all duration-300 ease-in-out", subjectsCollapsed ? 'md:w-[155px]' : 'md:w-[250px] lg:w-[280px]', 'w-full')}>
                    <Card className="flex flex-col h-full overflow-hidden">
                        <CardHeader className="flex-shrink-0 p-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="font-headline flex items-center gap-2 text-lg whitespace-nowrap"><Book className="h-5 w-5 text-primary"/> Subjects</CardTitle>
                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 ml-[5px]" onClick={() => setSubjectsCollapsed(!subjectsCollapsed)}>
                                    <PanelLeft className={cn("h-5 w-5 transition-transform duration-300 hidden md:block", subjectsCollapsed && "md:rotate-180")}/>
                                    <ChevronUp className={cn("h-5 w-5 transition-transform duration-300 md:hidden", subjectsCollapsed && "rotate-180")}/>
                                    <span className="sr-only">Toggle Subjects panel</span>
                                </Button>
                            </div>
                        </CardHeader>
                <ScrollArea className={cn("h-full px-2 pt-0 pb-2 border-t", subjectsCollapsed && 'md:overflow-hidden')}>
                            <div className={cn("flex flex-col gap-1 py-2", (subjectsCollapsed && isMobile) && 'hidden')}>
                                {subjects.map(subject => (
                                    <button
                                        key={subject}
                                        onClick={() => handleSelectSubject(subject)}
                                        className={cn(
                                            "w-full text-left p-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                                            selectedSubject === subject ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                                        )}
                                    >
                                        {subject}
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </Card>
                </div>


                {/* Lessons (Pages) Panel */}
                <div className={cn("transition-all duration-300 ease-in-out", lessonsCollapsed ? 'md:w-[150px]' : 'md:w-[300px] lg:w-[320px]', 'w-full')}>
                    <Card className="flex flex-col h-full overflow-hidden">
                        <CardHeader className="flex-shrink-0 p-2">
                           <div className="flex items-center justify-between">
                                <CardTitle className="font-headline flex items-center gap-2 text-lg whitespace-nowrap"><FileText className="h-5 w-5 text-primary"/> Lessons</CardTitle>
                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 ml-[5px]" onClick={() => setLessonsCollapsed(!lessonsCollapsed)}>
                                    <PanelLeft className={cn("h-5 w-5 transition-transform duration-300 hidden md:block", lessonsCollapsed && "md:rotate-180")}/>
                                    <ChevronUp className={cn("h-5 w-5 transition-transform duration-300 md:hidden", lessonsCollapsed && "rotate-180")}/>
                                    <span className="sr-only">Toggle Lessons panel</span>
                                </Button>
                            </div>
                        </CardHeader>
                        <ScrollArea className={cn("flex-grow px-2 pt-0 pb-2 border-t", lessonsCollapsed && 'md:overflow-hidden')}>
                             <div className={cn("space-y-2 py-2", (lessonsCollapsed && isMobile) && 'hidden')}>
                                {selectedSubject ? (
                                    groupedSummaries[selectedSubject] && groupedSummaries[selectedSubject].length > 0 ? (
                                        groupedSummaries[selectedSubject].map(summary => (
                                            <div
                                                key={summary.id}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => setSelectedSummary(summary)}
                                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedSummary(summary) }}
                                                className={cn(
                                                    "w-full text-left p-3 rounded-lg transition-colors border cursor-pointer",
                                                    selectedSummary?.id === summary.id ? "bg-muted ring-2 ring-primary" : "hover:bg-muted/50"
                                                )}
                                            >
                                                <p className="font-semibold text-sm truncate">{summary.title}</p>
                                                <p className="text-xs text-muted-foreground truncate pt-1">{summary.notes}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground text-center p-4">
                                            <p>No lessons for this subject.</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground text-center p-4">
                                        <p>Select a subject to see lessons.</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </Card>
                </div>

                {/* Content Panel */}
                <Card className="flex flex-col">
                     <ScrollArea className="h-full p-6">
                        {selectedSummary ? (
                            <div className="space-y-8 animate-in fade-in-20">
                                <div className="border-b pb-2">
                                    <div className="flex justify-between items-center gap-4">
                                        <h2 className="text-2xl font-bold font-headline">{selectedSummary.title}</h2>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => handleDeleteClick(e, selectedSummary.id)}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                            <span className="sr-only">Delete lesson</span>
                                        </Button>
                                    </div>
                                    <p className="text-sm text-muted-foreground pt-1">{format(selectedSummary.createdAt.toDate(), "MMMM d, yyyy")}</p>
                                </div>
                                
                                <div className="space-y-3">
                                    <h3 className="font-headline text-xl flex items-center gap-2"><ClipboardList className="text-primary"/> AI Summary</h3>
                                     <Card className="bg-primary/5 border-primary/20">
                                        <CardContent className="p-4">
                                            <p className="whitespace-pre-wrap leading-relaxed">{selectedSummary.summary}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                                
                                <div className="space-y-3">
                                    <h3 className="font-headline text-xl flex items-center gap-2"><ClipboardPaste className="text-primary"/> Original Notes</h3>
                                    <Card className="bg-muted/30 border-dashed">
                                        <CardContent className="p-4">
                                            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{selectedSummary.notes}</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="font-headline text-xl flex items-center gap-2"><Lightbulb className="text-primary"/> Clarification Questions</h3>
                                     <Card className="bg-accent/10 border-accent/20">
                                        <CardContent className="p-4">
                                            <ul className="list-disc space-y-2 pl-5">
                                                {selectedSummary.clarificationQuestions.split('\n').filter(q => q.trim() !== '' && q.trim() !== '-').map((question, index) => (
                                                    <li key={index}>{question.replace(/^- /, '')}</li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-4">
                                 <FileText className="h-16 w-16 mb-4"/>
                                <h3 className="text-xl font-semibold font-headline">Select a Lesson</h3>
                                <p className="text-sm">The contents of your lesson will be displayed here.</p>
                            </div>
                        )}
                     </ScrollArea>
                </Card>
            </div>
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the summary for "{summaryToDelete?.title}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSummaryIdToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

    