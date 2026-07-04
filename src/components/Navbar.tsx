import React, { useState, useEffect } from 'react';
import { useNavigation, Link } from '../context/NavigationContext';
import { supabase } from '../lib/supabaseClient';

export const Navbar: React.FC = () => {
  const { currentRoute, navigate } = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session || !!localStorage.getItem('oneshefaro_customer_session'));
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session || !!localStorage.getItem('oneshefaro_customer_session'));
    });

    return () => subscription.unsubscribe();
  }, []);

  const navItems = [
    { label: 'Home', route: 'home' as const },
    { label: 'Services', route: 'services' as const },
    { label: 'Pricing', route: 'pricing' as const },
    { label: 'Support', route: 'faqs' as const },
    { label: 'About', route: 'about' as const },
  ];

  return (
    <nav className="bg-surface/80 backdrop-blur-md sticky top-0 w-full z-50 shadow-sm shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 max-w-container-max mx-auto">
        <Link to="home" className="font-display-lg text-headline-md tracking-tighter text-primary">
          one.shefaro
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <Link
                key={item.route}
                to={item.route}
                className={`${
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-on-surface-variant'
                } font-label-md text-label-md hover:text-primary transition-all duration-300 px-3 py-2 rounded-lg hover:bg-surface-container-low`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link
              to="dashboard"
              className="inline-flex items-center justify-center bg-primary text-on-primary font-label-md text-label-md h-[48px] px-6 rounded-lg hover:bg-primary-container transition-colors shadow-level-1 active:scale-95 duration-200"
            >
              My Account
            </Link>
          ) : (
            <>
              <Link
                to="login"
                className="hidden md:inline-flex items-center justify-center font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors px-3"
              >
                Log In
              </Link>
              <Link
                to="signup"
                className="hidden md:inline-flex items-center justify-center bg-primary text-on-primary font-label-md text-label-md h-[48px] px-6 rounded-lg hover:bg-primary-container transition-colors shadow-level-1 active:scale-95 duration-200"
              >
                Book Shipment
              </Link>
            </>
          )}
          <button
            aria-controls="mobile-menu"
            aria-expanded={isOpen}
            aria-label="Toggle menu"
            className="md:hidden text-on-surface p-2 h-11 w-11 flex items-center justify-center cursor-pointer"
            id="menu-toggle"
            onClick={() => setIsOpen(!isOpen)}
            type="button"
          >
            <span className="material-symbols-outlined" id="menu-icon">
              {isOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className="md:hidden flex flex-col gap-1 px-margin-mobile pb-6 pt-2 bg-surface border-t border-outline-variant/20 shadow-level-1"
          id="mobile-menu"
        >
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <Link
                key={item.route}
                to={item.route}
                onClick={() => setIsOpen(false)}
                className={`${
                  isActive
                    ? 'text-primary font-bold bg-surface-container-low'
                    : 'text-on-surface-variant'
                } font-label-md text-label-md px-3 py-3 rounded-lg hover:bg-surface-container-low`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="flex items-center gap-3 pt-3 mt-2 border-t border-outline-variant/20">
            {isLoggedIn ? (
              <Link
                to="dashboard"
                onClick={() => setIsOpen(false)}
                className="flex-1 inline-flex items-center justify-center bg-primary text-on-primary font-label-md text-label-md h-[48px] px-6 rounded-lg hover:bg-primary-container"
              >
                My Account
              </Link>
            ) : (
              <>
                <Link
                  to="login"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 inline-flex items-center justify-center font-label-md text-label-md text-primary border border-outline-variant h-[48px] px-6 rounded-lg hover:bg-surface-container-low"
                >
                  Log In
                </Link>
                <Link
                  to="signup"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 inline-flex items-center justify-center bg-primary text-on-primary font-label-md text-label-md h-[48px] px-6 rounded-lg hover:bg-primary-container"
                >
                  Book Shipment
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
