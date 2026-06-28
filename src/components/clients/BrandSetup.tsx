import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Upload, Check, Video, Camera, Globe } from 'lucide-react';

export const BrandSetup: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { availableClients } = useAuth();
  const client = availableClients.find(c => c.id === id);

  const [primaryColor, setPrimaryColor] = useState(client?.brand_settings?.primaryColor || '#8B5CF6');
  const [secondaryColor, setSecondaryColor] = useState(client?.brand_settings?.secondaryColor || '#F3F4F6');
  const [accentColor, setAccentColor] = useState(client?.brand_settings?.accentColor || '#F59E0B');
  
  const [font, setFont] = useState('Inter');
  const [networks, setNetworks] = useState({
    instagram: true,
    tiktok: false,
    facebook: false
  });
  
  const [handles, setHandles] = useState({
    instagram: '',
    tiktok: '',
    facebook: ''
  });
  const [showToast, setShowToast] = useState(false);

  if (!client) {
    return <div className="p-8 text-center text-gray-500">Client not found</div>;
  }

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="flex h-full bg-gray-50/50 overflow-hidden">
      {/* Left Column - Configuration Form */}
      <div className="flex-1 overflow-y-auto border-r border-gray-200 bg-white relative">
        <div className="p-8 max-w-2xl mx-auto pb-24">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Brand Setup — {client.full_name}</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Configure how {client.full_name}'s portal looks. These settings apply to everything the client sees.
            </p>
          </div>

          {/* Section A: Logo */}
          <div className="mb-10">
            <h3 className="text-sm font-bold text-gray-900 mb-1">Client Logo</h3>
            <p className="text-xs text-gray-500 mb-3">Appears in the client's portal header, sidebar, and invitation email.</p>
            
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[var(--brand-primary)]/50 hover:bg-[var(--brand-primary)]/5 transition-all cursor-pointer group">
              <Upload className="mx-auto h-8 w-8 text-gray-400 group-hover:text-[var(--brand-primary)] mb-3" />
              <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG (max. 2MB)</p>
            </div>
          </div>

          {/* Section B: Brand Colors */}
          <div className="mb-10">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Brand Colors</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Primary Color</label>
                <p className="text-[10px] text-gray-500 mb-2">Used for buttons, progress bars, active menu items, and key highlights.</p>
                <div className="flex items-center space-x-3">
                  <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                  <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono w-28 uppercase" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Secondary Color</label>
                <p className="text-[10px] text-gray-500 mb-2">Used for backgrounds, card borders, and supporting elements.</p>
                <div className="flex items-center space-x-3">
                  <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                  <input type="text" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono w-28 uppercase" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Accent Color</label>
                <p className="text-[10px] text-gray-500 mb-2">Used for badges, status tags, and hover states.</p>
                <div className="flex items-center space-x-3">
                  <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                  <input type="text" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono w-28 uppercase" />
                </div>
              </div>
            </div>
          </div>

          {/* Section C: Typography */}
          <div className="mb-10">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Font Pairing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Inter', desc: 'Clean sans-serif' },
                { name: 'DM Sans', desc: 'Modern geometric' },
                { name: 'Playfair Display', desc: 'Editorial' },
                { name: 'Sora', desc: 'Minimal' }
              ].map(f => (
                <div 
                  key={f.name}
                  onClick={() => setFont(f.name)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${font === f.name ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 ring-1 ring-[var(--brand-primary)]' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-500">{f.name}</span>
                    {font === f.name && <Check size={14} className="text-[var(--brand-primary)]" />}
                  </div>
                  <p className="text-sm font-medium text-gray-900" style={{ fontFamily: f.name }}>
                    {client.full_name} — Social Media Management
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section D: Social Networks */}
          <div className="mb-10">
            <h3 className="text-sm font-bold text-gray-900 mb-1">Connected Social Networks</h3>
            <p className="text-xs text-gray-500 mb-4">Select which networks are active for this client. Only active networks appear in their portal's calendar and feed simulator.</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Instagram */}
              <div className={`flex-1 border rounded-xl p-4 transition-all ${networks.instagram ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5' : 'border-gray-200 bg-white'}`}>
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setNetworks(prev => ({ ...prev, instagram: !prev.instagram }))}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${networks.instagram ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <Camera size={20} />
                    </div>
                    <span className={`font-semibold text-sm ${networks.instagram ? 'text-gray-900' : 'text-gray-500'}`}>Instagram</span>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${networks.instagram ? 'bg-[var(--brand-primary)]' : 'bg-gray-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${networks.instagram ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                </div>
                {networks.instagram && (
                  <div className="mt-4 pt-4 border-t border-[var(--brand-primary)]/20 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-semibold text-[var(--brand-primary)] mb-1">Instagram Handle</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">@</span>
                      <input 
                        type="text" 
                        value={handles.instagram}
                        onChange={(e) => setHandles(prev => ({...prev, instagram: e.target.value}))}
                        placeholder="username" 
                        className="w-full pl-8 pr-3 py-2 bg-white border border-[var(--brand-primary)]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* TikTok */}
              <div className={`flex-1 border rounded-xl p-4 transition-all ${networks.tiktok ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5' : 'border-gray-200 bg-white'}`}>
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setNetworks(prev => ({ ...prev, tiktok: !prev.tiktok }))}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${networks.tiktok ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <Video size={20} />
                    </div>
                    <span className={`font-semibold text-sm ${networks.tiktok ? 'text-gray-900' : 'text-gray-500'}`}>TikTok</span>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${networks.tiktok ? 'bg-[var(--brand-primary)]' : 'bg-gray-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${networks.tiktok ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                </div>
                {networks.tiktok && (
                  <div className="mt-4 pt-4 border-t border-[var(--brand-primary)]/20 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-semibold text-[var(--brand-primary)] mb-1">TikTok Handle</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">@</span>
                      <input 
                        type="text" 
                        value={handles.tiktok}
                        onChange={(e) => setHandles(prev => ({...prev, tiktok: e.target.value}))}
                        placeholder="username" 
                        className="w-full pl-8 pr-3 py-2 bg-white border border-[var(--brand-primary)]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Facebook */}
              <div className={`flex-1 border rounded-xl p-4 transition-all ${networks.facebook ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5' : 'border-gray-200 bg-white'}`}>
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setNetworks(prev => ({ ...prev, facebook: !prev.facebook }))}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${networks.facebook ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <Globe size={20} />
                    </div>
                    <span className={`font-semibold text-sm ${networks.facebook ? 'text-gray-900' : 'text-gray-500'}`}>Facebook</span>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${networks.facebook ? 'bg-[var(--brand-primary)]' : 'bg-gray-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${networks.facebook ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                </div>
                {networks.facebook && (
                  <div className="mt-4 pt-4 border-t border-[var(--brand-primary)]/20 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-semibold text-[var(--brand-primary)] mb-1">Facebook Page Name</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={handles.facebook}
                        onChange={(e) => setHandles(prev => ({...prev, facebook: e.target.value}))}
                        placeholder="Page Name" 
                        className="w-full px-3 py-2 bg-white border border-[var(--brand-primary)]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            {!networks.instagram && !networks.tiktok && !networks.facebook && (
              <p className="text-xs text-orange-600 mt-3 font-medium">Enable at least one network to start planning content.</p>
            )}
          </div>
        </div>

        {/* Save Button Sticky */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            {showToast && (
              <div className="text-sm font-semibold text-emerald-600 flex items-center bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 animate-in fade-in">
                <Check size={16} className="mr-2" />
                Brand settings saved.
              </div>
            )}
            {!showToast && <div></div>}
            <button 
              onClick={handleSave}
              className="bg-[var(--brand-primary)] text-white px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-[var(--brand-primary)]/90 transition-all text-sm"
            >
              Save Brand Settings
            </button>
          </div>
        </div>
      </div>

      {/* Right Column - Live Preview */}
      <div className="w-[450px] bg-gray-50 hidden lg:flex flex-col p-8">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6 text-center">Client Portal Preview</h3>
        
        {/* Mockup Container */}
        <div className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col pointer-events-none" style={{ fontFamily: font }}>
          {/* Mockup Header */}
          <div className="h-14 border-b border-gray-100 flex items-center justify-between px-6" style={{ backgroundColor: secondaryColor }}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: primaryColor }}>
                {client.full_name?.substring(0, 2).toUpperCase()}
              </div>
              <span className="font-bold text-gray-900">{client.full_name}</span>
            </div>
          </div>
          
          <div className="flex-1 p-6" style={{ backgroundColor: secondaryColor }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome back, {client.full_name}.</h2>
            
            {/* Mockup Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-gray-900">Project Progress</span>
                <span className="text-xs font-bold px-2 py-1 rounded border" style={{ color: accentColor, borderColor: accentColor, backgroundColor: `${accentColor}10` }}>On Track</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                <div className="h-2 rounded-full" style={{ width: '65%', backgroundColor: primaryColor }}></div>
              </div>
            </div>

            {/* Mockup Button */}
            <div className="w-full py-2.5 rounded-lg text-white text-center font-semibold text-sm shadow-sm" style={{ backgroundColor: primaryColor }}>
              Review Pending Content
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          This is exactly what {client.full_name} will see when they log in.
        </p>
      </div>
    </div>
  );
};
