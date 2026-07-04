import { supabase, supabaseAdmin } from './supabaseClient';
import {
  UserAccount,
  Shipment,
  PricingRate,
  PromoCode,
  CourierPartner,
  FAQItem,
  AboutSection,
  Transaction,
  SupportTicket,
  AdminUser,
  AuditLog
} from '../admin/types';

// Let's define the local fallback key in case the remote DB isn't fully created/accessible yet.
const FALLBACK_KEY = 'oneshefaro_admin_db_fallback';

// Get fallback DB state from local storage (for robust graceful degradation)
const getLocalFallbackDB = () => {
  const data = localStorage.getItem(FALLBACK_KEY);
  if (!data) {
    const rawDefault = localStorage.getItem('oneshefaro_admin_db');
    if (rawDefault) {
      return JSON.parse(rawDefault);
    }
    return null;
  }
  return JSON.parse(data);
};

const saveLocalFallbackDB = (db: any) => {
  localStorage.setItem(FALLBACK_KEY, JSON.stringify(db));
};

// Map database fields to application types
const mapUser = (u: any): UserAccount => ({
  id: u.id,
  name: u.name || '',
  email: u.email || '',
  phone: u.phone || '',
  signupDate: u.signup_date || u.signupDate || new Date().toISOString().substring(0, 10),
  shipmentCount: Number(u.shipment_count ?? u.shipmentCount ?? 0),
  status: (u.status === 'Suspended' ? 'Suspended' : 'Active') as 'Active' | 'Suspended'
});

const mapShipment = (s: any): Shipment => ({
  id: s.id,
  senderName: s.sender_name || s.senderName || '',
  senderPhone: s.sender_phone || s.senderPhone || '',
  receiverName: s.receiver_name || s.receiverName || '',
  receiverPhone: s.receiver_phone || s.receiverPhone || '',
  origin: s.origin || '',
  destination: s.destination || '',
  status: (s.status || 'Booked') as Shipment['status'],
  courierPartner: s.courier_partner || s.courierPartner || 'Delhivery',
  dateBooked: s.date_booked || s.dateBooked || new Date().toISOString().substring(0, 10),
  items: s.items || '',
  weight: Number(s.weight ?? 0),
  cost: Number(s.cost ?? 0),
  timeline: s.timeline || []
});

const mapPricingRate = (p: any): PricingRate => ({
  id: p.id,
  weightSlab: p.weight_slab || p.weightSlab || '',
  zone: p.zone || '',
  standardRate: Number(p.standard_rate ?? p.standardRate ?? 0),
  expressRate: Number(p.express_rate ?? p.expressRate ?? 0)
});

const mapPromoCode = (p: any): PromoCode => ({
  id: p.id,
  code: p.code || '',
  discountPercent: Number(p.discount_percent ?? p.discountPercent ?? 0),
  expiryDate: p.expiry_date || p.expiryDate || '',
  isActive: !!(p.is_active ?? p.isActive)
});

const mapCourierPartner = (c: any): CourierPartner => ({
  id: c.id,
  name: c.name || '',
  coverageArea: c.coverage_area || c.coverageArea || '',
  onTimePercent: Number(c.on_time_percent ?? c.onTimePercent ?? 95),
  activeShipments: Number(c.active_shipments ?? c.activeShipments ?? 0),
  isActive: !!(c.is_active ?? c.isActive)
});

const mapFAQ = (f: any): FAQItem => ({
  id: f.id,
  question: f.question || '',
  answer: f.answer || '',
  order: Number(f.order ?? 0)
});

const mapAboutSection = (a: any): AboutSection => ({
  id: a.id,
  title: a.title || '',
  content: a.content || ''
});

const mapTransaction = (t: any): Transaction => ({
  id: t.id,
  date: t.date || '',
  customerName: t.customer_name || t.customerName || '',
  amount: Number(t.amount ?? 0),
  paymentMethod: t.payment_method || t.paymentMethod || 'UPI',
  status: (t.status || 'Success') as Transaction['status']
});

const mapTicket = (t: any): SupportTicket => ({
  id: t.id,
  customerName: t.customer_name || t.customerName || '',
  customerEmail: t.customer_email || t.customerEmail || '',
  subject: t.subject || '',
  status: (t.status || 'Open') as SupportTicket['status'],
  date: t.date || '',
  priority: (t.priority || 'Medium') as SupportTicket['priority'],
  messages: t.messages || []
});

const mapAdmin = (a: any): AdminUser => ({
  id: a.id,
  email: a.email || '',
  role: (a.role || 'Support') as AdminUser['role'],
  dateAdded: a.date_added || a.dateAdded || ''
});

const mapAuditLog = (a: any): AuditLog => ({
  id: a.id,
  action: a.action || '',
  admin: a.admin || '',
  timestamp: a.timestamp || ''
});

// Primary Database Wrapper
export class DBService {
  public static useLocalFallback = false;

  private static async executeQuery<T>(
    remoteQuery: () => Promise<any> | any,
    fallbackSelector: (db: any) => T[],
    fallbackSaver: (db: any, val: T[]) => void,
    mapFn: (item: any) => T
  ): Promise<T[]> {
    if (this.useLocalFallback) {
      return fallbackSelector(getLocalFallbackDB() || {});
    }

    try {
      const { data, error } = await remoteQuery();
      if (error) {
        console.warn('Supabase remote query failed, falling back to local state:', error);
        this.useLocalFallback = true;
        const localDb = getLocalFallbackDB();
        return localDb ? fallbackSelector(localDb) : [];
      }
      return (data || []).map(mapFn);
    } catch (err) {
      console.warn('Supabase request crashed, falling back to local state:', err);
      this.useLocalFallback = true;
      const localDb = getLocalFallbackDB();
      return localDb ? fallbackSelector(localDb) : [];
    }
  }

  // Seeding trigger
  public static async autoSeedIfEmpty(mockDb: any) {
    if (this.useLocalFallback) return;
    try {
      // Check if faqs table is empty as a canary
      const { data, error } = await supabase.from('faqs').select('id').limit(1);
      if (error) {
        console.log('Tables do not exist in Supabase yet. Relying on auto-fallback / local caching.');
        this.useLocalFallback = true;
        saveLocalFallbackDB(mockDb);
        return;
      }

      if (data && data.length === 0) {
        console.log('Supabase tables are empty. Pre-seeding remote DB with standard datasets...');
        
        // Seed users
        const dbUsers = mockDb.users.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          signup_date: u.signupDate,
          shipment_count: u.shipmentCount,
          status: u.status
        }));
        await supabaseAdmin.from('users').insert(dbUsers);

        // Seed shipments
        const dbShipments = mockDb.shipments.map((s: any) => ({
          id: s.id,
          sender_name: s.senderName,
          sender_phone: s.senderPhone,
          receiver_name: s.receiverName,
          receiver_phone: s.receiverPhone,
          origin: s.origin,
          destination: s.destination,
          status: s.status,
          courier_partner: s.courierPartner,
          date_booked: s.dateBooked,
          items: s.items,
          weight: s.weight,
          cost: s.cost,
          timeline: s.timeline
        }));
        await supabaseAdmin.from('shipments').insert(dbShipments);

        // Seed pricing rates
        const dbPricing = mockDb.pricingRates.map((p: any) => ({
          id: p.id,
          weight_slab: p.weightSlab,
          zone: p.zone,
          standard_rate: p.standardRate,
          express_rate: p.expressRate
        }));
        await supabaseAdmin.from('pricing_rates').insert(dbPricing);

        // Seed promo codes
        const dbPromos = mockDb.promoCodes.map((p: any) => ({
          id: p.id,
          code: p.code,
          discount_percent: p.discountPercent,
          expiry_date: p.expiryDate,
          is_active: p.isActive
        }));
        await supabaseAdmin.from('promo_codes').insert(dbPromos);

        // Seed courier partners
        const dbPartners = mockDb.partners.map((p: any) => ({
          id: p.id,
          name: p.name,
          coverage_area: p.coverageArea,
          on_time_percent: p.onTimePercent,
          active_shipments: p.activeShipments,
          is_active: p.isActive
        }));
        await supabaseAdmin.from('courier_partners').insert(dbPartners);

        // Seed faqs
        const dbFAQs = mockDb.faqs.map((f: any) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
          order: f.order
        }));
        await supabaseAdmin.from('faqs').insert(dbFAQs);

        // Seed about sections
        const dbAbout = mockDb.aboutSections.map((a: any) => ({
          id: a.id,
          title: a.title,
          content: a.content
        }));
        await supabaseAdmin.from('about_sections').insert(dbAbout);

        // Seed transactions
        const dbTransactions = mockDb.transactions.map((t: any) => ({
          id: t.id,
          date: t.date,
          customer_name: t.customerName,
          amount: t.amount,
          payment_method: t.paymentMethod,
          status: t.status
        }));
        await supabaseAdmin.from('transactions').insert(dbTransactions);

        // Seed tickets
        const dbTickets = mockDb.tickets.map((t: any) => ({
          id: t.id,
          customer_name: t.customerName,
          customer_email: t.customerEmail,
          subject: t.subject,
          status: t.status,
          date: t.date,
          priority: t.priority,
          messages: t.messages
        }));
        await supabaseAdmin.from('support_tickets').insert(dbTickets);

        // Seed admins
        const dbAdmins = mockDb.admins.map((a: any) => ({
          id: a.id,
          email: a.email,
          role: a.role,
          date_added: a.dateAdded
        }));
        await supabaseAdmin.from('admins').insert(dbAdmins);

        // Seed audit logs
        const dbAudit = mockDb.auditLogs.map((a: any) => ({
          id: a.id,
          action: a.action,
          admin: a.admin,
          timestamp: a.timestamp
        }));
        await supabaseAdmin.from('audit_logs').insert(dbAudit);

        console.log('Seeding completed successfully!');
      }
    } catch (e) {
      console.warn('Auto-seed check encountered an error, falling back:', e);
      this.useLocalFallback = true;
      saveLocalFallbackDB(mockDb);
    }
  }

  // --- USERS ---
  public static async fetchUsers(): Promise<UserAccount[]> {
    return this.executeQuery(
      () => supabaseAdmin.from('users').select('*').order('id'),
      (db) => db.users || [],
      (db, val) => { db.users = val; },
      mapUser
    );
  }

  public static async updateUser(userId: string, updated: Partial<UserAccount>) {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      db.users = (db.users || []).map((u: any) => u.id === userId ? { ...u, ...updated } : u);
      saveLocalFallbackDB(db);
      return;
    }
    const dbUpdate: any = {};
    if (updated.name !== undefined) dbUpdate.name = updated.name;
    if (updated.email !== undefined) dbUpdate.email = updated.email;
    if (updated.phone !== undefined) dbUpdate.phone = updated.phone;
    if (updated.status !== undefined) dbUpdate.status = updated.status;
    if (updated.shipmentCount !== undefined) dbUpdate.shipment_count = updated.shipmentCount;

    await supabaseAdmin.from('users').update(dbUpdate).eq('id', userId);
  }

  public static async deleteUser(userId: string) {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      db.users = (db.users || []).filter((u: any) => u.id !== userId);
      saveLocalFallbackDB(db);
      return;
    }
    await supabaseAdmin.from('users').delete().eq('id', userId);
  }

  // --- SHIPMENTS ---
  public static async fetchShipments(): Promise<Shipment[]> {
    return this.executeQuery(
      () => supabaseAdmin.from('shipments').select('*').order('id'),
      (db) => db.shipments || [],
      (db, val) => { db.shipments = val; },
      mapShipment
    );
  }

  public static async updateShipment(shipmentId: string, updated: Partial<Shipment>) {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      db.shipments = (db.shipments || []).map((s: any) => s.id === shipmentId ? { ...s, ...updated } : s);
      saveLocalFallbackDB(db);
      return;
    }
    const dbUpdate: any = {};
    if (updated.status !== undefined) dbUpdate.status = updated.status;
    if (updated.courierPartner !== undefined) dbUpdate.courier_partner = updated.courierPartner;
    if (updated.timeline !== undefined) dbUpdate.timeline = updated.timeline;
    if (updated.weight !== undefined) dbUpdate.weight = updated.weight;
    if (updated.cost !== undefined) dbUpdate.cost = updated.cost;
    if (updated.origin !== undefined) dbUpdate.origin = updated.origin;
    if (updated.destination !== undefined) dbUpdate.destination = updated.destination;

    await supabaseAdmin.from('shipments').update(dbUpdate).eq('id', shipmentId);
  }

  public static async insertShipment(shipment: Shipment) {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      db.shipments = [...(db.shipments || []), shipment];
      saveLocalFallbackDB(db);
      return;
    }
    const dbInsert = {
      id: shipment.id,
      sender_name: shipment.senderName,
      sender_phone: shipment.senderPhone,
      receiver_name: shipment.receiverName,
      receiver_phone: shipment.receiverPhone,
      origin: shipment.origin,
      destination: shipment.destination,
      status: shipment.status,
      courier_partner: shipment.courierPartner,
      date_booked: shipment.dateBooked,
      items: shipment.items,
      weight: shipment.weight,
      cost: shipment.cost,
      timeline: shipment.timeline
    };
    await supabaseAdmin.from('shipments').insert(dbInsert);
  }

  // --- PRICING ---
  public static async fetchPricingRates(): Promise<PricingRate[]> {
    return this.executeQuery(
      () => supabaseAdmin.from('pricing_rates').select('*').order('id'),
      (db) => db.pricingRates || [],
      (db, val) => { db.pricingRates = val; },
      mapPricingRate
    );
  }

  public static async updatePricingRate(rateId: string, updated: Partial<PricingRate>) {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      db.pricingRates = (db.pricingRates || []).map((r: any) => r.id === rateId ? { ...r, ...updated } : r);
      saveLocalFallbackDB(db);
      return;
    }
    const dbUpdate: any = {};
    if (updated.standardRate !== undefined) dbUpdate.standard_rate = updated.standardRate;
    if (updated.expressRate !== undefined) dbUpdate.express_rate = updated.expressRate;

    await supabaseAdmin.from('pricing_rates').update(dbUpdate).eq('id', rateId);
  }

  // --- PROMO CODES ---
  public static async fetchPromoCodes(): Promise<PromoCode[]> {
    return this.executeQuery(
      () => supabaseAdmin.from('promo_codes').select('*').order('id'),
      (db) => db.promoCodes || [],
      (db, val) => { db.promoCodes = val; },
      mapPromoCode
    );
  }

  public static async insertPromoCode(promo: PromoCode) {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      db.promoCodes = [...(db.promoCodes || []), promo];
      saveLocalFallbackDB(db);
      return;
    }
    const dbInsert = {
      id: promo.id,
      code: promo.code,
      discount_percent: promo.discountPercent,
      expiry_date: promo.expiryDate,
      is_active: promo.isActive
    };
    await supabaseAdmin.from('promo_codes').insert(dbInsert);
  }

  public static async updatePromoCode(promoId: string, updated: Partial<PromoCode>) {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      db.promoCodes = (db.promoCodes || []).map((p: any) => p.id === promoId ? { ...p, ...updated } : p);
      saveLocalFallbackDB(db);
      return;
    }
    const dbUpdate: any = {};
    if (updated.code !== undefined) dbUpdate.code = updated.code;
    if (updated.discountPercent !== undefined) dbUpdate.discount_percent = updated.discountPercent;
    if (updated.expiryDate !== undefined) dbUpdate.expiry_date = updated.expiryDate;
    if (updated.isActive !== undefined) dbUpdate.is_active = updated.isActive;

    await supabaseAdmin.from('promo_codes').update(dbUpdate).eq('id', promoId);
  }

  public static async deletePromoCode(promoId: string) {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      db.promoCodes = (db.promoCodes || []).filter((p: any) => p.id !== promoId);
      saveLocalFallbackDB(db);
      return;
    }
    await supabaseAdmin.from('promo_codes').delete().eq('id', promoId);
  }

  // --- COURIER PARTNERS ---
  public static async fetchPartners(): Promise<CourierPartner[]> {
    return this.executeQuery(
      () => supabaseAdmin.from('courier_partners').select('*').order('id'),
      (db) => db.partners || [],
      (db, val) => { db.partners = val; },
      mapCourierPartner
    );
  }

  public static async insertPartner(partner: CourierPartner) {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      db.partners = [...(db.partners || []), partner];
      saveLocalFallbackDB(db);
      return;
    }
    const dbInsert = {
      id: partner.id,
      name: partner.name,
      coverage_area: partner.coverageArea,
      on_time_percent: partner.onTimePercent,
      active_shipments: partner.activeShipments,
      is_active: partner.isActive
    };
    await supabaseAdmin.from('courier_partners').insert(dbInsert);
  }

  public static async updatePartner(partnerId: string, updated: Partial<CourierPartner>) {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      db.partners = (db.partners || []).map((p: any) => p.id === partnerId ? { ...p, ...updated } : p);
      saveLocalFallbackDB(db);
      return;
    }
    const dbUpdate: any = {};
    if (updated.name !== undefined) dbUpdate.name = updated.name;
    if (updated.coverageArea !== undefined) dbUpdate.coverage_area = updated.coverageArea;
    if (updated.isActive !== undefined) dbUpdate.is_active = updated.isActive;

    await supabaseAdmin.from('courier_partners').update(dbUpdate).eq('id', partnerId);
  }

  // --- CONTENT (FAQS & ABOUT) ---
  public static async fetchFAQs(): Promise<FAQItem[]> {
    return this.executeQuery(
      () => supabaseAdmin.from('faqs').select('*').order('order'),
      (db) => db.faqs || [],
      (db, val) => { db.faqs = val; },
      mapFAQ
    );
  }

  public static async updateFAQs(faqsList: FAQItem[]) {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      db.faqs = faqsList;
      saveLocalFallbackDB(db);
      return;
    }
    // Update multiple records
    for (const item of faqsList) {
      await supabaseAdmin.from('faqs').upsert({
        id: item.id,
        question: item.question,
        answer: item.answer,
        order: item.order
      });
    }
  }

  public static async fetchAboutSections(): Promise<AboutSection[]> {
    return this.executeQuery(
      () => supabaseAdmin.from('about_sections').select('*').order('id'),
      (db) => db.aboutSections || [],
      (db, val) => { db.aboutSections = val; },
      mapAboutSection
    );
  }

  public static async updateAboutSections(sections: AboutSection[]) {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      db.aboutSections = sections;
      saveLocalFallbackDB(db);
      return;
    }
    for (const item of sections) {
      await supabaseAdmin.from('about_sections').upsert({
        id: item.id,
        title: item.title,
        content: item.content
      });
    }
  }

  // --- TRANSACTIONS (FINANCE) ---
  public static async fetchTransactions(): Promise<Transaction[]> {
    return this.executeQuery(
      () => supabaseAdmin.from('transactions').select('*').order('date', { ascending: false }),
      (db) => db.transactions || [],
      (db, val) => { db.transactions = val; },
      mapTransaction
    );
  }

  public static async refundTransaction(txnId: string) {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      db.transactions = (db.transactions || []).map((t: any) => t.id === txnId ? { ...t, status: 'Refunded' } : t);
      saveLocalFallbackDB(db);
      return;
    }
    await supabaseAdmin.from('transactions').update({ status: 'Refunded' }).eq('id', txnId);
  }

  public static async insertTransaction(txn: Transaction) {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      db.transactions = [txn, ...(db.transactions || [])];
      saveLocalFallbackDB(db);
      return;
    }
    await supabaseAdmin.from('transactions').insert({
      id: txn.id,
      date: txn.date,
      customer_name: txn.customerName,
      amount: txn.amount,
      payment_method: txn.paymentMethod,
      status: txn.status
    });
  }

  // --- SUPPORT TICKETS ---
  public static async fetchTickets(): Promise<SupportTicket[]> {
    return this.executeQuery(
      () => supabaseAdmin.from('support_tickets').select('*').order('date', { ascending: false }),
      (db) => db.tickets || [],
      (db, val) => { db.tickets = val; },
      mapTicket
    );
  }

  public static async updateTicket(ticketId: string, updated: Partial<SupportTicket>) {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      db.tickets = (db.tickets || []).map((t: any) => t.id === ticketId ? { ...t, ...updated } : t);
      saveLocalFallbackDB(db);
      return;
    }
    const dbUpdate: any = {};
    if (updated.status !== undefined) dbUpdate.status = updated.status;
    if (updated.priority !== undefined) dbUpdate.priority = updated.priority;
    if (updated.messages !== undefined) dbUpdate.messages = updated.messages;

    await supabaseAdmin.from('support_tickets').update(dbUpdate).eq('id', ticketId);
  }

  public static async insertTicket(ticket: SupportTicket) {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      db.tickets = [ticket, ...(db.tickets || [])];
      saveLocalFallbackDB(db);
      return;
    }
    await supabaseAdmin.from('support_tickets').insert({
      id: ticket.id,
      customer_name: ticket.customerName,
      customer_email: ticket.customerEmail,
      subject: ticket.subject,
      status: ticket.status,
      date: ticket.date,
      priority: ticket.priority,
      messages: ticket.messages
    });
  }

  // --- ADMIN USERS (SETTINGS) ---
  public static async fetchAdmins(): Promise<AdminUser[]> {
    return this.executeQuery(
      () => supabaseAdmin.from('admins').select('*').order('id'),
      (db) => db.admins || [],
      (db, val) => { db.admins = val; },
      mapAdmin
    );
  }

  public static async insertAdmin(admin: AdminUser) {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      db.admins = [...(db.admins || []), admin];
      saveLocalFallbackDB(db);
      return;
    }
    await supabaseAdmin.from('admins').insert({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      date_added: admin.dateAdded
    });
  }

  public static async deleteAdmin(adminId: string) {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      db.admins = (db.admins || []).filter((a: any) => a.id !== adminId);
      saveLocalFallbackDB(db);
      return;
    }
    await supabaseAdmin.from('admins').delete().eq('id', adminId);
  }

  // --- AUDIT LOGS ---
  public static async fetchAuditLogs(): Promise<AuditLog[]> {
    return this.executeQuery(
      () => supabaseAdmin.from('audit_logs').select('*').order('timestamp', { ascending: false }),
      (db) => db.auditLogs || [],
      (db, val) => { db.auditLogs = val; },
      mapAuditLog
    );
  }

  public static async logAuditEvent(action: string, adminEmail: string = 'admin@oneshefaro.in') {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const id = `log-${Date.now()}`;

    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      const newLog = { id, action, admin: adminEmail, timestamp };
      db.auditLogs = [newLog, ...(db.auditLogs || [])].slice(0, 100);
      saveLocalFallbackDB(db);
      return;
    }

    try {
      await supabaseAdmin.from('audit_logs').insert({
        id,
        action,
        admin: adminEmail,
        timestamp
      });
    } catch (err) {
      console.warn('Could not save audit event remotely:', err);
    }
  }

  // ═══════════════════════════════════════
  // --- CUSTOMER DASHBOARD METHODS ---
  // ═══════════════════════════════════════

  // Get or create customer wallet
  public static async getOrCreateWallet(userId: string): Promise<{ balance: number }> {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      if (!db.wallets) db.wallets = {};
      if (db.wallets[userId] === undefined) {
        db.wallets[userId] = 500.00; // default signup balance of ₹500
        saveLocalFallbackDB(db);
      }
      return { balance: Number(db.wallets[userId]) };
    }

    try {
      const { data, error } = await supabase.from('wallets').select('balance').eq('user_id', userId).maybeSingle();
      if (error) throw error;
      if (data) {
        return { balance: Number(data.balance) };
      } else {
        // Create wallet
        const { error: insertError } = await supabase.from('wallets').insert({ user_id: userId, balance: 500.00 });
        if (insertError) console.warn('Could not insert initial wallet:', insertError);
        return { balance: 500.00 };
      }
    } catch (err) {
      console.warn('Supabase wallet fetch failed, using fallback:', err);
      const db = getLocalFallbackDB() || {};
      if (!db.wallets) db.wallets = {};
      if (db.wallets[userId] === undefined) {
        db.wallets[userId] = 500.00;
        saveLocalFallbackDB(db);
      }
      return { balance: Number(db.wallets[userId]) };
    }
  }

  // Top up wallet
  public static async topUpWallet(userId: string, amount: number, desc: string = 'Wallet Top-up'): Promise<number> {
    const timestamp = new Date().toISOString();
    const txnId = `wtx-${Date.now()}`;

    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      if (!db.wallets) db.wallets = {};
      const currentBalance = db.wallets[userId] !== undefined ? db.wallets[userId] : 500.00;
      const newBalance = Number(currentBalance) + amount;
      db.wallets[userId] = newBalance;

      // Log wallet transaction
      if (!db.walletTransactions) db.walletTransactions = [];
      db.walletTransactions.push({
        id: txnId,
        wallet_user_id: userId,
        amount,
        type: 'credit',
        description: desc,
        created_at: timestamp
      });
      saveLocalFallbackDB(db);
      return newBalance;
    }

    try {
      const { balance } = await this.getOrCreateWallet(userId);
      const newBalance = balance + amount;
      
      const { error: updateError } = await supabase.from('wallets').update({ balance: newBalance, updated_at: timestamp }).eq('user_id', userId);
      if (updateError) throw updateError;

      // Log wallet transaction
      await supabase.from('wallet_transactions').insert({
        id: txnId,
        wallet_user_id: userId,
        amount,
        type: 'credit',
        description: desc,
        created_at: timestamp
      });

      return newBalance;
    } catch (err) {
      console.warn('Supabase wallet top-up failed, using fallback:', err);
      // Fallback
      const db = getLocalFallbackDB() || {};
      if (!db.wallets) db.wallets = {};
      const currentBalance = db.wallets[userId] !== undefined ? db.wallets[userId] : 500.00;
      const newBalance = Number(currentBalance) + amount;
      db.wallets[userId] = newBalance;

      if (!db.walletTransactions) db.walletTransactions = [];
      db.walletTransactions.push({
        id: txnId,
        wallet_user_id: userId,
        amount,
        type: 'credit',
        description: desc,
        created_at: timestamp
      });
      saveLocalFallbackDB(db);
      return newBalance;
    }
  }

  // Fetch wallet transactions
  public static async fetchWalletTransactions(userId: string): Promise<any[]> {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      const txs = db.walletTransactions || [];
      return txs.filter((t: any) => t.wallet_user_id === userId).reverse();
    }

    try {
      const { data, error } = await supabase.from('wallet_transactions').select('*').eq('wallet_user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('Supabase fetch wallet transactions failed, fallback:', err);
      const db = getLocalFallbackDB() || {};
      const txs = db.walletTransactions || [];
      return txs.filter((t: any) => t.wallet_user_id === userId).reverse();
    }
  }

  // Fetch customer saved addresses
  public static async fetchSavedAddresses(userId: string): Promise<any[]> {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      const addresses = db.savedAddresses || [];
      return addresses.filter((a: any) => a.user_id === userId);
    }

    try {
      const { data, error } = await supabase.from('saved_addresses').select('*').eq('user_id', userId).order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('Supabase fetch addresses failed, fallback:', err);
      const db = getLocalFallbackDB() || {};
      const addresses = db.savedAddresses || [];
      return addresses.filter((a: any) => a.user_id === userId);
    }
  }

  // Insert or update address
  public static async saveAddress(address: any): Promise<void> {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      if (!db.savedAddresses) db.savedAddresses = [];
      
      const idx = db.savedAddresses.findIndex((a: any) => a.id === address.id);
      if (idx > -1) {
        db.savedAddresses[idx] = { ...db.savedAddresses[idx], ...address };
      } else {
        db.savedAddresses.push(address);
      }
      
      // Handle setting default address
      if (address.is_default) {
        db.savedAddresses = db.savedAddresses.map((a: any) => 
          a.user_id === address.user_id && a.id !== address.id ? { ...a, is_default: false } : a
        );
      }
      saveLocalFallbackDB(db);
      return;
    }

    try {
      if (address.is_default) {
        // unset others
        await supabase.from('saved_addresses').update({ is_default: false }).eq('user_id', address.user_id);
      }
      const { error } = await supabase.from('saved_addresses').upsert(address);
      if (error) throw error;
    } catch (err) {
      console.warn('Supabase save address failed, using fallback:', err);
      const db = getLocalFallbackDB() || {};
      if (!db.savedAddresses) db.savedAddresses = [];
      const idx = db.savedAddresses.findIndex((a: any) => a.id === address.id);
      if (idx > -1) {
        db.savedAddresses[idx] = { ...db.savedAddresses[idx], ...address };
      } else {
        db.savedAddresses.push(address);
      }
      if (address.is_default) {
        db.savedAddresses = db.savedAddresses.map((a: any) => 
          a.user_id === address.user_id && a.id !== address.id ? { ...a, is_default: false } : a
        );
      }
      saveLocalFallbackDB(db);
    }
  }

  // Delete saved address
  public static async deleteAddress(addressId: string): Promise<void> {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      db.savedAddresses = (db.savedAddresses || []).filter((a: any) => a.id !== addressId);
      saveLocalFallbackDB(db);
      return;
    }

    try {
      const { error } = await supabase.from('saved_addresses').delete().eq('id', addressId);
      if (error) throw error;
    } catch (err) {
      console.warn('Supabase delete address failed, fallback:', err);
      const db = getLocalFallbackDB() || {};
      db.savedAddresses = (db.savedAddresses || []).filter((a: any) => a.id !== addressId);
      saveLocalFallbackDB(db);
    }
  }

  // Fetch customer billing history (from transactions)
  public static async fetchCustomerBilling(userEmail: string, userId: string): Promise<any[]> {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      const txs = db.transactions || [];
      // Filter by customer name or simple user_id
      return txs.filter((t: any) => t.customerEmail === userEmail || t.user_id === userId || t.customerName === userEmail || t.customerName === userId);
    }

    try {
      const { data, error } = await supabase.from('transactions').select('*').or(`user_id.eq.${userId},customer_name.eq.${userEmail}`).order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('Supabase fetch customer transactions failed, fallback:', err);
      const db = getLocalFallbackDB() || {};
      const txs = db.transactions || [];
      return txs.filter((t: any) => t.user_id === userId || t.customerEmail === userEmail || t.customerName === userEmail || t.customerName === userId);
    }
  }

  // Fetch customer tickets
  public static async fetchCustomerTickets(email: string): Promise<any[]> {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      const tickets = db.tickets || [];
      return tickets.filter((t: any) => t.customerEmail === email);
    }

    try {
      const { data, error } = await supabase.from('support_tickets').select('*').eq('customer_email', email).order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('Supabase fetch customer tickets failed, fallback:', err);
      const db = getLocalFallbackDB() || {};
      const tickets = db.tickets || [];
      return tickets.filter((t: any) => t.customerEmail === email);
    }
  }

  // Insert Support Ticket
  public static async insertSupportTicket(ticket: any): Promise<void> {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      if (!db.tickets) db.tickets = [];
      db.tickets.push(ticket);
      saveLocalFallbackDB(db);
      return;
    }

    try {
      const { error } = await supabase.from('support_tickets').insert({
        id: ticket.id,
        customer_name: ticket.customerName || ticket.customer_name,
        customer_email: ticket.customerEmail || ticket.customer_email,
        subject: ticket.subject,
        status: ticket.status,
        date: ticket.date,
        priority: ticket.priority,
        messages: ticket.messages
      });
      if (error) throw error;
    } catch (err) {
      console.warn('Supabase support ticket insert failed, fallback:', err);
      const db = getLocalFallbackDB() || {};
      if (!db.tickets) db.tickets = [];
      db.tickets.push(ticket);
      saveLocalFallbackDB(db);
    }
  }

  // Reply to ticket (updates JSONB messages array)
  public static async replyTicket(ticketId: string, messages: any[]): Promise<void> {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      db.tickets = (db.tickets || []).map((t: any) => t.id === ticketId ? { ...t, messages } : t);
      saveLocalFallbackDB(db);
      return;
    }

    try {
      const { error } = await supabase.from('support_tickets').update({ messages }).eq('id', ticketId);
      if (error) throw error;
    } catch (err) {
      console.warn('Supabase reply ticket failed, fallback:', err);
      const db = getLocalFallbackDB() || {};
      db.tickets = (db.tickets || []).map((t: any) => t.id === ticketId ? { ...t, messages } : t);
      saveLocalFallbackDB(db);
    }
  }

  // Fetch notifications
  public static async fetchNotifications(userId: string): Promise<any[]> {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      const list = db.notifications || [];
      return list.filter((n: any) => n.user_id === userId);
    }

    try {
      const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('Supabase fetch notifications failed, fallback:', err);
      const db = getLocalFallbackDB() || {};
      const list = db.notifications || [];
      return list.filter((n: any) => n.user_id === userId);
    }
  }

  // Save/Create notification
  public static async saveNotification(notification: any): Promise<void> {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      if (!db.notifications) db.notifications = [];
      db.notifications.unshift(notification);
      saveLocalFallbackDB(db);
      return;
    }

    try {
      await supabase.from('notifications').insert(notification);
    } catch (err) {
      console.warn('Supabase notification insert failed, fallback:', err);
      const db = getLocalFallbackDB() || {};
      if (!db.notifications) db.notifications = [];
      db.notifications.unshift(notification);
      saveLocalFallbackDB(db);
    }
  }

  // Mark single notification as read
  public static async markNotificationRead(notificationId: string): Promise<void> {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      db.notifications = (db.notifications || []).map((n: any) => n.id === notificationId ? { ...n, is_read: true } : n);
      saveLocalFallbackDB(db);
      return;
    }

    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
    } catch (err) {
      console.warn('Supabase mark notification read failed, fallback:', err);
      const db = getLocalFallbackDB() || {};
      db.notifications = (db.notifications || []).map((n: any) => n.id === notificationId ? { ...n, is_read: true } : n);
      saveLocalFallbackDB(db);
    }
  }

  // Mark all notifications as read
  public static async markAllNotificationsRead(userId: string): Promise<void> {
    if (this.useLocalFallback) {
      const db = getLocalFallbackDB() || {};
      db.notifications = (db.notifications || []).map((n: any) => n.user_id === userId ? { ...n, is_read: true } : n);
      saveLocalFallbackDB(db);
      return;
    }

    try {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
    } catch (err) {
      console.warn('Supabase mark all notifications read failed, fallback:', err);
      const db = getLocalFallbackDB() || {};
      db.notifications = (db.notifications || []).map((n: any) => n.user_id === userId ? { ...n, is_read: true } : n);
      saveLocalFallbackDB(db);
    }
  }
}
