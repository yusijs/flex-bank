import { SessionsTable } from '@/components/SessionsTable';
import { ExportButton } from '@/components/ExportButton';
import { ManualSessionDialog } from '@/components/ManualSessionDialog';

export function HistoryPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Session History</h2>
        <div className="flex gap-2">
          <ManualSessionDialog />
          <ExportButton />
        </div>
      </div>
      <SessionsTable />
    </div>
  );
}

