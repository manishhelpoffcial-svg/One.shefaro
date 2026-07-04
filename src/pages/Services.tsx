import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';

export const Services: React.FC = () => {
  const { navigate } = useNavigation();
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [weight, setWeight] = useState('');
  const [estimate, setEstimate] = useState<number | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight) || 0;
    if (!fromLocation || !toLocation || w <= 0) {
      alert('Please fill out all fields with valid information.');
      return;
    }
    // Calculate a mock price
    const base = w <= 0.5 ? 50 : w <= 2 ? 90 : w <= 5 ? 180 : 180 + (w - 5) * 35;
    const randomDistanceMultiplier = 1.2 + (Math.random() * 0.8);
    setEstimate(Math.round(base * randomDistanceMultiplier));
  };

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h1 className="text-display-lg font-display-lg text-on-surface">
            Ship one parcel.<br />
            No business account needed.
          </h1>
          <p className="text-body-lg font-body-lg text-on-surface-variant max-w-lg">
            The simplest way for individuals to send parcels across India. No contracts, no accounts, just easy shipping.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={() => navigate('signup')}
              className="bg-primary text-on-primary text-label-md font-label-md py-4 px-8 rounded-full shadow-md hover-lift inline-flex items-center justify-center cursor-pointer font-semibold"
            >
              Book Shipment
            </button>
            <button
              onClick={() => navigate('pricing')}
              className="bg-surface-container-high text-on-surface text-label-md font-label-md py-4 px-8 rounded-full hover:bg-surface-container-highest transition-colors inline-flex items-center justify-center cursor-pointer"
            >
              Check Pricing
            </button>
          </div>
          <div className="flex items-center gap-6 pt-8 text-label-sm font-label-sm text-on-surface-variant">
            <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[20px]">lock</span> Secure Payments</div>
            <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[20px]">location_on</span> Live Tracking</div>
            <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span> Fast Pickup</div>
          </div>
        </div>
        <div className="flex-1 relative">
          <img 
            alt="Shipping illustration" 
            className="w-full h-auto object-contain drop-shadow-xl" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzuET6yPmyZfa7zptMOdkVD-EXIDXBZUjM5RuCmcD9yNHs-JNCYVFdiwPc37Az3NrMoTW8Qe_sJCMeRQkEp5714x3B2a7WEqinxNQXII-mYK7lzTkMnJYm33AURSmVrk-MQ7CCo4FKO01oO9CCkamOrVkfLExa8k8twfSiSIPAYlJmwMsgt0mdAUXWP3DuJh3u0wwuKEB5Vkijkv6TziJoL8XvAvRwCFWe4HK4v1x4AVOuEPiGzlxnn6O_35sg-tPLL6OM6sgmMnnc"
          />
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-surface-container-low py-16">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <h2 className="text-headline-lg font-headline-lg text-on-surface">Simple shipping in three steps</h2>
            <div className="space-y-6 relative">
              {/* Connecting Line (Visual) */}
              <div className="hidden md:block absolute left-8 top-12 bottom-12 w-0.5 bg-outline-variant z-0"></div>
              <div className="relative z-10 flex items-start gap-6 bg-surface p-6 rounded-2xl shadow-level-1 hover-lift">
                <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center flex-shrink-0 text-headline-md font-headline-md font-bold">1</div>
                <div>
                  <h3 className="text-headline-md font-headline-md text-on-surface mb-2">Enter Details</h3>
                  <p className="text-body-md font-body-md text-on-surface-variant">Tell us where it's going and how big it is.</p>
                </div>
              </div>
              <div className="relative z-10 flex items-start gap-6 bg-surface p-6 rounded-2xl shadow-level-1 hover-lift">
                <div className="w-16 h-16 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center flex-shrink-0 text-headline-md font-headline-md font-bold">2</div>
                <div>
                  <h3 className="text-headline-md font-headline-md text-on-surface mb-2">Pay Online</h3>
                  <p className="text-body-md font-body-md text-on-surface-variant">Secure checkout with multiple payment options.</p>
                </div>
              </div>
              <div className="relative z-10 flex items-start gap-6 bg-surface p-6 rounded-2xl shadow-level-1 hover-lift">
                <div className="w-16 h-16 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center flex-shrink-0 text-headline-md font-headline-md font-bold">3</div>
                <div>
                  <h3 className="text-headline-md font-headline-md text-on-surface mb-2">Track Shipment</h3>
                  <p className="text-body-md font-body-md text-on-surface-variant">Follow your parcel's journey to its destination.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <img 
              alt="Mobile tracking illustration" 
              className="w-full max-w-md mx-auto object-contain drop-shadow-xl" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCAQ0_k7I9mTwYGtU27qLPzya8J9N8BmGEz_9MfmN6Wp1SHK62t8WPiA5p2sPQ3uuvn7UPT3P4hlro0PfoCmYgA8hIePrS92BRlscxcL3Z2y1nvapGSVUiJ9BSRyIcWujAlBUGbXfhA2zzsRVbmeIrTxpcOTnVuV3F8fxFvj7Oy3HzEYR9tpVWUmL_3iPy89jIN23Bc860WJBa0k90Nv0DIGVuQVDNWgbOMxsIYBWR8BFx3fqDEqJvlP763d7C3ts4Y-41X1XeJLh7"
            />
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16">
        <h2 className="text-headline-lg font-headline-lg text-center text-on-surface mb-12">Why people love one.shefaro</h2>
        <div className="flex flex-col-reverse md:flex-row items-center gap-12">
          <div className="flex-1">
            <img 
              alt="Global network illustration" 
              className="w-full object-contain drop-shadow-xl" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0HD7nfQY-WL9W9_jrWTDbZFP9EhwbfYz9M2Xqv8GW_mMssrCXJ8uRggrwaReVjOVfHUiI97GuzwProk3XmlXsMqWt0FqEVshB4ClF181kTFUefs6vMlqR0fSLwe7ghnUTSEd1jGJE-iRkeQElsg7VrNwgHAVYmok6J5MGWixfy0VLaBHHhfDWJGfmWM8RbBZ97yulqIqeVL45NFeW2067tRUK_tYPKTxiTClG5iv75mRx_Q0yq6YlBrcnzuucUrUv3rCCGgcHW70J"
            />
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-surface p-8 rounded-2xl shadow-level-1 hover-lift border border-outline-variant/10">
              <span className="material-symbols-outlined text-secondary mb-4 block text-3xl">touch_app</span>
              <h3 className="text-headline-md font-headline-md mb-2">Easy Booking</h3>
              <p className="text-body-md font-body-md text-on-surface-variant">Intuitive interface designed for quick and stress-free booking.</p>
            </div>
            <div className="bg-surface p-8 rounded-2xl shadow-level-1 hover-lift border border-outline-variant/10">
              <span className="material-symbols-outlined text-secondary mb-4 block text-3xl">explore</span>
              <h3 className="text-headline-md font-headline-md mb-2">Live Tracking</h3>
              <p className="text-body-md font-body-md text-on-surface-variant">Real-time updates so you always know where your parcel is.</p>
            </div>
            <div className="bg-surface p-8 rounded-2xl shadow-level-1 hover-lift border border-outline-variant/10">
              <span className="material-symbols-outlined text-secondary mb-4 block text-3xl">payments</span>
              <h3 className="text-headline-md font-headline-md mb-2">Transparent Pricing</h3>
              <p className="text-body-md font-body-md text-on-surface-variant">No hidden fees. See the exact cost before you confirm.</p>
            </div>
            <div className="bg-surface p-8 rounded-2xl shadow-level-1 hover-lift border border-outline-variant/10">
              <span className="material-symbols-outlined text-secondary mb-4 block text-3xl">support_agent</span>
              <h3 className="text-headline-md font-headline-md mb-2">Friendly Support</h3>
              <p className="text-body-md font-body-md text-on-surface-variant">Our team is ready to help if you ever need assistance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="bg-surface-container-low py-16">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 w-full max-w-md bg-surface p-8 rounded-3xl shadow-level-2">
            <h3 className="text-headline-md font-headline-md mb-6 text-on-surface">Quick Estimate</h3>
            <form onSubmit={handleCalculate} className="space-y-4">
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">From</label>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-4 text-body-md font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" 
                  placeholder="e.g. Mumbai" 
                  type="text"
                  required
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">To</label>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-4 text-body-md font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" 
                  placeholder="e.g. Delhi" 
                  type="text"
                  required
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">Weight (kg)</label>
                  <input 
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-4 text-body-md font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" 
                    placeholder="1.5" 
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div className="flex-1 flex items-end">
                  <button 
                    type="submit"
                    className="w-full bg-primary text-on-primary text-label-md font-label-md py-4 rounded-xl hover-lift cursor-pointer font-semibold h-[56px] flex items-center justify-center"
                  >
                    Calculate
                  </button>
                </div>
              </div>
            </form>

            {estimate !== null && (
              <div className="mt-6 p-4 bg-surface-container-high rounded-xl text-center border border-outline-variant/30 animate-fade-in">
                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Estimated Price</p>
                <p className="text-headline-lg font-bold text-primary mt-1">₹{estimate}</p>
                <button
                  onClick={() => navigate('signup')}
                  className="mt-3 w-full bg-primary text-on-primary text-label-sm font-semibold py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Book with this estimate
                </button>
              </div>
            )}
          </div>
          <div className="flex-1">
            <img 
              alt="Parcel weighing illustration" 
              className="w-full max-w-lg mx-auto object-contain drop-shadow-xl" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwyi9EK7OKu9PN9k2-ijFqdzBUfitJjVtojBEQM0ORPxGb56tJR3EVR04eOegs4hskEns9uQ_qIuUXX5JWrRxL_Sve0lMVsafpNog8yXqd7lSDlWzB0_MU343Cy_otksndYvkUMcxcCr9Yvu4AJPvCdpZaIt8gmbmaQeXNiCGjRGUanvnzOwlU4SVK6D-T7D4g_9b4ifZFu-pRHsRcj507rV95_GFhl2YnE1HMrYlHmRzcIcClamI3GCC0AEQUK8kus66NGDLUuCs6"
            />
          </div>
        </div>
      </section>
    </main>
  );
};
