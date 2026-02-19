import { useState } from 'react';
import { Plus } from 'lucide-react';
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
import { useCreateWithdrawal } from '@/hooks/useQueries';

export function WithdrawalDialog() {
  const [open, setOpen] = useState(false);
  const [minutes, setMinutes] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const mutation = useCreateWithdrawal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(minutes, 10);
    if (!mins || mins <= 0) {
      setError('Please enter a valid number of minutes (> 0)');
      return;
    }
    setError('');
    mutation.mutate(
      { minutes: mins, reason: reason || undefined },
      {
        onSuccess: () => {
          setOpen(false);
          setMinutes('');
          setReason('');
        },
        onError: (err) => setError(err.message),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Withdraw Hours
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Withdraw Time</DialogTitle>
          <DialogDescription>
            Enter the number of minutes to withdraw from your time bank.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="minutes">Minutes to withdraw</Label>
            <Input
              id="minutes"
              type="number"
              min={1}
              placeholder="e.g. 60"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              required
            />
            <span className="text-xs text-muted-foreground">
              {minutes && parseInt(minutes) > 0
                ? `= ${Math.floor(parseInt(minutes) / 60)}h ${parseInt(minutes) % 60}m`
                : null}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input
              id="reason"
              placeholder="e.g. Half day off"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Withdraw'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}



