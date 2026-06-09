/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  fullName: string;
  phone: string;
  countryCode: string;
  balance: number;
  totalEarnings: number;
  totalReferralGains: number;
  referralCode: string;
  referredBy?: string;
  signupDate: string;
  blocked: boolean;
  role: 'user' | 'admin';
  freeSpins?: number;
}

export type ProductCategory = 'STABILITÉ' | 'BIEN-ÊTRE' | 'ACTIVITÉS';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  durationDays: number;
  totalRevenue: number;
  active: boolean;
  iconName: string;
  description?: string;
}

export interface Investment {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  amount: number;
  totalYield: number; // For STABILITÉ, only credited at the end. For others, at the end of cycle too.
  durationDays: number;
  daysPassed: number;
  purchaseDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED';
}

export interface Deposit {
  id: string;
  userId: string;
  userPhone: string;
  userFullName: string;
  amount: number;
  operator: 'Mobile Money' | 'Moov Money' | 'Flooz';
  paymentProofImage?: string; // base64 represent
  date: string;
  status: 'PENDING' | 'VALIDATED' | 'REFUSED';
}

export interface Withdrawal {
  id: string;
  userId: string;
  userPhone: string;
  amount: number;
  recipientPhone: string;
  recipientName: string;
  date: string;
  status: 'PENDING' | 'PAID' | 'REFUSED';
}

export interface SupportTicket {
  id: string;
  userId: string;
  userPhone: string;
  userFullName: string;
  subject: 'Dépôt non crédité' | 'Assistance technique' | 'Retrait retardé' | 'Autre réclamation';
  message: string;
  reply?: string;
  status: 'PENDING' | 'RESOLVED';
  date: string;
}

export interface Review {
  id: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  comment: string;
  date: string;
  isVerified: boolean;
  imageUrl?: string;
}

export interface Notification {
  id: string;
  userId: string; // "all" or specific userId
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface ReferralCommission {
  id: string;
  referrerId: string;
  referredId: string;
  referredName: string;
  level: number;
  amount: number;
  date: string;
}

export interface AppSettings {
  whatsappLink: string;
  telegramLink: string;
  withdrawStartHour: number; // e.g. 9
  withdrawEndHour: number; // e.g. 18
  minWithdrawAmount: number; // e.g. 1000 CFA
  commissionLevel1: number; // e.g. 8%
  commissionLevel2: number; // e.g. 3%
  commissionLevel3: number; // e.g. 1%
  homeWelcomeTitle: string;
  homeWelcomeDesc: string;
  requireStabilityToUnlockOthers: boolean;
  operatorPhones: {
    mobileMoney: string;
    moovMoney: string;
    flooz: string;
  };
}
