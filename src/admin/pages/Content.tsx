import React, { useState } from 'react';
import { 
  FileText, 
  HelpCircle, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Edit, 
  Trash2, 
  X, 
  Save, 
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import { FAQItem, AboutSection } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';

interface ContentProps {
  faqs: FAQItem[];
  aboutSections: AboutSection[];
  onUpdateFAQs: (faqs: FAQItem[]) => void;
  onUpdateAboutSections: (sections: AboutSection[]) => void;
  triggerToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const Content: React.FC<ContentProps> = ({
  faqs,
  aboutSections,
  onUpdateFAQs,
  onUpdateAboutSections,
  triggerToast
}) => {
  const [subTab, setSubTab] = useState<'faqs' | 'about'>('faqs');

  // FAQ Modal states
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqError, setFaqError] = useState('');
  const [isNewFAQ, setIsNewFAQ] = useState(false);

  // About Page Forms State (Loaded from current database state)
  const [aboutState, setAboutState] = useState<AboutSection[]>(aboutSections);

  // Confirmation modal state
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

  // Reorder FAQ logic (move items in list up or down)
  const handleMoveFAQ = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= faqs.length) return;

    const updatedFAQs = [...faqs];
    // Swap items
    const temp = updatedFAQs[index];
    updatedFAQs[index] = updatedFAQs[nextIndex];
    updatedFAQs[nextIndex] = temp;

    // Recalculate order numbers
    const finalFAQs = updatedFAQs.map((faq, i) => ({
      ...faq,
      order: i + 1
    }));

    onUpdateFAQs(finalFAQs);
    triggerToast('FAQs reordered successfully.', 'success');
  };

  const handleOpenFAQModal = (faq: FAQItem | null) => {
    if (faq) {
      setEditingFAQ(faq);
      setFaqQuestion(faq.question);
      setFaqAnswer(faq.answer);
      setIsNewFAQ(false);
    } else {
      setEditingFAQ({ id: '', question: '', answer: '', order: faqs.length + 1 });
      setFaqQuestion('');
      setFaqAnswer('');
      setIsNewFAQ(true);
    }
    setFaqError('');
  };

  const handleSaveFAQ = (e: React.FormEvent) => {
    e.preventDefault();
    setFaqError('');

    if (!faqQuestion.trim()) {
      setFaqError('FAQ Question is required.');
      return;
    }
    if (!faqAnswer.trim()) {
      setFaqError('FAQ Answer detail is required.');
      return;
    }

    if (isNewFAQ) {
      const newFaq: FAQItem = {
        id: `faq-${Date.now()}`,
        question: faqQuestion.trim(),
        answer: faqAnswer.trim(),
        order: faqs.length + 1
      };
      onUpdateFAQs([...faqs, newFaq]);
      triggerToast('FAQ added successfully.', 'success');
    } else if (editingFAQ) {
      const updated = faqs.map((f) => 
        f.id === editingFAQ.id 
          ? { ...f, question: faqQuestion.trim(), answer: faqAnswer.trim() } 
          : f
      );
      onUpdateFAQs(updated);
      triggerToast('FAQ updated successfully.', 'success');
    }

    setEditingFAQ(null);
  };

  const handleDeleteFAQ = (faq: FAQItem) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete FAQ Entry?',
      message: `Are you sure you want to permanently delete the FAQ: "${faq.question}"? This will immediately remove it from the customer Help section.`,
      action: () => {
        const remaining = faqs.filter((f) => f.id !== faq.id).map((f, index) => ({
          ...f,
          order: index + 1
        }));
        onUpdateFAQs(remaining);
        triggerToast('FAQ deleted successfully.', 'success');
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  // About Section Field Updates
  const handleAboutFieldChange = (id: string, field: 'title' | 'content', value: string) => {
    setAboutState(prev => prev.map(sec => 
      sec.id === id ? { ...sec, [field]: value } : sec
    ));
  };

  // Save About page with explicit confirmation
  const handleSaveAboutPage = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Publish About Page Edits?',
      message: 'Are you sure you want to save and publish these changes? They will immediately overwrite the current content displayed on the public marketing page.',
      action: () => {
        onUpdateAboutSections(aboutState);
        triggerToast('About Page sections published successfully.', 'success');
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Public Content Management</h1>
          <p className="text-sm text-slate-500 font-medium">Edit marketing copies, adjust FAQs, and configure displayed static section details.</p>
        </div>
        {/* Navigation Tabs */}
        <div className="bg-slate-200/60 p-1 rounded-xl flex items-center select-none self-start sm:self-center">
          <button
            onClick={() => setSubTab('faqs')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subTab === 'faqs' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            FAQs Manager
          </button>
          <button
            onClick={() => setSubTab('about')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subTab === 'about' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            About Page Sections
          </button>
        </div>
      </div>

      {subTab === 'faqs' ? (
        /* FAQS SECTION */
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">FAQ Help Inventory ({faqs.length})</h3>
              <p className="text-xs text-slate-400">Add, edit, or arrange the sequence of domestic freight FAQs.</p>
            </div>
            <button
              onClick={() => handleOpenFAQModal(null)}
              className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-colors text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/15 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add FAQ</span>
            </button>
          </div>

          {/* Table representing FAQs list */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {faqs.map((faq, index) => (
                <div key={faq.id} className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:bg-slate-50/20 transition-colors">
                  {/* Sequence Order Badge and Reordering */}
                  <div className="flex sm:flex-col items-center gap-2 self-start select-none bg-slate-100/50 p-2 rounded-xl border border-slate-200/40">
                    <button
                      disabled={index === 0}
                      onClick={() => handleMoveFAQ(index, 'up')}
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-600 px-1">{index + 1}</span>
                    <button
                      disabled={index === faqs.length - 1}
                      onClick={() => handleMoveFAQ(index, 'down')}
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* FAQ Content Details */}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <h4 className="text-sm font-extrabold text-slate-900 leading-tight flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <span>{faq.question}</span>
                    </h4>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-2xl pl-5 truncate sm:whitespace-normal">
                      {faq.answer}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      onClick={() => handleOpenFAQModal(faq)}
                      className="p-2 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors min-h-[38px] min-w-[38px] cursor-pointer"
                      title="Edit FAQ"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFAQ(faq)}
                      className="p-2 border border-slate-200 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors min-h-[38px] min-w-[38px] cursor-pointer"
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ABOUT PAGE SECTIONS */
        <div className="space-y-6">
          {aboutState.map((section) => (
            <div key={section.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2 py-1 rounded uppercase select-none">
                  Section ID: {section.id}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Section Headline Title</label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleAboutFieldChange(section.id, 'title', e.target.value)}
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Section Body Content Paragraph</label>
                  <textarea
                    value={section.content}
                    onChange={(e) => handleAboutFieldChange(section.id, 'content', e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 leading-relaxed focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Action Trigger Row */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSaveAboutPage}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-all text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-indigo-600/15 cursor-pointer min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              <span>Publish About Section Updates</span>
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit FAQ Modal Drawer */}
      {editingFAQ && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingFAQ(null)} />
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 z-10 flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-none">
                  {isNewFAQ ? 'Add New FAQ Entry' : 'Edit FAQ Entry'}
                </h3>
                <span className="text-xs text-slate-400 mt-1 block">Help center support inventory</span>
              </div>
              <button 
                onClick={() => setEditingFAQ(null)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors min-h-[36px] min-w-[36px] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveFAQ} className="p-6 space-y-4">
              {faqError && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
                  <AlertCircle className="w-4.5 h-4.5 text-red-500 flex-shrink-0" />
                  <span>{faqError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Question Title</label>
                <input
                  type="text"
                  placeholder="e.g. Do you support domestic liquid cargo?"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Answer Explanation Detail</label>
                <textarea
                  placeholder="Provide a detailed support answer explanation..."
                  rows={4}
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 leading-relaxed focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingFAQ(null)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 min-h-[40px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/15 min-h-[40px] cursor-pointer"
                >
                  Save FAQ Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal trigger container */}
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
