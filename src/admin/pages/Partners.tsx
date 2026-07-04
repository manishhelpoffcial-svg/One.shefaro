import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Activity, 
  Plus, 
  X, 
  CheckCircle, 
  XCircle, 
  PhoneCall, 
  Network,
  AlertCircle
} from 'lucide-react';
import { CourierPartner } from '../types';

interface PartnersProps {
  partners: CourierPartner[];
  onAddPartner: (partner: Omit<CourierPartner, 'id' | 'onTimePercent' | 'activeShipments'>) => void;
  onUpdatePartner: (partnerId: string, updated: Partial<CourierPartner>) => void;
  triggerToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const Partners: React.FC<PartnersProps> = ({
  partners,
  onAddPartner,
  onUpdatePartner,
  triggerToast
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Add Partner Form State
  const [partnerName, setPartnerName] = useState('');
  const [partnerContact, setPartnerContact] = useState('');
  const [partnerCoverage, setPartnerCoverage] = useState('');
  const [formError, setFormError] = useState('');

  const handleToggleStatus = (partner: CourierPartner) => {
    const nextState = !partner.isActive;
    onUpdatePartner(partner.id, { isActive: nextState });
    triggerToast(
      `Courier partner ${partner.name} is now ${nextState ? 'Active' : 'Deactivated'}`,
      nextState ? 'success' : 'info'
    );
  };

  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!partnerName.trim()) {
      setFormError('Partner business name is required.');
      return;
    }
    if (!partnerContact.trim()) {
      setFormError('Contact support details (phone/email) are required.');
      return;
    }
    if (!partnerCoverage.trim()) {
      setFormError('Coverage description is required.');
      return;
    }

    onAddPartner({
      name: partnerName.trim(),
      coverageArea: partnerCoverage.trim(),
      isActive: true
    });

    triggerToast(`Added new shipping courier partner: ${partnerName}`, 'success');

    // Reset Form
    setPartnerName('');
    setPartnerContact('');
    setPartnerCoverage('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Integrated Courier Partners</h1>
          <p className="text-sm text-slate-500">Monitor dispatch load capacities, on-time rating metrics, or add third-party courier APIs.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-colors text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/15 cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Courier Partner</span>
        </button>
      </div>

      {/* Grid of Partners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {partners.map((partner) => (
          <div 
            key={partner.id} 
            className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
              partner.isActive ? 'border-slate-200' : 'border-slate-200 bg-slate-50/50'
            }`}
          >
            {/* Top Row: Name and Status */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl border ${
                  partner.isActive 
                    ? 'bg-indigo-50 border-indigo-100 text-indigo-600' 
                    : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}>
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{partner.name}</h3>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide mt-0.5 block">API Provider ID: {partner.id}</span>
                </div>
              </div>

              {/* Toggle Status Slider Button */}
              <button
                onClick={() => handleToggleStatus(partner)}
                className="focus:outline-none transition-transform active:scale-95 cursor-pointer"
                title={partner.isActive ? 'Deactivate Courier' : 'Activate Courier'}
              >
                {partner.isActive ? (
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-slate-300 hover:text-slate-400" />
                )}
              </button>
            </div>

            {/* Middle Section: Metrics */}
            <div className="grid grid-cols-2 gap-4 my-6 py-4 border-y border-slate-100">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block select-none">On-Time Performance</span>
                <p className="text-lg font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-4.5 h-4.5 text-emerald-500" />
                  <span>{partner.onTimePercent}%</span>
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block select-none">Active Transit Loads</span>
                <p className="text-lg font-extrabold text-slate-800">
                  {partner.activeShipments.toLocaleString()} <span className="text-xs text-slate-400 font-semibold">pkgs</span>
                </p>
              </div>
            </div>

            {/* Bottom Section: Coverage Details */}
            <div className="flex items-start gap-2 text-xs font-semibold text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Coverage Territory</span>
                <span>{partner.coverageArea}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Partner Dialog Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 z-10 flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-none">Register Courier Partner</h3>
                <span className="text-xs text-slate-400 mt-1 block">Connect external dispatch routing APIs</span>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors min-h-[36px] min-w-[36px] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreatePartner} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
                  <AlertCircle className="w-4.5 h-4.5 text-red-500 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Partner Name</label>
                <input
                  type="text"
                  placeholder="e.g. Fedex Express India"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contact Support Email/Phone</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. partner@fedex.com"
                    value={partnerContact}
                    onChange={(e) => setPartnerContact(e.target.value)}
                    className="w-full h-11 pl-10 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none"
                  />
                  <PhoneCall className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Coverage Territory Slabs</label>
                <textarea
                  placeholder="e.g. North India, NCR and East Region (8,400+ pin codes)"
                  rows={2}
                  value={partnerCoverage}
                  onChange={(e) => setPartnerCoverage(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 min-h-[40px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/15 min-h-[40px] cursor-pointer"
                >
                  Save Partner API
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
