import React, { useState, useEffect } from 'react';
import { Link, useNavigation } from '../context/NavigationContext';

export const Home: React.FC = () => {
  const { navigate } = useNavigation();
  const [fromPincode, setFromPincode] = useState('400001');
  const [toPincode, setToPincode] = useState('110001');
  const [weight, setWeight] = useState('2.5');
  const [estimatedPrice, setEstimatedPrice] = useState(145);

  // Live calculator effect
  useEffect(() => {
    const w = parseFloat(weight) || 0;
    if (w <= 0 || !fromPincode || !toPincode) {
      setEstimatedPrice(0);
      return;
    }

    // A simple mock calculation based on weight & pincode distance representation
    const pincodeDiff = Math.abs((parseInt(fromPincode) || 0) - (parseInt(toPincode) || 0));
    const distanceFactor = Math.min(Math.max((pincodeDiff % 1000) / 100, 1), 5); // distance multiplier

    let basePrice = 50; // base price
    if (w <= 0.5) {
      basePrice = 50;
    } else if (w <= 2) {
      basePrice = 90;
    } else if (w <= 5) {
      basePrice = 180;
    } else {
      basePrice = 180 + (w - 5) * 35;
    }

    const calculated = Math.round(basePrice * distanceFactor);
    setEstimatedPrice(calculated);
  }, [fromPincode, toPincode, weight]);

  return (
    <main className="pt-12 pb-16">
      {/* Hero Section */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack-md items-center">
          <div className="flex flex-col gap-stack-sm">
            <div className="inline-flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-full px-4 py-1.5 w-fit">
              <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
              <span className="font-label-sm text-label-sm text-on-surface">SHIPPING ACROSS INDIA</span>
            </div>
            <h1 className="font-display-lg text-headline-lg-mobile md:text-display-xl text-on-background">
              Send a parcel across India.<br />
              <span className="text-on-surface-variant">Simple, fast and hassle-free.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Whether it's a gift for family or important documents, we make domestic shipping effortless with doorstep pickup and live tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => navigate('signup')}
                className="inline-flex items-center justify-center bg-primary text-on-primary font-label-md text-label-md h-[56px] px-8 rounded-lg hover:bg-primary-container transition-colors shadow-level-2 cursor-pointer"
              >
                Book Shipment
              </button>
              <button
                onClick={() => navigate('pricing')}
                className="inline-flex items-center justify-center bg-[#F1F5F9] text-on-surface font-label-md text-label-md h-[56px] px-8 rounded-lg hover:bg-surface-container transition-colors shadow-level-1 cursor-pointer"
              >
                Check Pricing
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-outline-variant/30 mt-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-container" data-weight="fill">local_shipping</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Doorstep Pickup</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-container" data-weight="fill">share_location</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Live Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-container" data-weight="fill">verified_user</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-container" data-weight="fill">person</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">No Account Needed</span>
              </div>
            </div>
          </div>
          <div className="relative w-full h-[350px] sm:h-[450px] lg:h-[500px] rounded-3xl overflow-hidden bg-surface-container-lowest shadow-level-2 border border-outline-variant/10 flex items-center justify-center">
            <img 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida/AP1WRLuGqj2C3D6baxz3-hv1bm_yOmjgYLKj1Ua2rMzbKqKmfommyaT4WjIAQrQK_1TDr8YLPg7w6odBSFUIScuULJ76AFYZ83Zpye_riebQi9ZXlQPrkTV58g2r6xzxs1S53e19iseop22M_lqvii8F5vv-af0PnT3hir7nGyHiTqGitNyNrupqbBQF8TmxPHkM2YJB1_DJPK30_fw269jxHfzZIIZRVKGraiNV76opRf4OZZnuftK8Gt86-ko"
              alt="Parcel shipping across India"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-xl">
        <div className="text-center mb-stack-md">
          <h2 className="font-headline-lg text-headline-lg text-on-background mb-4">How It Works</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">Three simple steps to get your parcel moving across the country.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter relative">
          {/* Connectors (Desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-[20%] right-[20%] h-0.5 bg-outline-variant/30 -translate-y-1/2 z-0"></div>
          {/* Card 1 */}
          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-level-1 relative z-10 border border-outline-variant/10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-surface-container flex items-center justify-center rounded-2xl mb-6 text-secondary-container shadow-sm">
              <span className="material-symbols-outlined text-3xl">edit_document</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-3">Enter Details</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Provide pickup and delivery addresses along with basic parcel information.</p>
          </div>
          {/* Card 2 */}
          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-level-1 relative z-10 border border-outline-variant/10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-surface-container flex items-center justify-center rounded-2xl mb-6 text-secondary-container shadow-sm">
              <span className="material-symbols-outlined text-3xl">credit_card</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-3">Pay Securely Online</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Review the estimated cost and securely complete your payment.</p>
          </div>
          {/* Card 3 */}
          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-level-1 relative z-10 border border-outline-variant/10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-surface-container flex items-center justify-center rounded-2xl mb-6 text-secondary-container shadow-sm">
              <span className="material-symbols-outlined text-3xl">map</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-3">Track Your Parcel</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Monitor your shipment's journey in real-time until it reaches its destination.</p>
          </div>
        </div>
        <div className="mt-stack-md w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-level-1 bg-surface-container-lowest border border-outline-variant/10">
          <img 
            className="w-full h-auto object-cover" 
            src="https://lh3.googleusercontent.com/aida/AP1WRLscgeeiB0jjvCkvyG9Bcq-IagGYZXnWr8TPb0hKVpUSnInIpTatwU0GVP1AhX6pJLksy2NTItUp_HIN4g2uXN3lCg4klaqW3TsM6Gd3ziqpbMvQqqJGTOjtDwS-p7zLjS7waxuqbX8nFtB6D8Zli2NYcccUCQXsFjwapqUx_IrHf3pqKhvr4KGMHMY-zLPkI4Q1Hifl-dxfjOaZLZyDbH4vPtIua9aMPEt2PUTu6rQlxpIp8pF-Yvd6sGNk"
            alt="Seamless shipping across India"
          />
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="bg-surface-container-low py-stack-xl">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack-md items-center">
            <div className="order-2 lg:order-1 relative w-full h-[350px] sm:h-[450px] lg:h-[500px] rounded-3xl overflow-hidden bg-surface-container-lowest shadow-level-2 border border-outline-variant/10">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida/AP1WRLuN3PYzXDqIxktNt3dyiuzddHRitSSCNxyxLpc1y81T_zIgTW-cHe3c8XmaDflFY2Jhy3VsCjy_0xSGpd7FNciHt3_kF-4A4VmO90NlMYSYq3nrrMdVYoGrBllffZjfZrCwNx_pgKREXtxE7znyaJRIsFyFeH0Jx8fL0OP_65eYmCyJVkk3okFAV53cyBi0Z_OThM10oWXjCBXTeEEt0RRfq6bRV3MaxOpIu36-_Pfv6d6shdcA_pJCGn0H"
                alt="Secure, direct shipping"
              />
            </div>
            <div className="order-1 lg:order-2 flex flex-col gap-8">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-background mb-4">Why Choose one.shefaro</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant">Designed for individuals who need reliable shipping without the complexity of business accounts.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-level-1 border border-outline-variant/10">
                  <span className="material-symbols-outlined text-secondary-container mb-4 text-2xl">mouse</span>
                  <h4 className="font-label-md text-label-md text-on-surface mb-2 text-lg">Easy Online Booking</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">Schedule a pickup in minutes from your phone or computer.</p>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-level-1 border border-outline-variant/10">
                  <span className="material-symbols-outlined text-secondary-container mb-4 text-2xl">location_on</span>
                  <h4 className="font-label-md text-label-md text-on-surface mb-2 text-lg">Real-Time Tracking</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">Know exactly where your parcel is at every step of the journey.</p>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-level-1 border border-outline-variant/10">
                  <span className="material-symbols-outlined text-secondary-container mb-4 text-2xl">currency_rupee</span>
                  <h4 className="font-label-md text-label-md text-on-surface mb-2 text-lg">Transparent Pricing</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">No hidden fees. See the estimated cost before you book.</p>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-level-1 border border-outline-variant/10">
                  <span className="material-symbols-outlined text-secondary-container mb-4 text-2xl">support_agent</span>
                  <h4 className="font-label-md text-label-md text-on-surface mb-2 text-lg">Dedicated Support</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">Our team is here to help if you have any questions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack-md items-center">
          <div className="flex flex-col gap-6">
            <h2 className="font-headline-lg text-headline-lg text-on-background">Clear, upfront pricing.</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Get an instant estimate for your shipment. No surprises.</p>
            <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-level-2 border border-outline-variant/10 mt-4">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2">From PIN Code</label>
                    <div className="h-[56px] bg-[#F8FAFC] rounded-lg px-4 flex items-center border border-transparent focus-within:bg-surface-container-lowest focus-within:border-primary focus-within:shadow-level-1 transition-all">
                      <input 
                        className="bg-transparent border-none w-full font-body-md text-on-surface focus:ring-0 p-0 outline-none" 
                        placeholder="e.g. 400001" 
                        type="text" 
                        maxLength={6}
                        value={fromPincode}
                        onChange={(e) => setFromPincode(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2">To PIN Code</label>
                    <div className="h-[56px] bg-[#F8FAFC] rounded-lg px-4 flex items-center border border-transparent focus-within:bg-surface-container-lowest focus-within:border-primary focus-within:shadow-level-1 transition-all">
                      <input 
                        className="bg-transparent border-none w-full font-body-md text-on-surface focus:ring-0 p-0 outline-none" 
                        placeholder="e.g. 110001" 
                        type="text" 
                        maxLength={6}
                        value={toPincode}
                        onChange={(e) => setToPincode(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2">Approximate Weight (kg)</label>
                  <div className="h-[56px] bg-[#F8FAFC] rounded-lg px-4 flex items-center border border-transparent focus-within:bg-surface-container-lowest focus-within:border-primary focus-within:shadow-level-1 transition-all">
                    <input 
                      className="bg-transparent border-none w-full font-body-md text-on-surface focus:ring-0 p-0 outline-none" 
                      type="number" 
                      step="0.1"
                      min="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                </div>
                <div className="bg-surface-container-low p-6 rounded-2xl flex justify-between items-center mt-6 border border-outline-variant/20">
                  <span className="font-headline-md text-headline-md text-on-surface">Estimated Price</span>
                  <span className="font-display-lg text-display-lg text-primary">₹{estimatedPrice}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="relative w-full h-[350px] sm:h-[450px] lg:h-[500px] rounded-3xl overflow-hidden bg-surface-container-lowest shadow-level-1 border border-outline-variant/10 flex items-center justify-center">
            <img 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida/AP1WRLuEWgndRtuWzY0_uM-OVuUN2j_pMGZQnni2O4lJlcBWMow2tGg_mYIxzltGEXe6j8Iz8EIPzRHZfh2E1zh_Vt79MCb6N1n-LAw57xVNeYcO8UU0GwL8qWuxjnK2o8DKCwr17aCGwAB4MmfZq-SA8LZHhaUxgDbfYkJQy40lTZ2L6r3KTJRCXyeYvRZcmhrJTWUnVl038maLShZrOW9E3wOoxYBINcli3N2Rlc23WMEYIkxIL7JbSrkrJ6rS"
              alt="Live pricing lookup illustration"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-md">
        <div className="bg-inverse-surface text-inverse-on-surface rounded-3xl p-12 md:p-20 text-center shadow-level-2 relative overflow-hidden">
          {/* Abstract decorative element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl -ml-32 -mb-32"></div>
          <div className="relative z-10">
            <h2 className="font-display-lg text-headline-lg md:text-display-lg text-on-error mb-6">Ready to send your parcel?</h2>
            <p className="font-body-lg text-body-lg text-inverse-primary max-w-2xl mx-auto mb-10">Book your shipment today and experience hassle-free delivery across India.</p>
            <button
              onClick={() => navigate('signup')}
              className="inline-flex items-center justify-center bg-on-error text-tertiary font-label-md text-label-md h-[56px] px-10 rounded-lg hover:bg-surface-container transition-colors shadow-level-1 text-lg cursor-pointer font-bold"
            >
              Book Your Shipment
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
