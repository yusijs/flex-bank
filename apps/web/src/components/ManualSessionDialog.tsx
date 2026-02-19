import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAddManualSession } from '@/hooks/useQueries';

/** Convert a local datetime-local string (YYYY-MM-DDTHH:mm) to a ms timestamp */
function localToMs(value: string): number {
  return new Date(value).getTime();
}

/** Format Date to datetime-local input value (YYYY-MM-DDTHH:mm) */
function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultStart(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - 60); // default: 1 hour ago
  return toDatetimeLocal(d);
}

function defaultEnd(): string {
  return toDatetimeLocal(new Date());
}

export function ManualSessionDialog() {
  const [open, setOpen] = useState(false);
  const [startedAt, setStartedAt] = useState('');
  const [endedAt, setEndedAt] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const mutation = useAddManualSession();

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setStartedAt(defaultStart());
      setEndedAt(defaultEnd());
      setNote('');
      setError('');
    }
    setOpen(isOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const start = localToMs(startedAt);
    const end = localToMs(endedAt);

    if (!startedAt || isNaN(start)) {
      setError('Please enter a valid start date/time.');
      return;
    }
    if (!endedAt || isNaN(end)) {
      setError('Please enter a valid end date/time.');
      return;
    }
    if (end <= start) {
      setError('End time must be after start time.');
      return;
    }

    mutation.mutate(
      { started_at: start, ended_at: end, note: note || undefined },
      {
        onSuccess: () => {
          setOpen(false);
        },
        onError: (err) => setError(err.message),
      }
    );
  };

  const durationMinutes =
    startedAt && endedAt
      ? Math.round((localToMs(endedAt) - localToMs(startedAt)) / 60_000)
      : null;
  const durationLabel =
    durationMinutes !== null && durationMinutes > 0
      ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
      : null;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Manual Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Manual Entry</DialogTitle>
          <DialogDescription>
            Record overtime hours you worked without using the timer.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="manual-start">Start</Label>
            <Input
              id="manual-start"
              type="datetime-local"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="manual-end">End</Label>
            <Input
              id="manual-end"
              type="datetime-local"
              value={endedAt}
              onChange={(e) => setEndedAt(e.target.value)}
              required
            />
            {durationLabel && (
              <span className="text-xs text-muted-foreground">Duration: {durationLabel}</span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="manual-note">Note (optional)</Label>
            <Input
              id="manual-note"
              placeholder="e.g. Late project delivery"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Add Entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

