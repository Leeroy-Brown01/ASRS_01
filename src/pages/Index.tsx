import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  Star, 
  Settings, 
  LogOut, 
  Home,
  Upload,
  Eye,
  Shield
} from 'lucide-react';
import { auth, getUserProfile, signOutUser } from '../lib/firebase';
import { User } from '../types';
import AuthComponents from '../components/AuthComponents';
import ApplicantDashboard from '../components/ApplicantDashboard';
import ReviewerDashboard from '../components/ReviewerDashboard';
import AdminDashboard from '../components/AdminDashboard';

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userProfile = await getUserProfile(firebaseUser.uid);
          if (userProfile) {
            const typedUser = userProfile as User;
            setUser(typedUser);
            // Redirect to dashboard route based on role
            if (typedUser.role === 'admin') navigate('/admin');
            else if (typedUser.role === 'reviewer') navigate('/reviewer');
            else if (typedUser.role === 'applicant') navigate('/applicant');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUser(null);
        if (location.pathname !== '/') navigate('/');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate, location.pathname]);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      setActiveView('dashboard');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getNavigationItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home }
    ];

    switch (user?.role) {
      case 'applicant':
        return [
          ...baseItems,
          { id: 'apply', label: 'New Application', icon: Upload },
          { id: 'applications', label: 'My Applications', icon: FileText }
        ];
      case 'reviewer':
        return [
          ...baseItems,
          { id: 'review', label: 'Review Applications', icon: Eye },
          { id: 'my-reviews', label: 'My Reviews', icon: Star }
        ];
      case 'admin':
        return [
          ...baseItems,
          { id: 'manage-applications', label: 'Manage Applications', icon: FileText },
          { id: 'manage-users', label: 'Manage Users', icon: Users },
          { id: 'reports', label: 'Reports', icon: Settings }
        ];
      default:
        return baseItems;
    }
  };

  const renderContent = () => {
    if (!user) return null;

    switch (user.role) {
      case 'applicant':
        return <ApplicantDashboard user={user} activeView={activeView} />;
      case 'reviewer':
        return <ReviewerDashboard user={user} activeView={activeView} />;
      case 'admin':
        return <AdminDashboard user={user} activeView={activeView} />;
      default:
        return <div>Invalid user role</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }


  if (!user) {
    // When authentication succeeds, fetch user profile and set user state for instant dashboard redirect
    return <AuthComponents onAuthSuccess={async () => {
      if (auth.currentUser) {
        setLoading(true);
        try {
          const userProfile = await getUserProfile(auth.currentUser.uid);
          if (userProfile) {
            const typedUser = userProfile as User;
            setUser(typedUser);
            // Redirect to dashboard route based on role
            if (typedUser.role === 'admin') navigate('/admin');
            else if (typedUser.role === 'reviewer') navigate('/reviewer');
            else if (typedUser.role === 'applicant') navigate('/applicant');
          }
        } catch (error) {
          console.error('Error fetching user profile after auth:', error);
        } finally {
          setLoading(false);
        }
      }
    }} />;
  }

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">
                Application Review System
              </h1>
              <Badge variant="outline" className="capitalize">
                {user.role}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.name}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                          activeView === item.id 
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                            : 'text-gray-700'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>

            {/* User Profile Card */}
            <Card className="mt-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}