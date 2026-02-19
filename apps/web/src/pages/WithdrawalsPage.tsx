import { WithdrawalsTable } from '@/components/WithdrawalsTable';
import { WithdrawalDialog } from '@/components/WithdrawalDialog';

export function WithdrawalsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Withdrawals</h2>
        <WithdrawalDialog />
      </div>
      <WithdrawalsTable />
    </div>
  );
}

