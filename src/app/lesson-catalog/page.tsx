'use client';

import { SummaryHistory } from '@/components/summary-history';
import { RedeemCodeDialog } from '@/components/redeem-code-dialog';

export default function LessonCatalogPage() {
  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline tracking-tight">Lesson Catalog</h1>
          <p className="text-muted-foreground">
            Review your past summaries here, organized like a digital notebook.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <RedeemCodeDialog expectedType="summary" />
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <SummaryHistory />
      </div>
    </div>
  );
}
