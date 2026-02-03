'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SummarizerForm } from "./summarizer-form";

export default function SummarizerPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">AI Note Summarizer</h1>
        <p className="text-muted-foreground">
          Paste your lecture notes and get a concise summary and clarification questions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Your Lecture Notes</CardTitle>
          <CardDescription>
            Provide the subject and notes you want to summarize below. Longer notes provide better results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SummarizerForm />
        </CardContent>
      </Card>
    </div>
  );
}

    