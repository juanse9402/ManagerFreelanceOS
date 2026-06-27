import React, { useState } from 'react';
import { Mail, Lock, User, Briefcase, Camera, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

export const RegisterView: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError("An account with this email already exists. Sign in instead?");
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      // 2. Upload profile photo if exists
      let avatarUrl = '';
      if (profilePhoto && authData.user) {
        const fileExt = profilePhoto.name.split('.').pop();
        const fileName = `avatar_${authData.user.id}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('content_media')
          .upload(fileName, profilePhoto);
        
        if (!uploadError) {
          const { data } = supabase.storage.from('content_media').getPublicUrl(fileName);
          avatarUrl = data.publicUrl;
        }
      }

      // 3. Create or update profile
      if (authData.user) {
        // Auth trigger usually creates the profile, but we need to update it with the business name and avatar
        await supabase.from('profiles').upsert({
          id: authData.user.id,
          full_name: fullName,
          business_name: businessName,
          role: 'admin',
          avatar_url: avatarUrl || undefined,
        }, { onConflict: 'id' });
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox.</h2>
          <p className="text-gray-500 mb-6">
            We sent a verification link to <span className="font-semibold text-gray-900">{email}</span>. Please verify your email to continue.
          </p>
          <button onClick={() => window.location.reload()} className="text-[var(--brand-primary)] font-medium hover:underline">
            Resend email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Panel: Value Prop */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 border-r border-gray-100 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-12">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Manager OS</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            Manage your social media clients in one place.
          </h1>
          
          <div className="space-y-6 mt-12">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Custom Branded Portals</h3>
                <p className="text-gray-500 mt-1">Give each client a beautiful, branded portal tailored to their identity.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Streamlined Approvals</h3>
                <p className="text-gray-500 mt-1">Get content approved faster with intuitive commenting and annotations.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Project Progress</h3>
                <p className="text-gray-500 mt-1">Keep your clients updated automatically as you complete tasks.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-sm text-gray-500">
          © {new Date().getFullYear()} Manager OS. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Create an account</h2>
            <p className="text-gray-500 mt-2">Start managing your freelance business today.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg">
              {error}
              {error.includes('Sign in') && (
                <Link to="/login" className="ml-2 font-bold underline">Go to login</Link>
              )}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Profile Photo */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="relative w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden mb-2 hover:bg-gray-200 transition-colors">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
                )}
                <input 
                  type="file" 
                  accept="image/png, image/jpeg"
                  onChange={handlePhotoChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <span className="text-xs text-gray-500 font-medium">Profile photo (Optional)</span>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business or studio name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm"
                  placeholder="Acme Studio"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">This name appears in your workspace and in client invitation emails.</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-70 transition-colors mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create my account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-black hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
