import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  ArrowDownLeft, 
  RefreshCcw, 
  Calendar, 
  TrendingUp,
  AlertOctagon,
  Search,
  CheckCircle,
  XCircle,
  ShieldAlert
} from 'lucide-react';
import { Transaction } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';

interface FinanceProps {
  transactions: Transaction[];
  onRefundTransaction: (txnId: string) => void;
  triggerToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const Finance: React.FC<FinanceProps> = ({
  transactions,
  onRefundTransaction,
  triggerToast
}) => {
  const [search, setSearch] = useState('');

  // Confirmation state
  const [refundTxn, setRefundTxn] = useState<Transaction | null>(null);

  // Financial Stats Calculation
  // Base stats on current dataset
  const baseRevenue = 485000; // Constant seed baseline
  const grossTxnAmount = transactions
    .filter(t => t.status === 'Success')
    .reduce((sum, t) => sum + t.amount, 0);

  const refundTxnAmount = transactions
    .filter(t => t.status === 'Refunded')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalGrossRevenue = baseRevenue + grossTxnAmount;
  const totalRefunded = refundTxnAmount;
  const totalNetRevenue = totalGrossRevenue - totalRefunded;

  // Filter list
  const filteredTxns = transactions.filter(t => 
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    t.customerName.toLowerCase().includes(search.toLowerCase()) ||
    t.paymentMethod.toLowerCase().includes(search.toLowerCase())
  );

  const handleTriggerRefund = (txn: Transaction) => {
    setRefundTxn(txn);
  };

  const handleConfirmRefund = () => {
    if (!refundTxn) return;

    onRefundTransaction(refundTxn.id);
    triggerToast(`Transaction ${refundTxn.id} has been fully refunded.`, 'success');
    setRefundTxn(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Finance & Refunds Ledger</h1>
        <p className="text-sm text-slate-500">Monitor transaction records, trigger user refunds, and view daily freight receipt summaries.</p>
      </div>

      {/* 3 Financial Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Gross Revenue This Month</span>
            <p className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">₹{totalGrossRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Refunds Issued */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <RefreshCcw className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Refunds Issued</span>
            <p className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">₹{totalRefunded.toLocaleString()}</p>
          </div>
        </div>

        {/* Net Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Net Earned Revenue</span>
            <p className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">₹{totalNetRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Search Filter bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="Search transactions by reference ID, customer name or payment gateway..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider select-none">
                <th className="py-4 px-6">Transaction ID</th>
                <th className="py-4 px-6">Date & Time</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Payment Method</th>
                <th className="py-4 px-6 text-center">Receipt Amt</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No matching financial transaction ledgers found.
                  </td>
                </tr>
              ) : (
                filteredTxns.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-extrabold text-slate-900 font-mono tracking-tight">{txn.id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{txn.date}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">{txn.customerName}</td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200/50 px-2 py-1 rounded">
                        {txn.paymentMethod}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-extrabold text-slate-900">
                      ₹{txn.amount}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        txn.status === 'Success'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-150'
                          : 'bg-rose-50 text-rose-700 border border-rose-150'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${txn.status === 'Success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{txn.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {txn.status === 'Success' ? (
                        <button
                          onClick={() => handleTriggerRefund(txn)}
                          className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:text-white hover:bg-rose-600 rounded-xl transition-all font-bold text-xs min-h-[34px] cursor-pointer"
                        >
                          Trigger Refund
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-rose-400 italic block py-1.5 px-3">
                          Refunded
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {refundTxn && (
        <ConfirmationModal
          isOpen={true}
          title="Approve Transaction Refund?"
          message={`Are you sure you want to trigger a full refund of ₹${refundTxn.amount} to ${refundTxn.customerName} for Transaction ID: ${refundTxn.id}? The payment gateway API will process the return within 3-5 bank business days.`}
          confirmText="Yes, Issue Refund"
          onConfirm={handleConfirmRefund}
          onCancel={() => setRefundTxn(null)}
        />
      )}
    </div>
  );
};
