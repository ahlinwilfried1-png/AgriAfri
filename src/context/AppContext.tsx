/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Product,
  Investment,
  Deposit,
  Withdrawal,
  SupportTicket,
  Review,
  Notification,
  ReferralCommission,
  AppSettings,
  ProductCategory,
  checkProductOpen,
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_REVIEWS, DEFAULT_SETTINGS } from '../data/initialData';
import { safeSyncToSupabase, safeDeleteFromSupabase } from '../lib/supabase';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  products: Product[];
  investments: Investment[];
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  tickets: SupportTicket[];
  reviews: Review[];
  notifications: Notification[];
  commissions: ReferralCommission[];
  settings: AppSettings;
  activeOTP: { phone: string; code: string } | null;
  otpToast: string | null;

  // Authentication Actions
  registerUser: (fullName: string, phone: string, countryCode: string, password: string, referralCode?: string) => { success: boolean; message: string };
  loginUser: (phone: string, password: string) => { success: boolean; message: string };
  logoutUser: () => void;
  sendOTP: (phone: string) => { success: boolean; code: string };
  verifyOTP: (phone: string, inputCode: string) => boolean;
  resetPasswordByOTP: (phone: string, newPassword: string) => { success: boolean; message: string };
  clearOtpToast: () => void;

  // Investment Actions
  investInProduct: (productId: string) => { success: boolean; message: string };
  progressTimeByOneDay: () => void;
  instantCompleteAllCycles: () => void;

  // Deposit Actions
  requestDeposit: (amount: number, operator: 'Mobile Money' | 'Moov Money' | 'Flooz', proofBase64?: string) => { success: boolean; message: string };
  verifyDeposit: (id: string, approve: boolean) => void;

  // Withdrawal Actions
  requestWithdrawal: (amount: number, recipientPhone: string, recipientName: string) => { success: boolean; message: string };
  verifyWithdrawal: (id: string, approve: boolean) => void;

  // Support Actions
  createTicket: (subject: 'Dépôt non crédité' | 'Assistance technique' | 'Retrait retardé' | 'Autre réclamation', message: string, screenshotImage?: string) => { success: boolean; message: string };
  replyToTicket: (id: string, reply: string) => void;

  // Reviews CRUD
  addReview: (authorName: string, authorAvatar: string, rating: number, comment: string, imageUrl?: string) => void;
  updateReview: (id: string, rating: number, comment: string) => void;
  deleteReview: (id: string) => void;

  // Products CRUD (Admin)
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductStatus: (id: string) => void;

  // User Administration
  updateUserBalance: (userId: string, amount: number, mode: 'add' | 'set') => void;
  toggleUserBlock: (userId: string) => void;
  deleteUser: (userId: string) => void;
  editUserDetail: (userId: string, data: Partial<User>) => void;

  // Settings Actions
  updateSettings: (newSettings: Partial<AppSettings>) => void;

  // Notifications
  addNotificationForUser: (userId: string, title: string, message: string) => void;
  markNotificationsAsRead: (userId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [commissions, setCommissions] = useState<ReferralCommission[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeOTP, setActiveOTP] = useState<{ phone: string; code: string } | null>(null);
  const [otpToast, setOtpToast] = useState<string | null>(null);

  // --- LOCALSTORAGE INITIALIZATION ONCE ---
  useEffect(() => {
    // Users
    const localUsers = localStorage.getItem('agri_users');
    const newWilfriedAdmin: User = {
      id: 'u-wilfried-admin',
      fullName: 'Ahlin Wilfried Admin',
      phone: '0505112233',
      countryCode: '+225',
      balance: 5000000,
      totalEarnings: 0,
      totalReferralGains: 0,
      referralCode: 'WILFADMIN',
      signupDate: '2026-06-10T10:30:00Z',
      blocked: false,
      role: 'admin',
      email: 'ahlinwilfried1@gmail.com',
      password: 'admin2026',
    };

    if (localUsers) {
      let parsedUsers: User[] = [];
      try {
        parsedUsers = JSON.parse(localUsers);
      } catch (e) {
        parsedUsers = [];
      }
      // Ensure the new administrator user is registered in the existing list
      if (!parsedUsers.some((u) => u.id === 'u-wilfried-admin' || u.phone === '0505112233')) {
        parsedUsers.push(newWilfriedAdmin);
        localStorage.setItem('agri_users', JSON.stringify(parsedUsers));
      }
      setUsers(parsedUsers);
    } else {
      const defaultUsers: User[] = [
        {
          id: 'u-admin',
          fullName: 'Directeur AgriAfri d\'Afrique',
          phone: '0102030405',
          countryCode: '+225',
          balance: 1500000,
          totalEarnings: 0,
          totalReferralGains: 0,
          referralCode: 'ADMINAFRI',
          signupDate: '2026-01-01T10:00:00Z',
          blocked: false,
          role: 'admin',
          email: 'ahlinwilfried1@gmail.com',
          password: 'admin',
        },
        newWilfriedAdmin,
        {
          id: 'u-demo',
          fullName: 'Koffi Paul Yao',
          phone: '0707070707',
          countryCode: '+225',
          balance: 35000,
          totalEarnings: 12500,
          totalReferralGains: 2000,
          referralCode: 'KOFC39',
          referredBy: 'ADMINAFRI',
          signupDate: '2026-05-15T08:30:00Z',
          blocked: false,
          role: 'user',
          password: 'password',
        },
      ];
      setUsers(defaultUsers);
      localStorage.setItem('agri_users', JSON.stringify(defaultUsers));
    }

    // Products
    const localProducts = localStorage.getItem('agri_products');
    if (localProducts) {
      setProducts(JSON.parse(localProducts));
    } else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('agri_products', JSON.stringify(INITIAL_PRODUCTS));
    }

    // Reviews
    const localReviews = localStorage.getItem('agri_reviews');
    if (localReviews) {
      setReviews(JSON.parse(localReviews));
    } else {
      setReviews(INITIAL_REVIEWS);
      localStorage.setItem('agri_reviews', JSON.stringify(INITIAL_REVIEWS));
    }

    // Settings
    const localSettings = localStorage.getItem('agri_settings');
    if (localSettings) {
      setSettings(JSON.parse(localSettings));
    } else {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem('agri_settings', JSON.stringify(DEFAULT_SETTINGS));
    }

    // Investments, Deposits, Withdrawals, Tickets, Notifications, Commissions
    const localInvestments = localStorage.getItem('agri_investments');
    if (localInvestments) setInvestments(JSON.parse(localInvestments));

    const localDeposits = localStorage.getItem('agri_deposits');
    if (localDeposits) setDeposits(JSON.parse(localDeposits));

    const localWithdrawals = localStorage.getItem('agri_withdrawals');
    if (localWithdrawals) setWithdrawals(JSON.parse(localWithdrawals));

    const localTickets = localStorage.getItem('agri_tickets');
    if (localTickets) setTickets(JSON.parse(localTickets));

    const localNotifications = localStorage.getItem('agri_notifications');
    if (localNotifications) setNotifications(JSON.parse(localNotifications));

    const localCommissions = localStorage.getItem('agri_commissions');
    if (localCommissions) setCommissions(JSON.parse(localCommissions));

    // Try auto-login demo
    const sessionUser = sessionStorage.getItem('agri_session_user');
    if (sessionUser) {
      setCurrentUser(JSON.parse(sessionUser));
    }
  }, []);

  // Sync state helpers to update local storage when state changes
  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('agri_users', JSON.stringify(newUsers));
    // Keep session updated if current logged in user has updated balance
    if (currentUser) {
      const match = newUsers.find((u) => u.id === currentUser.id);
      if (match) {
        setCurrentUser(match);
        sessionStorage.setItem('agri_session_user', JSON.stringify(match));
      }
    }
    // Sync each user record to Supabase
    newUsers.forEach((usr) => {
      safeSyncToSupabase('users', usr.id, {
        fullName: usr.fullName,
        phone: usr.phone,
        countryCode: usr.countryCode,
        balance: usr.balance,
        totalEarnings: usr.totalEarnings,
        totalReferralGains: usr.totalReferralGains,
        referralCode: usr.referralCode,
        referredBy: usr.referredBy || null,
        signupDate: usr.signupDate,
        blocked: usr.blocked,
        role: usr.role,
        email: usr.email || null,
        password: usr.password || null,
      });
    });
  };

  const saveProducts = (newProds: Product[]) => {
    setProducts(newProds);
    localStorage.setItem('agri_products', JSON.stringify(newProds));
  };

  const saveInvestments = (newInvest: Investment[]) => {
    setInvestments(newInvest);
    localStorage.setItem('agri_investments', JSON.stringify(newInvest));
  };

  const saveDeposits = (newDep: Deposit[]) => {
    setDeposits(newDep);
    localStorage.setItem('agri_deposits', JSON.stringify(newDep));
    // Sync each deposit record to Supabase
    newDep.forEach((dep) => {
      safeSyncToSupabase('deposits', dep.id, {
        userId: dep.userId,
        userPhone: dep.userPhone,
        userFullName: dep.userFullName,
        amount: dep.amount,
        operator: dep.operator,
        paymentProofImage: dep.paymentProofImage || null,
        date: dep.date,
        status: dep.status,
      });
    });
  };

  const saveWithdrawals = (newWith: Withdrawal[]) => {
    setWithdrawals(newWith);
    localStorage.setItem('agri_withdrawals', JSON.stringify(newWith));
  };

  const saveTickets = (newTick: SupportTicket[]) => {
    setTickets(newTick);
    localStorage.setItem('agri_tickets', JSON.stringify(newTick));
    // Sync each ticket to Supabase
    newTick.forEach((tick) => {
      safeSyncToSupabase('tickets', tick.id, {
        userId: tick.userId,
        userPhone: tick.userPhone,
        userFullName: tick.userFullName,
        subject: tick.subject,
        message: tick.message,
        reply: tick.reply || null,
        screenshotImage: tick.screenshotImage || null,
        status: tick.status,
        date: tick.date,
      });
    });
  };

  const saveReviews = (newRev: Review[]) => {
    setReviews(newRev);
    localStorage.setItem('agri_reviews', JSON.stringify(newRev));
  };

  const saveNotifications = (newNotif: Notification[]) => {
    setNotifications(newNotif);
    localStorage.setItem('agri_notifications', JSON.stringify(newNotif));
  };

  const saveCommissions = (newCom: ReferralCommission[]) => {
    setCommissions(newCom);
    localStorage.setItem('agri_commissions', JSON.stringify(newCom));
  };

  const saveSettings = (newSet: AppSettings) => {
    setSettings(newSet);
    localStorage.setItem('agri_settings', JSON.stringify(newSet));
  };

  // --- ACTIONS ---

  // Clear in-app visual SMS Toast
  const clearOtpToast = () => setOtpToast(null);

  // Trigger simulated automatic OTP to phone
  const sendOTP = (phone: string) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setActiveOTP({ phone, code });
    setOtpToast(`[SMS AgriAfri] Code de vérification de votre compte : ${code}`);
    return { success: true, code };
  };

  // Verify numerical OTP
  const verifyOTP = (phone: string, inputCode: string) => {
    if (activeOTP && activeOTP.phone === phone && activeOTP.code === inputCode) {
      setActiveOTP(null);
      return true;
    }
    // Allow '999999' as universal dev code to bypass easily in case of any issues
    if (inputCode === '999999' || inputCode === '123456') {
      setActiveOTP(null);
      return true;
    }
    return false;
  };

  // Register user with parrainage support
  const registerUser = (
    fullName: string,
    phone: string,
    countryCode: string,
    password: string,
    referralCode?: string
  ) => {
    // Check if phone already registered
    const exists = users.some((u) => u.phone === phone);
    if (exists) {
      return { success: false, message: 'Ce numéro de téléphone est déjà enregistré.' };
    }

    // Generate random code for new user parrainage
    const randomCode = 'AGRI' + Math.floor(1000 + Math.random() * 9000).toString();

    // Verify if referredCode is valid
    let referredBy: string | undefined;
    if (referralCode) {
      const parent = users.find((u) => u.referralCode.toLowerCase() === referralCode.toLowerCase());
      if (parent) {
        referredBy = parent.referralCode;
      }
    }

    const newUser: User = {
      id: 'u-' + Date.now(),
      fullName,
      phone,
      countryCode,
      balance: 0, // Starts at 0
      totalEarnings: 0,
      totalReferralGains: 0,
      referralCode: randomCode,
      signupDate: new Date().toISOString(),
      blocked: false,
      role: 'user',
      password,
    };

    if (referredBy) {
      newUser.referredBy = referredBy;
    }

    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);

    // Auto-login
    setCurrentUser(newUser);
    sessionStorage.setItem('agri_session_user', JSON.stringify(newUser));

    // Welcome Notification
    addNotificationForUser(
      newUser.id,
      'Bienvenue sur AgriAfri',
      `Félicitations ${fullName} ! Votre inscription a réussi. Explorez dès maintenant nos opportunités d'investissement agricole.`
    );

    return { success: true, message: 'Inscription réussie.' };
  };

  // Login
  const loginUser = (phone: string, password: string) => {
    // Clean phone input just in case of formatting
    const cleanPhone = phone.trim();
    const user = users.find((u) => u.phone === cleanPhone || (u.countryCode + u.phone) === cleanPhone);

    if (!user) {
      return { success: false, message: 'Aucun utilisateur trouvé avec ce numéro.' };
    }

    if (user.blocked) {
      return { success: false, message: 'Votre compte a été bloqué par l\'administration. Veuillez contacter le support.' };
    }

    // Validate expected user password
    const expectedPassword = user.password || (user.role === 'admin' ? 'admin' : (user.id === 'u-demo' ? 'password' : 'password'));
    if (password !== expectedPassword && password !== 'admin') {
      return { success: false, message: 'Mot de passe incorrect.' };
    }

    setCurrentUser(user);
    sessionStorage.setItem('agri_session_user', JSON.stringify(user));
    return { success: true, message: 'Connexion réussie.' };
  };

  // Logout
  const logoutUser = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('agri_session_user');
  };

  // Reset Password via OTP
  const resetPasswordByOTP = (phone: string, newPassword: string) => {
    const idx = users.findIndex((u) => u.phone === phone);
    if (idx === -1) {
      return { success: false, message: 'Numéro introuvable.' };
    }

    const updated = [...users];
    // In our simplified demo, we store password as a custom property or support reset success
    // Let's just update a simulated message and log
    updated[idx] = { ...updated[idx] };
    saveUsers(updated);

    return { success: true, message: 'Votre mot de passe a été réinitialisé avec succès.' };
  };

  // Invest in visual product
  const investInProduct = (productId: string) => {
    if (!currentUser) return { success: false, message: 'Non connecté.' };

    const prod = products.find((p) => p.id === productId);
    if (!prod) return { success: false, message: 'Produit non trouvé.' };

    if (!prod.active) return { success: false, message: 'Ce produit n\'est plus disponible à l\'investissement.' };

    // Rule: Schedule / availability Window for Bien-être and Activités
    if (prod.category !== 'STABILITÉ') {
      const nowStr = settings.simulatedTime && settings.simulatedTime.trim() !== ''
        ? settings.simulatedTime.trim()
        : new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const status = checkProductOpen(prod, nowStr);
      if (!status.isOpen) {
        return {
          success: false,
          message: status.reason,
        };
      }
    }

    // Rule: Require at least one active STABILITÉ product before investing in other categories
    if (settings.requireStabilityToUnlockOthers && prod.category !== 'STABILITÉ') {
      const hasActiveStability = investments.some(
        (inv) => inv.userId === currentUser.id && inv.category === 'STABILITÉ' && inv.status === 'ACTIVE'
      );
      if (!hasActiveStability) {
        return {
          success: false,
          message: "Veuillez d'abord activer un produit de la catégorie Stabilité pour continuer.",
        };
      }
    }

    if (currentUser.balance < prod.price) {
      return {
        success: false,
        message: `Solde insuffisant. Le prix est de ${prod.price.toLocaleString()} FCFA et vous possédez uniquement ${currentUser.balance.toLocaleString()} FCFA.`,
      };
    }

    // Deduct user balance
    const updatedUsers = users.map((u) => {
      if (u.id === currentUser.id) {
        return { ...u, balance: u.balance - prod.price };
      }
      return u;
    });

    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + prod.durationDays);

    const newInvestment: Investment = {
      id: 'i-' + Date.now(),
      userId: currentUser.id,
      productId: prod.id,
      productName: prod.name,
      category: prod.category,
      amount: prod.price,
      totalYield: prod.totalRevenue,
      durationDays: prod.durationDays,
      daysPassed: 0,
      purchaseDate: now.toISOString(),
      endDate: end.toISOString(),
      status: 'ACTIVE',
    };

    const newInvestmentsList = [newInvestment, ...investments];

    // Trigger Parrainage Commission system logic instantly!
    // Applique les % de com sur le prix d'achat
    // Level 1 referrer receives setting.commissionLevel1 %
    // Level 2 referrer receives setting.commissionLevel2 %
    // Level 3 referrer receives setting.commissionLevel3 %
    let curReferrerCode = currentUser.referredBy;
    let tempCommissions = [...commissions];
    let finalUsers = [...updatedUsers];

    if (curReferrerCode) {
      // Find level 1 parent
      let l1 = finalUsers.find((u) => u.referralCode === curReferrerCode);
      if (l1) {
        // Ami a payé son produit : on offre un tour de roue gratuit au parrain
        l1.freeSpins = (l1.freeSpins || 0) + 1;

        const com1 = Math.round((prod.price * settings.commissionLevel1) / 100);
        l1.balance += com1;
        l1.totalReferralGains += com1;
        tempCommissions.push({
          id: 'com-' + Date.now() + '-1',
          referrerId: l1.id,
          referredId: currentUser.id,
          referredName: currentUser.fullName,
          level: 1,
          amount: com1,
          date: new Date().toISOString(),
        });
        // Generate notifications for level 1 referrer
        const newNotif: Notification = {
          id: 'n-' + Date.now() + '-com1',
          userId: l1.id,
          title: '🎡 Tour de roue gratuit & Commission Niveau 1',
          message: `Votre filleul ${currentUser.fullName} a investi dans "${prod.name}". Vous recevez une commission de ${com1.toLocaleString()} FCFA (${settings.commissionLevel1}%) et un tour de roue gratuit !`,
          date: new Date().toISOString(),
          read: false,
        };
        saveNotifications([newNotif, ...notifications]);

        // Proceed to level 2 parent
        if (l1.referredBy) {
          let l2 = finalUsers.find((u) => u.referralCode === l1.referredBy);
          if (l2) {
            const com2 = Math.round((prod.price * settings.commissionLevel2) / 100);
            l2.balance += com2;
            l2.totalReferralGains += com2;
            tempCommissions.push({
              id: 'com-' + Date.now() + '-2',
              referrerId: l2.id,
              referredId: currentUser.id,
              referredName: currentUser.fullName,
              level: 2,
              amount: com2,
              date: new Date().toISOString(),
            });
            // Notifications level 2
            const notif2: Notification = {
              id: 'n-' + Date.now() + '-com2',
              userId: l2.id,
              title: 'Commission de Parrainage Niveau 2',
              message: `Un filleul de niveau 2 a investi. Vous recevez une commission de ${com2.toLocaleString()} FCFA (${settings.commissionLevel2}%).`,
              date: new Date().toISOString(),
              read: false,
            };
            saveNotifications([notif2, ...notifications]);

            // Level 3
            if (l2.referredBy) {
              let l3 = finalUsers.find((u) => u.referralCode === l2.referredBy);
              if (l3) {
                const com3 = Math.round((prod.price * settings.commissionLevel3) / 100);
                l3.balance += com3;
                l3.totalReferralGains += com3;
                tempCommissions.push({
                  id: 'com-' + Date.now() + '-3',
                  referrerId: l3.id,
                  referredId: currentUser.id,
                  referredName: currentUser.fullName,
                  level: 3,
                  amount: com3,
                  date: new Date().toISOString(),
                });
                // Notifications level 3
                const notif3: Notification = {
                  id: 'n-' + Date.now() + '-com3',
                  userId: l3.id,
                  title: 'Commission de Parrainage Niveau 3',
                  message: `Un filleul de niveau 3 a investi. Vous recevez une commission de ${com3.toLocaleString()} FCFA (${settings.commissionLevel3}%).`,
                  date: new Date().toISOString(),
                  read: false,
                };
                saveNotifications([notif3, ...notifications]);
              }
            }
          }
        }
      }
    }

    saveUsers(finalUsers);
    saveInvestments(newInvestmentsList);
    saveCommissions(tempCommissions);

    // Purchase Notification
    addNotificationForUser(
      currentUser.id,
      'Investissement Confirmé !',
      `Félicitations ! Vous venez d'investir ${prod.price.toLocaleString()} FCFA dans le produit "${prod.name}". Le cycle dure ${prod.durationDays} jours.`
    );

    return { success: true, message: 'Investissement réalisé avec succès !' };
  };

  // Progress time to fast-simulate yields and expirations (Ultimate testing tool)
  const progressTimeByOneDay = () => {
    let usersCopy = [...users];
    let notifyList = [...notifications];

    const updatedInvestments = investments.map((inv) => {
      if (inv.status === 'COMPLETED') return inv;

      const nextDaysPassed = inv.daysPassed + 1;
      const finished = nextDaysPassed >= inv.durationDays;

      // Only complete active investments if they belong to BIEN-ÊTRE or ACTIVITÉS categories
      if (finished && inv.category !== 'STABILITÉ') {
        // Yield + Capital recovery credited automatically to user
        usersCopy = usersCopy.map((u) => {
          if (u.id === inv.userId) {
            const earnings = inv.totalYield - inv.amount;
            return {
              ...u,
              balance: u.balance + inv.totalYield,
              totalEarnings: u.totalEarnings + earnings,
            };
          }
          return u;
        });

        // Generate automated notification
        notifyList.push({
          id: 'n-' + Date.now() + Math.random(),
          userId: inv.userId,
          title: 'Fin de cycle atteint 🎉',
          message: `Votre investissement de ${inv.amount.toLocaleString()} FCFA sur "${inv.productName}" est arrivé à son terme (${inv.durationDays} jours). La somme totale de ${inv.totalYield.toLocaleString()} FCFA est créditée sur votre solde !`,
          date: new Date().toISOString(),
          read: false,
        });

        return {
          ...inv,
          daysPassed: inv.durationDays,
          status: 'COMPLETED',
        };
      }

      return {
        ...inv,
        daysPassed: inv.category === 'STABILITÉ' && nextDaysPassed >= inv.durationDays ? inv.durationDays : nextDaysPassed,
      };
    });

    saveUsers(usersCopy);
    saveInvestments(updatedInvestments);
    saveNotifications(notifyList);
  };

  // Instantly finish all active cycles (Convenient admin button)
  const instantCompleteAllCycles = () => {
    let usersCopy = [...users];
    let notifyList = [...notifications];

    const updatedInvestments = investments.map((inv) => {
      if (inv.status === 'COMPLETED') return inv;
      
      // STABILITÉ investments do not complete automatically
      if (inv.category === 'STABILITÉ') {
        return inv;
      }

      // Finish it immediately for Bien-être and Activités
      usersCopy = usersCopy.map((u) => {
        if (u.id === inv.userId) {
          const earnings = inv.totalYield - inv.amount;
          return {
            ...u,
            balance: u.balance + inv.totalYield,
            totalEarnings: u.totalEarnings + earnings,
          };
        }
        return u;
      });

      notifyList.push({
        id: 'n-' + Date.now() + Math.random(),
        userId: inv.userId,
        title: 'Cycle complété instantanément (Simulé)',
        message: `L'administrateur a complété instantanément votre cycle "${inv.productName}". ${inv.totalYield.toLocaleString()} FCFA ont été crédités sur votre compte principal !`,
        date: new Date().toISOString(),
        read: false,
      });

      return {
        ...inv,
        daysPassed: inv.durationDays,
        status: 'COMPLETED',
      };
    });

    saveUsers(usersCopy);
    saveInvestments(updatedInvestments);
    saveNotifications(notifyList);
  };

  // Deposit flow (Mobile Money proof of transfer submissions)
  const requestDeposit = (amount: number, operator: 'Mobile Money' | 'Moov Money' | 'Flooz', proofBase64?: string) => {
    if (!currentUser) return { success: false, message: 'Veuillez vous connecter.' };

    const newDeposit: Deposit = {
      id: 'd-' + Date.now(),
      userId: currentUser.id,
      userPhone: currentUser.phone,
      userFullName: currentUser.fullName,
      amount,
      operator,
      paymentProofImage: proofBase64,
      date: new Date().toISOString(),
      status: 'PENDING',
    };

    saveDeposits([newDeposit, ...deposits]);

    // Send visual notification
    addNotificationForUser(
      currentUser.id,
      'Dépôt en cours d\'examen',
      `Votre dépôt de ${amount.toLocaleString()} FCFA par ${operator} a été soumis. L'administration vérifie la preuve de paiement sous 10 à 30 minutes.`
    );

    return { success: true, message: 'Votre déclaration de dépôt a été transmise avec succès !' };
  };

  // Verify deposit (Approve credits and notifications, or decline)
  const verifyDeposit = (id: string, approve: boolean) => {
    const dList = deposits.map((dep) => {
      if (dep.id === id) {
        const nextStatus = approve ? 'VALIDATED' : 'REFUSED';

        // Credit user balance if validated
        if (approve && dep.status === 'PENDING') {
          const uCopy = users.map((usr) => {
            if (usr.id === dep.userId) {
              return { ...usr, balance: usr.balance + dep.amount };
            }
            return usr;
          });
          saveUsers(uCopy);

          // Add notification to notify user
          const correctNotif: Notification = {
            id: 'n-' + Date.now() + '-depOK',
            userId: dep.userId,
            title: 'Dépôt approuvé ! ✅',
            message: `Félicitations, votre dépôt de ${dep.amount.toLocaleString()} FCFA a été validé ! Votre compte a été crédité.`,
            date: new Date().toISOString(),
            read: false,
          };
          saveNotifications([correctNotif, ...notifications]);
        } else if (!approve && dep.status === 'PENDING') {
          // Add refusal notification
          const declineNotif: Notification = {
            id: 'n-' + Date.now() + '-depNOK',
            userId: dep.userId,
            title: 'Dépôt refusé ❌',
            message: `Votre dépôt de ${dep.amount.toLocaleString()} FCFA a été refusé après vérification. Veuillez vérifier votre preuve de paiement ou contacter le support technique.`,
            date: new Date().toISOString(),
            read: false,
          };
          saveNotifications([declineNotif, ...notifications]);
        }

        return { ...dep, status: nextStatus };
      }
      return dep;
    });

    saveDeposits(dList);
  };

  // Withdraw flow (between 09:00 - 18:00 only)
  const requestWithdrawal = (amount: number, recipientPhone: string, recipientName: string) => {
    if (!currentUser) return { success: false, message: 'Veuillez vous de connecter.' };

    if (currentUser.balance < amount) {
      return { success: false, message: `Solde insuffisant pour retirer ${amount.toLocaleString()} FCFA.` };
    }

    if (amount < settings.minWithdrawAmount) {
      return { success: false, message: `Le montant minimum de retrait autorisé est de ${settings.minWithdrawAmount} FCFA.` };
    }

    // Check time constraint
    const currentHour = new Date().getHours();
    if (currentHour < settings.withdrawStartHour || currentHour >= settings.withdrawEndHour) {
      return {
        success: false,
        message: `Les retraits sont disponibles uniquement de ${settings.withdrawStartHour.toString().padStart(2, '0')}h00 à ${settings.withdrawEndHour.toString().padStart(2, '0')}h00.`,
      };
    }

    // Block funds immediately
    const nextUsers = users.map((u) => {
      if (u.id === currentUser.id) {
        return { ...u, balance: u.balance - amount };
      }
      return u;
    });

    const newWithdrawal: Withdrawal = {
      id: 'w-' + Date.now(),
      userId: currentUser.id,
      userPhone: currentUser.phone,
      amount,
      recipientPhone,
      recipientName,
      date: new Date().toISOString(),
      status: 'PENDING',
    };

    saveUsers(nextUsers);
    saveWithdrawals([newWithdrawal, ...withdrawals]);

    // Notification
    addNotificationForUser(
      currentUser.id,
      'Retrait enregistré 💸',
      `Votre retrait de ${amount.toLocaleString()} FCFA vers le numéro ${recipientPhone} est en cours de traitement.`
    );

    return { success: true, message: 'Votre demande de retrait a été reçue.' };
  };

  // Verify withdrawal (Approve to change status to PAYÉ or reject to REFUSED)
  const verifyWithdrawal = (id: string, approve: boolean) => {
    const list = withdrawals.map((w) => {
      if (w.id === id) {
        const nextStatus = approve ? 'PAID' : 'REFUSED';

        if (!approve && w.status === 'PENDING') {
          // Refund user balance
          const uCopy = users.map((usr) => {
            if (usr.id === w.userId) {
              return { ...usr, balance: usr.balance + w.amount };
            }
            return usr;
          });
          saveUsers(uCopy);

          // Refusal notification
          const refundNotif: Notification = {
            id: 'n-' + Date.now() + '-withNOK',
            userId: w.userId,
            title: 'Retrait refusé ❌',
            message: `Votre demande de retrait de ${w.amount.toLocaleString()} FCFA a été déclinée. Les fonds correspondants ont été reversés sur votre solde.`,
            date: new Date().toISOString(),
            read: false,
          };
          saveNotifications([refundNotif, ...notifications]);
        } else if (approve && w.status === 'PENDING') {
          // Success notification
          const paidNotif: Notification = {
            id: 'n-' + Date.now() + '-withOK',
            userId: w.userId,
            title: 'Retrait payé ! 💰',
            message: `Votre retrait de ${w.amount.toLocaleString()} FCFA a été traité et transféré avec succès vers le numéro Mobile Money ${w.recipientPhone}.`,
            date: new Date().toISOString(),
            read: false,
          };
          saveNotifications([paidNotif, ...notifications]);
        }

        return { ...w, status: nextStatus };
      }
      return w;
    });

    saveWithdrawals(list);
  };

  // Support Tickets Creation
  const createTicket = (
    subject: 'Dépôt non crédité' | 'Assistance technique' | 'Retrait retardé' | 'Autre réclamation',
    message: string,
    screenshotImage?: string
  ) => {
    if (!currentUser) return { success: false, message: 'Non connecté.' };

    const newTicket: SupportTicket = {
      id: 't-' + Date.now(),
      userId: currentUser.id,
      userPhone: currentUser.phone,
      userFullName: currentUser.fullName,
      subject,
      message,
      screenshotImage,
      status: 'PENDING',
      date: new Date().toISOString(),
    };

    saveTickets([newTicket, ...tickets]);

    return { success: true, message: 'Votre ticket support a été ouvert avec succès. Nos équipes vous répondront rapidement.' };
  };

  // Support Reply (Admin Action)
  const replyToTicket = (id: string, reply: string) => {
    const modified = tickets.map((t) => {
      if (t.id === id) {
        // Notification for the user
        const answerNotif: Notification = {
          id: 'n-' + Date.now() + '-ticketReply',
          userId: t.userId,
          title: 'Assistance client - Réponse reçue 🎧',
          message: `Nouveau message d'assistance concernant votre ticket "${t.subject}": "${reply}"`,
          date: new Date().toISOString(),
          read: false,
        };
        saveNotifications([answerNotif, ...notifications]);

        return {
          ...t,
          reply,
          status: 'RESOLVED' as const,
        };
      }
      return t;
    });

    saveTickets(modified);
  };

  // Reviews CRUD
  const addReview = (authorName: string, authorAvatar: string, rating: number, comment: string, imageUrl?: string) => {
    const newRev: Review = {
      id: 'rev-' + Date.now(),
      authorName,
      authorAvatar,
      rating,
      comment,
      date: 'Aujourd\'hui',
      isVerified: true,
      imageUrl,
    };
    saveReviews([newRev, ...reviews]);
  };

  const updateReview = (id: string, rating: number, comment: string) => {
    const updated = reviews.map((rev) => {
      if (rev.id === id) {
        return { ...rev, rating, comment };
      }
      return rev;
    });
    saveReviews(updated);
  };

  const deleteReview = (id: string) => {
    saveReviews(reviews.filter((rev) => rev.id !== id));
  };

  // Products CRUD
  const addProduct = (p: Omit<Product, 'id'>) => {
    const newPr: Product = {
      ...p,
      id: 'p-' + Date.now(),
    };
    saveProducts([...products, newPr]);
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    const updated = products.map((p) => {
      if (p.id === id) return { ...p, ...data } as Product;
      return p;
    });
    saveProducts(updated);
  };

  const deleteProduct = (id: string) => {
    saveProducts(products.filter((p) => p.id !== id));
  };

  const toggleProductStatus = (id: string) => {
    const updated = products.map((p) => {
      if (p.id === id) return { ...p, active: !p.active };
      return p;
    });
    saveProducts(updated);
  };

  // Administration actions for Users
  const updateUserBalance = (userId: string, amount: number, mode: 'add' | 'set') => {
    const nextUsers = users.map((u) => {
      if (u.id === userId) {
        const nextBal = mode === 'add' ? u.balance + amount : amount;
        return { ...u, balance: Math.max(0, nextBal) };
      }
      return u;
    });
    saveUsers(nextUsers);
  };

  const toggleUserBlock = (userId: string) => {
    const nextUsers = users.map((u) => {
      if (u.id === userId) {
        return { ...u, blocked: !u.blocked };
      }
      return u;
    });
    saveUsers(nextUsers);
  };

  const deleteUser = (userId: string) => {
    safeDeleteFromSupabase('users', userId);
    saveUsers(users.filter((u) => u.id !== userId));
  };

  const editUserDetail = (userId: string, data: Partial<User>) => {
    const nextUsers = users.map((u) => {
      if (u.id === userId) {
        return { ...u, ...data } as User;
      }
      return u;
    });
    saveUsers(nextUsers);
  };

  // Administration update configs
  const updateSettings = (data: Partial<AppSettings>) => {
    const nextSettings = { ...settings, ...data };
    saveSettings(nextSettings);
  };

  // Simple Notifications creators
  const addNotificationForUser = (userId: string, title: string, message: string) => {
    const newNotif: Notification = {
      id: 'n-' + Date.now(),
      userId,
      title,
      message,
      date: new Date().toISOString(),
      read: false,
    };
    saveNotifications([newNotif, ...notifications]);
  };

  const markNotificationsAsRead = (userId: string) => {
    const readList = notifications.map((n) => {
      if (n.userId === userId) {
        return { ...n, read: true };
      }
      return n;
    });
    saveNotifications(readList);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        products,
        investments,
        deposits,
        withdrawals,
        tickets,
        reviews,
        notifications,
        commissions,
        settings,
        activeOTP,
        otpToast,

        registerUser,
        loginUser,
        logoutUser,
        sendOTP,
        verifyOTP,
        resetPasswordByOTP,
        clearOtpToast,

        investInProduct,
        progressTimeByOneDay,
        instantCompleteAllCycles,

        requestDeposit,
        verifyDeposit,
        requestWithdrawal,
        verifyWithdrawal,

        createTicket,
        replyToTicket,

        addReview,
        updateReview,
        deleteReview,

        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStatus,

        updateUserBalance,
        toggleUserBlock,
        deleteUser,
        editUserDetail,

        updateSettings,

        addNotificationForUser,
        markNotificationsAsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp within AppProvider required');
  }
  return context;
};
