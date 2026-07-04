import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  MapPin, 
  Wallet as WalletIcon, 
  Receipt, 
  LifeBuoy, 
  Bell, 
  Settings as SettingsIcon, 
  LogOut, 
  ChevronRight, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Check, 
  Clock, 
  AlertTriangle, 
  Send, 
  User, 
  ShieldAlert, 
  X, 
  Menu,
  ChevronDown,
  Eye,
  Info
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { supabase } from '../lib/supabaseClient';
import { DBService } from '../lib/dbService';

type DashboardTab = 
  | 'overview' 
  | 'shipments' 
  | 'addresses' 
  | 'wallet' 
  | 'payments' 
  | 'support' 
  | 'notifications' 
  | 'settings';

interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

export const CustomerDashboard: React.FC = () => {
  const { navigate } = useNavigation();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Authenticated User & Profile State
  const [userSession, setUserSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>({
    id: '',
    name: 'Valued Customer',
    email: 'customer@oneshefaro.in',
    phone: '+91 9876543210',
    signupDate: '',
    status: 'Active',
    notification_preferences: { email: true, sms: true, whatsapp: false }
  });

  // Data Collections
  const [shipments, setShipments] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(500);
  const [walletTxns, setWalletTxns] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Form / Modal States
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  // Form fields: Booking
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [origin, setOrigin] = useState('New Delhi (DEL)');
  const [destination, setDestination] = useState('Mumbai (BOM)');
  const [destAddress, setDestAddress] = useState('');
  const [destCity, setDestCity] = useState('');
  const [destState, setDestState] = useState('');
  const [destPincode, setDestPincode] = useState('');
  const [itemWeight, setItemWeight] = useState(1);
  const [itemDesc, setItemDesc] = useState('');
  const [shippingSpeed, setShippingSpeed] = useState<'Standard' | 'Express'>('Standard');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Form fields: Address Book
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    id: '',
    label: 'Home',
    name: '',
    phone: '',
    address_line: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false
  });

  // Form fields: Wallet Top Up
  const [topUpAmount, setTopUpAmount] = useState('500');
  const [payMethod, setPayMethod] = useState('UPI');

  // Form fields: Support Ticket
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketPriority, setNewTicketPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newTicketMsg, setNewTicketMsg] = useState('');
  const [ticketReplyMsg, setTicketReplyMsg] = useState('');

  // Form fields: Settings Profile
  const [prefLang, setPrefLang] = useState('English');
  const [changePass, setChangePass] = useState({ current: '', next: '', confirm: '' });

  // Custom Toast helper
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Check login session & Initialize data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // If no supabase session, try local storage custom session for flexibility/demo
          const localSess = localStorage.getItem('oneshefaro_customer_session');
          if (localSess) {
            const parsed = JSON.parse(localSess);
            setUserSession(parsed);
            setProfile(parsed.profile);
            loadDashboardData(parsed.profile.id, parsed.profile.email);
          } else {
            // Not logged in -> Redirect to login
            showToast('Authentication required. Redirecting to login...', 'error');
            setTimeout(() => {
              navigate('login');
            }, 1500);
          }
        } else {
          setUserSession(session);
          
          // Get or build profile
          const { data: prof, error: profError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          let activeProfile = prof;
          if (profError || !prof) {
            // fallback profile matching supabase auth
            activeProfile = {
              id: session.user.id,
              name: session.user.user_metadata?.full_name || 'Valued Customer',
              email: session.user.email || 'customer@oneshefaro.in',
              phone: session.user.user_metadata?.phone_number || '+91 9876543210',
              signupDate: new Date().toISOString().substring(0, 10),
              status: 'Active',
              notification_preferences: { email: true, sms: true, whatsapp: false }
            };
            // Seed profile locally or remotely
            await DBService.updateUser(session.user.id, { name: activeProfile.name });
          }
          
          setProfile(activeProfile);
          loadDashboardData(activeProfile.id, activeProfile.email);
        }
      } catch (err) {
        console.error('Auth verification failed', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loadDashboardData = async (userId: string, userEmail: string) => {
    try {
      // 1. Wallet Balance
      const wallet = await DBService.getOrCreateWallet(userId);
      setWalletBalance(wallet.balance);

      // 2. Wallet Transactions
      const wtx = await DBService.fetchWalletTransactions(userId);
      setWalletTxns(wtx);

      // 3. Saved Addresses
      const addr = await DBService.fetchSavedAddresses(userId);
      setAddresses(addr);

      // 4. Invoices / Billing
      const billing = await DBService.fetchCustomerBilling(userEmail, userId);
      setTransactions(billing);

      // 5. Support Tickets
      const tix = await DBService.fetchCustomerTickets(userEmail);
      setTickets(tix);

      // 6. Notifications
      const alerts = await DBService.fetchNotifications(userId);
      setNotifications(alerts);

      // 7. Shipments
      // Fetch public shipments but scope them to sender_id = userId
      let ownShipments: any[] = [];
      if (DBService.useLocalFallback) {
        const localDb = (window as any).localStorage.getItem('oneshefaro_fallback_db');
        if (localDb) {
          const parsed = JSON.parse(localDb);
          const allShipments = parsed.shipments || [];
          ownShipments = allShipments.filter((s: any) => s.sender_id === userId || s.senderPhone === profile.phone);
        }
      } else {
        const { data, error } = await supabase
          .from('shipments')
          .select('*')
          .eq('sender_id', userId)
          .order('date_booked', { ascending: false });
        if (!error && data) {
          // map db to UI fields
          ownShipments = data.map(s => ({
            id: s.id,
            senderName: s.sender_name || s.senderName,
            senderPhone: s.sender_phone || s.senderPhone,
            receiverName: s.receiver_name || s.receiverName,
            receiverPhone: s.receiver_phone || s.receiverPhone,
            origin: s.origin,
            destination: s.destination,
            status: s.status,
            courierPartner: s.courier_partner || s.courierPartner,
            dateBooked: s.date_booked || s.dateBooked,
            items: s.items,
            weight: s.weight,
            cost: s.cost,
            timeline: s.timeline || []
          }));
        }
      }
      setShipments(ownShipments);

    } catch (err) {
      console.warn('Could not pull online datasets. Falling back to local arrays.', err);
    }
  };

  // LOGOUT HANDLER
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    localStorage.removeItem('oneshefaro_customer_session');
    showToast('Securely logging out...', 'info');
    setTimeout(() => {
      navigate('home');
      window.location.reload();
    }, 1000);
  };

  // LIVE PRICE CALCULATOR (Standard ₹80/kg, Express ₹150/kg)
  const calculateBookingCost = () => {
    const baseCost = shippingSpeed === 'Standard' ? 80 : 150;
    const rawCost = itemWeight * baseCost;
    const finalCost = Math.max(rawCost - (rawCost * discountPercent) / 100, rawCost * 0.5); // max 50% discount
    return Math.round(finalCost);
  };

  // APPLY COUPON
  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    const code = promoCode.trim().toUpperCase();
    if (code === 'WELCOME50') {
      setDiscountPercent(50);
      showToast('Promo WELCOME50 applied! 50% discount registered.', 'success');
    } else if (code === 'FREESHIP') {
      setDiscountPercent(100);
      showToast('Promo FREESHIP applied! Free shipping active.', 'success');
    } else {
      showToast('Invalid promo coupon code.', 'error');
    }
  };

  // BOOK NEW SHIPMENT
  const handleBookShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverName || !receiverPhone || !destAddress || !destCity || !destState || !destPincode || !itemDesc) {
      showToast('Please complete all recipient and cargo parameters.', 'error');
      return;
    }

    const calculatedCost = calculateBookingCost();

    if (walletBalance < calculatedCost) {
      showToast(`Insufficient Wallet Balance. Needed ₹${calculatedCost}, you have ₹${walletBalance}. Please top-up first.`, 'error');
      return;
    }

    try {
      setIsLoading(true);
      const bookingId = `SHF-${Math.floor(100000 + Math.random() * 900000)}`;
      const today = new Date().toISOString().substring(0, 10);

      // Create shipment model
      const newShipment = {
        id: bookingId,
        sender_id: profile.id,
        senderName: profile.name,
        senderPhone: profile.phone,
        receiverName,
        receiverPhone,
        origin,
        destination: `${destCity}, ${destState} (PIN: ${destPincode})`,
        status: 'Booked' as const,
        courierPartner: 'Shefaro Express',
        dateBooked: today,
        items: itemDesc,
        weight: Number(itemWeight),
        cost: calculatedCost,
        timeline: [
          { status: 'Booked', date: today, location: origin, description: 'Parcel successfully booked and paid via Shefaro Wallet.' }
        ]
      };

      // 1. Debit Wallet Balance
      const nextBalance = await DBService.topUpWallet(profile.id, -calculatedCost, `Booked consignment ${bookingId}`);
      setWalletBalance(nextBalance);

      // 2. Insert into shipments
      if (DBService.useLocalFallback) {
        const db = JSON.parse(localStorage.getItem('oneshefaro_fallback_db') || '{}');
        db.shipments = [newShipment, ...(db.shipments || [])];
        localStorage.setItem('oneshefaro_fallback_db', JSON.stringify(db));
      } else {
        await supabase.from('shipments').insert({
          id: bookingId,
          sender_id: profile.id,
          sender_name: profile.name,
          sender_phone: profile.phone,
          receiver_name: receiverName,
          receiver_phone: receiverPhone,
          origin,
          destination: `${destAddress}, ${destCity}, ${destState} - ${destPincode}`,
          status: 'Booked',
          courier_partner: 'Shefaro Express',
          date_booked: today,
          items: itemDesc,
          weight: Number(itemWeight),
          cost: calculatedCost,
          timeline: newShipment.timeline
        });
      }

      // 3. Log main billing transaction
      const invoiceTxn = {
        id: `TXN-${Date.now().toString().substring(6)}`,
        date: today,
        user_id: profile.id,
        customerName: profile.name,
        customerEmail: profile.email,
        amount: calculatedCost,
        paymentMethod: 'Wallet',
        status: 'Success' as const
      };

      if (DBService.useLocalFallback) {
        const db = JSON.parse(localStorage.getItem('oneshefaro_fallback_db') || '{}');
        db.transactions = [invoiceTxn, ...(db.transactions || [])];
        localStorage.setItem('oneshefaro_fallback_db', JSON.stringify(db));
      } else {
        await supabase.from('transactions').insert({
          id: invoiceTxn.id,
          date: invoiceTxn.date,
          user_id: profile.id,
          customer_name: profile.name,
          amount: calculatedCost,
          payment_method: 'Wallet',
          status: 'Success'
        });
      }

      // 4. Log notification
      const alertItem = {
        id: `notif-${Date.now()}`,
        user_id: profile.id,
        title: 'Shipment Booked!',
        message: `Consignment ${bookingId} has been successfully registered. Tracking is active.`,
        type: 'shipment',
        related_id: bookingId,
        is_read: false,
        created_at: new Date().toISOString()
      };
      await DBService.saveNotification(alertItem);

      showToast(`Consignment ${bookingId} booked successfully! Paid ₹${calculatedCost}.`, 'success');
      
      // Reset form & reload
      setIsBookingModalOpen(false);
      setReceiverName('');
      setReceiverPhone('');
      setDestAddress('');
      setDestCity('');
      setDestState('');
      setDestPincode('');
      setItemWeight(1);
      setItemDesc('');
      setPromoCode('');
      setDiscountPercent(0);

      loadDashboardData(profile.id, profile.email);
    } catch (err: any) {
      showToast(err.message || 'Failed to complete booking transaction.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // WALLET TOP UP TRANSACTION
  const handleWalletTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(topUpAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('Please enter a valid deposit amount.', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const updatedBal = await DBService.topUpWallet(profile.id, amountNum, `Deposited funds via ${payMethod}`);
      setWalletBalance(updatedBal);

      // Notification
      const alertItem = {
        id: `notif-${Date.now()}`,
        user_id: profile.id,
        title: 'Wallet Deposited',
        message: `Successfully loaded ₹${amountNum} into your Shefaro digital wallet via ${payMethod}.`,
        type: 'wallet',
        related_id: 'wallet',
        is_read: false,
        created_at: new Date().toISOString()
      };
      await DBService.saveNotification(alertItem);

      showToast(`Wallet credited with ₹${amountNum}! New balance: ₹${updatedBal}.`, 'success');
      setTopUpAmount('500');
      loadDashboardData(profile.id, profile.email);
    } catch (err: any) {
      showToast(err.message || 'Wallet credit failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // SAVE ADDRESS (ADD / EDIT)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, phone, address_line, city, state, pincode, label } = addressForm;
    if (!name || !phone || !address_line || !city || !state || !pincode) {
      showToast('Please complete all address fields.', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        id: addressForm.id || `addr-${Date.now()}`,
        user_id: profile.id,
        label,
        name,
        phone,
        address_line,
        city,
        state,
        pincode,
        is_default: addressForm.is_default,
        created_at: new Date().toISOString()
      };

      await DBService.saveAddress(payload);
      showToast(`Address saved successfully under tag "${label}".`, 'success');
      setIsAddressModalOpen(false);
      setAddressForm({
        id: '',
        label: 'Home',
        name: '',
        phone: '',
        address_line: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false
      });
      loadDashboardData(profile.id, profile.email);
    } catch (err: any) {
      showToast(err.message || 'Address update failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // DELETE ADDRESS
  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this address from your book?')) return;
    try {
      setIsLoading(true);
      await DBService.deleteAddress(id);
      showToast('Address deleted successfully.', 'info');
      loadDashboardData(profile.id, profile.email);
    } catch (err: any) {
      showToast(err.message || 'Deletion failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // SET DEFAULT ADDRESS
  const handleSetDefaultAddress = async (addr: any) => {
    try {
      setIsLoading(true);
      await DBService.saveAddress({ ...addr, is_default: true });
      showToast(`"${addr.label}" is now set as your default billing address.`, 'success');
      loadDashboardData(profile.id, profile.email);
    } catch (err: any) {
      showToast('Could not set address as default.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // CREATE SUPPORT TICKET
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketMsg.trim()) {
      showToast('Please supply a descriptive subject and details message.', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
      const today = new Date().toISOString().substring(0, 10);

      const payload = {
        id: ticketId,
        customerName: profile.name,
        customerEmail: profile.email,
        subject: newTicketSubject,
        status: 'Open' as const,
        date: today,
        priority: newTicketPriority,
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender: 'Customer' as const,
            senderName: profile.name,
            content: newTicketMsg,
            timestamp: new Date().toISOString()
          }
        ]
      };

      await DBService.insertSupportTicket(payload);

      // Notification
      const alertItem = {
        id: `notif-${Date.now()}`,
        user_id: profile.id,
        title: 'Support Ticket Raised',
        message: `Your ticket ${ticketId} regarding "${newTicketSubject}" is now logged.`,
        type: 'support',
        related_id: ticketId,
        is_read: false,
        created_at: new Date().toISOString()
      };
      await DBService.saveNotification(alertItem);

      showToast(`Support Ticket ${ticketId} raised successfully!`, 'success');
      setNewTicketSubject('');
      setNewTicketMsg('');
      loadDashboardData(profile.id, profile.email);
    } catch (err: any) {
      showToast(err.message || 'Support ticket submission failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // REPLY TO SUPPORT TICKET
  const handleTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReplyMsg.trim() || !selectedTicket) return;

    try {
      setIsLoading(true);
      const replyPayload = {
        id: `msg-${Date.now()}`,
        sender: 'Customer' as const,
        senderName: profile.name,
        content: ticketReplyMsg,
        timestamp: new Date().toISOString()
      };

      const updatedMessages = [...(selectedTicket.messages || []), replyPayload];
      await DBService.replyTicket(selectedTicket.id, updatedMessages);
      
      const refreshedTicket = { ...selectedTicket, messages: updatedMessages };
      setSelectedTicket(refreshedTicket);
      setTicketReplyMsg('');
      showToast('Response successfully transmitted.', 'success');
      loadDashboardData(profile.id, profile.email);
    } catch (err: any) {
      showToast('Could not send response.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // NOTIFICATION CLICK / DEEP LINK
  const handleNotifClick = async (notif: any) => {
    await DBService.markNotificationRead(notif.id);
    
    // update read status in UI
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));

    // Deep link routing
    if (notif.type === 'shipment' && notif.related_id) {
      const match = shipments.find(s => s.id === notif.related_id);
      if (match) {
        setSelectedShipment(match);
      } else {
        // Switch tab to shipments
        setActiveTab('shipments');
      }
    } else if (notif.type === 'wallet') {
      setActiveTab('wallet');
    } else if (notif.type === 'support') {
      setActiveTab('support');
    }
  };

  // MARK ALL NOTIFICATIONS AS READ
  const handleMarkAllNotifsRead = async () => {
    try {
      await DBService.markAllNotificationsRead(profile.id);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      showToast('All notifications cleared as read.', 'success');
    } catch (err) {
      showToast('Action failed.', 'error');
    }
  };

  // UPDATE PROFILE SETTINGS
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await DBService.updateUser(profile.id, {
        name: profile.name,
        phone: profile.phone
      });
      showToast('Account details updated successfully!', 'success');
      loadDashboardData(profile.id, profile.email);
    } catch (err) {
      showToast('Profile update failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // DEACTIVATE ACCOUNT (SOFT DELETE)
  const handleDeactivateAccount = async () => {
    if (!window.confirm('WARNING: Deactivating your account will suspend your session and disable parcel bookings. Do you want to proceed?')) return;
    try {
      setIsLoading(true);
      await DBService.updateUser(profile.id, { status: 'Suspended' });
      await DBService.logAuditEvent(`Customer de-activated self-profile: ${profile.email}`, profile.email);
      showToast('Your account is now suspended. Logging out...', 'error');
      setTimeout(() => {
        handleLogout();
      }, 2000);
    } catch (err) {
      showToast('Failed to suspend account.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation Links array
  const menuItems = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'shipments' as const, label: 'Book & Track', icon: Package },
    { id: 'addresses' as const, label: 'Address Book', icon: MapPin },
    { id: 'wallet' as const, label: 'Digital Wallet', icon: WalletIcon },
    { id: 'payments' as const, label: 'Transactions', icon: Receipt },
    { id: 'support' as const, label: 'Support Desk', icon: LifeBuoy },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell, badge: notifications.filter(n => !n.is_read).length },
    { id: 'settings' as const, label: 'Settings', icon: SettingsIcon }
  ];

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="flex bg-surface-container-lowest min-h-screen text-on-surface select-none relative" id="customer-dashboard-root">
      
      {/* ═══════════════════════════════════════
          TOAST CONTAINER (COMPACT & ANIMATED)
          ═══════════════════════════════════════ */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className={`p-4 rounded-xl shadow-level-3 border pointer-events-auto flex gap-3 items-start justify-between ${
                t.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                  : t.type === 'error' 
                    ? 'bg-rose-50 text-rose-900 border-rose-200' 
                    : 'bg-blue-50 text-blue-900 border-blue-200'
              }`}
            >
              <div className="flex gap-2">
                <span className="mt-0.5">
                  {t.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                </span>
                <span className="font-body-md text-sm leading-snug">{t.text}</span>
              </div>
              <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="text-on-surface/40 hover:text-on-surface">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════
          DESKTOP SIDEBAR
          ═══════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-72 bg-surface border-r border-outline-variant/30 sticky top-0 h-screen shrink-0 shadow-sm">
        <div className="p-8 border-b border-outline-variant/20 flex flex-col gap-1">
          <h2 className="font-display-lg text-primary text-xl font-bold tracking-tight">one.shefaro</h2>
          <p className="font-label-sm text-xs text-on-surface-variant font-mono">CUSTOMER PORTAL</p>
        </div>

        <nav className="flex-grow py-6 px-4 space-y-1 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-label-md text-sm font-semibold transition-all group ${
                  isActive 
                    ? 'bg-primary text-on-primary shadow-sm' 
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`w-[20px] h-[20px] group-hover:scale-105 transition-transform ${isActive ? 'text-on-primary' : 'text-on-surface-variant group-hover:text-primary'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${isActive ? 'bg-white text-primary' : 'bg-rose-500 text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-outline-variant/20">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-[20px] h-[20px]" />
            <span>Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════
          MOBILE MENU DRAWER
          ═══════════════════════════════════════ */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-black"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute left-0 top-0 bottom-0 w-80 bg-surface flex flex-col shadow-2xl p-6"
            >
              <div className="flex justify-between items-center mb-8 border-b pb-4 border-outline-variant/20">
                <div>
                  <h2 className="font-display-lg text-primary text-xl font-bold">one.shefaro</h2>
                  <p className="text-xs text-on-surface-variant font-mono">CUSTOMER PORTAL</p>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-surface-container rounded-lg">
                  <X className="w-5 h-5 text-on-surface" />
                </button>
              </div>

              <nav className="flex-grow space-y-1 overflow-y-auto">
                {menuItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-semibold text-sm transition-colors ${
                        isActive 
                          ? 'bg-primary text-on-primary' 
                          : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${isActive ? 'bg-white text-primary' : 'bg-rose-500 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-auto pt-4 border-t border-outline-variant/20">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 rounded-xl hover:bg-rose-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Secure Logout</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════
          MAIN CANVAS
          ═══════════════════════════════════════ */}
      <div className="flex-grow flex flex-col min-w-0 min-h-screen">
        
        {/* TOP BAR BAR */}
        <header className="h-20 border-b border-outline-variant/10 bg-surface flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-surface-container rounded-lg"
            >
              <Menu className="w-6 h-6 text-on-surface" />
            </button>
            <h1 className="font-display-md text-lg lg:text-xl text-on-surface font-semibold capitalize hidden sm:block">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Quick Notify Dropdown indicator */}
            <button 
              onClick={() => setActiveTab('notifications')}
              className="p-3 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors relative cursor-pointer group"
            >
              <Bell className="w-5 h-5 text-on-surface-variant group-hover:scale-105 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-surface animate-pulse" />
              )}
            </button>

            {/* Profile Avatar Card */}
            <div className="flex items-center gap-3 bg-surface-container-low pl-3 pr-4 py-2 rounded-xl border border-outline-variant/10">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-mono font-bold uppercase select-none">
                {profile.name.substring(0, 2)}
              </div>
              <div className="text-left hidden md:block">
                <p className="font-semibold text-xs leading-none text-on-surface">{profile.name}</p>
                <p className="text-[10px] text-on-surface-variant font-mono mt-0.5 uppercase leading-none">{profile.status}</p>
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE MAIN BODY */}
        <main className="flex-grow p-6 lg:p-10 overflow-y-auto">
          {isLoading && (
            <div className="flex justify-center items-center py-24">
              <div className="flex flex-col items-center gap-4">
                <span className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></span>
                <p className="text-sm font-semibold text-on-surface-variant">Syncing database registers...</p>
              </div>
            </div>
          )}

          {!isLoading && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                
                {/* ═══════════════════════════════════════
                    TAB 1: OVERVIEW PANEL
                    ═══════════════════════════════════════ */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Welcome Header */}
                    <div className="bg-gradient-to-r from-primary/10 via-primary/[0.04] to-transparent p-8 rounded-2xl border border-primary/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <h2 className="font-display-lg text-xl lg:text-2xl text-primary font-bold">Good day, {profile.name}!</h2>
                        <p className="font-body-md text-sm text-on-surface-variant max-w-xl">Welcome back to your One.Shefaro shipping dashboard. Create express parcel bookings or track shipments seamlessly across India.</p>
                      </div>
                      <button 
                        onClick={() => setIsBookingModalOpen(true)}
                        className="bg-primary text-on-primary font-semibold text-sm px-6 py-3.5 rounded-xl hover:bg-opacity-95 shadow-lg shadow-primary/10 active:scale-[0.98] transition-transform flex items-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Book New Shipment</span>
                      </button>
                    </div>

                    {/* Stats Widget grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-surface p-6 rounded-2xl border border-outline-variant/20 shadow-sm flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-on-surface-variant uppercase font-mono tracking-wide">Total Shipments</p>
                          <h3 className="font-display-lg text-3xl font-extrabold text-on-surface">{shipments.length}</h3>
                        </div>
                        <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                          <Package className="w-6 h-6" />
                        </div>
                      </div>

                      <div className="bg-surface p-6 rounded-2xl border border-outline-variant/20 shadow-sm flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-on-surface-variant uppercase font-mono tracking-wide">Active Trackers</p>
                          <h3 className="font-display-lg text-3xl font-extrabold text-on-surface">
                            {shipments.filter(s => s.status !== 'Delivered' && s.status !== 'Failed/Returned').length}
                          </h3>
                        </div>
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                          <Clock className="w-6 h-6" />
                        </div>
                      </div>

                      <div className="bg-surface p-6 rounded-2xl border border-outline-variant/20 shadow-sm flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-on-surface-variant uppercase font-mono tracking-wide">Wallet Balance</p>
                          <h3 className="font-display-lg text-3xl font-extrabold text-primary">₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                        </div>
                        <button 
                          onClick={() => setActiveTab('wallet')}
                          className="w-12 h-12 bg-amber-50 hover:bg-amber-100 transition-colors rounded-xl flex items-center justify-center text-amber-600 cursor-pointer"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Dual Layout (Recent Shipments & Notifications) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left: Recent bookings */}
                      <div className="lg:col-span-2 bg-surface rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-outline-variant/15 flex justify-between items-center">
                          <h3 className="font-display-md text-base text-on-surface font-bold">Recent Consignments</h3>
                          <button onClick={() => setActiveTab('shipments')} className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
                            <span>View All</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        {shipments.length === 0 ? (
                          <div className="flex-grow flex flex-col items-center justify-center py-16 px-6 text-center">
                            <Package className="w-12 h-12 text-on-surface-variant/20 mb-4" />
                            <p className="font-semibold text-on-surface-variant text-sm">No bookings recorded yet.</p>
                            <button onClick={() => setIsBookingModalOpen(true)} className="text-primary text-xs font-bold mt-2 hover:underline">Book Your First Shipment</button>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                              <thead>
                                <tr className="bg-surface-container-lowest text-on-surface-variant font-mono uppercase text-[10px] tracking-wider border-b border-outline-variant/10">
                                  <th className="px-6 py-4">Consignment ID</th>
                                  <th className="px-6 py-4">Recipient</th>
                                  <th className="px-6 py-4">Destination</th>
                                  <th className="px-6 py-4">Status</th>
                                  <th className="px-6 py-4 text-right">Cost</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-outline-variant/10">
                                {shipments.slice(0, 5).map(s => (
                                  <tr 
                                    key={s.id} 
                                    onClick={() => setSelectedShipment(s)}
                                    className="hover:bg-surface-container-lowest cursor-pointer transition-colors"
                                  >
                                    <td className="px-6 py-4.5 font-mono font-bold text-primary">{s.id}</td>
                                    <td className="px-6 py-4.5 font-semibold text-on-surface">{s.receiverName}</td>
                                    <td className="px-6 py-4.5 text-on-surface-variant truncate max-w-[140px]">{s.destination}</td>
                                    <td className="px-6 py-4.5">
                                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        s.status === 'Delivered' 
                                          ? 'bg-emerald-50 text-emerald-700' 
                                          : s.status === 'Failed/Returned' 
                                            ? 'bg-rose-50 text-rose-700' 
                                            : 'bg-blue-50 text-blue-700'
                                      }`}>
                                        {s.status}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4.5 text-right font-mono font-bold text-on-surface">₹{s.cost}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Right: Quick Notifications alert box */}
                      <div className="bg-surface rounded-2xl border border-outline-variant/20 shadow-sm p-6 flex flex-col h-full max-h-[380px]">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="font-display-md text-base text-on-surface font-bold">Alert Feed</h3>
                          {unreadCount > 0 && (
                            <button onClick={handleMarkAllNotifsRead} className="text-primary text-xs font-semibold hover:underline">
                              Mark all read
                            </button>
                          )}
                        </div>

                        <div className="flex-grow space-y-4 overflow-y-auto pr-1">
                          {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                              <Bell className="w-10 h-10 text-on-surface-variant/20 mb-3" />
                              <p className="text-xs text-on-surface-variant">Your inbox is completely clear.</p>
                            </div>
                          ) : (
                            notifications.slice(0, 4).map(notif => (
                              <button
                                key={notif.id}
                                onClick={() => handleNotifClick(notif)}
                                className={`w-full text-left p-3.5 rounded-xl border transition-colors flex gap-3 cursor-pointer ${
                                  notif.is_read 
                                    ? 'bg-surface border-outline-variant/10 hover:bg-surface-container-lowest' 
                                    : 'bg-primary/5 border-primary/10 hover:bg-primary/10'
                                }`}
                              >
                                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${notif.is_read ? 'bg-on-surface/15' : 'bg-primary'}`} />
                                <div className="space-y-1">
                                  <p className="font-semibold text-xs leading-none text-on-surface">{notif.title}</p>
                                  <p className="text-[11px] text-on-surface-variant leading-tight">{notif.message}</p>
                                  <p className="text-[9px] text-on-surface-variant/60 font-mono mt-1">
                                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}


                {/* ═══════════════════════════════════════
                    TAB 2: SHIPMENTS BOOKING & TRACKING
                    ═══════════════════════════════════════ */}
                {activeTab === 'shipments' && (
                  <div className="space-y-8">
                    {/* Header bar */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <h2 className="font-display-lg text-lg lg:text-xl text-on-surface font-bold">Consignment Manifest</h2>
                        <p className="text-sm text-on-surface-variant">Review tracking status histories, timeline events, or launch express parcel deliveries.</p>
                      </div>
                      <button 
                        onClick={() => setIsBookingModalOpen(true)}
                        className="bg-primary text-on-primary font-semibold text-sm px-5 py-3 rounded-xl hover:bg-opacity-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Book New Parcel</span>
                      </button>
                    </div>

                    {/* Shipments main table or lists */}
                    <div className="bg-surface rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
                      {shipments.length === 0 ? (
                        <div className="py-24 px-6 text-center flex flex-col items-center max-w-sm mx-auto">
                          <Package className="w-16 h-16 text-on-surface-variant/15 mb-6 animate-pulse" />
                          <h4 className="font-display-md text-base text-on-surface font-semibold">No consignments found</h4>
                          <p className="text-sm text-on-surface-variant mt-2 mb-6">You have not registered any delivery parcels. Charge your Shefaro wallet and make your first booking today.</p>
                          <button 
                            onClick={() => setIsBookingModalOpen(true)}
                            className="bg-primary text-on-primary text-xs font-semibold px-5 py-3 rounded-xl"
                          >
                            Get Started
                          </button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm border-collapse">
                            <thead>
                              <tr className="bg-surface-container-lowest text-on-surface-variant font-mono uppercase text-[10px] tracking-wider border-b border-outline-variant/10">
                                <th className="px-6 py-4">Consignment ID</th>
                                <th className="px-6 py-4">Receiver</th>
                                <th className="px-6 py-4">Route</th>
                                <th className="px-6 py-4">Partner</th>
                                <th className="px-6 py-4">Weight</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Fare</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/10">
                              {shipments.map(s => (
                                <tr 
                                  key={s.id}
                                  onClick={() => setSelectedShipment(s)}
                                  className="hover:bg-surface-container-lowest cursor-pointer transition-colors"
                                >
                                  <td className="px-6 py-5 font-mono font-bold text-primary flex items-center gap-2">
                                    <span>{s.id}</span>
                                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                                  </td>
                                  <td className="px-6 py-5">
                                    <p className="font-semibold text-on-surface">{s.receiverName}</p>
                                    <p className="text-xs text-on-surface-variant font-mono mt-0.5">{s.receiverPhone}</p>
                                  </td>
                                  <td className="px-6 py-5">
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="font-semibold">{s.origin.split(' ')[0]}</span>
                                      <span className="text-on-surface-variant font-bold">→</span>
                                      <span className="font-semibold truncate max-w-[100px]">{s.destination.split(',')[0]}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-5 text-on-surface-variant font-medium text-xs">{s.courierPartner}</td>
                                  <td className="px-6 py-5 font-mono text-xs">{s.weight} kg</td>
                                  <td className="px-6 py-5">
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                      s.status === 'Delivered' 
                                        ? 'bg-emerald-50 text-emerald-700' 
                                        : s.status === 'Failed/Returned' 
                                          ? 'bg-rose-50 text-rose-700' 
                                          : 'bg-blue-50 text-blue-700'
                                    }`}>
                                      {s.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-5 text-right font-mono font-bold text-on-surface">₹{s.cost}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}


                {/* ═══════════════════════════════════════
                    TAB 3: ADDRESS BOOK MANAGER
                    ═══════════════════════════════════════ */}
                {activeTab === 'addresses' && (
                  <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <h2 className="font-display-lg text-lg lg:text-xl text-on-surface font-bold">Saved Address Cards</h2>
                        <p className="text-sm text-on-surface-variant">Store default pickup/delivery profiles to accelerate booking operations.</p>
                      </div>
                      <button 
                        onClick={() => {
                          setAddressForm({
                            id: '',
                            label: 'Home',
                            name: '',
                            phone: '',
                            address_line: '',
                            city: '',
                            state: '',
                            pincode: '',
                            is_default: false
                          });
                          setIsAddressModalOpen(true);
                        }}
                        className="bg-primary text-on-primary font-semibold text-sm px-5 py-3 rounded-xl hover:bg-opacity-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add New Address</span>
                      </button>
                    </div>

                    {addresses.length === 0 ? (
                      <div className="bg-surface rounded-2xl border border-outline-variant/20 shadow-sm py-20 px-6 text-center max-w-sm mx-auto flex flex-col items-center">
                        <MapPin className="w-14 h-14 text-on-surface-variant/25 mb-5" />
                        <h4 className="font-display-md text-base text-on-surface font-semibold">Address book is empty</h4>
                        <p className="text-sm text-on-surface-variant mt-2 mb-6">Create predefined addresses to autofill checkout delivery parameters.</p>
                        <button 
                          onClick={() => setIsAddressModalOpen(true)}
                          className="bg-primary text-on-primary text-xs font-semibold px-5 py-3 rounded-xl"
                        >
                          Add Initial Card
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {addresses.map(addr => (
                          <div 
                            key={addr.id}
                            className={`bg-surface p-6 rounded-2xl border shadow-sm flex flex-col justify-between min-h-[220px] transition-all relative ${
                              addr.is_default ? 'border-primary/50 ring-1 ring-primary/20' : 'border-outline-variant/20 hover:border-outline-variant'
                            }`}
                          >
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary font-mono text-[10px] font-bold uppercase tracking-wider">
                                  {addr.label}
                                </span>
                                {addr.is_default && (
                                  <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Default</span>
                                  </span>
                                )}
                              </div>

                              <div className="space-y-1">
                                <p className="font-bold text-sm text-on-surface">{addr.name}</p>
                                <p className="text-xs text-on-surface-variant font-semibold">{addr.phone}</p>
                                <p className="text-xs text-on-surface-variant leading-relaxed pt-1">{addr.address_line}</p>
                                <p className="text-xs text-on-surface-variant leading-none font-medium">
                                  {addr.city}, {addr.state} - <span className="font-mono">{addr.pincode}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-outline-variant/10 mt-6">
                              {!addr.is_default && (
                                <button 
                                  onClick={() => handleSetDefaultAddress(addr)}
                                  className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                                >
                                  Set default
                                </button>
                              )}
                              <button 
                                onClick={() => {
                                  setAddressForm({
                                    id: addr.id,
                                    label: addr.label,
                                    name: addr.name,
                                    phone: addr.phone,
                                    address_line: addr.address_line,
                                    city: addr.city,
                                    state: addr.state,
                                    pincode: addr.pincode,
                                    is_default: addr.is_default
                                  });
                                  setIsAddressModalOpen(true);
                                }}
                                className="text-xs font-semibold text-on-surface-variant hover:text-on-surface cursor-pointer ml-auto"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="text-xs font-semibold text-rose-500 hover:text-rose-600 cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}


                {/* ═══════════════════════════════════════
                    TAB 4: PREPAID WALLET LEDGER
                    ═══════════════════════════════════════ */}
                {activeTab === 'wallet' && (
                  <div className="space-y-8">
                    {/* Balanced grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      
                      {/* Left: Balance card & Top Up Form */}
                      <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gradient-to-br from-primary via-primary to-primary-container p-8 rounded-2xl text-on-primary shadow-lg shadow-primary/10 space-y-6">
                          <div className="space-y-1">
                            <p className="text-xs text-white/70 uppercase font-mono tracking-wider font-semibold">Available Prepaid Balance</p>
                            <h3 className="font-display-lg text-4xl font-extrabold">₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-[11px] bg-white/10 px-2.5 py-1 rounded-md font-medium leading-none">Shefaro Instant-Pay Active</span>
                          </div>
                        </div>

                        {/* Top-up Form Box */}
                        <div className="bg-surface p-6 rounded-2xl border border-outline-variant/20 shadow-sm space-y-4">
                          <h4 className="font-display-md text-sm text-on-surface font-bold">Add Deposit Funds</h4>
                          <form onSubmit={handleWalletTopUp} className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-on-surface-variant font-mono" htmlFor="topUpAmt">AMOUNT (₹)</label>
                              <input 
                                className="w-full h-12 px-4 rounded-xl bg-surface-container border border-outline-variant/10 text-on-surface font-mono font-bold focus:outline-none focus:border-primary"
                                id="topUpAmt"
                                type="number" 
                                min={50}
                                placeholder="Enter Amount"
                                value={topUpAmount}
                                onChange={(e) => setTopUpAmount(e.target.value)}
                              />
                            </div>

                            {/* quick selectors */}
                            <div className="grid grid-cols-3 gap-2">
                              {['200', '500', '1000'].map(amt => (
                                <button 
                                  key={amt}
                                  type="button"
                                  onClick={() => setTopUpAmount(amt)}
                                  className="py-2.5 bg-surface-container hover:bg-outline-variant/20 transition-colors rounded-lg font-mono text-xs font-bold text-on-surface cursor-pointer"
                                >
                                  +₹{amt}
                                </button>
                              ))}
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-on-surface-variant font-mono" htmlFor="topUpMethod">PAYMENT MODE</label>
                              <select 
                                className="w-full h-12 px-3 rounded-xl bg-surface-container border border-outline-variant/10 text-xs font-semibold text-on-surface focus:outline-none"
                                id="topUpMethod"
                                value={payMethod}
                                onChange={(e) => setPayMethod(e.target.value)}
                              >
                                <option value="UPI">UPI Instant Pay (BHIM/GPay)</option>
                                <option value="Card">Visa / MasterCard Debit</option>
                                <option value="NetBanking">NetBanking Secure Portal</option>
                              </select>
                            </div>

                            <button 
                              type="submit"
                              className="w-full h-12 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-md cursor-pointer"
                            >
                              Proceed to Deposit Payment
                            </button>
                          </form>
                        </div>
                      </div>

                      {/* Right: Cash Flows Ledger */}
                      <div className="lg:col-span-2 bg-surface rounded-2xl border border-outline-variant/20 shadow-sm p-6 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                          <h4 className="font-display-md text-base text-on-surface font-bold">Wallet Transaction Logs</h4>
                        </div>

                        {walletTxns.length === 0 ? (
                          <div className="flex-grow flex flex-col items-center justify-center py-24 text-center">
                            <WalletIcon className="w-12 h-12 text-on-surface-variant/20 mb-4 animate-pulse" />
                            <p className="text-sm font-semibold text-on-surface-variant">No transactions logged.</p>
                          </div>
                        ) : (
                          <div className="space-y-3 flex-grow overflow-y-auto max-h-[500px] pr-1">
                            {walletTxns.map(tx => (
                              <div 
                                key={tx.id}
                                className="p-4 rounded-xl border border-outline-variant/10 bg-surface flex items-center justify-between"
                              >
                                <div className="flex gap-3 items-center">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                    tx.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                  }`}>
                                    {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-xs text-on-surface leading-tight">{tx.description}</p>
                                    <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">
                                      {new Date(tx.created_at || tx.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className={`font-mono font-bold text-xs ${tx.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {tx.type === 'credit' ? '+' : '-'} ₹{Math.abs(tx.amount)}
                                  </p>
                                  <p className="text-[9px] text-on-surface-variant font-mono uppercase mt-0.5">{tx.id}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}


                {/* ═══════════════════════════════════════
                    TAB 5: TRANSACTIONS & INVOICES
                    ═══════════════════════════════════════ */}
                {activeTab === 'payments' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="font-display-lg text-lg lg:text-xl text-on-surface font-bold">Billing Ledger</h2>
                      <p className="text-sm text-on-surface-variant">Review commercial checkout logs, prepaid debits, and download formal receipts.</p>
                    </div>

                    <div className="bg-surface rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
                      {transactions.length === 0 ? (
                        <div className="py-20 px-6 text-center max-w-sm mx-auto flex flex-col items-center">
                          <Receipt className="w-14 h-14 text-on-surface-variant/20 mb-5" />
                          <h4 className="font-display-md text-base text-on-surface font-semibold font-bold">No payments found</h4>
                          <p className="text-sm text-on-surface-variant mt-2">Any transaction processed on cargo shipments will appear on this invoice panel.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm border-collapse">
                            <thead>
                              <tr className="bg-surface-container-lowest text-on-surface-variant font-mono uppercase text-[10px] tracking-wider border-b border-outline-variant/10">
                                <th className="px-6 py-4">Transaction Reference</th>
                                <th className="px-6 py-4">Invoice Date</th>
                                <th className="px-6 py-4">Payer Name</th>
                                <th className="px-6 py-4">Payment Channel</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-right">Receipt</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/10">
                              {transactions.map(t => (
                                <tr key={t.id} className="hover:bg-surface-container-lowest transition-colors">
                                  <td className="px-6 py-4.5 font-mono font-bold text-primary">{t.id}</td>
                                  <td className="px-6 py-4.5 font-medium text-xs text-on-surface-variant">
                                    {new Date(t.date || t.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                  </td>
                                  <td className="px-6 py-4.5 font-semibold text-on-surface">{t.customerName || profile.name}</td>
                                  <td className="px-6 py-4.5 font-medium text-xs text-on-surface-variant">{t.paymentMethod || 'Wallet'}</td>
                                  <td className="px-6 py-4.5">
                                    <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700">
                                      Success
                                    </span>
                                  </td>
                                  <td className="px-6 py-4.5 text-right font-mono font-bold text-on-surface">₹{t.amount}</td>
                                  <td className="px-6 py-4.5 text-right">
                                    <button 
                                      onClick={() => setSelectedInvoice(t)}
                                      className="text-xs font-bold text-primary hover:underline flex items-center justify-end gap-1 ml-auto cursor-pointer"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>View</span>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}


                {/* ═══════════════════════════════════════
                    TAB 6: CONVERSATIONAL SUPPORT TICKETS
                    ═══════════════════════════════════════ */}
                {activeTab === 'support' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      
                      {/* Left side: Raise ticket form */}
                      <div className="lg:col-span-1 bg-surface p-6 rounded-2xl border border-outline-variant/20 shadow-sm space-y-4">
                        <h3 className="font-display-md text-base text-on-surface font-bold">Lodge Complaint / Dispute</h3>
                        <form onSubmit={handleCreateTicket} className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-on-surface-variant font-mono" htmlFor="tktSubject">SUBJECT TOPIC</label>
                            <input 
                              className="w-full h-12 px-4 rounded-xl bg-surface-container border border-outline-variant/10 text-xs text-on-surface font-semibold focus:outline-none"
                              id="tktSubject"
                              placeholder="e.g. Delayed Parcel SHF-82391"
                              type="text"
                              value={newTicketSubject}
                              onChange={(e) => setNewTicketSubject(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-on-surface-variant font-mono" htmlFor="tktPriority">PRIORITY LEVEL</label>
                            <select 
                              className="w-full h-12 px-3 rounded-xl bg-surface-container border border-outline-variant/10 text-xs font-semibold text-on-surface focus:outline-none"
                              id="tktPriority"
                              value={newTicketPriority}
                              onChange={(e) => setNewTicketPriority(e.target.value as any)}
                            >
                              <option value="Low">Low - Basic inquiries</option>
                              <option value="Medium">Medium - Standard concerns</option>
                              <option value="High">High - Urgent parcel blockages</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-on-surface-variant font-mono" htmlFor="tktDesc">MESSAGE DESCRIPTIVES</label>
                            <textarea 
                              className="w-full p-4 rounded-xl bg-surface-container border border-outline-variant/10 text-xs text-on-surface font-medium focus:outline-none min-h-[120px]"
                              id="tktDesc"
                              placeholder="Please detail your tracking concerns or dispute parameters clearly."
                              value={newTicketMsg}
                              onChange={(e) => setNewTicketMsg(e.target.value)}
                            />
                          </div>

                          <button 
                            type="submit"
                            className="w-full h-12 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-md cursor-pointer"
                          >
                            Submit Support Ticket
                          </button>
                        </form>
                      </div>

                      {/* Right side: Ticket logs & thread chats */}
                      <div className="lg:col-span-2 bg-surface rounded-2xl border border-outline-variant/20 shadow-sm p-6 flex flex-col min-h-[480px]">
                        <h3 className="font-display-md text-base text-on-surface font-bold mb-6">Dispute & Inquiries Archive</h3>

                        {tickets.length === 0 ? (
                          <div className="flex-grow flex flex-col items-center justify-center py-20 text-center">
                            <LifeBuoy className="w-12 h-12 text-on-surface-variant/20 mb-4 animate-pulse" />
                            <p className="text-sm font-semibold text-on-surface-variant">No active support claims raised.</p>
                          </div>
                        ) : (
                          <div className="space-y-3 flex-grow overflow-y-auto max-h-[420px] pr-1">
                            {tickets.map(t => (
                              <div 
                                key={t.id}
                                className="p-4 rounded-xl border border-outline-variant/10 hover:border-outline-variant/30 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-xs text-primary">{t.id}</span>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                      t.priority === 'High' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                                    }`}>
                                      {t.priority}
                                    </span>
                                  </div>
                                  <p className="font-bold text-xs text-on-surface">{t.subject}</p>
                                  <p className="text-[10px] text-on-surface-variant font-mono">LODGED: {t.date}</p>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                                    t.status === 'Resolved' 
                                      ? 'bg-emerald-50 text-emerald-700' 
                                      : t.status === 'In Progress' 
                                        ? 'bg-amber-50 text-amber-700' 
                                        : 'bg-blue-50 text-blue-700'
                                  }`}>
                                    {t.status}
                                  </span>
                                  <button 
                                    onClick={() => setSelectedTicket(t)}
                                    className="px-3.5 py-2 bg-surface-container-high text-xs font-semibold text-on-surface rounded-lg hover:bg-outline-variant/20 cursor-pointer"
                                  >
                                    Interact Chat
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}


                {/* ═══════════════════════════════════════
                    TAB 7: NOTIFICATIONS CENTER
                    ═══════════════════════════════════════ */}
                {activeTab === 'notifications' && (
                  <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <h2 className="font-display-lg text-lg lg:text-xl text-on-surface font-bold">Personal Alerts</h2>
                        <p className="text-sm text-on-surface-variant font-medium">Real-time deep links concerning financial clearances or timeline transitions.</p>
                      </div>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllNotifsRead}
                          className="bg-primary text-on-primary font-semibold text-sm px-5 py-3 rounded-xl hover:bg-opacity-95 shadow-md cursor-pointer"
                        >
                          Mark All as Read
                        </button>
                      )}
                    </div>

                    <div className="bg-surface rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden p-6 max-w-3xl mx-auto">
                      {notifications.length === 0 ? (
                        <div className="py-24 text-center flex flex-col items-center">
                          <Bell className="w-14 h-14 text-on-surface-variant/25 mb-5 animate-bounce" />
                          <h4 className="font-display-md text-base text-on-surface font-semibold">Inbox is clear</h4>
                          <p className="text-sm text-on-surface-variant mt-2">When cargo updates occur or wallet balances replenish, alert triggers will log here.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {notifications.map(n => (
                            <div 
                              key={n.id}
                              onClick={() => handleNotifClick(n)}
                              className={`p-4 rounded-xl border transition-colors flex justify-between items-center cursor-pointer ${
                                n.is_read 
                                  ? 'bg-surface border-outline-variant/15 hover:bg-surface-container-lowest' 
                                  : 'bg-primary/[0.04] border-primary/20 hover:bg-primary/10'
                              }`}
                            >
                              <div className="flex gap-4 items-start">
                                <div className={`w-3.5 h-3.5 rounded-full mt-1 shrink-0 ${n.is_read ? 'bg-on-surface/10' : 'bg-primary'}`} />
                                <div className="space-y-1">
                                  <p className="font-bold text-xs text-on-surface leading-tight">{n.title}</p>
                                  <p className="text-[11px] text-on-surface-variant leading-relaxed">{n.message}</p>
                                  <p className="text-[9px] text-on-surface-variant/60 font-mono mt-1">
                                    {new Date(n.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                  </p>
                                </div>
                              </div>
                              <span className="text-primary text-[10px] font-bold font-mono">DEEP-LINK</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}


                {/* ═══════════════════════════════════════
                    TAB 8: ACCOUNT SETTINGS
                    ═══════════════════════════════════════ */}
                {activeTab === 'settings' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                      
                      {/* Left: edit details */}
                      <div className="bg-surface p-6 rounded-2xl border border-outline-variant/20 shadow-sm space-y-6">
                        <h3 className="font-display-md text-base text-on-surface font-bold">Profile Details</h3>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-on-surface-variant font-mono" htmlFor="settName">FULL LEGAL NAME</label>
                            <input 
                              className="w-full h-12 px-4 rounded-xl bg-surface-container border border-outline-variant/10 text-xs text-on-surface font-semibold focus:outline-none"
                              id="settName"
                              type="text"
                              value={profile.name}
                              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-on-surface-variant font-mono" htmlFor="settEmail">EMAIL ADDRESS (Locked)</label>
                            <input 
                              className="w-full h-12 px-4 rounded-xl bg-surface-container-high border border-outline-variant/10 text-xs text-on-surface-variant font-mono focus:outline-none opacity-65"
                              id="settEmail"
                              type="email"
                              disabled
                              value={profile.email}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-on-surface-variant font-mono" htmlFor="settPhone">PHONE NUMBER</label>
                            <input 
                              className="w-full h-12 px-4 rounded-xl bg-surface-container border border-outline-variant/10 text-xs text-on-surface font-semibold focus:outline-none"
                              id="settPhone"
                              type="text"
                              value={profile.phone}
                              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-on-surface-variant font-mono" htmlFor="settLang">PREFERRED LANGUAGE</label>
                            <select 
                              className="w-full h-12 px-3 rounded-xl bg-surface-container border border-outline-variant/10 text-xs font-semibold text-on-surface focus:outline-none"
                              id="settLang"
                              value={prefLang}
                              onChange={(e) => setPrefLang(e.target.value)}
                            >
                              <option value="English">English (IN)</option>
                              <option value="Hindi">Hindi (हिंदी)</option>
                              <option value="Marathi">Marathi (मराठी)</option>
                            </select>
                          </div>

                          <button 
                            type="submit"
                            className="w-full h-12 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-md cursor-pointer"
                          >
                            Save Profile Settings
                          </button>
                        </form>
                      </div>

                      {/* Right: notifications preferences & delete account */}
                      <div className="space-y-8">
                        {/* Notify preferences */}
                        <div className="bg-surface p-6 rounded-2xl border border-outline-variant/20 shadow-sm space-y-4">
                          <h3 className="font-display-md text-base text-on-surface font-bold">Push Channels</h3>
                          <p className="text-xs text-on-surface-variant leading-relaxed">Specify transit notifications routing triggers:</p>
                          <div className="space-y-3 pt-2">
                            {Object.keys(profile.notification_preferences || {}).map(ch => (
                              <label key={ch} className="flex items-center gap-3 cursor-pointer select-none">
                                <input 
                                  type="checkbox" 
                                  checked={profile.notification_preferences?.[ch] ?? false}
                                  onChange={(e) => setProfile({
                                    ...profile,
                                    notification_preferences: {
                                      ...profile.notification_preferences,
                                      [ch]: e.target.checked
                                    }
                                  })}
                                  className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                                />
                                <span className="text-xs font-semibold text-on-surface capitalize">Receive {ch} alert integrations</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Soft suspension / danger zone */}
                        <div className="bg-surface p-6 rounded-2xl border border-rose-200/50 bg-rose-50/20 shadow-sm space-y-4">
                          <h3 className="font-display-md text-base text-rose-800 font-bold flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5" />
                            <span>Danger Zone</span>
                          </h3>
                          <p className="text-xs text-on-surface-variant leading-relaxed">Suspending your Shefaro profile will freeze your active trackers, terminate current billing agreements, and log you out. This action is fully recoverable.</p>
                          <button 
                            onClick={handleDeactivateAccount}
                            className="h-11 px-5 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 cursor-pointer"
                          >
                            Temporarily Deactivate Profile
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>


      {/* ═══════════════════════════════════════
          MODAL 1: BOOKING CONSIGNMENT MODAL
          ═══════════════════════════════════════ */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute inset-0 bg-black"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-2xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto flex flex-col"
            >
              <div className="flex justify-between items-center border-b pb-4 border-outline-variant/10 shrink-0 mb-6">
                <h3 className="font-display-lg text-lg text-primary font-bold">Consignment Registration</h3>
                <button onClick={() => setIsBookingModalOpen(false)} className="p-1 hover:bg-surface-container rounded-lg cursor-pointer">
                  <X className="w-5 h-5 text-on-surface" />
                </button>
              </div>

              <form onSubmit={handleBookShipment} className="space-y-6 overflow-y-auto flex-grow pr-1">
                {/* Section: Sender (Auto filled) */}
                <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/5">
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Sender Profile (You)</h4>
                  <p className="text-xs font-semibold text-on-surface">{profile.name} • {profile.phone}</p>
                </div>

                {/* Section: Recipient Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider font-mono">Consignee (Recipient) Parameters</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-on-surface-variant font-mono" htmlFor="recName">RECIPIENT NAME</label>
                      <input 
                        className="w-full h-11 px-3 rounded-lg bg-surface-container border border-outline-variant/10 text-xs font-semibold text-on-surface focus:outline-none"
                        id="recName"
                        type="text" 
                        placeholder="Consignee Name"
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-on-surface-variant font-mono" htmlFor="recPhone">CONTACT PHONE</label>
                      <input 
                        className="w-full h-11 px-3 rounded-lg bg-surface-container border border-outline-variant/10 text-xs font-semibold text-on-surface focus:outline-none"
                        id="recPhone"
                        type="text" 
                        placeholder="+91 Mobile number"
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-on-surface-variant font-mono" htmlFor="recAddr">DELIVERY ADDRESS LINE</label>
                    <input 
                      className="w-full h-11 px-3 rounded-lg bg-surface-container border border-outline-variant/10 text-xs font-semibold text-on-surface focus:outline-none"
                      id="recAddr"
                      type="text" 
                      placeholder="e.g. 402, Block B, Oberoi Gardens"
                      value={destAddress}
                      onChange={(e) => setDestAddress(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-on-surface-variant font-mono" htmlFor="recCity">CITY</label>
                      <input 
                        className="w-full h-11 px-3 rounded-lg bg-surface-container border border-outline-variant/10 text-xs font-semibold text-on-surface focus:outline-none"
                        id="recCity"
                        type="text" 
                        placeholder="City"
                        value={destCity}
                        onChange={(e) => setDestCity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-on-surface-variant font-mono" htmlFor="recState">STATE</label>
                      <input 
                        className="w-full h-11 px-3 rounded-lg bg-surface-container border border-outline-variant/10 text-xs font-semibold text-on-surface focus:outline-none"
                        id="recState"
                        type="text" 
                        placeholder="State"
                        value={destState}
                        onChange={(e) => setDestState(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-on-surface-variant font-mono" htmlFor="recPin">PINCODE</label>
                      <input 
                        className="w-full h-11 px-3 rounded-lg bg-surface-container border border-outline-variant/10 text-xs font-semibold text-on-surface focus:outline-none"
                        id="recPin"
                        type="text" 
                        maxLength={6}
                        placeholder="6-digit Pincode"
                        value={destPincode}
                        onChange={(e) => setDestPincode(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Cargo Details */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider font-mono">Consignment Specifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-on-surface-variant font-mono" htmlFor="cargoWeight">CARGO WEIGHT (KG)</label>
                      <input 
                        className="w-full h-11 px-3 rounded-lg bg-surface-container border border-outline-variant/10 text-xs font-mono font-bold text-on-surface focus:outline-none"
                        id="cargoWeight"
                        type="number" 
                        min={0.5}
                        step={0.5}
                        value={itemWeight}
                        onChange={(e) => setItemWeight(parseFloat(e.target.value) || 0.5)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-on-surface-variant font-mono" htmlFor="cargoSpeed">SHIPPING SERVICE</label>
                      <select 
                        className="w-full h-11 px-2.5 rounded-lg bg-surface-container border border-outline-variant/10 text-xs font-semibold text-on-surface focus:outline-none"
                        id="cargoSpeed"
                        value={shippingSpeed}
                        onChange={(e) => setShippingSpeed(e.target.value as any)}
                      >
                        <option value="Standard">Standard Domestic (3-5 days)</option>
                        <option value="Express">Express Air (24-48 hrs)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-on-surface-variant font-mono" htmlFor="cargoOrigin">DEPOT ORIGIN</label>
                      <select 
                        className="w-full h-11 px-2.5 rounded-lg bg-surface-container border border-outline-variant/10 text-xs font-semibold text-on-surface focus:outline-none"
                        id="cargoOrigin"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                      >
                        <option value="New Delhi (DEL)">New Delhi (DEL)</option>
                        <option value="Mumbai (BOM)">Mumbai (BOM)</option>
                        <option value="Bengaluru (BLR)">Bengaluru (BLR)</option>
                        <option value="Kolkata (CCU)">Kolkata (CCU)</option>
                        <option value="Chennai (MAA)">Chennai (MAA)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-on-surface-variant font-mono" htmlFor="cargoDesc">ITEM CONTENT DESCRIPTION</label>
                    <input 
                      className="w-full h-11 px-3 rounded-lg bg-surface-container border border-outline-variant/10 text-xs font-semibold text-on-surface focus:outline-none"
                      id="cargoDesc"
                      type="text" 
                      placeholder="e.g. Leather shoes, Legal documents"
                      value={itemDesc}
                      onChange={(e) => setItemDesc(e.target.value)}
                    />
                  </div>
                </div>

                {/* Section: Discount coupon */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-bold text-on-surface-variant font-mono" htmlFor="cargoPromo">PROMO / DISCOUNT DISCOUNT</label>
                  <div className="flex gap-2">
                    <input 
                      className="flex-grow h-11 px-3 rounded-lg bg-surface-container border border-outline-variant/10 text-xs font-mono font-bold text-on-surface uppercase focus:outline-none"
                      id="cargoPromo"
                      type="text" 
                      placeholder="Try WELCOME50 or FREESHIP"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={handleApplyPromo}
                      className="h-11 px-4 bg-surface-container-high rounded-lg text-xs font-bold text-on-surface cursor-pointer"
                    >
                      Apply Code
                    </button>
                  </div>
                </div>

                {/* Pricing / Checkouts */}
                <div className="p-5 bg-primary/[0.04] rounded-2xl border border-primary/10 flex items-center justify-between mt-6">
                  <div>
                    <p className="text-xs font-semibold text-on-surface-variant">Estimated Delivery Cost</p>
                    <p className="text-[10px] text-on-surface-variant/70 font-mono mt-0.5">Deducted from prepaid wallet balance</p>
                  </div>
                  <div className="text-right">
                    <h3 className="font-display-lg text-2xl font-extrabold text-primary">₹{calculateBookingCost()}</h3>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 shrink-0">
                  <button 
                    type="button" 
                    onClick={() => setIsBookingModalOpen(false)}
                    className="flex-1 h-12 bg-surface-container-high text-on-surface font-semibold text-xs rounded-xl hover:bg-outline-variant/20 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 h-12 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-lg cursor-pointer"
                  >
                    Authorize Payment & Book
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ═══════════════════════════════════════
          MODAL 2: SHIPMENT TIMELINE DETAILS
          ═══════════════════════════════════════ */}
      <AnimatePresence>
        {selectedShipment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedShipment(null)}
              className="absolute inset-0 bg-black"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-surface rounded-2xl shadow-2xl p-6 lg:p-8 max-h-[85vh] overflow-y-auto flex flex-col"
            >
              <div className="flex justify-between items-center border-b pb-4 border-outline-variant/10 shrink-0 mb-6">
                <div>
                  <h3 className="font-display-lg text-base text-primary font-bold">Consignment Tracking</h3>
                  <p className="text-xs text-on-surface-variant font-mono mt-0.5">ID Reference: {selectedShipment.id}</p>
                </div>
                <button onClick={() => setSelectedShipment(null)} className="p-1 hover:bg-surface-container rounded-lg cursor-pointer">
                  <X className="w-5 h-5 text-on-surface" />
                </button>
              </div>

              <div className="space-y-6 overflow-y-auto flex-grow pr-1">
                {/* Visual Tracker Stepper */}
                <div className="space-y-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5">
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider font-mono">Transit Progression</h4>
                  
                  {/* Progress Line UI */}
                  <div className="grid grid-cols-4 relative pt-4">
                    <div className="absolute top-6 left-1/8 right-1/8 h-1 bg-outline-variant/30 z-0">
                      <div className="h-full bg-primary transition-all duration-500" style={{
                        width: selectedShipment.status === 'Booked' ? '0%' : selectedShipment.status === 'Picked Up' ? '33.3%' : selectedShipment.status === 'In Transit' ? '66.6%' : '100%'
                      }} />
                    </div>

                    {['Booked', 'Picked Up', 'In Transit', 'Delivered'].map((step, idx) => {
                      const states = ['Booked', 'Picked Up', 'In Transit', 'Delivered'];
                      const currentIdx = states.indexOf(selectedShipment.status);
                      const isCompleted = currentIdx >= idx;
                      return (
                        <div key={step} className="flex flex-col items-center z-10 text-center space-y-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isCompleted ? 'bg-primary text-on-primary' : 'bg-surface border-2 border-outline-variant/40 text-on-surface-variant'
                          }`}>
                            {idx + 1}
                          </div>
                          <span className={`text-[10px] font-bold leading-none ${isCompleted ? 'text-primary' : 'text-on-surface-variant'}`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/10">
                    <p className="text-[10px] font-bold text-on-surface-variant font-mono uppercase">Recipient Profile</p>
                    <p className="font-bold text-on-surface mt-1">{selectedShipment.receiverName}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">{selectedShipment.receiverPhone}</p>
                  </div>
                  <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/10">
                    <p className="text-[10px] font-bold text-on-surface-variant font-mono uppercase">Destination</p>
                    <p className="font-semibold text-on-surface mt-1 truncate max-w-[180px]">{selectedShipment.destination}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Route: {selectedShipment.origin} → Dest</p>
                  </div>
                </div>

                {/* Stepper details checklist history */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider font-mono">Detailed Timeline Log</h4>
                  
                  <div className="relative border-l border-outline-variant/30 pl-5 space-y-6 ml-2 pt-2">
                    {selectedShipment.timeline && selectedShipment.timeline.length > 0 ? (
                      selectedShipment.timeline.map((evt: any, i: number) => (
                        <div key={i} className="relative space-y-1">
                          {/* Left bullet */}
                          <div className={`absolute -left-[26px] top-1 w-3 h-3 rounded-full ring-4 ring-surface ${i === 0 ? 'bg-primary' : 'bg-on-surface/20'}`} />
                          <p className="font-bold text-xs text-on-surface">{evt.status} - <span className="text-on-surface-variant/70 font-medium">{evt.location}</span></p>
                          <p className="text-xs text-on-surface-variant leading-relaxed">{evt.description}</p>
                          <p className="text-[9px] text-on-surface-variant/50 font-mono pt-0.5">{evt.date}</p>
                        </div>
                      ))
                    ) : (
                      <div className="relative space-y-1">
                        <div className="absolute -left-[26px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-surface" />
                        <p className="font-bold text-xs text-on-surface">Booked</p>
                        <p className="text-xs text-on-surface-variant">Consignment details processed. Cargo dispatcher awaiting local pickup.</p>
                        <p className="text-[9px] text-on-surface-variant/50 font-mono">{selectedShipment.dateBooked}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedShipment(null)}
                className="w-full h-11 bg-surface-container-high text-on-surface font-semibold text-xs rounded-xl mt-6 cursor-pointer hover:bg-outline-variant/20 shrink-0"
              >
                Close Tracking Canvas
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ═══════════════════════════════════════
          MODAL 3: INVOICE BILLING RECEIPT MODAL
          ═══════════════════════════════════════ */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInvoice(null)}
              className="absolute inset-0 bg-black"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-surface rounded-2xl shadow-2xl p-6 lg:p-8"
            >
              <div className="flex justify-between items-center border-b pb-4 border-outline-variant/10 mb-6">
                <div>
                  <h3 className="font-display-lg text-sm text-primary font-extrabold uppercase tracking-widest font-mono">One.Shefaro Invoice</h3>
                  <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">REFERENCE: {selectedInvoice.id}</p>
                </div>
                <button onClick={() => setSelectedInvoice(null)} className="p-1 hover:bg-surface-container rounded-lg cursor-pointer">
                  <X className="w-5 h-5 text-on-surface" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Visual receipt layout */}
                <div className="border border-dashed border-outline-variant/30 rounded-xl p-5 space-y-4 font-mono text-xs">
                  <div className="flex justify-between border-b pb-3 border-outline-variant/10">
                    <span className="text-on-surface-variant font-medium">Billed To</span>
                    <span className="font-bold text-on-surface">{selectedInvoice.customerName || profile.name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-3 border-outline-variant/10">
                    <span className="text-on-surface-variant font-medium">Invoice Date</span>
                    <span className="font-bold text-on-surface">
                      {new Date(selectedInvoice.date || selectedInvoice.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-3 border-outline-variant/10">
                    <span className="text-on-surface-variant font-medium">Payment Mode</span>
                    <span className="font-bold text-on-surface">{selectedInvoice.paymentMethod || 'Prepaid Wallet'}</span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between font-bold">
                      <span>Description</span>
                      <span>Line Fare</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant text-[11px]">
                      <span>Domestic Cargo Booking Fee</span>
                      <span>₹{selectedInvoice.amount}</span>
                    </div>
                  </div>

                  <div className="border-t border-outline-variant/20 pt-3 flex justify-between font-extrabold text-sm text-primary">
                    <span>TOTAL AUTHORIZED</span>
                    <span>₹{selectedInvoice.amount}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => { window.print(); }}
                    className="flex-1 h-11 bg-surface-container-high text-on-surface font-semibold text-xs rounded-xl hover:bg-outline-variant/20 cursor-pointer"
                  >
                    Download PDF
                  </button>
                  <button 
                    onClick={() => setSelectedInvoice(null)}
                    className="flex-1 h-11 bg-primary text-on-primary font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ═══════════════════════════════════════
          MODAL 4: INTERACTIVE SUPPORT CHAT MODAL
          ═══════════════════════════════════════ */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTicket(null)}
              className="absolute inset-0 bg-black"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-surface rounded-2xl shadow-2xl p-6 lg:p-8 max-h-[85vh] overflow-y-auto flex flex-col"
            >
              <div className="flex justify-between items-center border-b pb-4 border-outline-variant/10 shrink-0 mb-4">
                <div>
                  <h3 className="font-display-lg text-base text-primary font-bold">Ticket Discussion Thread</h3>
                  <p className="text-xs text-on-surface-variant font-mono mt-0.5">Reference ID: {selectedTicket.id}</p>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="p-1 hover:bg-surface-container rounded-lg cursor-pointer">
                  <X className="w-5 h-5 text-on-surface" />
                </button>
              </div>

              {/* Chat Thread Messages bubble list */}
              <div className="flex-grow overflow-y-auto space-y-4 pr-1 min-h-[280px] p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/5">
                {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                  selectedTicket.messages.map((m: any, idx: number) => {
                    const isCustomer = m.sender === 'Customer' || m.sender_type === 'customer';
                    return (
                      <div 
                        key={idx} 
                        className={`flex flex-col max-w-[85%] ${isCustomer ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <p className="text-[10px] text-on-surface-variant font-semibold mb-1">
                          {isCustomer ? 'You (Customer)' : 'Support Desk'}
                        </p>
                        <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isCustomer 
                            ? 'bg-primary text-on-primary rounded-tr-none' 
                            : 'bg-surface-container-high text-on-surface rounded-tl-none border border-outline-variant/10'
                        }`}>
                          {m.content || m.message}
                        </div>
                        <span className="text-[8px] text-on-surface-variant/60 font-mono mt-1">
                          {new Date(m.timestamp || m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-xs text-on-surface-variant font-medium">
                    No replies logged yet.
                  </div>
                )}
              </div>

              {/* Reply box */}
              <form onSubmit={handleTicketReply} className="flex gap-2 mt-4 shrink-0">
                <input 
                  className="flex-grow h-11 px-4 rounded-xl bg-surface-container border border-outline-variant/10 text-xs font-medium text-on-surface focus:outline-none"
                  type="text" 
                  placeholder="Type descriptive response message..."
                  value={ticketReplyMsg}
                  onChange={(e) => setTicketReplyMsg(e.target.value)}
                />
                <button 
                  type="submit"
                  className="h-11 px-4 bg-primary text-on-primary rounded-xl flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ═══════════════════════════════════════
          MODAL 5: SAVE ADDRESS MANAGER MODAL
          ═══════════════════════════════════════ */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute inset-0 bg-black"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-surface rounded-2xl shadow-2xl p-6 lg:p-8"
            >
              <div className="flex justify-between items-center border-b pb-4 border-outline-variant/10 mb-6">
                <h3 className="font-display-lg text-base text-primary font-bold">
                  {addressForm.id ? 'Edit Address Card' : 'Create Address Card'}
                </h3>
                <button onClick={() => setIsAddressModalOpen(false)} className="p-1 hover:bg-surface-container rounded-lg cursor-pointer">
                  <X className="w-5 h-5 text-on-surface" />
                </button>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-on-surface-variant font-mono" htmlFor="addrLabel">TAG LABEL</label>
                    <select 
                      className="w-full h-11 px-2 rounded-lg bg-surface-container border border-outline-variant/10 text-xs font-semibold text-on-surface focus:outline-none"
                      id="addrLabel"
                      value={addressForm.label}
                      onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                    >
                      <option value="Home">Home (Default Residence)</option>
                      <option value="Office">Office (Corporate Hub)</option>
                      <option value="Warehouse">Warehouse (Logistics)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-on-surface-variant font-mono" htmlFor="addrName">CONTACT FULL NAME</label>
                    <input 
                      className="w-full h-11 px-3 rounded-lg bg-surface-container border border-outline-variant/10 text-xs font-semibold text-on-surface focus:outline-none"
                      id="addrName"
                      type="text" 
                      placeholder="Receiver Name"
                      value={addressForm.name}
                      onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant font-mono" htmlFor="addrPhone">CONTACT PHONE</label>
                  <input 
                    className="w-full h-11 px-3 rounded-lg bg-surface-container border border-outline-variant/10 text-xs font-semibold text-on-surface focus:outline-none"
                    id="addrPhone"
                    type="text" 
                    placeholder="Mobile"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant font-mono" htmlFor="addrLine">STREET ADDRESS LINE</label>
                  <input 
                    className="w-full h-11 px-3 rounded-lg bg-surface-container border border-outline-variant/10 text-xs font-semibold text-on-surface focus:outline-none"
                    id="addrLine"
                    type="text" 
                    placeholder="Plot Number, Area, Landmark"
                    value={addressForm.address_line}
                    onChange={(e) => setAddressForm({ ...addressForm, address_line: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-on-surface-variant font-mono" htmlFor="addrCity">CITY</label>
                    <input 
                      className="w-full h-11 px-3 rounded-lg bg-surface-container border border-outline-variant/10 text-xs font-semibold text-on-surface focus:outline-none"
                      id="addrCity"
                      type="text" 
                      placeholder="City"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-on-surface-variant font-mono" htmlFor="addrState">STATE</label>
                    <input 
                      className="w-full h-11 px-3 rounded-lg bg-surface-container border border-outline-variant/10 text-xs font-semibold text-on-surface focus:outline-none"
                      id="addrState"
                      type="text" 
                      placeholder="State"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-on-surface-variant font-mono" htmlFor="addrPin">PINCODE</label>
                    <input 
                      className="w-full h-11 px-3 rounded-lg bg-surface-container border border-outline-variant/10 text-xs font-semibold text-on-surface focus:outline-none"
                      id="addrPin"
                      type="text" 
                      maxLength={6}
                      placeholder="Pin"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2.5 pt-2 select-none cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={addressForm.is_default}
                    onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                    className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-on-surface">Mark as default delivery card</span>
                </label>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsAddressModalOpen(false)}
                    className="flex-1 h-11 bg-surface-container-high text-on-surface font-semibold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 h-11 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    Save Address Card
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
