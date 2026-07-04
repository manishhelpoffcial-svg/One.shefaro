import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  History, 
  Mail, 
  Briefcase, 
  X,
  AlertCircle,
  Clock
} from 'lucide-react';
import { AdminUser, AuditLog } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';

interface SettingsProps {
  admins: AdminUser[];
  auditLogs: AuditLog[];
  onAddAdmin: (email: string, role: AdminUser['role']) => void;
  onRemoveAdmin: (adminId: string) => void;
  triggerToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const Settings: React.FC<SettingsProps> = ({
  admins,
  auditLogs,
  onAddAdmin,
  onRemoveAdmin,
  triggerToast
}) => {
  // Add Admin form states
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<AdminUser['role']>('Support');
  const [formError, setFormError] = useState('');

  // Confirmation dialog state
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

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const emailStr = newEmail.trim().toLowerCase();
    if (!emailStr) {
      setFormError('Please input a valid staff email address.');
      return;
    }
    if (!emailStr.includes('@') || !emailStr.includes('.')) {
      setFormError('The email address provided is formatted incorrectly.');
      return;
    }
    if (admins.some((a) => a.email.toLowerCase() === emailStr)) {
      setFormError('An administrator with this email already exists.');
      return;
    }

    onAddAdmin(emailStr, newRole);
    triggerToast(`Successfully registered staff account ${emailStr} as ${newRole}`, 'success');
    setNewEmail('');
    setNewRole('Support');
  };

  const handleRemoveAdmin = (admin: AdminUser) => {
    // Prevent self-deletion of demo admin
    if (admin.email === 'admin@oneshefaro.in') {
      triggerToast('Security Error: The primary Super Admin account cannot be removed.', 'error');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Revoke Staff Access?',
      message: `Warning: This will immediately delete the administrative account for ${admin.email} (${admin.role}). They will lose all access keys to the Super Admin Panel.`,
      action: () => {
        onRemoveAdmin(admin.id);
        triggerToast(`Revoked staff access for ${admin.email}`, 'success');
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Settings & Audit Log</h1>
        <p className="text-sm text-slate-500 font-medium">Add/remove administrative accounts, manage permission roles, and review the immutable security audit logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Admin staff management & Addition */}
        <div className="lg:col-span-5 space-y-6">
          {/* Add Staff form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-500" />
              <span>Register Staff Account</span>
            </h3>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Staff Email</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="staff@oneshefaro.in"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      if (formError) setFormError('');
                    }}
                    className="w-full h-11 pl-10 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Permission Role</label>
                <div className="relative">
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full h-11 pl-10 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="Super Admin">Super Admin (All permissions)</option>
                    <option value="Support">Support Desk Agent</option>
                    <option value="Ops">Operations Dispatcher</option>
                    <option value="Finance">Finance Accountant</option>
                  </select>
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-colors cursor-pointer shadow-md shadow-indigo-600/15"
              >
                Provision Staff Credentials
              </button>
            </form>
          </div>

          {/* Admins inventory list */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <span>Active Administrators ({admins.length})</span>
              </h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
              {admins.map((admin) => (
                <div key={admin.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/20 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{admin.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded">
                        {admin.role}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">Added: {admin.dateAdded}</span>
                    </div>
                  </div>
                  {admin.email !== 'admin@oneshefaro.in' && (
                    <button
                      onClick={() => handleRemoveAdmin(admin)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer border border-slate-100"
                      title="De-authorize Administrator"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Immutable Security Audit Log list */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[525px]">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-500" />
              <span>Immutable System Audit Log ({auditLogs.length})</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full select-none">
              ReadOnly History
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-slate-50/20">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 px-5 flex items-start sm:items-center justify-between gap-4 hover:bg-white transition-colors">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800 leading-snug">{log.action}</p>
                  <div className="flex flex-wrap items-center gap-x-2 text-[10px] font-bold text-slate-400 uppercase">
                    <span className="text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-1 rounded-md">{log.admin}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{log.timestamp}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation modal trigger block */}
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
