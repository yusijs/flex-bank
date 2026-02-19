import { Play, Square, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useActiveSession, useStartSession, useStopSession } from '@/hooks/useQueries';
import { useTimer, formatElapsed } from '@/hooks/useTimer';

export function TimerCard() {
  const { data: activeSession, isLoading } = useActiveSession();
  const startMutation = useStartSession();
  const stopMutation = useStopSession();

  const elapsed = useTimer(activeSession?.started_at ?? null);
  const isRunning = !!activeSession;

  const handleToggle = () => {
    if (isRunning && activeSession) {
      stopMutation.mutate({ id: activeSession.id });
    } else {
      startMutation.mutate({});
    }
  };

  const isPending = startMutation.isPending || stopMutation.isPending || isLoading;

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center gap-6 py-10">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-5 w-5" />
          <span className="text-sm font-medium">{isRunning ? 'Session in progress' : 'No active session'}</span>
        </div>

        {isRunning && (
          <div className="text-5xl font-mono font-bold tabular-nums text-foreground">
            {formatElapsed(elapsed)}
          </div>
        )}

        <Button
          size="xl"
          variant={isRunning ? 'destructive' : 'default'}
          onClick={handleToggle}
          disabled={isPending}
          className="w-48 gap-3"
          data-testid="timer-toggle"
        >
          {isRunning ? (
            <>
              <Square className="h-5 w-5 fill-current" />
              Stop
            </>
          ) : (
            <>
              <Play className="h-5 w-5 fill-current" />
              Start
            </>
          )}
        </Button>

        {(startMutation.isError || stopMutation.isError) && (
          <p className="text-sm text-destructive">
            {(startMutation.error ?? stopMutation.error)?.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

