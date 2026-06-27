import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

export const ClientOrientation: React.FC = () => {
  const { user, profileName, setHasCompletedOrientation } = useAuth();
  
  // Steps: 1 = Password, 2 = Welcome, 3 = Tutorial
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setStep(2); // Move to welcome screen
    } catch (err: any) {
      setError(err.message || 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  const finishOrientation = async () => {
    setLoading(true);
    try {
      if (user) {
        await supabase
          .from('profiles')
          .update({ has_completed_orientation: true })
          .eq('id', user.id);
      }
      setHasCompletedOrientation(true);
    } catch (err) {
      console.error('Error completing orientation:', err);
      // Even if it fails to save, let them in for now
      setHasCompletedOrientation(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {step === 1 && (
          <div className="p-8">
            <div className="w-12 h-12 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-xl flex items-center justify-center mb-6">
              <Lock size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Secure your account</h2>
            <p className="text-gray-500 mb-6">
              Welcome to your new workspace, {profileName.split(' ')[0]}! Please set a password to secure your account before continuing.
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-white font-medium mt-6 bg-[var(--brand-primary)] hover:opacity-90 transition-opacity"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Set Password'}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="p-8 text-center">
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
              alt="Welcome" 
              className="w-full h-48 object-cover rounded-xl mb-6 shadow-sm"
            />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to your workspace</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              This portal is where you can review, approve, and track all the social media content we create for you. Everything is organized in one place, so you never have to search through emails or messages again.
            </p>
            <button
              onClick={() => setStep(3)}
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-white font-medium bg-[var(--brand-primary)] hover:opacity-90 transition-opacity"
            >
              Next <ArrowRight size={18} className="ml-2" />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="p-8">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 mx-auto">
              <CheckCircle size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How approvals work</h2>
            
            <div className="space-y-6 mb-8">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold shrink-0 mt-1">1</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Review Content</h4>
                  <p className="text-sm text-gray-500 mt-1">We'll notify you when new posts are ready. You can see how they'll look on Instagram, TikTok, and other platforms.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold shrink-0 mt-1">2</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Leave Feedback</h4>
                  <p className="text-sm text-gray-500 mt-1">Click anywhere on an image or video to drop a pin and leave a specific comment for changes.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold shrink-0 mt-1">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Approve</h4>
                  <p className="text-sm text-gray-500 mt-1">If everything looks perfect, hit Approve. We'll handle the publishing!</p>
                </div>
              </div>
            </div>

            <button
              onClick={finishOrientation}
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-white font-medium bg-[var(--brand-primary)] hover:opacity-90 transition-opacity"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Started'}
            </button>
          </div>
        )}

        {/* Progress indicators for steps 2 & 3 */}
        {step > 1 && (
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-center gap-2">
            <div className={`h-2 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-[var(--brand-primary)]' : 'w-2 bg-gray-300'}`} />
            <div className={`h-2 rounded-full transition-all duration-300 ${step === 3 ? 'w-8 bg-[var(--brand-primary)]' : 'w-2 bg-gray-300'}`} />
          </div>
        )}
      </div>
    </div>
  );
};
