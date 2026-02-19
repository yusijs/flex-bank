import { TimerCard } from '@/components/TimerCard';
import { SummaryCard } from '@/components/SummaryCard';
import { ManualSessionDialog } from '@/components/ManualSessionDialog';

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <TimerCard />
      <div className="flex justify-end">
        <ManualSessionDialog />
      </div>
      <SummaryCard />
    </div>
  );
}

