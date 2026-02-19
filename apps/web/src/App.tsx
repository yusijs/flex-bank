import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Clock } from 'lucide-react';
import { DashboardPage } from '@/pages/DashboardPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { WithdrawalsPage } from '@/pages/WithdrawalsPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 10_000 } },
});

const navClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
  }`;

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-6">
          <div className="flex items-center gap-2 font-semibold">
            <Clock className="h-5 w-5 text-primary" />
            Overtime Tracker
          </div>
          <nav className="flex gap-1">
            <NavLink to="/" end className={navClass}>Dashboard</NavLink>
            <NavLink to="/history" className={navClass}>History</NavLink>
            <NavLink to="/withdrawals" className={navClass}>Withdrawals</NavLink>
          </nav>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/withdrawals" element={<WithdrawalsPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
