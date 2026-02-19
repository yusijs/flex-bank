import { TimerCard } from '@/components/TimerCard';
import { SummaryCard } from '@/components/SummaryCard';

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <TimerCard />
      <SummaryCard />
    </div>
  );
}

