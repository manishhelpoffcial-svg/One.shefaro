import React, { createContext, useContext, useState, useEffect } from 'react';
import { ActiveRoute } from '../types';

interface NavigationContextType {
  currentRoute: ActiveRoute;
  navigate: (route: ActiveRoute) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

const routeMap: Record<string, ActiveRoute> = {
  '#home': 'home',
  '#services': 'services',
  '#pricing': 'pricing',
  '#faqs': 'faqs',
  '#about': 'about',
  '#signup': 'signup',
  '#login': 'login',
  '#dashboard': 'dashboard',
  // fallback for original HTML file links
  'index.html': 'home',
  'services.html': 'services',
  'pricing.html': 'pricing',
  'faqs.html': 'faqs',
  'about.html': 'about',
  'signup.html': 'signup',
  'login.html': 'login',
  'dashboard.html': 'dashboard',
};

const inverseRouteMap: Record<ActiveRoute, string> = {
  home: '#home',
  services: '#services',
  pricing: '#pricing',
  faqs: '#faqs',
  about: '#about',
  signup: '#signup',
  login: '#login',
  dashboard: '#dashboard',
};

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<ActiveRoute>(() => {
    const hash = window.location.hash;
    if (hash && routeMap[hash]) {
      return routeMap[hash];
    }
    return 'home';
  });

  const navigate = (route: ActiveRoute) => {
    setCurrentRoute(route);
    window.location.hash = inverseRouteMap[route];
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash && routeMap[hash]) {
        setCurrentRoute(routeMap[hash]);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <NavigationContext.Provider value={{ currentRoute, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const Link: React.FC<{
  to: ActiveRoute;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}> = ({ to, className, onClick, children }) => {
  const { navigate } = useNavigation();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) onClick();
    navigate(to);
  };

  return (
    <a href={`#${to}`} className={className} onClick={handleClick}>
      {children}
    </a>
  );
};
