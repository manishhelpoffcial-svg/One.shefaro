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
} from './types';

// Helper to load/save state in localStorage
const STORAGE_KEY = 'oneshefaro_admin_db';

export interface AdminDB {
  users: UserAccount[];
  shipments: Shipment[];
  pricingRates: PricingRate[];
  promoCodes: PromoCode[];
  partners: CourierPartner[];
  faqs: FAQItem[];
  aboutSections: AboutSection[];
  transactions: Transaction[];
  tickets: SupportTicket[];
  admins: AdminUser[];
  auditLogs: AuditLog[];
}

// Initial Seed Data
const defaultUsers: UserAccount[] = [
  { id: 'usr-1', name: 'Rajesh Kumar', email: 'rajesh.kumar@gmail.com', phone: '+91 98765 43210', signupDate: '2026-01-15', shipmentCount: 14, status: 'Active' },
  { id: 'usr-2', name: 'Aanya Sharma', email: 'aanya.sharma@yahoo.com', phone: '+91 91234 56789', signupDate: '2026-02-02', shipmentCount: 8, status: 'Active' },
  { id: 'usr-3', name: 'Vikram Singh', email: 'vikram.singh@outlook.com', phone: '+91 93456 78901', signupDate: '2026-02-18', shipmentCount: 22, status: 'Active' },
  { id: 'usr-4', name: 'Priya Patel', email: 'priya.patel@gmail.com', phone: '+91 94567 89012', signupDate: '2026-03-01', shipmentCount: 3, status: 'Active' },
  { id: 'usr-5', name: 'Amit Shah', email: 'amit.shah@gmail.com', phone: '+91 95678 90123', signupDate: '2026-03-10', shipmentCount: 0, status: 'Suspended' },
  { id: 'usr-6', name: 'Sneha Reddy', email: 'sneha.reddy@gmail.com', phone: '+91 96789 01234', signupDate: '2026-03-24', shipmentCount: 11, status: 'Active' },
  { id: 'usr-7', name: 'Rohan Mehta', email: 'rohan.mehta@hotmail.com', phone: '+91 97890 12345', signupDate: '2026-04-05', shipmentCount: 5, status: 'Active' },
  { id: 'usr-8', name: 'Neha Gupta', email: 'neha.gupta@gmail.com', phone: '+91 98901 23456', signupDate: '2026-04-12', shipmentCount: 2, status: 'Active' },
  { id: 'usr-9', name: 'Arjun Verma', email: 'arjun.verma@gmail.com', phone: '+91 99012 34567', signupDate: '2026-04-20', shipmentCount: 7, status: 'Active' },
  { id: 'usr-10', name: 'Deepa Rao', email: 'deepa.rao@gmail.com', phone: '+91 90123 45678', signupDate: '2026-05-01', shipmentCount: 18, status: 'Active' },
  { id: 'usr-11', name: 'Sanjay Dutt', email: 'sanjay.dutt@gmail.com', phone: '+91 81234 56789', signupDate: '2026-05-04', shipmentCount: 4, status: 'Active' },
  { id: 'usr-12', name: 'Kirti Sen', email: 'kirti.sen@yahoo.com', phone: '+91 82345 67890', signupDate: '2026-05-11', shipmentCount: 1, status: 'Active' },
  { id: 'usr-13', name: 'Harish Kalyan', email: 'harish.k@gmail.com', phone: '+91 83456 78901', signupDate: '2026-05-14', shipmentCount: 0, status: 'Active' },
  { id: 'usr-14', name: 'Meera Nair', email: 'meera.nair@gmail.com', phone: '+91 84567 89012', signupDate: '2026-05-20', shipmentCount: 9, status: 'Active' },
  { id: 'usr-15', name: 'Ravi Teja', email: 'ravi.teja@gmail.com', phone: '+91 85678 90123', signupDate: '2026-05-29', shipmentCount: 12, status: 'Active' },
  { id: 'usr-16', name: 'Divya Bharti', email: 'divya.b@gmail.com', phone: '+91 86789 01234', signupDate: '2026-06-03', shipmentCount: 0, status: 'Suspended' },
  { id: 'usr-17', name: 'Gautam Gambhir', email: 'gautam.g@gmail.com', phone: '+91 87890 12345', signupDate: '2026-06-08', shipmentCount: 6, status: 'Active' },
  { id: 'usr-18', name: 'Pooja Hegde', email: 'pooja.h@gmail.com', phone: '+91 88901 23456', signupDate: '2026-06-12', shipmentCount: 3, status: 'Active' },
  { id: 'usr-19', name: 'Manoj Bajpayee', email: 'manoj.b@gmail.com', phone: '+91 89012 34567', signupDate: '2026-06-15', shipmentCount: 15, status: 'Active' },
  { id: 'usr-20', name: 'Kavita Krishnamurthy', email: 'kavita.k@gmail.com', phone: '+91 70123 45678', signupDate: '2026-06-20', shipmentCount: 2, status: 'Active' },
  { id: 'usr-21', name: 'Pranav Anand', email: 'pranav.anand@gmail.com', phone: '+91 71234 56789', signupDate: '2026-06-22', shipmentCount: 4, status: 'Active' },
  { id: 'usr-22', name: 'Shreya Ghoshal', email: 'shreya.g@gmail.com', phone: '+91 72345 67890', signupDate: '2026-06-25', shipmentCount: 8, status: 'Active' },
  { id: 'usr-23', name: 'Vijay Sethupathi', email: 'vijay.s@gmail.com', phone: '+91 73456 78901', signupDate: '2026-06-28', shipmentCount: 19, status: 'Active' },
  { id: 'usr-24', name: 'Trisha Krishnan', email: 'trisha.k@gmail.com', phone: '+91 74567 89012', signupDate: '2026-06-29', shipmentCount: 1, status: 'Active' }
];

const defaultShipments: Shipment[] = [
  {
    id: 'OS-98234-IN',
    senderName: 'Rajesh Kumar',
    senderPhone: '+91 98765 43210',
    receiverName: 'Suresh Kumar',
    receiverPhone: '+91 98111 22233',
    origin: 'New Delhi, Delhi',
    destination: 'Mumbai, Maharashtra',
    status: 'Delivered',
    courierPartner: 'Delhivery',
    dateBooked: '2026-06-25',
    items: 'Books & Educational Documents',
    weight: 1.5,
    cost: 180,
    timeline: [
      { status: 'Booked', date: '2026-06-25 10:30 AM', location: 'New Delhi', description: 'Shipment registered & labels generated' },
      { status: 'Picked Up', date: '2026-06-25 04:15 PM', location: 'New Delhi Hub', description: 'Package picked up by Delhivery agent' },
      { status: 'In Transit', date: '2026-06-26 02:00 AM', location: 'Delhi Airport', description: 'Package departed Delhi airport in air cargo' },
      { status: 'In Transit', date: '2026-06-26 09:00 AM', location: 'Mumbai Hub', description: 'Package received at Mumbai distribution center' },
      { status: 'Delivered', date: '2026-06-27 11:30 AM', location: 'Mumbai Destination', description: 'Package safely delivered to Suresh Kumar' }
    ]
  },
  {
    id: 'OS-87123-IN',
    senderName: 'Aanya Sharma',
    senderPhone: '+91 91234 56789',
    receiverName: 'Karan Sharma',
    receiverPhone: '+91 91333 44455',
    origin: 'Bangalore, Karnataka',
    destination: 'Chennai, Tamil Nadu',
    status: 'In Transit',
    courierPartner: 'Blue Dart',
    dateBooked: '2026-07-01',
    items: 'Handmade Sweets & Gift Box',
    weight: 0.8,
    cost: 210,
    timeline: [
      { status: 'Booked', date: '2026-07-01 02:45 PM', location: 'Bangalore', description: 'Shipment booked via Express' },
      { status: 'Picked Up', date: '2026-07-01 06:30 PM', location: 'Bangalore South Hub', description: 'Consignment secured by Blue Dart partner' },
      { status: 'In Transit', date: '2026-07-02 08:00 AM', location: 'Chennai Main Facility', description: 'In transit to local delivery hub' }
    ]
  },
  {
    id: 'OS-76239-IN',
    senderName: 'Vikram Singh',
    senderPhone: '+91 93456 78901',
    receiverName: 'Ranjeet Singh',
    receiverPhone: '+91 93222 11100',
    origin: 'Jaipur, Rajasthan',
    destination: 'Guwahati, Assam',
    status: 'Booked',
    courierPartner: 'Shadowfax',
    dateBooked: '2026-07-02',
    items: 'Traditional Kurta Set',
    weight: 1.2,
    cost: 290,
    timeline: [
      { status: 'Booked', date: '2026-07-02 11:15 AM', location: 'Jaipur Office', description: 'Waybill created' }
    ]
  },
  {
    id: 'OS-54311-IN',
    senderName: 'Sneha Reddy',
    senderPhone: '+91 96789 01234',
    receiverName: 'Rahul Reddy',
    receiverPhone: '+91 96222 33344',
    origin: 'Hyderabad, Telangana',
    destination: 'Pune, Maharashtra',
    status: 'Picked Up',
    courierPartner: 'Delhivery',
    dateBooked: '2026-07-01',
    items: 'Electronics Accessories (Power Bank)',
    weight: 0.4,
    cost: 120,
    timeline: [
      { status: 'Booked', date: '2026-07-01 09:00 AM', location: 'Hyderabad', description: 'Waybill generated' },
      { status: 'Picked Up', date: '2026-07-01 05:00 PM', location: 'Hyderabad Gachibowli Hub', description: 'Package picked up from residence' }
    ]
  },
  {
    id: 'OS-43223-IN',
    senderName: 'Rohan Mehta',
    senderPhone: '+91 97890 12345',
    receiverName: 'Siddharth Mehta',
    receiverPhone: '+91 97111 33344',
    origin: 'Kolkata, West Bengal',
    destination: 'Patna, Bihar',
    status: 'Failed/Returned',
    courierPartner: 'Xpressbees',
    dateBooked: '2026-06-20',
    items: 'Leather Wallet & Belt Set',
    weight: 0.6,
    cost: 150,
    timeline: [
      { status: 'Booked', date: '2026-06-20 11:30 AM', location: 'Kolkata', description: 'Shipment created' },
      { status: 'Picked Up', date: '2026-06-20 04:00 PM', location: 'Kolkata Central', description: 'Picked up' },
      { status: 'In Transit', date: '2026-06-21 09:00 AM', location: 'Patna Sorting Center', description: 'Received in Patna' },
      { status: 'In Transit', date: '2026-06-22 10:00 AM', location: 'Patna Delivery Branch', description: 'Out for delivery' },
      { status: 'Failed/Returned', date: '2026-06-22 05:30 PM', location: 'Patna', description: 'Delivery failed - Address incomplete. Returning to sender.' }
    ]
  },
  {
    id: 'OS-32111-IN',
    senderName: 'Manoj Bajpayee',
    senderPhone: '+91 89012 34567',
    receiverName: 'Gajendra Rao',
    receiverPhone: '+91 89111 22233',
    origin: 'Lucknow, Uttar Pradesh',
    destination: 'Dehradun, Uttarakhand',
    status: 'Delivered',
    courierPartner: 'Blue Dart',
    dateBooked: '2026-06-28',
    items: 'Chikan Embroidered Kurtas',
    weight: 2.5,
    cost: 380,
    timeline: [
      { status: 'Booked', date: '2026-06-28 02:00 PM', location: 'Lucknow', description: 'Booked' },
      { status: 'Picked Up', date: '2026-06-28 06:00 PM', location: 'Lucknow Hub', description: 'Picked up' },
      { status: 'In Transit', date: '2026-06-29 10:00 AM', location: 'Dehradun Sorting', description: 'In transit' },
      { status: 'Delivered', date: '2026-06-30 02:45 PM', location: 'Dehradun', description: 'Delivered & signed by receiver' }
    ]
  },
  {
    id: 'OS-21190-IN',
    senderName: 'Vijay Sethupathi',
    senderPhone: '+91 73456 78901',
    receiverName: 'Madhavan S.',
    receiverPhone: '+91 73111 22233',
    origin: 'Chennai, Tamil Nadu',
    destination: 'Coimbatore, Tamil Nadu',
    status: 'Delivered',
    courierPartner: 'Shadowfax',
    dateBooked: '2026-06-29',
    items: 'Vintage Brass Coffee Filter',
    weight: 0.9,
    cost: 140,
    timeline: [
      { status: 'Booked', date: '2026-06-29 09:00 AM', location: 'Chennai', description: 'Booked' },
      { status: 'Picked Up', date: '2026-06-29 02:00 PM', location: 'Chennai Guindy', description: 'Picked up' },
      { status: 'Delivered', date: '2026-06-30 04:00 PM', location: 'Coimbatore Office', description: 'Delivered' }
    ]
  }
];

const defaultPricingRates: PricingRate[] = [
  // Slab 1: Up to 500g
  { id: 'pr-1', weightSlab: 'Up to 500g', zone: 'Zone A (Within City)', standardRate: 40, expressRate: 80 },
  { id: 'pr-2', weightSlab: 'Up to 500g', zone: 'Zone B (Within State)', standardRate: 60, expressRate: 110 },
  { id: 'pr-3', weightSlab: 'Up to 500g', zone: 'Zone C (Metro to Metro)', standardRate: 80, expressRate: 140 },
  { id: 'pr-4', weightSlab: 'Up to 500g', zone: 'Zone D (Rest of India)', standardRate: 100, expressRate: 180 },
  { id: 'pr-5', weightSlab: 'Up to 500g', zone: 'Zone E (Special & Remote)', standardRate: 150, expressRate: 250 },

  // Slab 2: 500g to 1kg
  { id: 'pr-6', weightSlab: '500g to 1kg', zone: 'Zone A (Within City)', standardRate: 60, expressRate: 110 },
  { id: 'pr-7', weightSlab: '500g to 1kg', zone: 'Zone B (Within State)', standardRate: 90, expressRate: 150 },
  { id: 'pr-8', weightSlab: '500g to 1kg', zone: 'Zone C (Metro to Metro)', standardRate: 120, expressRate: 200 },
  { id: 'pr-9', weightSlab: '500g to 1kg', zone: 'Zone D (Rest of India)', standardRate: 150, expressRate: 260 },
  { id: 'pr-10', weightSlab: '500g to 1kg', zone: 'Zone E (Special & Remote)', standardRate: 220, expressRate: 350 },

  // Slab 3: 1kg to 2kg
  { id: 'pr-11', weightSlab: '1kg to 2kg', zone: 'Zone A (Within City)', standardRate: 90, expressRate: 150 },
  { id: 'pr-12', weightSlab: '1kg to 2kg', zone: 'Zone B (Within State)', standardRate: 130, expressRate: 220 },
  { id: 'pr-13', weightSlab: '1kg to 2kg', zone: 'Zone C (Metro to Metro)', standardRate: 180, expressRate: 300 },
  { id: 'pr-14', weightSlab: '1kg to 2kg', zone: 'Zone D (Rest of India)', standardRate: 220, expressRate: 380 },
  { id: 'pr-15', weightSlab: '1kg to 2kg', zone: 'Zone E (Special & Remote)', standardRate: 320, expressRate: 500 },

  // Slab 4: 2kg to 5kg
  { id: 'pr-16', weightSlab: '2kg to 5kg', zone: 'Zone A (Within City)', standardRate: 150, expressRate: 250 },
  { id: 'pr-17', weightSlab: '2kg to 5kg', zone: 'Zone B (Within State)', standardRate: 220, expressRate: 380 },
  { id: 'pr-18', weightSlab: '2kg to 5kg', zone: 'Zone C (Metro to Metro)', standardRate: 300, expressRate: 500 },
  { id: 'pr-19', weightSlab: '2kg to 5kg', zone: 'Zone D (Rest of India)', standardRate: 380, expressRate: 650 },
  { id: 'pr-20', weightSlab: '2kg to 5kg', zone: 'Zone E (Special & Remote)', standardRate: 550, expressRate: 850 }
];

const defaultPromoCodes: PromoCode[] = [
  { id: 'promo-1', code: 'SHEFAROFIRST', discountPercent: 20, expiryDate: '2026-12-31', isActive: true },
  { id: 'promo-2', code: 'MONSOON50', discountPercent: 15, expiryDate: '2026-08-31', isActive: true },
  { id: 'promo-3', code: 'METRODEAL', discountPercent: 10, expiryDate: '2026-10-15', isActive: false },
  { id: 'promo-4', code: 'EXPRESSSAVE', discountPercent: 25, expiryDate: '2026-09-30', isActive: true }
];

const defaultPartners: CourierPartner[] = [
  { id: 'p-1', name: 'Delhivery', coverageArea: 'Pan India (18,500+ pin codes)', onTimePercent: 94.6, activeShipments: 1240, isActive: true },
  { id: 'p-2', name: 'Blue Dart', coverageArea: 'Air Express Metro Hubs', onTimePercent: 98.2, activeShipments: 850, isActive: true },
  { id: 'p-3', name: 'Shadowfax', coverageArea: 'Hyperlocal & Intra-City', onTimePercent: 91.8, activeShipments: 410, isActive: true },
  { id: 'p-4', name: 'Xpressbees', coverageArea: 'Tier-2 & Tier-3 Cities', onTimePercent: 92.5, activeShipments: 620, isActive: true }
];

const defaultFAQs: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How long does standard domestic delivery take?',
    answer: 'Standard delivery within major metropolitan areas typically takes 2-3 business days. For remote or rural locations, please allow 4-6 business days. You can always track your parcel in real-time using your waybill number.',
    order: 1
  },
  {
    id: 'faq-2',
    question: 'Can I change the delivery address after shipping?',
    answer: 'Yes, address modifications are possible before the package reaches the final destination hub. Please log into your account, select the active shipment, and choose \'Modify Destination\'. Additional routing fees may apply depending on the new distance.',
    order: 2
  },
  {
    id: 'faq-3',
    question: 'What are the restricted items for domestic shipping?',
    answer: 'We strictly prohibit the transport of hazardous materials, explosives, perishables requiring refrigeration, and illegal substances. For a comprehensive list, please review our Terms of Service document or contact support prior to booking.',
    order: 3
  },
  {
    id: 'faq-4',
    question: 'How do I claim a refund for a delayed shipment?',
    answer: 'Refund requests for express services that failed to meet the delivery guarantee must be submitted within 7 days of delivery. Navigate to your Account Dashboard, select \'Claim Support\', and provide the tracking ID.',
    order: 4
  },
  {
    id: 'faq-5',
    question: 'Do I need a business GSTIN account to ship parcels?',
    answer: 'No, one.shefaro is custom-built for individual citizens. You can send individual gifts, documents, personal parcels, and household items without any business licensing or commercial GSTIN registration.',
    order: 5
  },
  {
    id: 'faq-6',
    question: 'What online payment methods do you accept?',
    answer: 'We accept all major Indian payment gateways, including UPI (Google Pay, PhonePe, Paytm), Net Banking from all major Indian banks, Debit and Credit Cards (Visa, Mastercard, RuPay), and popular mobile wallets.',
    order: 6
  }
];

const defaultAboutSections: AboutSection[] = [
  {
    id: 'about-hero',
    title: 'We wanted parcel shipping to feel simple.',
    content: 'one.shefaro was built for individuals who want to send parcels without hassle. No business accounts, no complex forms—just straightforward shipping for everyone.'
  },
  {
    id: 'about-why',
    title: 'Why we built one.shefaro',
    content: 'We saw that shipping a simple package across the country often felt like a chore reserved for businesses. It shouldn\'t be. We built one.shefaro to democratize logistics—to create a service so seamless and transparent that sending a gift to a friend or returning an item feels effortless. It\'s shipping, stripped of complexity and infused with warmth.'
  },
  {
    id: 'about-family',
    title: 'Meet the family',
    content: 'Behind every successful delivery is a team of dedicated individuals who believe in approachable service. We are a diverse group united by a single goal: to make logistics human again. When you ship with us, you\'re trusting a team that treats your parcels as their own.'
  }
];

const defaultTransactions: Transaction[] = [
  { id: 'TXN-908234', date: '2026-06-25 10:30 AM', customerName: 'Rajesh Kumar', amount: 180, paymentMethod: 'UPI (Paytm)', status: 'Success' },
  { id: 'TXN-871230', date: '2026-07-01 02:45 PM', customerName: 'Aanya Sharma', amount: 210, paymentMethod: 'Credit Card', status: 'Success' },
  { id: 'TXN-762391', date: '2026-07-02 11:15 AM', customerName: 'Vikram Singh', amount: 290, paymentMethod: 'UPI (Google Pay)', status: 'Success' },
  { id: 'TXN-543111', date: '2026-07-01 09:00 AM', customerName: 'Sneha Reddy', amount: 120, paymentMethod: 'Net Banking (HDFC)', status: 'Success' },
  { id: 'TXN-432231', date: '2026-06-20 11:30 AM', customerName: 'Rohan Mehta', amount: 150, paymentMethod: 'UPI (PhonePe)', status: 'Success' },
  { id: 'TXN-321110', date: '2026-06-28 02:00 PM', customerName: 'Manoj Bajpayee', amount: 380, paymentMethod: 'Debit Card', status: 'Success' },
  { id: 'TXN-211902', date: '2026-06-29 09:00 AM', customerName: 'Vijay Sethupathi', amount: 140, paymentMethod: 'UPI (Paytm)', status: 'Success' }
];

const defaultTickets: SupportTicket[] = [
  {
    id: 'TCK-2309',
    customerName: 'Rajesh Kumar',
    customerEmail: 'rajesh.kumar@gmail.com',
    subject: 'Refund status for delayed express shipment',
    status: 'Open',
    date: '2026-07-02',
    priority: 'High',
    messages: [
      { id: 'msg-1', sender: 'Customer', senderName: 'Rajesh Kumar', content: 'Hi, my express shipment OS-98234-IN was delayed by one day. I want to claim a refund of my delivery charges as guaranteed.', timestamp: '2026-07-02 10:00 AM' }
    ]
  },
  {
    id: 'TCK-2101',
    customerName: 'Sneha Reddy',
    customerEmail: 'sneha.reddy@gmail.com',
    subject: 'Cannot change pin code after booking',
    status: 'In Progress',
    date: '2026-07-01',
    priority: 'Medium',
    messages: [
      { id: 'msg-2', sender: 'Customer', senderName: 'Sneha Reddy', content: 'Hello, I booked a shipment but I put the wrong pincode. Can you update it to 411001 for Pune?', timestamp: '2026-07-01 02:30 PM' },
      { id: 'msg-3', sender: 'Admin', senderName: 'Operations Support', content: 'Hello Sneha, we have paused the pick-up. Please confirm the full address details so we can reroute it.', timestamp: '2026-07-01 04:15 PM' },
      { id: 'msg-4', sender: 'Customer', senderName: 'Sneha Reddy', content: 'Yes, full address is Flat 402, Sunshine Apts, Near Station, Pune 411001.', timestamp: '2026-07-01 04:45 PM' }
    ]
  },
  {
    id: 'TCK-1981',
    customerName: 'Aanya Sharma',
    customerEmail: 'aanya.sharma@yahoo.com',
    subject: 'Label printing assistance',
    status: 'Resolved',
    date: '2026-06-28',
    priority: 'Low',
    messages: [
      { id: 'msg-5', sender: 'Customer', senderName: 'Aanya Sharma', content: 'My printer is not working, can the pickup guy bring a printed label with him?', timestamp: '2026-06-28 09:15 AM' },
      { id: 'msg-6', sender: 'Admin', senderName: 'Operations Support', content: 'Hi Aanya, yes! Our Blue Dart courier partner will carry a sticky routing label with them. You do not need to print anything.', timestamp: '2026-06-28 11:00 AM' },
      { id: 'msg-7', sender: 'Customer', senderName: 'Aanya Sharma', content: 'Wow, that is amazing. Thank you so much!', timestamp: '2026-06-28 11:30 AM' }
    ]
  }
];

const defaultAdmins: AdminUser[] = [
  { id: 'adm-1', email: 'admin@oneshefaro.in', role: 'Super Admin', dateAdded: '2026-01-01' },
  { id: 'adm-2', email: 'support.manager@oneshefaro.in', role: 'Support', dateAdded: '2026-02-15' },
  { id: 'adm-3', email: 'ops.lead@oneshefaro.in', role: 'Ops', dateAdded: '2026-03-01' }
];

const defaultAuditLogs: AuditLog[] = [
  { id: 'log-1', action: 'System pre-seeded initial database', admin: 'system', timestamp: '2026-07-02 11:00 PM' },
  { id: 'log-2', action: 'Created new courier partner: Blue Dart', admin: 'admin@oneshefaro.in', timestamp: '2026-07-02 11:02 PM' }
];

// Load current DB state
export const getAdminDB = (): AdminDB => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const initialDB: AdminDB = {
      users: defaultUsers,
      shipments: defaultShipments,
      pricingRates: defaultPricingRates,
      promoCodes: defaultPromoCodes,
      partners: defaultPartners,
      faqs: defaultFAQs,
      aboutSections: defaultAboutSections,
      transactions: defaultTransactions,
      tickets: defaultTickets,
      admins: defaultAdmins,
      auditLogs: defaultAuditLogs
    };
    saveAdminDB(initialDB);
    return initialDB;
  }
  return JSON.parse(data);
};

// Save current DB state
export const saveAdminDB = (db: AdminDB) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

// Log a custom admin audit event
export const logAuditEvent = (action: string, adminEmail: string = 'admin@oneshefaro.in') => {
  const db = getAdminDB();
  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    action,
    admin: adminEmail,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  db.auditLogs.unshift(newLog);
  // limit to 100 logs
  if (db.auditLogs.length > 100) {
    db.auditLogs.pop();
  }
  saveAdminDB(db);
};
