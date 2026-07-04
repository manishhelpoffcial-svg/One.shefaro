import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';

export const Pricing: React.FC = () => {
  const { navigate } = useNavigation();
  const [pickupPincode, setPickupPincode] = useState('');
  const [deliveryPincode, setDeliveryPincode] = useState('');
  const [weight, setWeight] = useState('');
  const [size, setSize] = useState('Small (Document/Flyer)');
  const [estimate, setEstimate] = useState<number | null>(null);

  const calculateEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight) || 0;
    if (!pickupPincode || !deliveryPincode || w <= 0) {
      alert('Please enter valid pickup/delivery PIN codes and weight.');
      return;
    }

    // A real mock calculation formula
    const p1 = parseInt(pickupPincode) || 0;
    const p2 = parseInt(deliveryPincode) || 0;
    const pincodeDiff = Math.abs(p1 - p2);
    const distanceFactor = Math.min(Math.max((pincodeDiff % 1000) / 120, 1.1), 4.5);

    let sizeFactor = 1.0;
    if (size.includes('Medium')) sizeFactor = 1.3;
    if (size.includes('Large')) sizeFactor = 1.8;

    let baseRate = 50;
    if (w <= 0.5) baseRate = 50;
    else if (w <= 2) baseRate = 90;
    else if (w <= 5) baseRate = 180;
    else baseRate = 180 + (w - 5) * 35;

    const result = Math.round(baseRate * distanceFactor * sizeFactor);
    setEstimate(result);
  };

  return (
    <main className="pt-12 pb-stack-xl max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop space-y-stack-xl">
      {/* Hero Section */}
      <section className="text-center pt-16 md:pt-24 max-w-3xl mx-auto space-y-6">
        <h1 className="text-display-lg font-display-lg text-primary tracking-tight">Simple, transparent parcel pricing.</h1>
        <p className="text-body-lg font-body-lg text-on-surface-variant">Pricing based on parcel details, weight, and delivery distance with no hidden charges.</p>
      </section>

      {/* Pricing Calculator Section (Bento Layout) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
        {/* Calculator Form */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-[32px] p-8 md:p-12 shadow-level-2 border border-outline-variant/10 space-y-8">
          <h2 className="text-headline-md font-headline-md text-primary">Calculate Shipping Cost</h2>
          <form onSubmit={calculateEstimate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-label-md font-label-md text-on-surface-variant">Pickup PIN Code</label>
                <input 
                  className="w-full h-14 bg-[#F8FAFC] border-none rounded-lg px-4 text-body-md focus:ring-0 focus:bg-white focus:shadow-[0_4px_20px_0px_rgba(0,0,0,0.04)] focus:border-b-2 focus:border-b-primary transition-all outline-none" 
                  placeholder="e.g. 400001" 
                  type="text"
                  maxLength={6}
                  required
                  value={pickupPincode}
                  onChange={(e) => setPickupPincode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-label-md font-label-md text-on-surface-variant">Delivery PIN Code</label>
                <input 
                  className="w-full h-14 bg-[#F8FAFC] border-none rounded-lg px-4 text-body-md focus:ring-0 focus:bg-white focus:shadow-[0_4px_20px_0px_rgba(0,0,0,0.04)] focus:border-b-2 focus:border-b-primary transition-all outline-none" 
                  placeholder="e.g. 110001" 
                  type="text"
                  maxLength={6}
                  required
                  value={deliveryPincode}
                  onChange={(e) => setDeliveryPincode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-label-md font-label-md text-on-surface-variant">Weight (kg)</label>
                <input 
                  className="w-full h-14 bg-[#F8FAFC] border-none rounded-lg px-4 text-body-md focus:ring-0 focus:bg-white focus:shadow-[0_4px_20px_0px_rgba(0,0,0,0.04)] focus:border-b-2 focus:border-b-primary transition-all outline-none" 
                  placeholder="0.5" 
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-label-md font-label-md text-on-surface-variant">Parcel Size</label>
                <select 
                  className="w-full h-14 bg-[#F8FAFC] border-none rounded-lg px-4 text-body-md focus:ring-0 focus:bg-white focus:shadow-[0_4px_20px_0px_rgba(0,0,0,0.04)] focus:border-b-2 focus:border-b-primary transition-all outline-none cursor-pointer"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                >
                  <option>Small (Document/Flyer)</option>
                  <option>Medium (Shoebox size)</option>
                  <option>Large (Electronics/Apparel)</option>
                </select>
              </div>
            </div>
            <div className="pt-6 border-t border-surface-dim flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Estimated Price</p>
                <p className="text-headline-lg font-headline-lg text-primary">
                  {estimate !== null ? `₹${estimate}` : '₹ --'}
                </p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button 
                  type="submit"
                  className="flex-1 md:flex-none bg-primary text-on-primary h-14 px-8 rounded-full text-label-md font-label-md hover:bg-primary/90 transition-colors cursor-pointer font-semibold"
                >
                  Calculate
                </button>
                {estimate !== null && (
                  <button 
                    type="button"
                    onClick={() => navigate('signup')}
                    className="flex-1 md:flex-none bg-secondary text-on-secondary h-14 px-6 rounded-full text-label-md font-label-md hover:bg-opacity-90 transition-all cursor-pointer font-semibold shadow-level-1"
                  >
                    Book Now
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
        {/* Visual Anchor */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <img 
            className="w-full max-w-md object-contain rounded-[32px]" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoyTurnN5k2d2HOb2PQUBl4akxLvARhsALVFRNJu81cobd2mAbZse8M3HPL4qxTrvHhIuAo85JTGHMC0GPxK6Yrm4cxNWv6eEhufCavLJmKCnpfeuCyotza5qhJsquxvs8gCzxhwzXeQzrGBa60RqKyx2u7aYhNewzi0E1HTjNbqTziEWwsf7mso7JCz0EgtAiWHTGKLA277dtqXIkqOzzNoUtXMDbdHXl_oi1Ri6fVOdJwQAMteZgcN399OlnNViRp7eOwvX7f3F7"
            alt="Approachable logistics solutions"
          />
        </div>
      </section>

      {/* How Pricing Works */}
      <section className="space-y-12">
        <div className="text-center">
          <h2 className="text-headline-lg text-headline-lg text-primary">How Pricing Works</h2>
          <p className="text-body-lg text-body-lg text-on-surface-variant mt-4">Three simple factors determine your shipping cost.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-level-1 border border-outline-variant/10 flex flex-col items-start space-y-4">
            <span className="material-symbols-outlined text-4xl text-secondary">distance</span>
            <h3 className="text-headline-md font-headline-md text-primary">Distance</h3>
            <p className="text-body-md font-body-md text-on-surface-variant">Calculated automatically between your pickup and delivery PIN codes.</p>
          </div>
          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-level-1 border border-outline-variant/10 flex flex-col items-start space-y-4">
            <span className="material-symbols-outlined text-4xl text-secondary">scale</span>
            <h3 className="text-headline-md font-headline-md text-primary">Weight</h3>
            <p className="text-body-md font-body-md text-on-surface-variant">The actual weight of your parcel determines the base rate tier.</p>
          </div>
          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-level-1 border border-outline-variant/10 flex flex-col items-start space-y-4">
            <span className="material-symbols-outlined text-4xl text-secondary">package_2</span>
            <h3 className="text-headline-md font-headline-md text-primary">Parcel Size</h3>
            <p className="text-body-md font-body-md text-on-surface-variant">Volumetric weight is considered for large but light packages.</p>
          </div>
        </div>
      </section>

      {/* Examples & Image Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-stack-md items-center">
        <div>
          <img 
            className="w-full rounded-[32px] shadow-level-1" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUS7jtvzX25X5xTs1HlVuLr4dPhLm1oHK4glSMplNjWTVfp1wElftbO6S4eGAFrJY6BgACQ1DY8ofV6PYOv0e4OqboTLnZIGWd8BBxV6G77UaeABdpxfEhiS56_CIrExwfeghwU2sMTVGbYM8DVfm27rW0VbrC09EfSVnmnpFvU1R_wk7p9C6jO20vN2s7q8HN6tC5gn30BF6SKHYaJiqZ0HesH-Gv9m-_HEAn2OQz3FN7amyojLeuuk9P1Frj7JbQSZys5WT21CQB"
            alt="Parcel shipping examples"
          />
        </div>
        <div className="space-y-8">
          <h2 className="text-headline-lg font-headline-lg text-primary">Pricing Examples</h2>
          <div className="space-y-4">
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-level-1 flex items-center justify-between border border-outline-variant/10">
              <div>
                <h4 className="text-label-md font-label-md text-primary">Small Parcel</h4>
                <p className="text-label-sm font-label-sm text-on-surface-variant mt-1">Up to 0.5 kg</p>
              </div>
              <p className="text-headline-md font-headline-md text-primary">Starts at ₹50</p>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-level-1 flex items-center justify-between border border-outline-variant/10">
              <div>
                <h4 className="text-label-md font-label-md text-primary">Medium Parcel</h4>
                <p className="text-label-sm font-label-sm text-on-surface-variant mt-1">0.5 kg to 2 kg</p>
              </div>
              <p className="text-headline-md font-headline-md text-primary">Starts at ₹90</p>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-level-1 flex items-center justify-between border border-outline-variant/10">
              <div>
                <h4 className="text-label-md font-label-md text-primary">Large Parcel</h4>
                <p className="text-label-sm font-label-sm text-on-surface-variant mt-1">2 kg to 5 kg</p>
              </div>
              <p className="text-headline-md font-headline-md text-primary">Starts at ₹180</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-inverse-surface rounded-[40px] p-12 md:p-16 text-center space-y-12">
        <h2 className="text-headline-lg font-headline-lg text-on-primary">Transparency First</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary">money_off</span>
            </div>
            <h3 className="text-headline-md font-headline-md text-on-primary">No hidden fees</h3>
            <p className="text-body-md font-body-md text-tertiary-fixed-dim">What you see on the calculator is what you pay. Fuel surcharges and standard taxes are included in the estimate.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary">check_circle</span>
            </div>
            <h3 className="text-headline-md font-headline-md text-on-primary">Clear pricing</h3>
            <p className="text-body-md font-body-md text-tertiary-fixed-dim">Always know your shipping cost before you confirm the booking. No surprises at pickup.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary">calculate</span>
            </div>
            <h3 className="text-headline-md font-headline-md text-on-primary">Easy calculation</h3>
            <p className="text-body-md font-body-md text-tertiary-fixed-dim">Our intelligent system instantly calculates the best route and most efficient pricing for your parcel.</p>
          </div>
        </div>
      </section>
    </main>
  );
};
