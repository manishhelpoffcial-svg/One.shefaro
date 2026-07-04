import React from 'react';
import { useNavigation } from '../context/NavigationContext';

export const About: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop pt-12 md:pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-center">
          <div className="pr-0 md:pr-12 space-y-6">
            <h1 className="font-display-xl text-headline-lg-mobile md:text-display-xl text-on-surface mb-stack-sm">
              We wanted parcel shipping to feel simple.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-stack-md">
              one.shefaro was built for individuals who want to send parcels without hassle. No business accounts, no complex forms—just straightforward shipping for everyone.
            </p>
          </div>
          <div className="relative">
            <img 
              className="w-full h-auto rounded-3xl shadow-level-2 object-cover aspect-[4/3]" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQEpeHQPJMg8yb2CaVFpa52PkKjmR0niajZvDn8AmGiF5g84dksrfQeJgO_DuFD8_V3Xs1SSUjRKiXLUox4Lx9M0DiJB1bNtqwMsr1tmMyIyAS13BPDDAHLEbyiLXLfnxkRi4WHx6mT1LcPMcKpp80dGpPtM4NyXUq5jrlWisbADZ8hYL8l1HG9GDwd0w-A1T-d_Pw8dMCiZU-g-VVp7ls80SDEmY2HSB22KNnkkHc5Ll6IUS3vUXbQhDDwRI0cPUQhYwvPt1kSTv_"
              alt="Parcel shipping feels simple"
            />
          </div>
        </div>
      </section>

      {/* Mission & Values Section (Bento Grid Style) */}
      <section className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {/* Card 1: Simplicity */}
          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-level-1 flex flex-col h-full border border-surface-dim">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-secondary text-2xl">sentiment_satisfied</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4 font-semibold">Simplicity</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-auto">Everything we do is designed to be easy to understand.</p>
          </div>
          {/* Card 2: Trust */}
          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-level-1 flex flex-col h-full border border-surface-dim">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-secondary text-2xl">verified_user</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4 font-semibold">Trust</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-auto">Your parcels are handled with care by our dedicated team.</p>
          </div>
          {/* Card 3: Speed */}
          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-level-1 flex flex-col h-full border border-surface-dim">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-secondary text-2xl">local_shipping</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4 font-semibold">Speed</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-auto">Fast domestic delivery that respects your time.</p>
          </div>
          {/* Card 4: Fair Pricing */}
          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-level-1 flex flex-col h-full border border-surface-dim">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-secondary text-2xl">payments</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4 font-semibold">Fair Pricing</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-auto">Transparent costs with no hidden fees, ever.</p>
          </div>
        </div>
      </section>

      {/* Why We Built one.shefaro Section */}
      <section className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <div className="bg-surface-container-low rounded-[40px] p-8 md:p-16 shadow-level-1 flex flex-col md:flex-row items-center gap-12 md:gap-16 border border-outline-variant/15">
          <div className="md:w-1/2 space-y-6">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-stack-sm font-bold">Why we built one.shefaro</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              We saw that shipping a simple package across the country often felt like a chore reserved for businesses. It shouldn't be. We built one.shefaro to democratize logistics—to create a service so seamless and transparent that sending a gift to a friend or returning an item feels effortless. It's shipping, stripped of complexity and infused with warmth.
            </p>
          </div>
          <div className="md:w-1/2">
            <img 
              className="w-full h-auto rounded-3xl shadow-level-2 object-cover aspect-[4/3]" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPeI5X_5nBCTJjZ_pha7tTgxTTWVOC6UgDCHFMKKgJPT2e5Il0MF8iypGAZ-5ccJuSJ03L__Ba_Em9NLZxFwSah5cZZ20vs0MYJwRO5aZbdUWnuKF-fHGtyUrxOzCsRL-0z5KoY4kI1Szpj5SEFBt4rYCQ53njfwImMda4ikOlBf9vAF754s3WJItspxdfFopmkuUwaFO1iQ8YCB7MqWEkxKa04qEzzoXgINHjVJTA223fJQvyChekCLpcb4IDeOHtgIsEPdJBnbc1"
              alt="Approachable logistics mission"
            />
          </div>
        </div>
      </section>

      {/* One Family Section */}
      <section className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <div className="text-center mb-10">
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">One Family, Two Solutions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter relative">
          {/* Connector Line (Visual only for larger screens) */}
          <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 border-t-2 border-dashed border-outline-variant z-0"></div>
          {/* Individual Card */}
          <div className="bg-surface-container-lowest p-10 rounded-3xl shadow-level-2 z-10 border border-surface-dim relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-surface-variant rounded-bl-full opacity-50"></div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4 font-bold">one.shefaro</h3>
            <p className="font-label-md text-label-md text-secondary mb-6 tracking-widest uppercase font-semibold">For Individuals</p>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Simple, friendly, and designed for occasional shippers. No account needed, just print your label and drop it off.
            </p>
          </div>
          {/* Business Card */}
          <div className="bg-surface-container p-10 rounded-3xl shadow-level-1 z-10 border border-surface-dim relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-surface-dim rounded-tl-full opacity-50"></div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4 font-bold">Shefaro</h3>
            <p className="font-label-md text-label-md text-on-surface-variant mb-6 tracking-widest uppercase font-semibold">For Business</p>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Professional logistics for larger volumes. API integration, bulk tracking, and dedicated account management.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-center">
          <div className="pl-0 md:pl-12 order-2 md:order-1">
            <img 
              className="w-full h-auto rounded-3xl shadow-level-2 object-cover aspect-[4/3]" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4iWDgj4BXuXwO8Ep5vl023xAk3k5dKApm1xm37AbIlYxX50gCphMxgS3qe2wvCd63y46SENjOL9pcnbLRm6Knyjelj6DsWNCQu7AeKOetvFzpvCqC_mP6ljamUPfIbGLpOP7kqDM4HadZvLTtP5ESHBm-Asmxrf2E94it8jBbjiX3nfw8At0l3uXz51QNAVMgQE7wfV0ETTZc13i3_no6kdsRtmJe-Dyuro40LJfPEf4FrZnW1YAhUjlu3W6cEqj2nbsDpGeTbUM1"
              alt="Our shipping support family"
            />
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Meet the family</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Behind every successful delivery is a team of dedicated individuals who believe in approachable service. We are a diverse group united by a single goal: to make logistics human again. When you ship with us, you're trusting a team that treats your parcels as their own.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop pb-20 pt-12">
        <div className="bg-gradient-to-br from-surface-variant to-surface-container-high rounded-[48px] p-12 md:p-16 text-center shadow-level-2 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-white rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-80 h-80 bg-secondary rounded-full opacity-10 blur-3xl"></div>
          <h2 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-surface mb-8 relative z-10 font-bold">
            Ready to send your first parcel?
          </h2>
          <button
            onClick={() => navigate('signup')}
            className="bg-primary text-on-primary font-label-md text-label-md px-10 py-4 rounded-full hover:bg-primary/90 transition-all duration-300 shadow-level-2 min-h-[56px] inline-flex items-center justify-center relative z-10 text-lg cursor-pointer font-semibold"
          >
            Book a Shipment
          </button>
        </div>
      </section>
    </main>
  );
};
