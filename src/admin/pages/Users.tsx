import React, { useState } from 'react';
import { 
  Search, 
  UserX, 
  UserCheck, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  User,
  X,
  Mail,
  Phone,
  Calendar,
  Box
} from 'lucide-react';
import { UserAccount, Shipment } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';

interface UsersProps {
  users: UserAccount[];
  shipments: Shipment[];
  onUpdateUser: (userId: string, updated: Partial<UserAccount>) => void;
  onDeleteUser: (userId: string) => void;
  triggerToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const Users: React.FC<UsersProps> = ({
  users,
  shipments,
  onUpdateUser,
  onDeleteUser,
  triggerToast
}) => {
  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended'>('All');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Selected User for details modal
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  // Confirmation Modals State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {}
  });

  // Filter & Search Logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.includes(search);
    
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Paginated Users
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset page on filter change
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (val: 'All' | 'Active' | 'Suspended') => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  // Actions
  const handleToggleStatus = (user: UserAccount) => {
    const isSuspending = user.status === 'Active';
    const actionText = isSuspending ? 'Suspend' : 'Reactivate';
    const nextStatus = isSuspending ? 'Suspended' : 'Active';

    setConfirmModal({
      isOpen: true,
      title: `${actionText} User Account?`,
      message: `Are you sure you want to ${actionText.toLowerCase()} the account for ${user.name} (${user.email})? ${
        isSuspending ? 'They will lose immediate access to booking new shipments.' : 'Their account access will be immediately restored.'
      }`,
      action: () => {
        onUpdateUser(user.id, { status: nextStatus });
        triggerToast(`Successfully ${isSuspending ? 'suspended' : 'reactivated'} user ${user.name}`, 'success');
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleDelete = (user: UserAccount) => {
    setConfirmModal({
      isOpen: true,
      title: 'Permanently Delete User?',
      message: `Warning: This will permanently delete the user account for ${user.name} (${user.email}) and all associated shipment histories. This action cannot be undone.`,
      action: () => {
        onDeleteUser(user.id);
        triggerToast(`Permanently deleted user account ${user.name}`, 'success');
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Extract shipment history for selected user in modal
  const userShipments = selectedUser 
    ? shipments.filter(s => s.senderName.toLowerCase() === selectedUser.name.toLowerCase() || s.senderPhone === selectedUser.phone)
    : [];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">User Accounts Manager</h1>
          <p className="text-sm text-slate-500">View customer profile details, toggle account suspensions, or remove registrations.</p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400"
          />
        </div>
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="text-slate-400 w-4 h-4 ml-1 hidden md:block" />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value as any)}
            className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 cursor-pointer min-w-[140px]"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider select-none">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Contact Info</th>
                <th className="py-4 px-6">Registered On</th>
                <th className="py-4 px-6 text-center">Shipments</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="text-base font-bold">No registered users match your query.</p>
                    <p className="text-xs mt-1">Try adjusting your filters or search terms.</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">{user.name}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col font-medium text-slate-600">
                        <span>{user.email}</span>
                        <span className="text-xs text-slate-400">{user.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-500">{user.signupDate}</td>
                    <td className="py-4 px-6 text-center font-bold text-slate-800">{user.shipmentCount}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-150'
                          : 'bg-rose-50 text-rose-700 border border-rose-150'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{user.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedUser(user)}
                          title="View Profile Details"
                          className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100 rounded-xl transition-colors min-w-[38px] min-h-[38px] cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          title={user.status === 'Active' ? 'Suspend Account' : 'Reactivate Account'}
                          className={`p-2 border rounded-xl transition-colors min-w-[38px] min-h-[38px] cursor-pointer ${
                            user.status === 'Active'
                              ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-slate-100'
                              : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-slate-100'
                          }`}
                        >
                          {user.status === 'Active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          title="Permanently Delete Account"
                          className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-100 rounded-xl transition-colors min-w-[38px] min-h-[38px] cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-400 uppercase select-none">
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} Users
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-all min-h-[38px] min-w-[38px] cursor-pointer ${
                    page === currentPage
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Dialog Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-gray-100 z-10 flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-150 flex justify-between items-center bg-slate-50/50 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  {selectedUser.name[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-none">{selectedUser.name}</h3>
                  <span className="text-xs text-slate-400 mt-1 block">Account details & shipment records</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors min-h-[36px] min-w-[36px] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 flex-grow overflow-y-auto">
              {/* Profile Details Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-100 p-4 rounded-xl flex items-center gap-3 bg-slate-50/30">
                  <Mail className="w-5 h-5 text-indigo-500" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Email Address</span>
                    <p className="text-sm font-semibold text-slate-800 truncate">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="border border-slate-100 p-4 rounded-xl flex items-center gap-3 bg-slate-50/30">
                  <Phone className="w-5 h-5 text-indigo-500" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Phone Number</span>
                    <p className="text-sm font-semibold text-slate-800 truncate">{selectedUser.phone}</p>
                  </div>
                </div>
                <div className="border border-slate-100 p-4 rounded-xl flex items-center gap-3 bg-slate-50/30">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Registration Date</span>
                    <p className="text-sm font-semibold text-slate-800 truncate">{selectedUser.signupDate}</p>
                  </div>
                </div>
                <div className="border border-slate-100 p-4 rounded-xl flex items-center gap-3 bg-slate-50/30">
                  <Box className="w-5 h-5 text-indigo-500" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Account Standing</span>
                    <p className="text-sm font-bold text-slate-800 truncate flex items-center gap-1.5 mt-0.5">
                      <span className={`w-2 h-2 rounded-full ${selectedUser.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span>{selectedUser.status} Profile</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipment History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Associated Shipment History ({userShipments.length})</h4>
                {userShipments.length === 0 ? (
                  <p className="text-sm text-slate-400 italic py-4 border border-dashed border-slate-200 rounded-xl text-center bg-slate-50/30">
                    This user has not booked any package shipments yet.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
                    {userShipments.map((shipment) => (
                      <div key={shipment.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-slate-900">{shipment.id}</span>
                            <span className="text-xs text-slate-400">({shipment.dateBooked})</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-500 mt-1">
                            {shipment.origin.split(',')[0]} → {shipment.destination.split(',')[0]}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <span className="text-xs font-bold text-slate-800">₹{shipment.cost}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            shipment.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                            shipment.status === 'Failed/Returned' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {shipment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 min-h-[40px] cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal Component Trigger */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
