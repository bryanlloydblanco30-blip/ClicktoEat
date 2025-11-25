'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff' | 'member';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    verifyAuth();
  }, [pathname]);

  const verifyAuth = () => {
    // Don't check auth on login/signup pages
    const authPages = ['/login', '/signup'];
    if (authPages.includes(pathname)) {
      setIsChecking(false);
      setIsAuthorized(true);
      return;
    }

    try {
      // Get user from localStorage
      const userStr = localStorage.getItem('user');
      
      if (!userStr) {
        // Not logged in - redirect to login
        router.push('/login');
        return;
      }

      const user = JSON.parse(userStr);

      // Check role if specified
      if (requiredRole && user.role !== requiredRole) {
        // Redirect to appropriate page based on their actual role
        if (user.role === 'admin') {
          router.push('/admin');
        } else if (user.role === 'staff') {
          router.push('/partners');
        } else {
          router.push('/');
        }
        return;
      }

      // User is authorized
      setIsAuthorized(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}