export type Language = 'en' | 'ta' | 'hi';
export type UserRole = 'farmer' | 'provider';

export type Screen =
  | 'language'
  | 'auth'
  | 'farm-profile'
  | 'home'
  | 'estimator'
  | 'smart-sell'
  | 'amenities'
  | 'ledger'
  | 'alerts'
  | 'schemes'
  | 'loans'
  | 'disease'
  | 'profile'
  | 'provider';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
}

export interface FarmProfile {
  district: string;
  state: string;
  lat: number;
  lng: number;
  landSize: number;
  soilType: string;
  crops: string[];
  irrigationType: string;
  isComplete: boolean;
}

export interface CropRecommendation {
  id: string;
  name: string;
  nameTa: string;
  nameHi: string;
  emoji: string;
  suitabilityScore: number;
  suitabilityReason: string;
  expectedYield: number;
  marketPrice: number;
  estimatedRevenue: number;
  waterRequirement: 'low' | 'medium' | 'high';
  duration: number;
  riskLevel: 'low' | 'medium' | 'high';
  tags: string[];
}

export interface Mandi {
  id: string;
  name: string;
  district: string;
  price: number;
  trend: 'up' | 'down' | 'stable';
  distance: number;
  commission: number;
  transportCost: number;
  netProfit: number;
  isBestMatch: boolean;
  facilities: string[];
  contact: string;
  priceHistory: { date: string; price: number }[];
}

export interface AmenityProvider {
  id: string;
  name: string;
  type: 'inputs' | 'machinery' | 'labour';
  rating: number;
  reliability: number;
  isVerified: boolean;
  jobs: number;
  disputes: number;
  location: string;
  distance: number;
  services: AmenityService[];
  contact: string;
  initials: string;
  color: string;
}

export interface AmenityService {
  id: string;
  name: string;
  unit: string;
  price: number;
  available: boolean;
}

export interface BundleItem {
  providerId: string;
  serviceId: string;
  providerName: string;
  serviceName: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface LedgerEntry {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  photoUrl?: string;
}

export interface Alert {
  id: string;
  type: 'weather' | 'market' | 'disease' | 'scheme' | 'reminder';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionScreen?: Screen;
  actionLabel?: string;
}

export interface Scheme {
  id: string;
  name: string;
  type: 'scheme' | 'loan';
  amount: string;
  deadline: string;
  description: string;
  eligibility: string[];
  benefits: string[];
  isEligible: boolean;
}

export interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
