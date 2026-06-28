import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, ArrowRight, Loader2, LayoutDashboard, FolderKanban, CheckSquare, Calendar as CalendarIcon, Grid } from 'lucide-react';

export const ClientOrientation: React.FC = () => {
  const { user, profileName, clientProfile, setHasCompletedOrientation } = useAuth();
  
  const brandSettings = clientProfile?.brand_settings || {};
  const brandName = clientProfile?.company_name || profileName.split(' ')[0] || 'Brand';
  
  // Steps: 1 = Password, 2 = Features, 3 = Tutorial
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateStrength = (pass: string) => {
    if (pass.length === 0) return { label: '', color: 'bg-transparent' };
    if (pass.length < 8) return { label: 'Weak', color: 'bg-red-400' };
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) return { label: 'Strong', color: 'bg-green-500' };
    return { label: 'Fair', color: 'bg-yellow-400' };
  };

  const strength = calculateStrength(password);

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
      setStep(2); // Move to features screen
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
      setHasCompletedOrientation(true);
    } finally {
      setLoading(false);
    }
  };

  const BrandHeader = () => (
    <div className="flex flex-col items-center justify-center mb-6">
      {brandSettings.logo_url ? (
        <img src={brandSettings.logo_url} alt="Logo" className="w-16 h-16 rounded-xl object-cover mb-3 shadow-sm border border-gray-100" />
      ) : (
        <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mb-3 text-gray-400 border border-gray-200">
          <span className="text-xl font-bold">{brandName.charAt(0)}</span>
        </div>
      )}
      <h1 className="text-xl font-bold text-gray-900" style={brandSettings.font ? { fontFamily: `"${brandSettings.font}", sans-serif` } : {}}>{brandName}</h1>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {step === 1 && (
          <div className="p-8">
            <BrandHeader />
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Set your password to access your portal.</h2>
              <p className="text-gray-500">
                Choose a secure password to protect your {brandName} portal.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition-colors"
                  placeholder="••••••••"
                />
                {password && (
                  <div className="flex items-center mt-2 space-x-2">
                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: strength.label === 'Weak' ? '33%' : strength.label === 'Fair' ? '66%' : '100%' }} />
                    </div>
                    <span className={`text-xs font-medium ${strength.label === 'Weak' ? 'text-red-500' : strength.label === 'Fair' ? 'text-yellow-600' : 'text-green-600'}`}>{strength.label}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-white font-medium mt-6 bg-[var(--brand-primary)] hover:opacity-90 transition-opacity shadow-sm"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Set password and enter my portal'}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="p-8">
            <BrandHeader />
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Here's everything you can do here.</h2>
            
            <div className="space-y-5 mb-8">
              <div className="flex gap-4 items-start">
                <div className="p-2 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-lg shrink-0">
                  <LayoutDashboard size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Dashboard</h4>
                  <p className="text-sm text-gray-500 mt-0.5">See your active campaigns, what needs your attention, and the overall progress of your project.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-2 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-lg shrink-0">
                  <FolderKanban size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">My Campaigns</h4>
                  <p className="text-sm text-gray-500 mt-0.5">Browse all active and past campaigns and track which phase each one is in.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-2 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-lg shrink-0">
                  <CheckSquare size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Task Tracker</h4>
                  <p className="text-sm text-gray-500 mt-0.5">Follow the work your team is doing this week, day by day.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-2 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-lg shrink-0">
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Content Calendar</h4>
                  <p className="text-sm text-gray-500 mt-0.5">Review every post scheduled for your channels. Approve, comment, or request changes directly.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-2 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-lg shrink-0">
                  <Grid size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Preview & Feed</h4>
                  <p className="text-sm text-gray-500 mt-0.5">See exactly how your Instagram and TikTok feeds will look. Drag and drop to reorder posts.</p>
                </div>
              </div>
            </div>

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
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How the review process works.</h2>
            
            <div className="flex items-center justify-between mb-10 px-2 relative">
              <div className="absolute top-6 left-12 right-12 h-0.5 bg-gray-200 -z-10" />
              
              <div className="flex flex-col items-center flex-1 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full border-[3px] border-white flex items-center justify-center font-bold text-gray-500 mb-3 shadow-sm">1</div>
                <p className="text-xs font-semibold text-gray-900">Your team plans<br/>and produces content</p>
              </div>
              
              <div className="flex flex-col items-center flex-1 text-center">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full border-[3px] border-white flex items-center justify-center mb-3 shadow-sm">
                  <CheckCircle size={24} />
                </div>
                <p className="text-xs font-semibold text-gray-900">You receive a<br/>notification to review</p>
              </div>
              
              <div className="flex flex-col items-center flex-1 text-center">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full border-[3px] border-white flex items-center justify-center mb-3 shadow-sm">
                  <CheckCircle size={24} />
                </div>
                <p className="text-xs font-semibold text-gray-900">You approve or<br/>request changes</p>
              </div>
            </div>

            <p className="text-center text-gray-600 mb-8 leading-relaxed">
              When content is ready for your review, you'll get an email with a direct link. You can also log in here at any time to check progress, leave feedback, and approve posts.
            </p>

            <button
              onClick={finishOrientation}
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-white font-medium bg-[var(--brand-primary)] hover:opacity-90 transition-opacity"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Got it, take me to my portal'}
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
