import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  User, 
  Truck, 
  Calendar, 
  Edit, 
  ChevronDown, 
  ChevronUp,
  Package,
  Weight,
  DollarSign,
  PlusCircle,
  X,
  History
} from 'lucide-react';
import { Shipment, ShipmentTimelineEvent } from '../types';

interface ShipmentsProps {
  shipments: Shipment[];
  onUpdateShipment: (shipmentId: string, updated: Partial<Shipment>) => void;
  triggerToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const Shipments: React.FC<ShipmentsProps> = ({
  shipments,
  onUpdateShipment,
  triggerToast
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<
    'All' | 'Booked' | 'Picked Up' | 'In Transit' | 'Delivered' | 'Failed/Returned'
  >('All');

  // Expanded row tracking
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Status editing modal state
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [nextStatus, setNextStatus] = useState<Shipment['status']>('Booked');
  const [timelineLocation, setTimelineLocation] = useState('');
  const [timelineDesc, setTimelineDesc] = useState('');

  // Status Filter options
  const statusTabs = [
    { label: 'All', value: 'All' },
    { label: 'Booked', value: 'Booked' },
    { label: 'Picked Up', value: 'Picked Up' },
    { label: 'In Transit', value: 'In Transit' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Failed/Returned', value: 'Failed/Returned' }
  ] as const;

  // Search & Filter Logic
  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch = 
      shipment.id.toLowerCase().includes(search.toLowerCase()) ||
      shipment.senderName.toLowerCase().includes(search.toLowerCase()) ||
      shipment.receiverName.toLowerCase().includes(search.toLowerCase()) ||
      shipment.origin.toLowerCase().includes(search.toLowerCase()) ||
      shipment.destination.toLowerCase().includes(search.toLowerCase());

    const matchesTab = activeTab === 'All' || shipment.status === activeTab;

    return matchesSearch && matchesTab;
  });

  const toggleRow = (id: string) => {
    setExpandedRow(prev => prev === id ? null : id);
  };

  const handleOpenStatusModal = (e: React.MouseEvent, shipment: Shipment) => {
    e.stopPropagation(); // Prevent row expansion when clicking update button
    setEditingShipment(shipment);
    setNextStatus(shipment.status);
    setTimelineLocation('');
    setTimelineDesc('');
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShipment) return;

    // Validate manual timeline insertion if changing status
    const defaultLocation = nextStatus === 'Delivered' 
      ? editingShipment.destination.split(',')[0] 
      : nextStatus === 'Picked Up'
      ? editingShipment.origin.split(',')[0]
      : 'In Transit Facility';

    const defaultDesc = `Package status updated manually to ${nextStatus}`;

    const newEvent: ShipmentTimelineEvent = {
      status: nextStatus,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      location: timelineLocation.trim() || defaultLocation,
      description: timelineDesc.trim() || defaultDesc
    };

    const updatedTimeline = [...editingShipment.timeline, newEvent];

    onUpdateShipment(editingShipment.id, {
      status: nextStatus,
      timeline: updatedTimeline
    });

    triggerToast(`Shipment ${editingShipment.id} status updated to ${nextStatus}`, 'success');
    setEditingShipment(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Active Shipments Router</h1>
        <p className="text-sm text-slate-500">Monitor tracking IDs, adjust dispatch states, and view automated tracking history logs.</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-px">
        {statusTabs.map((tab) => {
          const isActive = tab.value === activeTab;
          const count = tab.value === 'All' 
            ? shipments.length 
            : shipments.filter(s => s.status === tab.value).length;

          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 uppercase tracking-wide cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                isActive ? 'bg-indigo-50 text-indigo-700 font-extrabold' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="Search by Tracking ID, Sender/Receiver, Origin or Destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Shipments List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider select-none">
                <th className="py-4 px-6 w-12"></th>
                <th className="py-4 px-6">Tracking ID</th>
                <th className="py-4 px-6">Sender & Receiver</th>
                <th className="py-4 px-6">Origin → Destination</th>
                <th className="py-4 px-6">Courier Partner</th>
                <th className="py-4 px-6 text-center">Date Booked</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="text-base font-bold">No domestic shipments found in this category.</p>
                    <p className="text-xs mt-1">Try searching for a different Tracking ID or filter.</p>
                  </td>
                </tr>
              ) : (
                filteredShipments.map((shipment) => {
                  const isExpanded = expandedRow === shipment.id;
                  return (
                    <React.Fragment key={shipment.id}>
                      {/* Main Table Row */}
                      <tr 
                        onClick={() => toggleRow(shipment.id)}
                        className={`hover:bg-slate-50/50 transition-colors cursor-pointer select-none ${isExpanded ? 'bg-indigo-50/20' : ''}`}
                      >
                        <td className="py-4 px-6 text-center">
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-extrabold text-slate-900 tracking-tight block">{shipment.id}</span>
                          <span className="text-[10px] font-bold text-indigo-500 uppercase">Weight: {shipment.weight} kg</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col text-xs font-semibold text-slate-600 gap-0.5">
                            <span className="flex items-center gap-1"><span className="text-slate-400 font-bold uppercase text-[9px]">From:</span> {shipment.senderName}</span>
                            <span className="flex items-center gap-1"><span className="text-slate-400 font-bold uppercase text-[9px]">To:</span> {shipment.receiverName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col text-xs font-semibold text-slate-600">
                            <span className="truncate max-w-[180px]">{shipment.origin}</span>
                            <span className="text-[10px] text-slate-400 font-bold">→ {shipment.destination}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-700">{shipment.courierPartner}</td>
                        <td className="py-4 px-6 text-center font-semibold text-slate-500">{shipment.dateBooked}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            shipment.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                            shipment.status === 'Failed/Returned' ? 'bg-rose-50 text-rose-700 border border-rose-150' :
                            shipment.status === 'In Transit' ? 'bg-blue-50 text-blue-700 border border-blue-150' :
                            'bg-amber-50 text-amber-700 border border-amber-150'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              shipment.status === 'Delivered' ? 'bg-emerald-500' :
                              shipment.status === 'Failed/Returned' ? 'bg-rose-500' :
                              shipment.status === 'In Transit' ? 'bg-blue-500' :
                              'bg-amber-500'
                            }`} />
                            <span>{shipment.status}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={(e) => handleOpenStatusModal(e, shipment)}
                            className="p-2 border border-slate-200 text-slate-600 hover:bg-white hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition-all min-h-[38px] cursor-pointer flex items-center gap-1 ml-auto text-xs font-bold bg-slate-50/50"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Status</span>
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Section Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="py-5 px-8 bg-slate-50/60 border-y border-slate-150">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                              {/* Left Panel: Package Details */}
                              <div className="md:col-span-4 space-y-4">
                                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <Package className="w-4 h-4 text-slate-400" />
                                  <span>Consignment Metadata</span>
                                </h4>
                                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                  <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Package Items</span>
                                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{shipment.items}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-100">
                                    <div>
                                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Net Weight</span>
                                      <p className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                                        <Weight className="w-3.5 h-3.5 text-slate-500" />
                                        <span>{shipment.weight} kg</span>
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Charge Price</span>
                                      <p className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-0.5">
                                        <span>₹</span>
                                        <span>{shipment.cost}</span>
                                      </p>
                                    </div>
                                  </div>
                                  <div className="pt-2.5 border-t border-slate-100 text-xs font-medium text-slate-500">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Contact Detail</span>
                                    <p>Sender Phone: {shipment.senderPhone}</p>
                                    <p>Receiver Phone: {shipment.receiverPhone}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Right Panel: Vertical Timeline */}
                              <div className="md:col-span-8 space-y-4">
                                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <History className="w-4 h-4 text-slate-400" />
                                  <span>Real-time Transit Timeline</span>
                                </h4>
                                <div className="relative pl-6 space-y-5 border-l border-indigo-200/50 mt-2 ml-3">
                                  {shipment.timeline.map((event, index) => {
                                    const isLast = index === shipment.timeline.length - 1;
                                    return (
                                      <div key={index} className="relative">
                                        {/* Timeline Node */}
                                        <span className={`absolute left-[-29px] top-1.5 w-3 h-3 rounded-full border-2 ${
                                          isLast 
                                            ? 'bg-indigo-600 border-indigo-200 ring-4 ring-indigo-500/10' 
                                            : 'bg-slate-300 border-white'
                                        }`} />
                                        
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                                          <div>
                                            <span className={`text-xs font-bold uppercase tracking-wider ${isLast ? 'text-indigo-600' : 'text-slate-500'}`}>
                                              {event.status}
                                            </span>
                                            <p className="text-xs font-semibold text-slate-400 mt-0.5">
                                              Location: <span className="text-slate-700">{event.location}</span>
                                            </p>
                                            <p className="text-sm font-semibold text-slate-600 mt-1 leading-relaxed">
                                              {event.description}
                                            </p>
                                          </div>
                                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase self-start mt-0.5 whitespace-nowrap">
                                            {event.date}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Status Modification Drawer Dialog */}
      {editingShipment && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingShipment(null)} />
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 z-10 flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-none">Update Status</h3>
                <span className="text-xs text-slate-400 mt-1 block">Shipment ID: {editingShipment.id}</span>
              </div>
              <button 
                onClick={() => setEditingShipment(null)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors min-h-[36px] min-w-[36px] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveStatus} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Next Status</label>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as any)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none cursor-pointer"
                >
                  <option value="Booked">Booked</option>
                  <option value="Picked Up">Picked Up</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Failed/Returned">Failed/Returned</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Pune Delivery Hub"
                  value={timelineLocation}
                  onChange={(e) => setTimelineLocation(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Log Description (Optional)</label>
                <textarea
                  placeholder="e.g. Parcel sorted and loaded for dispatch."
                  rows={2}
                  value={timelineDesc}
                  onChange={(e) => setTimelineDesc(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingShipment(null)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 min-h-[40px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/15 min-h-[40px] cursor-pointer"
                >
                  Apply Status Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
