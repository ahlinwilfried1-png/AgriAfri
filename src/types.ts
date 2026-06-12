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
  email?: string;
  password?: string;
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
  image?: string; // Real attractive crop image
  openingTime?: string; // HH:MM, e.g. "10:00"
  closingTime?: string; // HH:MM, e.g. "10:10"
  availabilityDurationMinutes?: number; // Duration of availability in minutes
  manualClosed?: boolean; // Open or close manual override
  manualOpened?: boolean; // Open or close manual override
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

export interface SupportMessage {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  date: string;
  image?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userPhone: string;
  userFullName: string;
  subject: 'Dépôt non crédité' | 'Assistance technique' | 'Retrait retardé' | 'Autre réclamation';
  message: string;
  reply?: string;
  screenshotImage?: string; // base64 representation of any attached file or deposit proof
  status: 'PENDING' | 'RESOLVED';
  messageStatus?: 'NON_LU' | 'LU' | 'REPONDU';
  date: string;
  messages?: SupportMessage[];
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

export interface ForumPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  role: 'user' | 'admin';
  content: string;
  imageUrl?: string;
  date: string;
  likes: number;
  likedBy: string[]; // User IDs who liked the post
  comments: {
    id: string;
    authorName: string;
    authorAvatar: string;
    content: string;
    date: string;
    role: 'user' | 'admin';
  }[];
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
  simulatedTime?: string; // Opt simulated time for testing scheduler e.g. "10:05"
}

export function checkProductOpen(prod: Product, currentTimeStr: string): { isOpen: boolean; reason: string } {
  if (prod.category === 'STABILITÉ') {
    return { isOpen: true, reason: 'Toujours disponible' };
  }
  if (prod.manualClosed) {
    return { isOpen: false, reason: 'Fermé manuellement' };
  }
  if (prod.manualOpened) {
    return { isOpen: true, reason: 'Ouvert manuellement' };
  }

  const { openingTime, closingTime, availabilityDurationMinutes } = prod;

  if (!openingTime) {
    // Default open if no schedule is active
    return { isOpen: true, reason: 'Disponible' };
  }

  // Parse current system or simulated time (format "HH:MM")
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  const resolvedTimeStr = regex.test(currentTimeStr) ? currentTimeStr : "12:00";
  const [currH, currM] = resolvedTimeStr.split(':').map(Number);
  const currTotal = currH * 60 + currM;

  // Parse opening time
  const [openH, openM] = openingTime.split(':').map(Number);
  const openTotal = openH * 60 + openM;

  // Calculate closing time
  let closeTotal = 0;
  if (closingTime) {
    const [closeH, closeM] = closingTime.split(':').map(Number);
    closeTotal = closeH * 60 + closeM;
  } else if (availabilityDurationMinutes) {
    closeTotal = openTotal + availabilityDurationMinutes;
  } else {
    // If opening time is specified but no duration, it is open for the rest of the day
    closeTotal = 24 * 60;
  }

  if (closeTotal < openTotal) {
    // Overnight lock
    if (currTotal >= openTotal || currTotal < closeTotal) {
      return { isOpen: true, reason: 'Ouvert' };
    }
  } else {
    if (currTotal >= openTotal && currTotal < closeTotal) {
      return { isOpen: true, reason: 'Ouvert' };
    }
  }

  const formatTime = (totalMins: number) => {
    const h = Math.floor((totalMins % (24 * 60)) / 60);
    const m = Math.floor(totalMins % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const formattedClose = closingTime || formatTime(closeTotal);

  return {
    isOpen: false,
    reason: `Fermé (Disponible uniquement de ${openingTime} à ${formattedClose})`,
  };
}
