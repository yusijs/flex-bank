import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useWithdrawals, useDeleteWithdrawal } from '@/hooks/useQueries';
import { formatMinutes } from '@overtime/shared';
import type { Withdrawal } from '@overtime/shared';

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

export function WithdrawalsTable() {
  const { data: withdrawals, isLoading } = useWithdrawals();
  const deleteMutation = useDeleteWithdrawal();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteMutation.mutate(id, { onSettled: () => setDeletingId(null) });
  };

  if (isLoading) return <p className="text-sm text-muted-foreground py-4">Loading withdrawals…</p>;
  if (!withdrawals?.length) return <p className="text-sm text-muted-foreground py-4">No withdrawals yet.</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {withdrawals.map((w: Withdrawal) => (
          <TableRow key={w.id}>
            <TableCell className="font-medium">{formatDate(w.withdrawn_at)}</TableCell>
            <TableCell>{formatMinutes(w.minutes)}</TableCell>
            <TableCell className="text-muted-foreground">{w.reason ?? '—'}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(w.id)}
                disabled={deletingId === w.id}
                aria-label="Delete withdrawal"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

