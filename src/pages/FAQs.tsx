import React, { useState } from 'react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export const FAQs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Topics');
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});

  const categories = ['All Topics', 'Booking', 'Tracking', 'Payments', 'Account'];

  const faqData: FAQItem[] = [
    {
      id: 1,
      category: 'Booking',
      question: 'How long does standard domestic delivery take?',
      answer: 'Standard delivery within major metropolitan areas typically takes 2-3 business days. For remote or rural locations, please allow 4-6 business days. You can always track your parcel in real-time using your waybill number.'
    },
    {
      id: 2,
      category: 'Tracking',
      question: 'Can I change the delivery address after shipping?',
      answer: 'Yes, address modifications are possible before the package reaches the final destination hub. Please log into your account, select the active shipment, and choose \'Modify Destination\'. Additional routing fees may apply depending on the new distance.'
    },
    {
      id: 3,
      category: 'Booking',
      question: 'What are the restricted items for domestic shipping?',
      answer: 'We strictly prohibit the transport of hazardous materials, explosives, perishables requiring refrigeration, and illegal substances. For a comprehensive list, please review our Terms of Service document or contact support prior to booking.'
    },
    {
      id: 4,
      category: 'Payments',
      question: 'How do I claim a refund for a delayed shipment?',
      answer: 'Refund requests for express services that failed to meet the delivery guarantee must be submitted within 7 days of delivery. Navigate to your Account Dashboard, select \'Claim Support\', and provide the tracking ID.'
    },
    {
      id: 5,
      category: 'Account',
      question: 'Do I need a business GSTIN account to ship parcels?',
      answer: 'No, one.shefaro is custom-built for individual citizens. You can send individual gifts, documents, personal parcels, and household items without any business licensing or commercial GSTIN registration.'
    },
    {
      id: 6,
      category: 'Payments',
      question: 'What online payment methods do you accept?',
      answer: 'We accept all major Indian payment gateways, including UPI (Google Pay, PhonePe, Paytm), Net Banking from all major Indian banks, Debit and Credit Cards (Visa, Mastercard, RuPay), and popular mobile wallets.'
    }
  ];

  const toggleAccordion = (id: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredFAQs = faqData.filter((item) => {
    const matchesCategory = selectedCategory === 'All Topics' || item.category === selectedCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="flex-grow flex flex-col items-center w-full px-margin-mobile md:px-margin-desktop py-stack-lg max-w-container-max mx-auto gap-stack-xl">
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center text-center gap-stack-md mt-stack-md">
        <h1 className="font-display-lg text-display-lg text-primary max-w-3xl">Frequently Asked Questions</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Find quick answers to your queries about shipping, tracking, and account management.</p>
        <div className="w-full max-w-2xl relative mt-4">
          <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input 
            className="w-full h-14 pl-14 pr-6 rounded-2xl bg-surface-bright shadow-level-1 border-none focus:ring-1 focus:ring-primary focus:outline-none focus:shadow-level-2 transition-all font-body-md text-body-md text-on-surface placeholder:text-outline-variant" 
            placeholder="Search for help..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Image Break */}
      <section className="w-full flex justify-center items-center">
        <div className="max-w-4xl w-full rounded-3xl overflow-hidden shadow-level-2 bg-surface-container-lowest p-8 flex flex-col md:flex-row items-center gap-8 relative border border-outline-variant/10">
          <img 
            alt="How can we help?" 
            className="w-full md:w-1/2 rounded-2xl object-cover h-64 md:h-80 shadow-level-1" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuANr62568PCzSMXCUZlJAoJ3fasQ7Cgq38ZquPzqc89MmzGtntHYTg3BW4OMQ_Xpqoms8vON8N2UWGNtLG0D7c8EZrQzha2I4ai4RIE_PtWFsD_mUWU73FL32ZHBw4f-DvbRI1u-PQQHlCjScqgQwLB44MYV4lX2i5DdJKWqRwQEXfi3GyETjpT6swnfri8o3jJXtaYve75bXengxjqhz3GMOwC8oKxnmEQ3ZiDcfW96CnhKgLVOJV3Vr7l9FJRk1aH4EqKW_6t_ovn"
          />
          <div className="flex flex-col gap-4 text-left z-10 md:w-1/2">
            <h2 className="font-headline-lg text-headline-lg text-primary">How can we help you today?</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Browse our categorized topics below or use the search bar to find exact solutions for your domestic shipments.</p>
          </div>
        </div>
      </section>

      {/* FAQ Categories & Accordions */}
      <section className="w-full max-w-4xl flex flex-col gap-stack-md">
        {/* Category Chips */}
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full border transition-all cursor-pointer font-label-sm text-label-sm ${
                selectedCategory === cat
                  ? 'border-primary bg-primary text-on-primary shadow-level-1 font-bold'
                  : 'border-outline-variant bg-surface-bright text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="flex flex-col gap-4 w-full min-h-[250px]">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => {
              const isOpen = !!openItems[faq.id];
              return (
                <div 
                  key={faq.id} 
                  className={`accordion-item bg-surface-container-lowest rounded-2xl shadow-level-1 overflow-hidden border border-outline-variant/10 ${isOpen ? 'active' : ''}`}
                >
                  <button 
                    className="w-full px-8 py-6 flex justify-between items-center text-left focus:outline-none cursor-pointer"
                    onClick={() => toggleAccordion(faq.id)}
                  >
                    <span className="font-headline-md text-headline-md text-primary text-xl font-semibold pr-4">{faq.question}</span>
                    <span className="material-symbols-outlined icon-toggle text-primary flex-shrink-0">
                      {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  <div className="accordion-content px-8 pb-6">
                    <p className="font-body-md text-body-md text-on-surface-variant border-t border-surface-variant pt-4">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
              <p className="font-body-md">No FAQ entries match your search or filters.</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('All Topics'); }}
                className="mt-4 text-secondary hover:underline text-label-md font-semibold cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Still Need Help Section */}
      <section className="w-full max-w-5xl">
        <div className="bg-surface-bright rounded-3xl shadow-level-2 p-12 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden border border-surface-variant">
          <div className="flex flex-col gap-6 z-10 max-w-md">
            <h3 className="font-headline-lg text-headline-lg text-primary">Still need help?</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Our support team is available 24/7 to assist you with complex issues or specific inquiries.</p>
            <div className="flex flex-wrap gap-4 mt-2">
              <button 
                onClick={() => alert('Support tickets can be submitted by registered users. Please log in or sign up.')}
                className="bg-primary text-on-primary px-8 py-4 rounded-xl font-label-md text-label-md flex items-center gap-2 hover:bg-opacity-90 transition-opacity cursor-pointer font-semibold"
              >
                <span className="material-symbols-outlined">headset_mic</span>
                Contact Support
              </button>
              <button 
                onClick={() => alert('Live Chat starting... Connect with our India-based parcel assistant.')}
                className="bg-surface-container-low text-primary px-6 py-4 rounded-xl font-label-md text-label-md flex items-center gap-2 hover:bg-surface-variant transition-colors border border-outline-variant cursor-pointer font-semibold"
              >
                <span className="material-symbols-outlined">chat</span>
                Live Chat
              </button>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex justify-end z-10">
            <img 
              alt="Support Agent" 
              className="rounded-2xl object-cover h-64 md:h-auto shadow-level-1 max-w-full" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKGSPRTUv6G9Y7KjbC68sN4Fe-El1-RykRY_ncBMomU2qn6R_Szm8M4Qr6SnVHtXxmXImWyGr5c7bcQpbcvUROQAl1YH4BDTADcW3E4X0SNfsOEhS5Eg8d6WpMKQnDaViN-d2csypT8-wIVebW2bOyH-9YbVQSm_RARb2Dd9iHk6wHc8CD8oTZzQ8HXreV5DNPqRbAoYgijo1zTvvLcIeI6zqiGjkXEc5IHpcnyQZzaf1QytoiUQJk3oY4IPdFkDufFu5tDaMmgwSm"
            />
          </div>
        </div>
      </section>
    </main>
  );
};
