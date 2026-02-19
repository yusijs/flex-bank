import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionsTable } from '../components/SessionsTable';
import { WithdrawalsTable } from '../components/WithdrawalsTable';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('SessionsTable', () => {
  it('shows loading state', () => {
    render(<SessionsTable />, { wrapper });
    expect(screen.getByText(/loading sessions/i)).toBeInTheDocument();
  });

  it('renders sessions from API', async () => {
    render(<SessionsTable />, { wrapper });
    // MSW returns one session of 60 minutes
    await waitFor(() => {
      expect(screen.getByText('1h')).toBeInTheDocument();
    });
    // Table headers
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
  });
});

describe('WithdrawalsTable', () => {
  it('shows loading state', () => {
    render(<WithdrawalsTable />, { wrapper });
    expect(screen.getByText(/loading withdrawals/i)).toBeInTheDocument();
  });

  it('renders withdrawals from API', async () => {
    render(<WithdrawalsTable />, { wrapper });
    // MSW returns one withdrawal of 60 minutes, reason "Day off"
    await waitFor(() => {
      expect(screen.getByText('1h')).toBeInTheDocument();
      expect(screen.getByText('Day off')).toBeInTheDocument();
    });
  });
});

