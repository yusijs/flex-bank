import { BrowserRouter, HashRouter, NavLink, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Clock, LogOut } from 'lucide-react';
import { DashboardPage } from '@/pages/DashboardPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { WithdrawalsPage } from '@/pages/WithdrawalsPage';
import { LoginPage } from '@/pages/LoginPage';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const IS_ELECTRON = typeof window !== 'undefined' && window.electronAPI !== undefined;
const Router = IS_ELECTRON ? HashRouter : BrowserRouter;

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
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-6">
          <div className="flex items-center gap-2 font-semibold">
            <Clock className="h-5 w-5 text-primary" />
            Overtime Tracker
          </div>
          <nav className="flex gap-1 flex-1">
            <NavLink to="/" end className={navClass}>Dashboard</NavLink>
            <NavLink to="/history" className={navClass}>History</NavLink>
            <NavLink to="/withdrawals" className={navClass}>Withdrawals</NavLink>
          </nav>
          <Button variant="ghost" size="sm" onClick={logout} className="gap-1.5">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/withdrawals" element={<WithdrawalsPage />} />
      </Routes>
    </Layout>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
