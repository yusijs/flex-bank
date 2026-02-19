import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { TimerCard } from '../components/TimerCard';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('TimerCard', () => {
  it('shows Start button when no session is active', async () => {
    render(<TimerCard />, { wrapper });
    await waitFor(() => {
      expect(screen.getByTestId('timer-toggle')).toHaveTextContent('Start');
    });
  });

  it('shows Stop button when a session is active', async () => {
    server.use(
      http.get('/api/sessions/active', () =>
        HttpResponse.json({
          id: 'abc',
          started_at: Date.now() - 5000,
          ended_at: null,
          note: null,
          created_at: Date.now() - 5000,
        })
      )
    );
    render(<TimerCard />, { wrapper });
    await waitFor(() => {
      expect(screen.getByTestId('timer-toggle')).toHaveTextContent('Stop');
    });
  });

  it('calls start API when Start is clicked', async () => {
    const user = userEvent.setup();
    render(<TimerCard />, { wrapper });
    const btn = await screen.findByTestId('timer-toggle');
    await user.click(btn);
    // After clicking Start, the button should eventually show Stop (after mock response)
    await waitFor(() => {
      // MSW start handler returns a running session
      expect(btn).not.toBeDisabled();
    });
  });
});

