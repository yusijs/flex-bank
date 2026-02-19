import { SessionsTable } from '@/components/SessionsTable';
import { ExportButton } from '@/components/ExportButton';

export function HistoryPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Session History</h2>
        <ExportButton />
      </div>
      <SessionsTable />
    </div>
  );
}

