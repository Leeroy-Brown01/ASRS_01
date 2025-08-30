import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import { useNavigate } from 'react-router-dom';
// Redirects authenticated users from / to their dashboard
function RootRedirect() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const checkUser = async () => {
      if (auth.currentUser) {
        const userProfile = await getUserProfile(auth.currentUser.uid);
        if (userProfile && (userProfile as User).role) {
          const role = (userProfile as User).role;
          if (role === 'admin') navigate('/admin', { replace: true });
          else if (role === 'reviewer') navigate('/reviewer', { replace: true });
          else if (role === 'applicant') navigate('/applicant', { replace: true });
          return;
        }
      }
      setLoading(false);
    };
    checkUser();
  }, [navigate]);
  if (loading) return <div>Loading...</div>;
  return <Index />;
}
import NotFound from './pages/NotFound';
import ApplicantDashboard from './components/ApplicantDashboard';
import ReviewerDashboard from './components/ReviewerDashboard';
import AdminDashboard from './components/AdminDashboard';
import { auth, getUserProfile } from './lib/firebase';
import { useEffect, useState } from 'react';
import { User } from './types';

const queryClient = new QueryClient();


// Wrapper to protect dashboard routes and provide user prop
function ProtectedDashboard({ role, Component }: { role: string, Component: any }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchUser = async () => {
      if (auth.currentUser) {
        const userProfile = await getUserProfile(auth.currentUser.uid);
        setUser(userProfile as User);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);
  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== role) return <div>Unauthorized</div>;
  return <Component user={user} activeView="dashboard" />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/applicant" element={<ProtectedDashboard role="applicant" Component={ApplicantDashboard} />} />
          <Route path="/reviewer" element={<ProtectedDashboard role="reviewer" Component={ReviewerDashboard} />} />
          <Route path="/admin" element={<ProtectedDashboard role="admin" Component={AdminDashboard} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
