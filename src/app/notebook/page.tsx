'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Summary } from "@/lib/types";
import { format } from 'date-fns';
import { Book, FileText, ChevronLeft, ChevronDown, Save, Plus, Trash2, Edit3, Search, FileSignature, Sparkles, Menu, Bold, Italic, List, CheckSquare, Quote, Code, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSummaries } from '@/context/summaries-context';
import { useClasses } from '@/context/classes-context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { renderMarkdown } from '@/lib/markdown-compiler';

export default function NotebookPage() {
  const { classes } = useClasses();
  const { summaries: notes, addSummary: addNote, deleteSummary: deleteNote, updateSummary: updateNote } = useSummaries();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Use class names as subjects
  const subjects = useMemo(() => Array.from(new Set(classes.map(c => c.name))).sort(), [classes]);

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Summary | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingNewNoteTitle, setPendingNewNoteTitle] = useState<string | null>(null);

  // 1. Keep selectedNote in sync with the real-time notes collection
  useEffect(() => {
    if (selectedNote) {
      const freshNote = notes.find(n => n.id === selectedNote.id);
      if (freshNote) {
        if (freshNote.title !== selectedNote.title || freshNote.notes !== selectedNote.notes) {
          setSelectedNote(freshNote);
        }
      }
    }
  }, [notes, selectedNote]);

  // 2. Automatically select the newly created note when it is written to the Firestore collection
  useEffect(() => {
    if (pendingNewNoteTitle && selectedSubject) {
      const newNote = notes.find(n => n.title === pendingNewNoteTitle && n.subject === selectedSubject);
      if (newNote) {
        setSelectedNote(newNote);
        setPendingNewNoteTitle(null);
        if (isMobile) {
          setMobileView('editor');
        }
      }
    }
  }, [notes, pendingNewNoteTitle, selectedSubject, isMobile]);

  // Navigation panel toggle (Desktop)
  const [showNav, setShowNav] = useState(true);

  // Mobile navigation state
  const [mobileView, setMobileView] = useState<'subjects' | 'notes' | 'editor'>('subjects');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [noteIdToDelete, setNoteIdToDelete] = useState<string | null>(null);

  // Set initial subject on load
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0]);
    }
  }, [subjects, selectedSubject]);

  const subjectNotes = useMemo(() => {
    if (!selectedSubject) return [];
    let filtered = notes.filter(n => n.subject === selectedSubject);
    if (searchQuery.trim()) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.notes.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
  }, [notes, selectedSubject, searchQuery]);

  const [editPreviewMode, setEditPreviewMode] = useState(false);

  // Sync edit states when selecting a note
  useEffect(() => {
    if (selectedNote) {
      setEditTitle(selectedNote.title);
      setEditBody(selectedNote.notes);
    } else {
      setEditTitle('');
      setEditBody('');
    }
    setEditPreviewMode(false);
  }, [selectedNote]);

  const handleInsertMarkdown = (syntax: string) => {
    const isMobileTextarea = isMobile && mobileView === 'editor';
    const textareaId = isMobileTextarea ? 'note-textarea-mobile' : 'note-textarea';
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editBody;
    const selectedText = text.substring(start, end);

    let replacement = '';
    let cursorOffset = 0;

    switch (syntax) {
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`;
        cursorOffset = selectedText ? replacement.length : 2;
        break;
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`;
        cursorOffset = selectedText ? replacement.length : 1;
        break;
      case 'heading':
        replacement = `\n# ${selectedText || 'Heading'}\n`;
        cursorOffset = replacement.length;
        break;
      case 'subheading':
        replacement = `\n## ${selectedText || 'Subheading'}\n`;
        cursorOffset = replacement.length;
        break;
      case 'bullet':
        replacement = `\n- ${selectedText || 'List item'}`;
        cursorOffset = replacement.length;
        break;
      case 'todo':
        replacement = `\n- [ ] ${selectedText || 'Todo item'}`;
        cursorOffset = replacement.length;
        break;
      case 'quote':
        replacement = `\n> ${selectedText || 'Blockquote'}\n`;
        cursorOffset = replacement.length;
        break;
      case 'code':
        replacement = `\n\`\`\`\n${selectedText || 'code'}\n\`\`\`\n`;
        cursorOffset = replacement.length;
        break;
      default:
        break;
    }

    const newText = text.substring(0, start) + replacement + text.substring(end);
    setEditBody(newText);

    // Refocus and set cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 50);
  };

  const handleTodoToggle = (targetIndex: number) => {
    const targetText = isEditing ? editBody : (selectedNote?.notes || '');
    
    let currentIndex = 0;
    const toggledText = targetText.replace(/^- \[( |x)\] (.*?)$/gm, (match, checked, content) => {
      const idx = currentIndex++;
      if (idx === targetIndex) {
        const nextChecked = checked === 'x' ? ' ' : 'x';
        return `- [${nextChecked}] ${content}`;
      }
      return match;
    });
    
    if (isEditing) {
      setEditBody(toggledText);
    } else if (selectedNote) {
      updateNote(selectedNote.id, {
        notes: toggledText
      });
      setSelectedNote(prev => prev ? { ...prev, notes: toggledText } : null);
    }
  };

  const handleSelectSubject = (subject: string) => {
    setSelectedSubject(subject);
    setSearchQuery('');
    setSelectedNote(null);
    setIsEditing(false);
    if (isMobile) {
      setMobileView('notes');
    }
  };

  const handleSelectNote = (note: Summary) => {
    setSelectedNote(note);
    setIsEditing(false);
    if (isMobile) {
      setMobileView('editor');
    }
  };

  const handleCreateNew = () => {
    setSelectedNote(null);
    setEditTitle('');
    setEditBody('');
    setIsEditing(true);
    if (isMobile) {
      setMobileView('editor');
    }
  };

  const handleEdit = () => {
    if (selectedNote) {
      setEditTitle(selectedNote.title);
      setEditBody(selectedNote.notes);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (!selectedSubject) return;
    if (!editTitle.trim()) {
      toast({ title: 'Title Required', description: 'Please enter a title for your note.', variant: 'destructive' });
      return;
    }

    if (selectedNote) {
      updateNote(selectedNote.id, {
        title: editTitle,
        notes: editBody,
      });
      // Update local state immediately for instant, latency-free feedback
      setSelectedNote({
        ...selectedNote,
        title: editTitle,
        notes: editBody
      });
      toast({ title: 'Success', description: 'Note updated successfully!' });
    } else {
      addNote({
        title: editTitle,
        notes: editBody,
        subject: selectedSubject,
        summary: '',
        clarificationQuestions: ''
      });
      // Set the pending title trigger so our reactive effect selects it immediately upon creation
      setPendingNewNoteTitle(editTitle);
      toast({ title: 'Success', description: 'Note created successfully!' });
    }
    setIsEditing(false);
    if (isMobile) {
      setMobileView('notes');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNoteIdToDelete(id);
    setDialogOpen(true);
  };

  const confirmDelete = () => {
    if (noteIdToDelete) {
      deleteNote(noteIdToDelete);
      toast({ title: "Note Deleted", description: "Your note was deleted successfully." });
      if (selectedNote?.id === noteIdToDelete) {
        setSelectedNote(null);
        if (isMobile) {
          setMobileView('notes');
        }
      }
    }
    setDialogOpen(false);
    setNoteIdToDelete(null);
  };

  // Word & Character count helper for edit mode
  const wordCount = editBody.trim() ? editBody.trim().split(/\s+/).length : 0;
  const charCount = editBody.length;

  const readingTime = Math.ceil(wordCount / 200) || 1;
  const progressPercentage = Math.min((wordCount / 300) * 100, 100);

  const noteLevel = useMemo(() => {
    if (wordCount === 0) return "Empty Note 🗒️";
    if (wordCount < 50) return "Quick Memo 📝";
    if (wordCount >= 50 && wordCount < 150) return "Study Outline 📌";
    if (wordCount >= 150 && wordCount < 300) return "Lecture Outline 📚";
    return "Comprehensive Guide 🎓";
  }, [wordCount]);

  // Word & Character count helper for saved note view mode
  const viewWordCount = selectedNote?.notes.trim() ? selectedNote.notes.trim().split(/\s+/).length : 0;
  const viewCharCount = selectedNote?.notes.length || 0;

  const viewReadingTime = Math.ceil(viewWordCount / 200) || 1;
  const viewProgressPercentage = Math.min((viewWordCount / 300) * 100, 100);

  const viewNoteLevel = selectedNote ? (
    viewWordCount === 0 ? "Empty Note 🗒️" :
    viewWordCount < 50 ? "Quick Memo 📝" :
    viewWordCount >= 50 && viewWordCount < 150 ? "Study Outline 📌" :
    viewWordCount >= 150 && viewWordCount < 300 ? "Lecture Outline 📚" :
    "Comprehensive Guide 🎓"
  ) : "Empty Note 🗒️";

  return (
    <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto h-[calc(100dvh-120px)] md:h-full gap-4 min-h-0 min-w-0 overflow-x-hidden">

      {/* Top Navigation & Controls Bar (Desktop collapse triggers here) */}
      <div className="flex items-center gap-3 px-1 border-b pb-3 border-muted/30 w-full min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowNav(!showNav)}
          className="hidden md:flex h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/70 rounded-xl transition-all"
          title={showNav ? "Hide Navigation" : "Show Navigation"}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Notebook Name Selector (Always active) */}
        {selectedSubject ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="flex-1 md:flex-initial min-w-0 max-w-[90vw] sm:max-w-none">
              <Button variant="ghost" className="flex items-center justify-between md:justify-start w-full md:w-auto gap-2 font-headline font-bold text-lg px-3 py-2 hover:bg-muted/65 rounded-xl transition-all">
                <div className="flex items-center gap-2 min-w-0">
                  <Book className="h-5 w-5 text-primary shrink-0" />
                  <span className="truncate">{selectedSubject}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" collisionPadding={16} className="w-[calc(100vw-32px)] sm:w-60 rounded-xl shadow-lg border border-primary/10 p-1.5">
              {subjects.map(subject => (
                <DropdownMenuItem
                  key={subject}
                  onClick={() => handleSelectSubject(subject)}
                  className={cn(
                    "rounded-lg py-2.5 px-3 cursor-pointer text-sm font-headline transition-all flex items-center min-w-0 w-full",
                    selectedSubject === subject ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted"
                  )}
                >
                  <span className="truncate flex-grow">{subject}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="space-y-1">
            <h1 className="text-xl font-bold font-headline">Notebook</h1>
          </div>
        )}

        <div className="ml-auto hidden md:flex items-center gap-2">
          <p className="text-xs text-muted-foreground font-medium">
            Double-click or click Edit to modify your notes.
          </p>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className={cn(
        "hidden md:grid flex-1 gap-6",
        showNav ? "md:grid-cols-[240px_320px_1fr]" : "md:grid-cols-1"
      )}>

        {/* PANEL 1: SUBJECT SHELF (Hidden when collapsed) */}
        {showNav && (
          <Card className="flex flex-col h-[75vh] border bg-background/50 backdrop-blur-md rounded-2xl shadow-sm overflow-hidden animate-in slide-in-from-left-4 duration-200">
            <CardHeader className="p-4 border-b bg-muted/20">
              <CardTitle className="font-headline text-md font-semibold text-muted-foreground uppercase tracking-wider">
                Subjects
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1 p-3">
              <div className="flex flex-col gap-2">
                {subjects.length === 0 ? (
                  <div className="text-center p-6 border-2 border-dashed rounded-xl border-muted-foreground/20">
                    <p className="text-xs text-muted-foreground leading-normal">
                      Create a subject class in the schedule to view your notebooks.
                    </p>
                  </div>
                ) : (
                  subjects.map(subject => {
                    const count = notes.filter(n => n.subject === subject).length;
                    return (
                      <button
                        key={subject}
                        onClick={() => handleSelectSubject(subject)}
                        className={cn(
                          "w-full text-left p-3 rounded-xl text-sm font-medium transition-all duration-200 flex justify-between items-center group relative overflow-hidden",
                          selectedSubject === subject
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                            : "hover:bg-muted border border-transparent hover:border-muted-foreground/10"
                        )}
                      >
                        <span className="truncate pr-2 font-headline">{subject}</span>
                        <span className={cn(
                          "text-xs px-2.5 py-0.5 rounded-full font-bold",
                          selectedSubject === subject ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                        )}>
                          {count}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </Card>
        )}

        {/* PANEL 2: NOTES LIST (Hidden when collapsed) */}
        {showNav && (
          <Card className="flex flex-col h-[75vh] border bg-background/50 backdrop-blur-md rounded-2xl shadow-sm overflow-hidden animate-in slide-in-from-left-4 duration-250">
            <CardHeader className="p-4 border-b bg-muted/20 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-headline text-md font-semibold text-muted-foreground uppercase tracking-wider">
                  Notes
                </CardTitle>
                <Button
                  onClick={handleCreateNew}
                  disabled={!selectedSubject}
                  size="sm"
                  className="h-8 px-2.5 bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary transition-all rounded-lg"
                >
                  <Plus className="h-4 w-4 mr-1" /> New Note
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-background/50 rounded-lg"
                  disabled={!selectedSubject}
                />
              </div>
            </CardHeader>
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-2">
                {selectedSubject ? (
                  subjectNotes.length > 0 ? (
                    subjectNotes.map(note => (
                      <div
                        key={note.id}
                        role="button"
                        onClick={() => handleSelectNote(note)}
                        className={cn(
                          "w-full text-left p-4 rounded-xl transition-all duration-200 border cursor-pointer group relative overflow-hidden",
                          selectedNote?.id === note.id && !isEditing
                            ? "bg-primary/5 ring-1 ring-primary border-primary/20 shadow-sm"
                            : "hover:bg-muted/80 hover:scale-[1.01]"
                        )}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-bold text-sm text-foreground font-headline truncate w-full group-hover:text-primary transition-colors">
                            {note.title}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 pt-1 font-sans">
                          {note.notes || "No content."}
                        </p>
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-muted/30">
                          <p className="text-[10px] text-muted-foreground/75 font-semibold">
                            {note.createdAt?.toDate ? format(note.createdAt.toDate(), "MMM d, yyyy") : 'Just now'}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleDeleteClick(e, note.id)}
                            className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground/60">
                      <p className="text-sm font-headline">No notes match your search</p>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground/60">
                    <p className="text-sm">Select a subject to view notes</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        )}

        {/* PANEL 3: WRITING AREA / VIEW PANEL */}
        <Card className={cn(
          "flex flex-col h-[75vh] border bg-background rounded-2xl shadow-md overflow-hidden relative border-primary/10 transition-all duration-300",
          isEditing && !editPreviewMode && "ring-2 ring-primary/20 shadow-lg border-primary/30"
        )}>
          {isEditing && (
            /* Markdown Editor Toolbar */
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-muted/40 border-b border-muted/50 shrink-0">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleInsertMarkdown('bold')}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleInsertMarkdown('italic')}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <div className="h-4 w-[1px] bg-muted-foreground/20 mx-1" />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleInsertMarkdown('heading')}
                className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg text-xs font-bold font-headline"
                title="Heading 1"
              >
                H1
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleInsertMarkdown('subheading')}
                className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg text-xs font-bold font-headline"
                title="Heading 2"
              >
                H2
              </Button>
              <div className="h-4 w-[1px] bg-muted-foreground/20 mx-1" />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleInsertMarkdown('bullet')}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleInsertMarkdown('todo')}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                title="Checklist"
              >
                <CheckSquare className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleInsertMarkdown('quote')}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                title="Blockquote"
              >
                <Quote className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleInsertMarkdown('code')}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                title="Code Block"
              >
                <Code className="h-4 w-4" />
              </Button>

              {/* Segmented Write vs Preview control */}
              <div className="ml-auto flex items-center bg-muted/60 p-0.5 rounded-lg border border-muted-foreground/10 shrink-0">
                <Button
                  size="sm"
                  variant={!editPreviewMode ? "secondary" : "ghost"}
                  onClick={() => setEditPreviewMode(false)}
                  className={cn("h-7 rounded-md text-[11px] font-semibold px-2.5", !editPreviewMode && "shadow-sm bg-background text-foreground")}
                >
                  Write
                </Button>
                <Button
                  size="sm"
                  variant={editPreviewMode ? "secondary" : "ghost"}
                  onClick={() => setEditPreviewMode(true)}
                  className={cn("h-7 rounded-md text-[11px] font-semibold px-2.5", editPreviewMode && "shadow-sm bg-background text-foreground")}
                >
                  Preview
                </Button>
              </div>
            </div>
          )}

            {isEditing ? (
              <div className="flex-1 flex flex-col gap-4 p-6 min-h-0 animate-in fade-in-20 duration-200">
                {/* Fixed Header Toolbar */}
                <div className="flex justify-between items-center pb-4 border-b border-muted/50 shrink-0">
                  <Input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="E.g., Lecture 1: Core Concepts"
                    className="text-xl font-bold font-headline max-w-md bg-transparent border-none shadow-none px-0 focus-visible:ring-0 focus-visible:border-none text-foreground placeholder:text-muted-foreground/50"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        if (!selectedNote && subjectNotes.length > 0) setSelectedNote(subjectNotes[0]);
                      }}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm rounded-xl px-4"
                    >
                      <Save className="w-4 h-4 mr-2" /> Save Note
                    </Button>
                  </div>
                </div>

                {/* ONLY scroll the writing/preview canvas */}
                <ScrollArea className="flex-1 min-h-0 w-full pr-1">
                  {editPreviewMode ? (
                    <div className="px-0 py-1 w-full">
                      {renderMarkdown(editBody, handleTodoToggle)}
                    </div>
                  ) : (
                    <Textarea
                      id="note-textarea"
                      value={editBody}
                      onChange={e => setEditBody(e.target.value)}
                      placeholder="Start typing your study notes here..."
                      className="w-full border-none shadow-none resize-none px-0 py-1 focus-visible:ring-0 text-md font-sans min-h-[350px] placeholder:text-muted-foreground/45 bg-transparent"
                      style={{
                        backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.06) 1px, transparent 1px)',
                        backgroundSize: '100% 2.2rem',
                        lineHeight: '2.2rem',
                        borderLeft: '2px solid rgba(239, 68, 68, 0.25)',
                        paddingLeft: '1.25rem',
                      }}
                    />
                  )}
                </ScrollArea>

                {/* Fixed Intelligent Note Stats Footer */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-muted-foreground border-t pt-4 border-muted/50 shrink-0">
                  <div className="flex flex-wrap gap-4 items-center min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="relative h-6 w-6 shrink-0">
                        <svg className="h-full w-full transform -rotate-90">
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            className="stroke-muted/30"
                            strokeWidth="2.5"
                            fill="transparent"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            className="stroke-primary transition-all duration-300"
                            strokeWidth="2.5"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 9}
                            strokeDashoffset={2 * Math.PI * 9 - (progressPercentage / 100) * 2 * Math.PI * 9}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-foreground">
                          {Math.round(progressPercentage)}%
                        </span>
                      </div>
                      <span className="font-semibold text-foreground/80">{noteLevel}</span>
                    </div>

                    <div className="h-3 w-[1px] bg-muted-foreground/20 hidden xs:block" />
                    
                    <span><strong>Words:</strong> {wordCount}</span>
                    <span><strong>Chars:</strong> {charCount}</span>
                    
                    <div className="h-3 w-[1px] bg-muted-foreground/20 hidden xs:block" />
                    
                    <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5 text-primary" /> {readingTime} min read</span>
                  </div>
                  
                  <span className="flex items-center gap-1 text-[11px] bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-full shrink-0"><Sparkles className="w-3 h-3" /> Live Markdown</span>
                </div>
              </div>
            ) : selectedNote ? (
              <div className="flex-1 flex flex-col gap-4 p-6 min-h-0 animate-in fade-in-20 duration-200">
                {/* Fixed Viewer Header */}
                <div className="border-b pb-4 flex justify-between items-start gap-4 shrink-0">
                  <div className="space-y-1.5">
                    <h2 className="text-2xl font-bold font-headline text-foreground">{selectedNote.title}</h2>
                    <p className="text-xs text-muted-foreground font-semibold bg-muted px-2.5 py-0.5 rounded-full inline-block">
                      {selectedNote.createdAt?.toDate ? format(selectedNote.createdAt.toDate(), "MMMM d, yyyy") : 'Just now'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={handleEdit}
                      className="rounded-xl hover:bg-primary/5 hover:text-primary hover:border-primary/20"
                    >
                      <Edit3 className="w-4 h-4 mr-2" /> Edit Note
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteClick(e, selectedNote.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl h-9 w-9"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* ONLY scroll the viewing area */}
                <ScrollArea className="flex-1 min-h-0 w-full pr-1">
                  <div className="leading-relaxed text-md font-sans text-foreground/90 max-w-none">
                    {renderMarkdown(selectedNote.notes, handleTodoToggle)}
                  </div>
                </ScrollArea>

                {/* Fixed Intelligent Note Stats Footer for Viewer */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-muted-foreground border-t pt-4 border-muted/50 shrink-0">
                  <div className="flex flex-wrap gap-4 items-center min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="relative h-6 w-6 shrink-0">
                        <svg className="h-full w-full transform -rotate-90">
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            className="stroke-muted/30"
                            strokeWidth="2.5"
                            fill="transparent"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            className="stroke-primary transition-all duration-300"
                            strokeWidth="2.5"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 9}
                            strokeDashoffset={2 * Math.PI * 9 - (viewProgressPercentage / 100) * 2 * Math.PI * 9}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-foreground">
                          {Math.round(viewProgressPercentage)}%
                        </span>
                      </div>
                      <span className="font-semibold text-foreground/80">{viewNoteLevel}</span>
                    </div>

                    <div className="h-3 w-[1px] bg-muted-foreground/20 hidden xs:block" />
                    
                    <span><strong>Words:</strong> {viewWordCount}</span>
                    <span><strong>Chars:</strong> {viewCharCount}</span>
                    
                    <div className="h-3 w-[1px] bg-muted-foreground/20 hidden xs:block" />
                    
                    <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5 text-primary" /> {viewReadingTime} min read</span>
                  </div>
                  
                  <span className="flex items-center gap-1 text-[11px] bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-full shrink-0"><Sparkles className="w-3 h-3" /> Live Markdown</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
                <div className="bg-primary/10 p-4 rounded-full mb-4 text-primary animate-pulse">
                  <FileSignature className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold font-headline text-foreground">Write Your Notes</h3>
                {!showNav && selectedSubject && (
                  <Button onClick={() => setShowNav(true)} className="mt-3 bg-primary text-primary-foreground rounded-xl">
                    <Menu className="w-4 h-4 mr-2" /> Show Navigation Pane
                  </Button>
                )}
                <p className="text-sm max-w-sm pt-1">
                  Select a note from the list, or create a brand new one to capture your lecture highlights.
                </p>
              </div>
            )}
        </Card>
      </div>

      {/* Mobile Layout (Unchanged single-panel stack flow) */}
      <div className="md:hidden flex-1 flex flex-col min-h-0 h-full">
        {/* MOBILE VIEW 1: SUBJECT SHELF */}
        {mobileView === 'subjects' && (
          <Card className="flex-1 flex flex-col border rounded-2xl overflow-hidden min-h-0 h-full">
            <CardHeader className="p-4 border-b bg-muted/10">
              <CardTitle className="font-headline text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                My Notebooks
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1 p-3">
              <div className="grid grid-cols-1 gap-2">
                {subjects.length === 0 ? (
                  <div className="text-center p-8 border-2 border-dashed rounded-2xl border-muted-foreground/20">
                    <p className="text-sm text-muted-foreground leading-normal">
                      Create a class in the schedule to view your notebooks automatically.
                    </p>
                  </div>
                ) : (
                  subjects.map(subject => {
                    const count = notes.filter(n => n.subject === subject).length;
                    return (
                      <button
                        key={subject}
                        onClick={() => handleSelectSubject(subject)}
                        className="w-full text-left p-4 rounded-xl border hover:bg-muted bg-background/50 flex justify-between items-center gap-2 group active:scale-[0.99] transition-transform min-w-0"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                          <span className="font-bold text-sm text-foreground font-headline truncate flex-1">{subject}</span>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                          {count} {count === 1 ? 'note' : 'notes'}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </Card>
        )}

        {/* MOBILE VIEW 2: NOTES LIST */}
        {mobileView === 'notes' && (
          <Card className="flex-1 flex flex-col border rounded-2xl overflow-hidden min-h-0 h-full">
            <CardHeader className="p-4 border-b bg-muted/10 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-lg" onClick={() => setMobileView('subjects')}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1 min-w-0 max-w-[140px] xs:max-w-[180px] sm:max-w-[300px]">
                  <span className="font-headline text-sm font-bold text-foreground truncate block">
                    {selectedSubject}
                  </span>
                </div>
                <Button onClick={handleCreateNew} size="sm" className="h-8 bg-primary text-primary-foreground px-3 rounded-lg flex items-center ml-auto shrink-0">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-background/50 rounded-lg"
                />
              </div>
            </CardHeader>
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-2">
                {subjectNotes.length > 0 ? (
                  subjectNotes.map(note => (
                    <div
                      key={note.id}
                      role="button"
                      onClick={() => handleSelectNote(note)}
                      className="w-full text-left p-4 rounded-xl border bg-background/50 transition-all active:bg-muted min-w-0"
                    >
                      <div className="flex justify-between items-start gap-2 min-w-0 w-full">
                        <p className="font-bold text-sm text-foreground font-headline truncate flex-1 pr-1">
                          {note.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteClick(e, note.id)}
                          className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 pt-1 font-sans">
                        {note.notes || "No content."}
                      </p>
                      <p className="text-[10px] text-muted-foreground/80 mt-2 font-semibold">
                        {note.createdAt?.toDate ? format(note.createdAt.toDate(), "MMM d, yyyy") : 'Just now'}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                    <p className="text-sm">No notes found.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        )}

        {/* MOBILE VIEW 3: WRITING AREA / VIEW PANEL */}
        {mobileView === 'editor' && (
          <Card className="flex-1 flex flex-col border rounded-2xl overflow-hidden bg-background min-h-0 h-full">
            <div className="p-4 border-b flex justify-between items-center gap-2 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-lg shrink-0" onClick={() => {
                setIsEditing(false);
                setMobileView('notes');
              }}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex-grow min-w-0 max-w-[130px] xs:max-w-[160px] sm:max-w-[300px]">
                {isEditing ? (
                  <Input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="Note Title"
                    className="text-sm font-bold font-headline max-w-full bg-transparent border-none shadow-none px-0 focus-visible:ring-0 focus-visible:border-none"
                  />
                ) : (
                  <h2 className="text-sm font-bold font-headline truncate text-foreground">
                    {selectedNote ? selectedNote.title : "New Note"}
                  </h2>
                )}
              </div>

              {/* Segmented Write vs Preview control for mobile editing */}
              {isEditing && (
                <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-muted-foreground/10 shrink-0 ml-2">
                  <Button
                    size="sm"
                    variant={!editPreviewMode ? "secondary" : "ghost"}
                    onClick={() => setEditPreviewMode(false)}
                    className={cn("h-7 rounded-md text-[10px] font-semibold px-2", !editPreviewMode && "shadow-sm bg-background text-foreground")}
                  >
                    Write
                  </Button>
                  <Button
                    size="sm"
                    variant={editPreviewMode ? "secondary" : "ghost"}
                    onClick={() => setEditPreviewMode(true)}
                    className={cn("h-7 rounded-md text-[10px] font-semibold px-2", editPreviewMode && "shadow-sm bg-background text-foreground")}
                  >
                    Prev
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-1 shrink-0 ml-auto">
                {isEditing ? (
                  <Button onClick={handleSave} size="sm" className="bg-primary text-primary-foreground h-8 px-3 rounded-lg flex items-center">
                    <Save className="w-3.5 h-3.5 mr-1" /> Save
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="h-8 px-2.5 rounded-lg" onClick={handleEdit}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteClick(e, selectedNote!.id)}
                      className="text-muted-foreground hover:text-destructive h-8 w-8 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Markdown Toolbar */}
            {isEditing && !editPreviewMode && (
              <div className="flex items-center gap-1 p-1.5 bg-muted/30 border-b border-muted/50 overflow-x-auto shrink-0 scrollbar-none select-none">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleInsertMarkdown('bold')}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg shrink-0"
                >
                  <Bold className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleInsertMarkdown('italic')}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg shrink-0"
                >
                  <Italic className="h-3.5 w-3.5" />
                </Button>
                <div className="h-4 w-[1px] bg-muted-foreground/20 mx-0.5 shrink-0" />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleInsertMarkdown('heading')}
                  className="h-7 px-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg text-[10px] font-bold shrink-0 font-headline"
                >
                  H1
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleInsertMarkdown('subheading')}
                  className="h-7 px-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg text-[10px] font-bold shrink-0 font-headline"
                >
                  H2
                </Button>
                <div className="h-4 w-[1px] bg-muted-foreground/20 mx-0.5 shrink-0" />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleInsertMarkdown('bullet')}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg shrink-0"
                >
                  <List className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleInsertMarkdown('todo')}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg shrink-0"
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleInsertMarkdown('quote')}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg shrink-0"
                >
                  <Quote className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleInsertMarkdown('code')}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg shrink-0"
                >
                  <Code className="h-3.5 w-3.5" />
                </Button>
                
              </div>
            )}

            {isEditing ? (
              <div className="flex-1 flex flex-col gap-3 p-4 min-h-0">
                {/* Scrollable Mobile Editor Canvas */}
                <ScrollArea className="flex-1 min-h-0 w-full">
                  {editPreviewMode ? (
                    <div className="px-0 py-1 min-h-[250px] w-full">
                      {renderMarkdown(editBody, handleTodoToggle)}
                    </div>
                  ) : (
                    <Textarea
                      id="note-textarea-mobile"
                      value={editBody}
                      onChange={e => setEditBody(e.target.value)}
                      placeholder="Type your notes here..."
                      className="w-full border-none shadow-none resize-none px-0 py-1 focus-visible:ring-0 text-sm font-sans min-h-[250px] placeholder:text-muted-foreground/45 bg-transparent"
                      style={{
                        backgroundImage: 'linear-gradient(rgba(59, 130, 245, 0.05) 1px, transparent 1px)',
                        backgroundSize: '100% 2.2rem',
                        lineHeight: '2.2rem',
                        borderLeft: '2px solid rgba(239, 68, 68, 0.25)',
                        paddingLeft: '1.25rem',
                      }}
                    />
                  )}
                </ScrollArea>
                
                {/* Pinned Intelligent Stats Row for Mobile Editor */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground border-t pt-3 shrink-0 select-none">
                  <div className="flex items-center gap-1">
                    <div className="relative h-5 w-5 shrink-0">
                      <svg className="h-full w-full transform -rotate-90">
                        <circle
                          cx="10"
                          cy="10"
                          r="8"
                          className="stroke-muted/30"
                          strokeWidth="2"
                          fill="transparent"
                        />
                        <circle
                          cx="10"
                          cy="10"
                          r="8"
                          className="stroke-primary transition-all duration-300"
                          strokeWidth="2"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 8}
                          strokeDashoffset={2 * Math.PI * 8 - (progressPercentage / 100) * 2 * Math.PI * 8}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-foreground">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    <span className="font-bold text-foreground/80 text-[10px]">{noteLevel}</span>
                  </div>
                  <div className="h-2.5 w-[1px] bg-muted-foreground/20" />
                  <span>W: {wordCount} | C: {charCount}</span>
                  <div className="h-2.5 w-[1px] bg-muted-foreground/20" />
                  <span className="flex items-center gap-0.5"><Timer className="w-3.5 h-3.5 text-primary" /> {readingTime} min</span>
                </div>
              </div>
            ) : selectedNote ? (
              <div className="flex-1 flex flex-col gap-3 p-4 min-h-0 animate-in fade-in-20 duration-200">
                <div className="shrink-0">
                  <p className="text-[10px] text-muted-foreground/75 font-semibold bg-muted inline-block px-2.5 py-0.5 rounded-full">
                    {selectedNote.createdAt?.toDate ? format(selectedNote.createdAt.toDate(), "MMMM d, yyyy") : 'Just now'}
                  </p>
                </div>
                
                {/* Scrollable Mobile Viewer Canvas */}
                <ScrollArea className="flex-1 min-h-0 w-full">
                  <div className="leading-relaxed text-sm font-sans text-foreground/90 max-w-none">
                    {renderMarkdown(selectedNote.notes, handleTodoToggle)}
                  </div>
                </ScrollArea>

                {/* Pinned Intelligent Stats Row for Mobile Viewer */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground border-t pt-3 shrink-0 select-none">
                  <div className="flex items-center gap-1">
                    <div className="relative h-5 w-5 shrink-0">
                      <svg className="h-full w-full transform -rotate-90">
                        <circle
                          cx="10"
                          cy="10"
                          r="8"
                          className="stroke-muted/30"
                          strokeWidth="2"
                          fill="transparent"
                        />
                        <circle
                          cx="10"
                          cy="10"
                          r="8"
                          className="stroke-primary transition-all duration-300"
                          strokeWidth="2"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 8}
                          strokeDashoffset={2 * Math.PI * 8 - (viewProgressPercentage / 100) * 2 * Math.PI * 8}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-foreground">
                        {Math.round(viewProgressPercentage)}%
                      </span>
                    </div>
                    <span className="font-bold text-foreground/80 text-[10px]">{viewNoteLevel}</span>
                  </div>
                  <div className="h-2.5 w-[1px] bg-muted-foreground/20" />
                  <span>W: {viewWordCount} | C: {viewCharCount}</span>
                  <div className="h-2.5 w-[1px] bg-muted-foreground/20" />
                  <span className="flex items-center gap-0.5"><Timer className="w-3.5 h-3.5 text-primary" /> {viewReadingTime} min</span>
                </div>
              </div>
            ) : null}
          </Card>
        )}
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="w-[90%] sm:max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline font-bold">Delete Note?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              This action cannot be undone. This note will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setNoteIdToDelete(null)} className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
