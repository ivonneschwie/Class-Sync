'use client';

import { SummaryHistory } from '@/components/summary-history';

export default function LessonCatalogPage() {
  return (
    <div className="flex flex-col h-full gap-4">
      <div>
        <h1 className="text-3xl font-bold font-headline">Lesson Catalog</h1>
        <p className="text-muted-foreground">
          Review your past summaries here, organized like a digital notebook.
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <SummaryHistory />
      </div>
    </div>
  );
}
