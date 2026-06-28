import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LoginView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Progressive Brand Reveal States
  const [brandColor, setBrandColor] = useState<string>('#000000'); // Default black
  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [isClientMode, setIsClientMode] = useState(false);

  // Check email on blur
  const handleEmailBlur = async () => {
    if (!email || !email.includes('@')) return;
    try {
      // Calls a secure RPC to fetch brand details by email without exposing other users' data
      const { data, error } = await supabase.rpc('get_client_brand_by_email', { client_email: email });
      if (data && !error && data.primary_color) {
        setIsClientMode(true);
        setBrandColor(data.primary_color);
        if (data.logo_url) setBrandLogo(data.logo_url);
      } else {
        // Reset to default if not found
        setIsClientMode(false);
        setBrandColor('#000000');
        setBrandLogo(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // On success, App.tsx router will handle redirection based on role
    } catch (err: any) {
      setError(err.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans transition-colors duration-500 ease-in-out"
      style={{ backgroundColor: isClientMode ? `${brandColor}10` : '#f9fafb' }}
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md transition-all duration-400">
        <div className="flex justify-center mb-6">
          {isClientMode && brandLogo ? (
            <img 
              src={brandLogo} 
              alt="Client Logo" 
              className="w-20 h-20 object-contain rounded-xl shadow-sm animate-in fade-in zoom-in duration-500"
            />
          ) : (
            <img 
              src="/logo.png" 
              alt="Kameleoia" 
              className="w-48 h-auto object-contain transition-all duration-500"
            />
          )}
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight transition-colors">
          {isClientMode ? 'Welcome back.' : 'Welcome to your Dashboard'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isClientMode ? 'Let\'s review your content.' : 'Sign in to your account'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  className="focus:ring-black focus:border-black block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2.5 border transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-black focus:border-black block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2.5 border transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white disabled:opacity-50 transition-all duration-500 hover:opacity-90"
                style={{ backgroundColor: isClientMode ? brandColor : '#000000' }}
              >
                {loading ? 'Processing...' : 'Sign in'}
              </button>
            </div>
          </form>

          {!isClientMode && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    New to Manager OS?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/register"
                  className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Create a freelancer account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
