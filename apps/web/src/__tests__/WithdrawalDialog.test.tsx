import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WithdrawalDialog } from '../components/WithdrawalDialog';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('WithdrawalDialog', () => {
  it('opens the dialog when button is clicked', async () => {
    const user = userEvent.setup();
    render(<WithdrawalDialog />, { wrapper });

    await user.click(screen.getByRole('button', { name: /withdraw hours/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/minutes to withdraw/i)).toBeInTheDocument();
  });

  it('shows an error when submitting with zero minutes', async () => {
    const user = userEvent.setup();
    render(<WithdrawalDialog />, { wrapper });

    await user.click(screen.getByRole('button', { name: /withdraw hours/i }));

    // Type an invalid value (0) then submit via fireEvent to bypass native HTML required validation
    const minutesInput = screen.getByLabelText(/minutes to withdraw/i);
    await user.type(minutesInput, '0');

    // Submit the form directly to trigger our JS validation
    fireEvent.submit(minutesInput.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText(/valid number of minutes/i)).toBeInTheDocument();
    });
  });

  it('shows minute conversion hint', async () => {
    const user = userEvent.setup();
    render(<WithdrawalDialog />, { wrapper });

    await user.click(screen.getByRole('button', { name: /withdraw hours/i }));
    await user.type(screen.getByLabelText(/minutes to withdraw/i), '90');

    expect(screen.getByText(/1h 30m/i)).toBeInTheDocument();
  });
});


