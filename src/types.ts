import React from 'react';

export type ActiveRoute = 'home' | 'services' | 'pricing' | 'faqs' | 'about' | 'signup' | 'login' | 'dashboard';

export interface RouteLinkProps {
  to: ActiveRoute;
  className?: string;
  children: React.ReactNode;
}
