import React, { useState } from 'react';
import { 
  Coins, 
  Percent, 
  Calendar, 
  Plus, 
  Edit, 
  X, 
  Trash2, 
  Sparkles,
  ToggleLeft,
  ToggleRight,
  AlertCircle
} from 'lucide-react';
import { PricingRate, PromoCode } from '../types';

interface PricingProps {
  pricingRates: PricingRate[];
  promoCodes: PromoCode[];
  onUpdatePricingRate: (rateId: string, updated: Partial<PricingRate>) => void;
  onAddPromoCode: (promo: Omit<PromoCode, 'id'>) => void;
  onUpdatePromoCode: (promoId: string, updated: Partial<PromoCode>) => void;
  onDeletePromoCode: (promoId: string) => void;
  triggerToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const Pricing: React.FC<PricingProps> = ({
  pricingRates,
  promoCodes,
  onUpdatePricingRate,
  onAddPromoCode,
  onUpdatePromoCode,
  onDeletePromoCode,
  triggerToast
}) => {
  // Tabs: Rates vs Promos
  const [activeTab, setActiveTab] = useState<'rates' | 'promos'>('rates');

  // Rate Editing state
  const [editingRate, setEditingRate] = useState<PricingRate | null>(null);
  const [editStandard, setEditStandard] = useState(0);
  const [editExpress, setEditExpress] = useState(0);

  // New Promo Code state
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState('');
  const [promoExpiry, setPromoExpiry] = useState('');
  const [promoError, setPromoError] = useState('');

  // Group pricing rates by Weight Slab for better tabular presentation
  const slabs = ['Up to 500g', '500g to 1kg', '1kg to 2kg', '2kg to 5kg'];

  const getRatesForSlab = (slab: string) => {
    return pricingRates.filter((rate) => rate.weightSlab === slab);
  };

  const handleEditRate = (rate: PricingRate) => {
    setEditingRate(rate);
    setEditStandard(rate.standardRate);
    setEditExpress(rate.expressRate);
  };

  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRate) return;

    if (editStandard < 0 || editExpress < 0) {
      triggerToast('Pricing rates cannot be negative.', 'error');
      return;
    }

    onUpdatePricingRate(editingRate.id, {
      standardRate: Number(editStandard),
      expressRate: Number(editExpress)
    });

    triggerToast(`Updated rates for ${editingRate.weightSlab} in ${editingRate.zone}`, 'success');
    setEditingRate(null);
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');

    if (!promoCode.trim()) {
      setPromoError('Please specify a promo code string.');
      return;
    }
    const discountNum = Number(promoDiscount);
    if (!promoDiscount || isNaN(discountNum) || discountNum <= 0 || discountNum > 100) {
      setPromoError('Please specify a discount percentage between 1 and 100.');
      return;
    }
    if (!promoExpiry) {
      setPromoError('Promo expiry date is required.');
      return;
    }

    onAddPromoCode({
      code: promoCode.trim().toUpperCase(),
      discountPercent: discountNum,
      expiryDate: promoExpiry,
      isActive: true
    });

    triggerToast(`Promo code ${promoCode.toUpperCase()} added successfully`, 'success');
    
    // Clear state
    setPromoCode('');
    setPromoDiscount('');
    setPromoExpiry('');
    setShowAddPromo(false);
  };

  const handleTogglePromo = (promo: PromoCode) => {
    const nextState = !promo.isActive;
    onUpdatePromoCode(promo.id, { isActive: nextState });
    triggerToast(
      `Promo code ${promo.code} is now ${nextState ? 'Active' : 'Inactive'}`,
      nextState ? 'success' : 'info'
    );
  };

  const handleDeletePromo = (promo: PromoCode) => {
    if (window.confirm(`Are you sure you want to delete promo code ${promo.code}?`)) {
      onDeletePromoCode(promo.id);
      triggerToast(`Deleted promo code ${promo.code}`, 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pricing Matrix & Promo Codes</h1>
          <p className="text-sm text-slate-500">Configure courier rate slabs for standard/express services across zones, and manage promo coupons.</p>
        </div>
        {/* Tab Controls */}
        <div className="bg-slate-200/60 p-1 rounded-xl flex items-center self-start sm:self-center select-none">
          <button
            onClick={() => setActiveTab('rates')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'rates' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Pricing Matrix
          </button>
          <button
            onClick={() => setActiveTab('promos')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'promos' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Promo Coupons ({promoCodes.length})
          </button>
        </div>
      </div>

      {activeTab === 'rates' ? (
        <div className="space-y-6">
          {/* Helper Banner */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-xs font-semibold text-indigo-800 leading-relaxed">
            ✏️ <span className="font-extrabold">Super Admin Tip:</span> Clicking the edit button on any slab row allows you to modify standard and express charges. The updated rates will instantly take effect across customer checkout logs.
          </div>

          {/* Pricing Tables Grouped by Slabs */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {slabs.map((slab) => (
              <div key={slab} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                    <Coins className="w-4 h-4 text-indigo-500" />
                    <span>Weight Slab: {slab}</span>
                  </h3>
                </div>

                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                        <th className="py-3 px-5">Destination Zone</th>
                        <th className="py-3 px-5 text-center">Standard Price</th>
                        <th className="py-3 px-5 text-center">Express Price</th>
                        <th className="py-3 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {getRatesForSlab(slab).map((rate) => (
                        <tr key={rate.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="py-3 px-5 font-semibold text-slate-800 leading-tight">
                            {rate.zone}
                          </td>
                          <td className="py-3 px-5 text-center font-bold text-slate-900">
                            ₹{rate.standardRate}
                          </td>
                          <td className="py-3 px-5 text-center font-bold text-slate-900">
                            ₹{rate.expressRate}
                          </td>
                          <td className="py-3 px-5 text-right">
                            <button
                              onClick={() => handleEditRate(rate)}
                              className="p-1.5 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Rates"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* PROMO CODES PANEL */
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Coupon Inventory</h3>
              <p className="text-xs text-slate-400">Launch active promotional campaigns to increase booking frequencies.</p>
            </div>
            {!showAddPromo && (
              <button
                onClick={() => setShowAddPromo(true)}
                className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-colors text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/15 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Promo Code</span>
              </button>
            )}
          </div>

          {/* Create Promo Panel Form */}
          {showAddPromo && (
            <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Create Promotional Code Coupon</span>
                </h4>
                <button
                  onClick={() => setShowAddPromo(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {promoError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{promoError}</span>
                </div>
              )}

              <form onSubmit={handleCreatePromo} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Coupon Name Code</label>
                  <input
                    type="text"
                    placeholder="e.g. MONSOON30"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold uppercase text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Discount Percent (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="e.g. 30"
                      value={promoDiscount}
                      onChange={(e) => setPromoDiscount(e.target.value)}
                      className="w-full h-11 pl-3 pr-8 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none"
                    />
                    <Percent className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Expiry Date Lock</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={promoExpiry}
                      onChange={(e) => setPromoExpiry(e.target.value)}
                      className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Save Promo</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Promo Codes Inventory List */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider select-none">
                    <th className="py-4 px-6">Promo Code</th>
                    <th className="py-4 px-6 text-center">Discount Percentage</th>
                    <th className="py-4 px-6 text-center">Expiry Deadline</th>
                    <th className="py-4 px-6 text-center">Current Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {promoCodes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No promotional coupons created yet.
                      </td>
                    </tr>
                  ) : (
                    promoCodes.map((promo) => (
                      <tr key={promo.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-4 px-6">
                          <span className="font-extrabold text-slate-900 tracking-wider bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200/50 text-xs uppercase inline-block">
                            {promo.code}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center font-extrabold text-indigo-600 text-base">
                          {promo.discountPercent}% OFF
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-slate-500 font-semibold text-xs">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{promo.expiryDate}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleTogglePromo(promo)}
                            title={promo.isActive ? 'Deactivate Coupon' : 'Activate Coupon'}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border cursor-pointer transition-colors"
                            style={{
                              borderColor: promo.isActive ? '#bbf7d0' : '#f1f5f9',
                              backgroundColor: promo.isActive ? '#f0fdf4' : '#f8fafc',
                              color: promo.isActive ? '#15803d' : '#64748b'
                            }}
                          >
                            {promo.isActive ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                <span>Inactive</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDeletePromo(promo)}
                            className="p-2 border border-slate-200 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer min-h-[38px] min-w-[38px]"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Rate Editor Modal */}
      {editingRate && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingRate(null)} />
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-100 z-10 flex flex-col animate-scaleUp">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 leading-none">Modify Slab Pricing</h3>
                <span className="text-[11px] text-slate-400 mt-1 block font-semibold">{editingRate.weightSlab} — {editingRate.zone}</span>
              </div>
              <button 
                onClick={() => setEditingRate(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveRate} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Standard Delivery Cost (₹)</label>
                <input
                  type="number"
                  value={editStandard}
                  onChange={(e) => setEditStandard(Number(e.target.value))}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Express Delivery Cost (₹)</label>
                <input
                  type="number"
                  value={editExpress}
                  onChange={(e) => setEditExpress(Number(e.target.value))}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none"
                  min="0"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRate(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 min-h-[38px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/15 min-h-[38px] cursor-pointer"
                >
                  Save Charges
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
