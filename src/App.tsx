/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Public Pages
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { Pricing as PublicPricing } from './pages/Pricing';
import { FAQs } from './pages/FAQs';
import { About } from './pages/About';
import { Signup } from './pages/Signup';
import { Login } from './pages/Login';
import { CustomerDashboard } from './pages/CustomerDashboard';

// Admin Core Imports
import { AdminSection, AdminSession, UserAccount, Shipment, PricingRate, PromoCode, CourierPartner, FAQItem, AboutSection, Transaction, SupportTicket, AdminUser } from './admin/types';
import { getAdminDB, saveAdminDB } from './admin/mockData';
import { DBService } from './lib/dbService';
import { AdminLayout } from './admin/components/AdminLayout';
import { AdminLogin } from './admin/pages/AdminLogin';
import { ToastContainer } from './admin/components/Toast';

// Admin Pages
import { Dashboard } from './admin/pages/Dashboard';
import { Users } from './admin/pages/Users';
import { Shipments } from './admin/pages/Shipments';
import { Pricing as AdminPricing } from './admin/pages/Pricing';
import { Partners } from './admin/pages/Partners';
import { Content as AdminContent } from './admin/pages/Content';
import { Finance } from './admin/pages/Finance';
import { Support } from './admin/pages/Support';
import { Settings } from './admin/pages/Settings';

const AppContent: React.FC = () => {
  const { currentRoute } = useNavigation();

  // ═══════════════════════════════════════
  // 1. ADMIN PANEL ROUTING & STATE MANAGEMENT
  // ═══════════════════════════════════════
  const [adminPath, setAdminPath] = useState(() => window.location.pathname);
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);

  // Admin Session State
  const [session, setSession] = useState<AdminSession | null>(() => {
    const saved = localStorage.getItem('oneshefaro_admin_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Admin Mock Database State
  const [db, setDb] = useState(() => getAdminDB());

  // Toast State
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([]);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToasts((prev) => [...prev, { id: `toast-${Date.now()}-${Math.random()}`, message, type }]);
  };

  // On mount: auto-seed (if empty) and then load all tables from Supabase!
  useEffect(() => {
    const initDatabase = async () => {
      // 1. Check if Supabase requires auto-seeding
      const initialSeedData = getAdminDB();
      await DBService.autoSeedIfEmpty(initialSeedData);

      // 2. Fetch all tables in parallel using our mapped functions
      try {
        const [
          users,
          shipments,
          pricingRates,
          promoCodes,
          partners,
          faqs,
          aboutSections,
          transactions,
          tickets,
          admins,
          auditLogs
        ] = await Promise.all([
          DBService.fetchUsers(),
          DBService.fetchShipments(),
          DBService.fetchPricingRates(),
          DBService.fetchPromoCodes(),
          DBService.fetchPartners(),
          DBService.fetchFAQs(),
          DBService.fetchAboutSections(),
          DBService.fetchTransactions(),
          DBService.fetchTickets(),
          DBService.fetchAdmins(),
          DBService.fetchAuditLogs()
        ]);

        setDb({
          users,
          shipments,
          pricingRates,
          promoCodes,
          partners,
          faqs,
          aboutSections,
          transactions,
          tickets,
          admins,
          auditLogs
        });
      } catch (e) {
        console.error('Failed loading data from Supabase, fell back to local storage cache.', e);
      }
    };

    initDatabase();
  }, []);

  // Sync back/forward navigation within the Admin Panel
  useEffect(() => {
    const handlePopState = () => {
      setAdminPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Determine current Admin Section based on URL pathname
  const getAdminSection = (path: string): AdminSection => {
    const segment = path.replace('/admin', '').replace('/', '');
    const validSections: AdminSection[] = [
      'dashboard',
      'users',
      'shipments',
      'pricing',
      'partners',
      'content',
      'finance',
      'support',
      'settings'
    ];
    if (validSections.includes(segment as AdminSection)) {
      return segment as AdminSection;
    }
    return 'dashboard';
  };

  const currentAdminSection = getAdminSection(adminPath);

  // Guard routing for session checks
  const isRootAdmin = adminPath === '/admin' || adminPath === '/admin/';
  const hasSession = !!session;

  useEffect(() => {
    if (adminPath.startsWith('/admin')) {
      if (!hasSession && !isRootAdmin) {
        // Accessing /admin/* without session -> redirect to /admin login and preserve target
        setRedirectTarget(adminPath);
        window.history.replaceState({}, '', '/admin');
        setAdminPath('/admin');
      }
    }
  }, [adminPath, hasSession, isRootAdmin]);

  // Navigate function inside Admin Panel
  const handleAdminNavigate = (section: AdminSection) => {
    const newPath = `/admin/${section}`;
    window.history.pushState({}, '', newPath);
    setAdminPath(newPath);
  };

  // Login handler
  const handleLoginSuccess = (email: string) => {
    const role = email === 'admin@oneshefaro.in' ? 'Super Admin' : 'Support Desk';
    const newSession: AdminSession = {
      email,
      role,
      token: `tok-${Date.now()}-${Math.random()}`
    };
    localStorage.setItem('oneshefaro_admin_session', JSON.stringify(newSession));
    setSession(newSession);
    DBService.logAuditEvent('Admin logged in & session initialized', email);

    // Redirect to preserved landing target or default to dashboard
    const target = redirectTarget && redirectTarget.startsWith('/admin/') ? redirectTarget : '/admin/dashboard';
    window.history.replaceState({}, '', target);
    setAdminPath(target);
    setRedirectTarget(null);
    triggerToast('Authorized access. Welcome back!', 'success');
  };

  // Logout handler
  const handleLogout = () => {
    const email = session?.email || 'admin@oneshefaro.in';
    DBService.logAuditEvent('Admin logged out & session terminated', email);
    localStorage.removeItem('oneshefaro_admin_session');
    setSession(null);
    setRedirectTarget(null);
    // Overwrite history to prevent back navigation
    window.history.replaceState({}, '', '/admin');
    setAdminPath('/admin');
    triggerToast('Session cleared safely.', 'info');
  };

  // ═══════════════════════════════════════
  // 2. DATABASE WRITERS & AUDIT LOGGERS
  // ═══════════════════════════════════════
  const handleUpdateUser = async (userId: string, updated: Partial<UserAccount>) => {
    setDb((prev) => {
      const user = prev.users.find(u => u.id === userId);
      const nextUsers = prev.users.map(u => u.id === userId ? { ...u, ...updated } : u);
      if (updated.status && user) {
        DBService.logAuditEvent(`${updated.status === 'Suspended' ? 'Suspended' : 'Reactivated'} user account: ${user.email}`, session?.email);
      }
      return { ...prev, users: nextUsers };
    });
    await DBService.updateUser(userId, updated);
  };

  const handleDeleteUser = async (userId: string) => {
    setDb((prev) => {
      const user = prev.users.find(u => u.id === userId);
      const nextUsers = prev.users.filter(u => u.id !== userId);
      if (user) {
        DBService.logAuditEvent(`Permanently deleted user account: ${user.email}`, session?.email);
      }
      return { ...prev, users: nextUsers };
    });
    await DBService.deleteUser(userId);
  };

  const handleUpdateShipment = async (shipmentId: string, updated: Partial<Shipment>) => {
    setDb((prev) => {
      const nextShipments = prev.shipments.map(s => s.id === shipmentId ? { ...s, ...updated } : s);
      if (updated.status) {
        DBService.logAuditEvent(`Manually updated shipment ${shipmentId} status to ${updated.status}`, session?.email);
      }
      return { ...prev, shipments: nextShipments };
    });
    await DBService.updateShipment(shipmentId, updated);
  };

  const handleUpdatePricingRate = async (rateId: string, updated: Partial<PricingRate>) => {
    setDb((prev) => {
      const rate = prev.pricingRates.find(r => r.id === rateId);
      const nextRates = prev.pricingRates.map(r => r.id === rateId ? { ...r, ...updated } : r);
      if (rate) {
        DBService.logAuditEvent(`Modified weight rates for slab: "${rate.weightSlab}" in ${rate.zone}`, session?.email);
      }
      return { ...prev, pricingRates: nextRates };
    });
    await DBService.updatePricingRate(rateId, updated);
  };

  const handleAddPromoCode = async (promo: Omit<PromoCode, 'id'>) => {
    const newPromo: PromoCode = {
      ...promo,
      id: `promo-${Date.now()}`
    };
    setDb((prev) => {
      DBService.logAuditEvent(`Created promo discount coupon: ${promo.code} (${promo.discountPercent}% OFF)`, session?.email);
      return { ...prev, promoCodes: [...prev.promoCodes, newPromo] };
    });
    await DBService.insertPromoCode(newPromo);
  };

  const handleUpdatePromoCode = async (promoId: string, updated: Partial<PromoCode>) => {
    setDb((prev) => {
      const promo = prev.promoCodes.find(p => p.id === promoId);
      const nextPromos = prev.promoCodes.map(p => p.id === promoId ? { ...p, ...updated } : p);
      if (promo && updated.isActive !== undefined) {
        DBService.logAuditEvent(`Toggled promo coupon ${promo.code} status to: ${updated.isActive ? 'Active' : 'Inactive'}`, session?.email);
      }
      return { ...prev, promoCodes: nextPromos };
    });
    await DBService.updatePromoCode(promoId, updated);
  };

  const handleDeletePromoCode = async (promoId: string) => {
    setDb((prev) => {
      const promo = prev.promoCodes.find(p => p.id === promoId);
      const nextPromos = prev.promoCodes.filter(p => p.id !== promoId);
      if (promo) {
        DBService.logAuditEvent(`Deleted promo discount coupon: ${promo.code}`, session?.email);
      }
      return { ...prev, promoCodes: nextPromos };
    });
    await DBService.deletePromoCode(promoId);
  };

  const handleAddPartner = async (partner: Omit<CourierPartner, 'id' | 'onTimePercent' | 'activeShipments'>) => {
    const newPartner: CourierPartner = {
      ...partner,
      id: `p-${Date.now()}`,
      onTimePercent: 95.0,
      activeShipments: 0
    };
    setDb((prev) => {
      DBService.logAuditEvent(`Registered new shipping courier partner: ${partner.name}`, session?.email);
      return { ...prev, partners: [...prev.partners, newPartner] };
    });
    await DBService.insertPartner(newPartner);
  };

  const handleUpdatePartner = async (partnerId: string, updated: Partial<CourierPartner>) => {
    setDb((prev) => {
      const partner = prev.partners.find(p => p.id === partnerId);
      const nextPartners = prev.partners.map(p => p.id === partnerId ? { ...p, ...updated } : p);
      if (partner && updated.isActive !== undefined) {
        DBService.logAuditEvent(`Toggled courier partner ${partner.name} status to: ${updated.isActive ? 'Active' : 'Deactivated'}`, session?.email);
      }
      return { ...prev, partners: nextPartners };
    });
    await DBService.updatePartner(partnerId, updated);
  };

  const handleUpdateFAQs = async (nextFAQs: FAQItem[]) => {
    setDb((prev) => {
      DBService.logAuditEvent('Modified FAQ content inventory & sequence reorder', session?.email);
      return { ...prev, faqs: nextFAQs };
    });
    await DBService.updateFAQs(nextFAQs);
  };

  const handleUpdateAboutSections = async (nextSections: AboutSection[]) => {
    setDb((prev) => {
      DBService.logAuditEvent('Published descriptive section updates on About Page', session?.email);
      return { ...prev, aboutSections: nextSections };
    });
    await DBService.updateAboutSections(nextSections);
  };

  const handleRefundTransaction = async (txnId: string) => {
    setDb((prev) => {
      const txn = prev.transactions.find(t => t.id === txnId);
      const nextTxns = prev.transactions.map(t => t.id === txnId ? { ...t, status: 'Refunded' as const } : t);
      if (txn) {
        DBService.logAuditEvent(`Issued full refund of ₹${txn.amount} for Transaction ${txn.id} to ${txn.customerName}`, session?.email);
      }
      return { ...prev, transactions: nextTxns };
    });
    await DBService.refundTransaction(txnId);
  };

  const handleUpdateTicket = async (ticketId: string, updated: Partial<SupportTicket>) => {
    setDb((prev) => {
      const ticket = prev.tickets.find(t => t.id === ticketId);
      const nextTickets = prev.tickets.map(t => t.id === ticketId ? { ...t, ...updated } : t);
      if (ticket) {
        if (updated.status && updated.status !== ticket.status) {
          DBService.logAuditEvent(`Changed support ticket ${ticketId} status to ${updated.status}`, session?.email);
        } else if (updated.messages) {
          DBService.logAuditEvent(`Sent administrative response reply to support ticket: ${ticketId}`, session?.email);
        }
      }
      return { ...prev, tickets: nextTickets };
    });
    await DBService.updateTicket(ticketId, updated);
  };

  const handleAddAdmin = async (email: string, role: AdminUser['role']) => {
    const newAdmin: AdminUser = {
      id: `adm-${Date.now()}`,
      email,
      role,
      dateAdded: new Date().toISOString().substring(0, 10)
    };
    setDb((prev) => {
      DBService.logAuditEvent(`Authorized staff access credential for ${email} with role ${role}`, session?.email);
      return { ...prev, admins: [...prev.admins, newAdmin] };
    });
    await DBService.insertAdmin(newAdmin);
  };

  const handleRemoveAdmin = async (adminId: string) => {
    setDb((prev) => {
      const admin = prev.admins.find(a => a.id === adminId);
      const nextAdmins = prev.admins.filter(a => a.id !== adminId);
      if (admin) {
        DBService.logAuditEvent(`Revoked administrative staff access for ${admin.email}`, session?.email);
      }
      return { ...prev, admins: nextAdmins };
    });
    await DBService.deleteAdmin(adminId);
  };

  // ═══════════════════════════════════════
  // 3. RENDER WORKSPACE HUB
  // ═══════════════════════════════════════
  if (adminPath.startsWith('/admin')) {
    if (!session) {
      return (
        <>
          <ToastContainer toasts={toasts} setToasts={setToasts} />
          <AdminLogin onLoginSuccess={handleLoginSuccess} />
        </>
      );
    }

    const renderAdminSectionContent = () => {
      switch (currentAdminSection) {
        case 'dashboard':
          return (
            <Dashboard
              auditLogs={db.auditLogs}
              shipmentCount={db.shipments.length}
              userCount={db.users.length}
              revenue={db.transactions.reduce((sum, t) => sum + (t.status === 'Success' ? t.amount : 0), 0)}
              ticketsCount={db.tickets.filter(t => t.status !== 'Resolved').length}
              onNavigate={handleAdminNavigate}
            />
          );
        case 'users':
          return (
            <Users
              users={db.users}
              shipments={db.shipments}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              triggerToast={triggerToast}
            />
          );
        case 'shipments':
          return (
            <Shipments
              shipments={db.shipments}
              onUpdateShipment={handleUpdateShipment}
              triggerToast={triggerToast}
            />
          );
        case 'pricing':
          return (
            <AdminPricing
              pricingRates={db.pricingRates}
              promoCodes={db.promoCodes}
              onUpdatePricingRate={handleUpdatePricingRate}
              onAddPromoCode={handleAddPromoCode}
              onUpdatePromoCode={handleUpdatePromoCode}
              onDeletePromoCode={handleDeletePromoCode}
              triggerToast={triggerToast}
            />
          );
        case 'partners':
          return (
            <Partners
              partners={db.partners}
              onAddPartner={handleAddPartner}
              onUpdatePartner={handleUpdatePartner}
              triggerToast={triggerToast}
            />
          );
        case 'content':
          return (
            <AdminContent
              faqs={db.faqs}
              aboutSections={db.aboutSections}
              onUpdateFAQs={handleUpdateFAQs}
              onUpdateAboutSections={handleUpdateAboutSections}
              triggerToast={triggerToast}
            />
          );
        case 'finance':
          return (
            <Finance
              transactions={db.transactions}
              onRefundTransaction={handleRefundTransaction}
              triggerToast={triggerToast}
            />
          );
        case 'support':
          return (
            <Support
              tickets={db.tickets}
              onUpdateTicket={handleUpdateTicket}
              triggerToast={triggerToast}
            />
          );
        case 'settings':
          return (
            <Settings
              admins={db.admins}
              auditLogs={db.auditLogs}
              onAddAdmin={handleAddAdmin}
              onRemoveAdmin={handleRemoveAdmin}
              triggerToast={triggerToast}
            />
          );
        default:
          return <div className="p-4 text-slate-500 font-bold">Workspace Loading...</div>;
      }
    };

    return (
      <>
        <ToastContainer toasts={toasts} setToasts={setToasts} />
        <AdminLayout
          session={session}
          currentSection={currentAdminSection}
          onNavigate={handleAdminNavigate}
          onLogout={handleLogout}
        >
          {renderAdminSectionContent()}
        </AdminLayout>
      </>
    );
  }

  // PUBLIC APP CONTENT
  const renderActivePage = () => {
    switch (currentRoute) {
      case 'home':
        return <Home />;
      case 'services':
        return <Services />;
      case 'pricing':
        return <PublicPricing />;
      case 'faqs':
        return <FAQs />;
      case 'about':
        return <About />;
      case 'signup':
        return <Signup />;
      case 'login':
        return <Login />;
      case 'dashboard':
        return <CustomerDashboard />;
      default:
        return <Home />;
    }
  };

  if (currentRoute === 'dashboard') {
    return (
      <div className="bg-surface-container-lowest text-on-surface antialiased min-h-screen flex flex-col">
        {renderActivePage()}
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background antialiased selection:bg-secondary-container selection:text-on-secondary-container min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        {renderActivePage()}
      </div>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  );
}
