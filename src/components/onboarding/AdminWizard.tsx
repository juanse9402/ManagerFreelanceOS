import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Building2, 
  Palette, 
  Eye, 
  UserPlus, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Loader2,
  Camera,
  AlertCircle
} from 'lucide-react';

// WCAG Contrast helper
const getRelativeLuminance = (r: number, g: number, b: number) => {
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;
  
  const rL = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gL = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bL = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const getContrastRatio = (l1: number, l2: number) => {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

export const AdminWizard: React.FC = () => {
  const { user, profileName, setHasCompletedOrientation } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Details
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  
  // Step 2: Brand
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [secondaryColor, setSecondaryColor] = useState('#f3f4f6');
  const [accentColor, setAccentColor] = useState('#ec4899');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Step 4: Client
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  const rgb = hexToRgb(primaryColor);
  let contrastWithWhite = 0;
  if (rgb) {
    const lum = getRelativeLuminance(rgb.r, rgb.g, rgb.b);
    contrastWithWhite = getContrastRatio(1, lum); // 1 is white
  }
  const isAccessibleWithWhite = contrastWithWhite >= 4.5;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      if (user) {
        let avatarUrl = undefined;
        
        // Upload logo if exists
        if (logo) {
          const fileExt = logo.name.split('.').pop();
          const fileName = `logo_${user.id}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('content_media')
            .upload(fileName, logo);
            
          if (!uploadError) {
            const { data } = supabase.storage.from('content_media').getPublicUrl(fileName);
            avatarUrl = data.publicUrl;
          }
        }

        // Save admin profile
        await supabase.from('profiles').update({
          business_name: businessName,
          industry,
          website,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          accent_color: accentColor,
          avatar_url: avatarUrl,
          has_completed_orientation: true
        }).eq('id', user.id);

        // Optionally invite client if email provided
        if (clientEmail && clientName) {
          // Send mock invite via Supabase API (if config allows)
          const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(clientEmail, {
            data: { full_name: clientName, role: 'client' }
          });
          if (inviteError) {
            console.error("Invite failed, creating mocked client:", inviteError);
            // Mock mode fallback if admin API is not available
            await supabase.from('profiles').insert({
              full_name: clientName,
              role: 'client',
              status: 'pending'
            });
          }
        }
      }
      setHasCompletedOrientation(true);
    } catch (err) {
      console.error(err);
      // Fallback
      setHasCompletedOrientation(true);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to your studio, {profileName.split(' ')[0]}</h2>
            <p className="text-gray-500 mb-8">Let's set up your freelance agency profile. This information helps us tailor your experience.</p>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="e.g. Acme Creative"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry / Niche</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="e.g. Restaurant Marketing"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website (Optional)</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="https://"
                />
              </div>
            </div>
            
            <div className="mt-10 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!businessName}
                className="flex items-center py-3 px-6 rounded-xl text-white font-medium bg-black hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                Next Step <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Brand Identity</h2>
            <p className="text-gray-500 mb-8">Customize how your portal looks to your clients.</p>
            
            <div className="space-y-6">
              <div className="flex gap-6 items-start">
                <div className="w-24 h-24 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:bg-gray-200">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-gray-400 mb-1" />
                      <span className="text-[10px] text-gray-500 font-medium">Upload Logo</span>
                    </>
                  )}
                  <input type="file" onChange={handleLogoChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">Agency Logo</h4>
                  <p className="text-sm text-gray-500 mb-2">Upload your logo to display in client portals. We recommend a square transparent PNG.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-10 rounded cursor-pointer border-0 p-0"
                    />
                    <input 
                      type="text" 
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  {!isAccessibleWithWhite && (
                    <div className="mt-2 flex items-start gap-1.5 text-amber-600 text-xs">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span>This color has low contrast with white text. Buttons might be hard to read.</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="h-10 w-10 rounded cursor-pointer border-0 p-0"
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

              <div className="mt-4 p-4 rounded-xl border border-gray-200 bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-3">Live Contrast Preview</p>
                <button 
                  style={{ backgroundColor: primaryColor }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium w-full ${isAccessibleWithWhite ? 'text-white' : 'text-gray-900'}`}
                >
                  Primary Action Button
                </button>
              </div>
            </div>
            
            <div className="mt-10 flex justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-3 font-medium text-gray-600 hover:text-gray-900">
                Back
              </button>
              <button onClick={() => setStep(3)} className="flex items-center py-3 px-6 rounded-xl text-white font-medium bg-black hover:bg-gray-800">
                Preview Portal <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Portal Preview</h2>
            <p className="text-gray-500 mb-8">Here is how your clients will see your portal.</p>
            
            <div className="w-full h-72 border-4 border-gray-100 rounded-2xl overflow-hidden relative shadow-lg flex flex-col">
              <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  {logoPreview ? (
                    <img src={logoPreview} className="w-6 h-6 object-contain" alt="Logo" />
                  ) : (
                    <div className="w-6 h-6 rounded-md" style={{ backgroundColor: primaryColor }} />
                  )}
                  <span className="font-bold text-sm">{businessName || 'Your Studio'}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100" />
              </div>
              <div className="flex-1 flex" style={{ backgroundColor: secondaryColor }}>
                <div className="w-48 border-r border-gray-200 bg-white p-4 hidden md:block">
                  <div className="h-8 rounded mb-2" style={{ backgroundColor: `${primaryColor}20` }} />
                  <div className="h-8 rounded mb-2" style={{ backgroundColor: `transparent` }} />
                  <div className="h-8 rounded mb-2" style={{ backgroundColor: `transparent` }} />
                </div>
                <div className="flex-1 p-6">
                  <div className="h-4 w-32 rounded mb-4 bg-gray-200" />
                  <div className="h-8 w-48 rounded mb-6 text-2xl font-bold">Dashboard</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 rounded-xl bg-white shadow-sm border border-gray-100 p-4">
                      <div className="w-8 h-8 rounded-full mb-2" style={{ backgroundColor: accentColor }} />
                      <div className="h-2 w-16 bg-gray-200 rounded" />
                    </div>
                    <div className="h-24 rounded-xl bg-white shadow-sm border border-gray-100 p-4">
                      <div className="w-8 h-8 rounded-full mb-2 bg-gray-100" />
                      <div className="h-2 w-16 bg-gray-200 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-10 flex justify-between">
              <button onClick={() => setStep(2)} className="px-6 py-3 font-medium text-gray-600 hover:text-gray-900">
                Back
              </button>
              <button onClick={() => setStep(4)} className="flex items-center py-3 px-6 rounded-xl text-white font-medium bg-black hover:bg-gray-800">
                Looks Good <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Add Your First Client</h2>
            <p className="text-gray-500 mb-8">Send an invitation to a client so they can access their customized portal. (Optional)</p>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name / Brand</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="e.g. Burger King"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Email</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="client@burgerking.com"
                />
              </div>
            </div>

            {clientName && clientEmail && (
              <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-100">
                <div className="flex gap-3">
                  <CheckCircle className="text-green-600 w-5 h-5 shrink-0" />
                  <div className="text-sm text-green-800">
                    <strong>Preview:</strong> An email will be sent to {clientEmail} inviting them to join "{businessName}" on Manager OS.
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-10 flex justify-between items-center">
              <button onClick={handleFinish} disabled={loading} className="px-6 py-3 font-medium text-gray-500 hover:text-gray-900">
                Skip for now
              </button>
              <button 
                onClick={handleFinish}
                disabled={loading}
                className="flex items-center py-3 px-6 rounded-xl text-white font-medium bg-black hover:bg-gray-800 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>{clientEmail ? 'Send Invitation & Finish' : 'Finish Setup'} <CheckCircle size={18} className="ml-2" /></>
                )}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 flex font-sans">
      {/* Left Panel: Wizard Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="mb-12 flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div 
                key={i} 
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-black' : 'bg-gray-200'}`}
              />
            ))}
          </div>
          {renderStep()}
        </div>
      </div>

      {/* Right Panel: Decorative/Features */}
      <div className="hidden lg:flex w-1/2 bg-black text-white p-16 flex-col justify-between">
        <div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-12">
            <Building2 className="text-white w-6 h-6" />
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-6">
            Make your agency look professional.
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-md">
            FreelanceOS allows you to fully white-label the client experience. Give your clients a beautiful, secure place to review their content.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-8 mt-12">
          <div>
            <Palette className="text-gray-400 mb-4 w-6 h-6" />
            <h3 className="font-semibold text-lg mb-2">Custom Branding</h3>
            <p className="text-gray-400 text-sm">Your colors, your logo, your identity on every screen.</p>
          </div>
          <div>
            <Eye className="text-gray-400 mb-4 w-6 h-6" />
            <h3 className="font-semibold text-lg mb-2">Clear Previews</h3>
            <p className="text-gray-400 text-sm">Clients see exactly what their posts will look like live.</p>
          </div>
          <div>
            <UserPlus className="text-gray-400 mb-4 w-6 h-6" />
            <h3 className="font-semibold text-lg mb-2">Easy Onboarding</h3>
            <p className="text-gray-400 text-sm">Send one magic link and your client is ready to approve.</p>
          </div>
          <div>
            <CheckCircle className="text-gray-400 mb-4 w-6 h-6" />
            <h3 className="font-semibold text-lg mb-2">Faster Approvals</h3>
            <p className="text-gray-400 text-sm">Eliminate endless email threads and scattered feedback.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
