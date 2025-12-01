// Frontend/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '../services/api';

// Admin app URL - update this to your actual admin deployment URL
const ADMIN_URL = "https://clickto-eat-rxo1-iis0k4cuk-bryans-projects-e4c7e470.vercel.app"

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔐 Login attempt:', formData.username);

    try {
      // Call the backend API (ADMIN_API_URL from api.js)
      const response = await login(formData.username, formData.password);
      console.log('✅ Login response:', response);
      
      if (response.success && response.user) {
        const userData = response.user;
        console.log('💾 User data received:', userData);
        
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('authToken', 'authenticated-' + Date.now());
        
        // Verify storage
        const storedUser = localStorage.getItem('user');
        console.log('✔️ Verified stored user:', storedUser);
        
        // Redirect based on role
        if (userData.role === 'admin') {
          console.log('→ Admin role detected - Redirecting to admin app');
          
          // Option 1: Simple redirect (admin app will read from localStorage)
          window.location.href = ADMIN_URL;
          
          // Option 2: Pass data via URL parameter (if admin app needs it immediately)
          // const userDataEncoded = encodeURIComponent(JSON.stringify(userData));
          // window.location.href = `${ADMIN_URL}?auth=success&user=${userDataEncoded}`;
          
        } else if (userData.role === 'staff') {
          console.log('→ Staff role detected - Redirecting to owner page');
          localStorage.setItem('food_partner', userData.food_partner);
          
          // Redirect to staff/owner section in admin app
          window.location.href = `${ADMIN_URL}/owner`;
          
        } else {
          // Member/client role - stay in client app
          console.log('→ Member role - Redirecting to client home');
          router.push('/');
        }
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
              placeholder="Enter your username"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
              placeholder="Enter your password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-orange-500 hover:text-orange-600 font-semibold">
              Sign up
            </Link>
          </p>
        </div>

        {/* Continue as Guest */}
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            Continue as guest →
          </Link>
        </div>
      </div>
    </div>
  );
}