export type AdminSection =
  | 'dashboard'
  | 'users'
  | 'shipments'
  | 'pricing'
  | 'partners'
  | 'content'
  | 'finance'
  | 'support'
  | 'settings';

export interface AdminSession {
  email: string;
  role: string;
  token: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'Super Admin' | 'Support' | 'Ops' | 'Finance';
  dateAdded: string;
}

export interface AuditLog {
  id: string;
  action: string;
  admin: string;
  timestamp: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  signupDate: string;
  shipmentCount: number;
  status: 'Active' | 'Suspended';
}

export interface ShipmentTimelineEvent {
  status: string;
  date: string;
  location: string;
  description: string;
}

export interface Shipment {
  id: string; // Tracking ID
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  origin: string;
  destination: string;
  status: 'Booked' | 'Picked Up' | 'In Transit' | 'Delivered' | 'Failed/Returned';
  courierPartner: string;
  dateBooked: string;
  items: string;
  weight: number; // in kg
  cost: number;
  timeline: ShipmentTimelineEvent[];
}

export interface PricingRate {
  id: string;
  weightSlab: string;
  zone: string;
  standardRate: number;
  expressRate: number;
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercent: number;
  expiryDate: string;
  isActive: boolean;
}

export interface CourierPartner {
  id: string;
  name: string;
  coverageArea: string;
  onTimePercent: number;
  activeShipments: number;
  isActive: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface AboutSection {
  id: string;
  title: string;
  content: string;
}

export interface Transaction {
  id: string;
  date: string;
  customerName: string;
  amount: number;
  paymentMethod: string;
  status: 'Success' | 'Refunded';
}

export interface TicketMessage {
  id: string;
  sender: 'Customer' | 'Admin';
  senderName: string;
  content: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  date: string;
  priority: 'Low' | 'Medium' | 'High';
  messages: TicketMessage[];
}

export interface DashboardStats {
  totalShipments: number;
  activeUsers: number;
  revenueThisMonth: number;
  pendingDisputes: number;
  trends: {
    shipments: number; // percentage
    users: number;
    revenue: number;
    disputes: number;
  };
}
