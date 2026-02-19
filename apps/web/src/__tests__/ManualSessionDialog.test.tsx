import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ManualSessionDialog } from '../components/ManualSessionDialog';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('ManualSessionDialog', () => {
  it('opens the dialog when button is clicked', async () => {
    const user = userEvent.setup();
    render(<ManualSessionDialog />, { wrapper });

    await user.click(screen.getByRole('button', { name: /add manual entry/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/start/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end/i)).toBeInTheDocument();
  });

  it('pre-fills start and end times when opened', async () => {
    const user = userEvent.setup();
    render(<ManualSessionDialog />, { wrapper });

    await user.click(screen.getByRole('button', { name: /add manual entry/i }));

    const startInput = screen.getByLabelText(/start/i) as HTMLInputElement;
    const endInput = screen.getByLabelText(/end/i) as HTMLInputElement;

    expect(startInput.value).not.toBe('');
    expect(endInput.value).not.toBe('');
  });

  it('shows duration hint when valid start and end are set', async () => {
    const user = userEvent.setup();
    render(<ManualSessionDialog />, { wrapper });

    await user.click(screen.getByRole('button', { name: /add manual entry/i }));

    // The default values (start = 1h ago, end = now) should already show a duration
    await waitFor(() => {
      expect(screen.getByText(/duration:/i)).toBeInTheDocument();
    });
  });

  it('shows an error when end is before start', async () => {
    const user = userEvent.setup();
    render(<ManualSessionDialog />, { wrapper });

    await user.click(screen.getByRole('button', { name: /add manual entry/i }));

    const startInput = screen.getByLabelText(/start/i);
    const endInput = screen.getByLabelText(/end/i);

    // Set end before start
    await user.clear(startInput);
    await user.type(startInput, '2026-02-19T10:00');
    await user.clear(endInput);
    await user.type(endInput, '2026-02-19T09:00');

    const form = startInput.closest('form')!;
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/end time must be after start time/i)).toBeInTheDocument();
    });
  });

  it('submits successfully with valid data and closes dialog', async () => {
    const user = userEvent.setup();
    render(<ManualSessionDialog />, { wrapper });

    await user.click(screen.getByRole('button', { name: /add manual entry/i }));

    // The form has valid defaults — just submit
    await user.click(screen.getByRole('button', { name: /^add entry$/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});

