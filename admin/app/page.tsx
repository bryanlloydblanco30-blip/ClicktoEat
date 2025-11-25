// admin/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from './components/Dashboard';

export default function AdminHomePage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // First, check if user data is in URL parameter (from login redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('user');
    
    if (userParam) {
      console.log('📦 Found user data in URL parameter');
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        console.log('💾 Storing user data in localStorage:', userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Clean up URL (remove the ?user= parameter)
        window.history.replaceState({}, '', '/');
        console.log('✨ URL cleaned up');
      } catch (error) {
        console.error('❌ Failed to parse user data from URL:', error);
      }
    }
    
    // Now check authentication
    checkAdminAuth();
  }, []);

  const checkAdminAuth = () => {
    console.log('🔍 Checking admin auth...');
    
    try {
      const userStr = localStorage.getItem('user');
      console.log('📦 User from localStorage:', userStr);
      
      if (!userStr) {
        console.log('❌ No user found, redirecting to frontend login');
        // Redirect to frontend app login
        window.location.href = 'http://localhost:3000/login';
        return;
      }

      const user = JSON.parse(userStr);
      console.log('👤 Parsed user:', user);
      console.log('🔑 User role:', user.role);

      if (user.role !== 'admin') {
        console.log('❌ User is not admin:', user.role);
        // Redirect to frontend app
        window.location.href = 'http://localhost:3000/';
        return;
      }

      console.log('✅ Admin authorized - showing dashboard');
      setIsAuthorized(true);
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      window.location.href = 'http://localhost:3000/login';
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <Dashboard />;
}