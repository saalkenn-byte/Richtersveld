export interface Business {
  id: number;
  name: string;
  ownerName: string;
  category: string;
  town: string;
  description: string;
  phone: string;
  whatsapp: string;
  address?: string | null;
  hours?: string | null;
  paymentMethods?: string | null;
  services?: string | null; // JSON string of [{title, price, desc}]
  isVerified?: boolean | null;
  verificationStatus?: "goedgekeur" | "hangend" | "afgekeur" | string | null;
  subscriptionStatus?: "aktief" | "proeftydperk" | "agterstallig" | "verval" | string | null;
  subscriptionPlan?: string | null;
  monthlyFee?: number | null;
  subscriptionPaidUntil?: string | Date | null;
  paymentReference?: string | null;
  isFeatured?: boolean | null;
  imageUrl?: string | null;
  rating?: string | null;
  reviewCount?: number | null;
  createdAt?: string | Date | null;
}

export interface SubscriptionPayment {
  id: number;
  businessId: number;
  amount: number;
  period: string;
  paymentMethod: string;
  reference?: string | null;
  status?: string | null;
  notes?: string | null;
  recordedBy?: string | null;
  paidAt?: string | Date | null;
}

export interface AdminUser {
  id: number;
  username: string;
  fullName: string;
  role?: string | null;
  lastLogin?: string | Date | null;
}

export interface ServiceItem {
  title: string;
  price?: string;
  desc?: string;
}

export interface MarketplaceListing {
  id: number;
  title: string;
  category: string;
  town: string;
  price: string;
  description: string;
  sellerName: string;
  phone: string;
  whatsapp: string;
  type?: string | null; // sell, buy, service
  status?: string | null;
  imageUrl?: string | null;
  isVerified?: boolean | null;
  createdAt?: string | Date | null;
}

export interface Ride {
  id: number;
  origin: string;
  destination: string;
  date: string;
  time: string;
  seatsAvailable: number;
  pricePerSeat: string;
  driverName: string;
  vehicleInfo?: string | null;
  phone: string;
  whatsapp: string;
  notes?: string | null;
  isVerified?: boolean | null;
  createdAt?: string | Date | null;
}

export interface CommunityNotice {
  id: number;
  title: string;
  category: string;
  town: string;
  content: string;
  date: string;
  isUrgent?: boolean | null;
  author: string;
  contactPhone?: string | null;
  isVerified?: boolean | null;
  createdAt?: string | Date | null;
}

export interface EmergencyContact {
  id: number;
  name: string;
  category: string;
  town: string;
  phone: string;
  altPhone?: string | null;
  available: string;
  notes?: string | null;
}

export interface Review {
  id: number;
  businessId: number;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt?: string | Date | null;
}
