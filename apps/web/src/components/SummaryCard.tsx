import { TrendingUp, Minus, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSummary } from '@/hooks/useQueries';
import { formatMinutes } from '@overtime/shared';

function StatTile({
  icon: Icon,
  label,
  value,
  variant,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
}) {
  return (
    <div className="flex flex-col items-center gap-2 p-4">
      <div className="rounded-full bg-muted p-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <Badge variant={variant ?? 'secondary'} className="text-base px-3 py-1">
        {value}
      </Badge>
      <span className="text-xs text-muted-foreground text-center">{label}</span>
    </div>
  );
}

export function SummaryCard() {
  const { data: summary, isLoading } = useSummary();

  if (isLoading || !summary) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Time Bank</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <span className="text-muted-foreground text-sm">Loading…</span>
        </CardContent>
      </Card>
    );
  }

  const balanceNegative = summary.balanceMinutes < 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Time Bank</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 divide-x">
          <StatTile
            icon={TrendingUp}
            label="Earned"
            value={formatMinutes(summary.totalMinutes)}
            variant="success"
          />
          <StatTile
            icon={Minus}
            label="Withdrawn"
            value={formatMinutes(summary.withdrawnMinutes)}
            variant="secondary"
          />
          <StatTile
            icon={Wallet}
            label="Balance"
            value={formatMinutes(summary.balanceMinutes)}
            variant={balanceNegative ? 'destructive' : 'default'}
          />
        </div>
      </CardContent>
    </Card>
  );
}

