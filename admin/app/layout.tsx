// Admin/app/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import './globals.css';

const FRONTEND_LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL || 'http://localhost:3000/login';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      console.log('🔍 Admin: Checking authentication...');
      
      // Get user data from localStorage
      const userStr = localStorage.getItem('user');
      const authToken = localStorage.getItem('authToken');

      console.log('User data:', userStr);
      console.log('Auth token:', authToken);

      if (!userStr || !authToken) {
        console.log('❌ No authentication data found');
        redirectToLogin();
        return;
      }

      const userData = JSON.parse(userStr);
      console.log('👤 User role:', userData.role);

      // Check if user has admin or staff role
      if (userData.role !== 'admin' && userData.role !== 'staff') {
        console.log('❌ Unauthorized role:', userData.role);
        alert('Access denied. Admin or Staff role required.');
        redirectToLogin();
        return;
      }

      // If staff, check if they should be on owner page
      if (userData.role === 'staff' && pathname === '/') {
        console.log('→ Redirecting staff to /owner page');
        router.push('/owner');
        return;
      }

      console.log('✅ User authenticated');
      setUser(userData);
      setIsAuthenticated(true);
      setIsLoading(false);

    } catch (error) {
      console.error('❌ Auth check error:', error);
      redirectToLogin();
    }
  };

  const redirectToLogin = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    window.location.href = FRONTEND_LOGIN_URL;
  };

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('food_partner');
    window.location.href = FRONTEND_LOGIN_URL;
  };

  if (isLoading) {
    return (
      <html lang="en">
        <body>
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto mb-4"></div>
              <p className="text-xl text-gray-600 font-medium">Verifying access...</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="min-h-screen">
          {/* Admin Header */}
          <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-xl md:text-2xl font-bold text-red-600">
                    🍽️ ClickToEat Admin
                  </h1>
                </div>
                
                <div className="flex items-center space-x-4">
                  {user && (
                    <div className="flex items-center space-x-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">
                          {user.full_name || user.username}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user.role === 'admin' ? 'Administrator' : user.food_partner}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}