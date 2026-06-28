import React, { useState, useEffect } from 'react';
import { X, Loader2, Camera, Video, Globe, CheckCircle } from 'lucide-react';

export type NetworkType = 'instagram' | 'tiktok' | 'facebook';

interface OAuthPopupProps {
  isOpen: boolean;
  network: NetworkType | null;
  onClose: () => void;
  onSuccess: (network: NetworkType, handle: string) => void;
}

export const OAuthPopup: React.FC<OAuthPopupProps> = ({ isOpen, network, onClose, onSuccess }) => {
  const [step, setStep] = useState<'loading' | 'login' | 'authorizing' | 'success'>('loading');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep('loading');
      setUsername('');
      setPassword('');
      
      // Simulate initial connection delay
      const timer = setTimeout(() => {
        setStep('login');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, network]);

  if (!isOpen || !network) return null;

  const getNetworkDetails = () => {
    switch (network) {
      case 'instagram':
        return {
          name: 'Instagram',
          color: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500',
          icon: <Camera size={32} className="text-white" />
        };
      case 'tiktok':
        return {
          name: 'TikTok',
          color: 'bg-black',
          icon: <Video size={32} className="text-white" />
        };
      case 'facebook':
        return {
          name: 'Facebook',
          color: 'bg-blue-600',
          icon: <Globe size={32} className="text-white" />
        };
    }
  };

  const details = getNetworkDetails();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    
    setStep('authorizing');
    
    // Simulate authorization delay
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess(network, username);
      }, 2000);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
            <span>Connect to {details.name}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
              <p className="text-sm font-medium text-gray-500">Connecting to {details.name}...</p>
            </div>
          )}

          {step === 'login' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-center mb-6">
                <div className={`w-16 h-16 rounded-2xl ${details.color} flex items-center justify-center shadow-lg shadow-${details.color}/20`}>
                  {details.icon}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-center text-gray-900 mb-1">Log in to {details.name}</h3>
              <p className="text-sm text-center text-gray-500 mb-6">FreelanceOS is requesting access to your account.</p>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Phone number, username, or email"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className={`w-full py-3 rounded-xl text-white font-bold text-sm shadow-md transition-opacity hover:opacity-90 ${details.color}`}
                >
                  Log In
                </button>
              </form>
            </div>
          )}

          {step === 'authorizing' && (
            <div className="flex flex-col items-center justify-center py-12 animate-in fade-in duration-300">
              <div className="relative mb-6">
                <div className={`w-16 h-16 rounded-2xl ${details.color} flex items-center justify-center shadow-lg`}>
                  {details.icon}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              </div>
              <p className="text-base font-bold text-gray-900">Authorizing...</p>
              <p className="text-xs text-gray-500 mt-1">Securing connection</p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Connected!</h3>
              <p className="text-sm text-gray-500">Successfully connected to {details.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
