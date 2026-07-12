import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  X, 
  User, 
  Palette, 
  ArrowRight,
  Loader2,
  Camera,
  CheckCircle
} from 'lucide-react';

interface ClientCreationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ClientCreationDrawer: React.FC<ClientCreationDrawerProps> = ({ isOpen, onClose, onSuccess }) => {
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Details
  const [clientName, setClientName] = useState('');
  
  // Step 2: Brand
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [accentColor, setAccentColor] = useState('#ec4899');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      // 1. Create client profile
      // Typically we use inviteUserByEmail for Supabase Auth, but we might not have admin rights
      // If we don't, we insert directly to profiles to "mock" the client creation
      
      const { data: newProfile, error: profileError } = await supabase.from('profiles').insert({
        full_name: clientName,
        role: 'client',
        status: 'approved',
        primary_color: primaryColor,
        accent_color: accentColor
      }).select('id').single();

      if (profileError) throw profileError;

      // 2. Upload Logo if exists
      if (logo && newProfile) {
        const fileExt = logo.name.split('.').pop();
        const fileName = `logo_${newProfile.id}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('content_media')
          .upload(fileName, logo);
          
        if (!uploadError) {
          const { data } = supabase.storage.from('content_media').getPublicUrl(fileName);
          await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', newProfile.id);
        }
      }

      onSuccess();
      onClose();
      // Reset state
      setTimeout(() => {
        setStep(1);
        setClientName('');
        setLogoPreview(null);
        setLogo(null);
      }, 300);
    } catch (error) {
      console.error('Error creating client:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Add New Client</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-6 py-4 border-b border-gray-50 flex gap-2">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-[var(--brand-primary)]' : 'bg-gray-100'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-[var(--brand-primary)]' : 'bg-gray-100'}`} />
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Client Details</h3>
                  <p className="text-sm text-gray-500">Basic information to set up their account</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company / Client Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)]"
                  placeholder="e.g. Burger King"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Palette size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Brand Configuration</h3>
                  <p className="text-sm text-gray-500">Override the default agency branding for this client</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-20 h-20 rounded-xl bg-gray-50 border border-dashed border-gray-300 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:bg-gray-100">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-[10px] text-gray-500 font-medium">Upload</span>
                    </>
                  )}
                  <input type="file" onChange={handleLogoChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-gray-900 mb-1">Client Logo (Optional)</h4>
                  <p className="text-xs text-gray-500">This replaces your studio logo in their portal view.</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-9 w-9 rounded cursor-pointer border-0 p-0"
                    />
                    <input 
                      type="text" 
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="h-9 w-9 rounded cursor-pointer border-0 p-0"
                    />
                    <input 
                      type="text" 
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-white transition-colors"
            >
              Back
            </button>
          )}
          
          {step < 2 ? (
            <button 
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !clientName}
              className="flex-[2] px-4 py-2.5 bg-black text-white font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              Next Step <ArrowRight size={16} className="ml-2" />
            </button>
          ) : (
            <button 
              onClick={handleCreate}
              disabled={loading}
              className="flex-[2] px-4 py-2.5 bg-[var(--brand-primary)] text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>{'Create Client'} <CheckCircle size={16} className="ml-2" /></>
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
};
