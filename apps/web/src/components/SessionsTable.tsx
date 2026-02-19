import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSessions, useDeleteSession } from '@/hooks/useQueries';
import { formatMinutes, sessionDurationMinutes } from '@overtime/shared';
import type { WorkSession } from '@overtime/shared';

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}
function formatTime(ms: number) {
  return new Date(ms).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function SessionsTable() {
  const { data: sessions, isLoading } = useSessions();
  const deleteMutation = useDeleteSession();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteMutation.mutate(id, { onSettled: () => setDeletingId(null) });
  };

  if (isLoading) return <p className="text-sm text-muted-foreground py-4">Loading sessions…</p>;
  if (!sessions?.length) return <p className="text-sm text-muted-foreground py-4">No sessions recorded yet.</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Start</TableHead>
          <TableHead>End</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Note</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((s: WorkSession) => (
          <TableRow key={s.id}>
            <TableCell className="font-medium">{formatDate(s.started_at)}</TableCell>
            <TableCell>{formatTime(s.started_at)}</TableCell>
            <TableCell>{s.ended_at ? formatTime(s.ended_at) : '—'}</TableCell>
            <TableCell>{formatMinutes(sessionDurationMinutes(s))}</TableCell>
            <TableCell className="text-muted-foreground">{s.note ?? '—'}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(s.id)}
                disabled={deletingId === s.id}
                aria-label="Delete session"
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

