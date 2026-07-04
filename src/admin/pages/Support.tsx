import React, { useState } from 'react';
import { 
  LifeBuoy, 
  Send, 
  User, 
  Clock, 
  AlertOctagon, 
  ChevronRight, 
  MessageSquare,
  X,
  ChevronLeft
} from 'lucide-react';
import { SupportTicket, TicketMessage } from '../types';

interface SupportProps {
  tickets: SupportTicket[];
  onUpdateTicket: (ticketId: string, updated: Partial<SupportTicket>) => void;
  triggerToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const Support: React.FC<SupportProps> = ({
  tickets,
  onUpdateTicket,
  triggerToast
}) => {
  // Selected ticket for side-by-side or detailed dialogue view
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  
  // Message reply content state
  const [replyText, setReplyText] = useState('');

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  const handleStatusChange = (ticketId: string, nextStatus: SupportTicket['status']) => {
    onUpdateTicket(ticketId, { status: nextStatus });
    triggerToast(`Ticket ${ticketId} status changed to ${nextStatus}`, 'success');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    const newMsg: TicketMessage = {
      id: `msg-${Date.now()}`,
      sender: 'Admin',
      senderName: 'Operations Support Manager',
      content: replyText.trim(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const updatedMessages = [...selectedTicket.messages, newMsg];
    
    // Automatically set status to "In Progress" when replying, if currently "Open"
    const nextStatus = selectedTicket.status === 'Open' ? 'In Progress' : selectedTicket.status;

    onUpdateTicket(selectedTicket.id, {
      messages: updatedMessages,
      status: nextStatus
    });

    triggerToast('Administrative reply sent successfully.', 'success');
    setReplyText('');
  };

  // Priority color badges
  const priorityColors = {
    High: 'bg-rose-50 text-rose-700 border-rose-100',
    Medium: 'bg-amber-50 text-amber-700 border-amber-100',
    Low: 'bg-slate-50 text-slate-600 border-slate-100'
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Support Tickets</h1>
        <p className="text-sm text-slate-500 font-medium">Respond to user booking queries, coordinate delivery delays, and update ticket statuses.</p>
      </div>

      {/* Workspace: Side-by-Side Grid layout if a ticket is selected, else standard full width */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tickets List Table */}
        <div className={`${selectedTicketId ? 'lg:col-span-5' : 'lg:col-span-12'} bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300`}>
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-indigo-500" />
              <span>Incoming Tickets Queue ({tickets.length})</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                  <th className="py-3 px-5">Ticket ID</th>
                  <th className="py-3 px-5">Subject & Customer</th>
                  {!selectedTicketId && <th className="py-3 px-5 text-center">Date</th>}
                  <th className="py-3 px-5 text-center">Priority</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No active customer support tickets.
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => {
                    const isSelected = selectedTicketId === ticket.id;
                    return (
                      <tr 
                        key={ticket.id} 
                        onClick={() => setSelectedTicketId(ticket.id)}
                        className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                          isSelected ? 'bg-indigo-50/30' : ''
                        }`}
                      >
                        <td className="py-3 px-5">
                          <span className="font-extrabold text-slate-900">{ticket.id}</span>
                        </td>
                        <td className="py-3 px-5">
                          <div className="space-y-0.5 truncate max-w-[150px] sm:max-w-[200px]">
                            <p className="font-bold text-slate-800 truncate">{ticket.subject}</p>
                            <p className="text-[10px] text-slate-400 font-semibold truncate">{ticket.customerName}</p>
                          </div>
                        </td>
                        {!selectedTicketId && (
                          <td className="py-3 px-5 text-center font-semibold text-slate-500">
                            {ticket.date}
                          </td>
                        )}
                        <td className="py-3 px-5 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${priorityColors[ticket.priority]}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                          {/* Inline Status Dropdown Changer */}
                          <select
                            value={ticket.status}
                            onChange={(e) => handleStatusChange(ticket.id, e.target.value as any)}
                            className="text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1 rounded focus:outline-none cursor-pointer"
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </td>
                        <td className="py-3 px-5 text-right">
                          <ChevronRight className={`w-4 h-4 text-slate-400 ml-auto transition-transform ${isSelected ? 'translate-x-1 text-indigo-500' : ''}`} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Active Dialogue Chat Thread */}
        {selectedTicketId && selectedTicket && (
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[520px]">
            {/* Thread Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold">
                  {selectedTicket.customerName[0]}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{selectedTicket.subject}</h4>
                  <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                    Customer: <span className="text-slate-600 font-bold">{selectedTicket.customerName}</span> ({selectedTicket.customerEmail})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTicketId(null)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer min-h-[36px] min-w-[36px]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thread Conversation scroll area */}
            <div className="flex-1 p-5 overflow-y-auto bg-slate-50/50 space-y-4">
              {selectedTicket.messages.map((msg) => {
                const isAdmin = msg.sender === 'Admin';
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl p-4 shadow-sm border ${
                      isAdmin 
                        ? 'bg-indigo-600 text-white border-indigo-700 rounded-tr-none' 
                        : 'bg-white text-slate-800 border-slate-200/60 rounded-tl-none'
                    }`}>
                      <div className="flex justify-between items-center gap-4 mb-1.5 border-b pb-1 select-none"
                        style={{ borderColor: isAdmin ? 'rgba(255,255,255,0.15)' : '#f1f5f9' }}
                      >
                        <span className={`text-[9px] font-extrabold uppercase ${isAdmin ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {msg.senderName}
                        </span>
                        <span className={`text-[9px] ${isAdmin ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="text-xs font-semibold leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Thread Reply Input box */}
            <div className="p-4 border-t border-slate-100">
              <form onSubmit={handleSendReply} className="flex gap-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your official administrative support response..."
                  className="flex-1 h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="h-11 w-11 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white shadow-md shadow-indigo-600/15 cursor-pointer transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
