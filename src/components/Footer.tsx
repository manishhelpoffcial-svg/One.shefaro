import React from 'react';
import { Link } from '../context/NavigationContext';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-container-lowest w-full py-stack-lg mt-auto border-t border-outline-variant/10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
          <Link to="home" className="font-headline-md text-headline-md font-bold text-primary">
            one.shefaro
          </Link>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
            Simplifying domestic parcel shipping across India.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <span className="font-label-md text-label-md text-primary font-semibold">Services</span>
          <Link to="services" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline">
            Domestic
          </Link>
          <Link to="services" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline">
            Express
          </Link>
          <Link to="services" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline">
            Gift Shipping
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          <span className="font-label-md text-label-md text-primary font-semibold">Company</span>
          <Link to="about" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline">
            About
          </Link>
          <Link to="about" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline">
            Our Story
          </Link>
          <Link to="faqs" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline">
            Contact
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          <span className="font-label-md text-label-md text-primary font-semibold">Support</span>
          <Link to="faqs" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline">
            Help Center
          </Link>
          <Link to="pricing" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline">
            Pricing
          </Link>
          <Link to="faqs" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline">
            FAQs
          </Link>
        </div>
        <div className="col-span-2 md:col-span-4 mt-stack-md pt-8 border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-body-md text-body-md text-on-surface-variant">
            © 2026 one.shefaro India. All rights reserved.
          </span>
          <div className="flex gap-6">
            <a href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline">
              Terms
            </a>
            <a href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline">
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
