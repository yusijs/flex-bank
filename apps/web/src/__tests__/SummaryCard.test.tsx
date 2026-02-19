import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SummaryCard } from '../components/SummaryCard';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('SummaryCard', () => {
  it('shows loading state initially', () => {
    render(<SummaryCard />, { wrapper });
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows earned, withdrawn and balance after load', async () => {
    render(<SummaryCard />, { wrapper });
    // MSW returns totalMinutes:120, withdrawnMinutes:60, balanceMinutes:60
    await waitFor(() => {
      expect(screen.getByText('2h')).toBeInTheDocument(); // 120 min earned
      // Both withdrawn and balance are 1h, so two elements
      expect(screen.getAllByText('1h')).toHaveLength(2);
    });
    expect(screen.getByText('Earned')).toBeInTheDocument();
    expect(screen.getByText('Withdrawn')).toBeInTheDocument();
    expect(screen.getByText('Balance')).toBeInTheDocument();
  });
});


