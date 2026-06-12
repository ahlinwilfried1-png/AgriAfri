/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  Coins,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Layers,
  Users,
  Link,
  Settings,
  LogOut,
  ChevronRight,
  Clipboard,
  History,
  TrendingUp,
  X,
  PlusCircle,
  FileText,
  Clock,
  Briefcase,
  UserCheck,
  Info,
  HelpCircle,
  Smartphone,
  Download,
} from 'lucide-react';

interface ProfileViewProps {
  isAdminView?: boolean;
  setIsAdminView?: (val: boolean) => void;
  setActiveTab?: (tab: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ isAdminView, setIsAdminView, setActiveTab }) => {
  const {
    currentUser,
    investments,
    deposits,
    withdrawals,
    commissions,
    settings,
    logoutUser,
    requestDeposit,
    requestWithdrawal,
    tickets,
    createTicket,
  } = useApp();

  // Active expanded accordion sub-menu
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>('history');
  const [linkCopied, setLinkCopied] = useState(false);
  const [txFilter, setTxFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'revenue' | 'purchase'>('all');

  // --- DEPOSIT SUB-FORM STATE ---
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depAmount, setDepAmount] = useState<number>(5000);
  const [depOperator, setDepOperator] = useState<'Mobile Money' | 'Moov Money' | 'Flooz'>('Mobile Money');
  const [depProof, setDepProof] = useState<string>('');
  const [depSuccess, setDepSuccess] = useState('');
  const [depError, setDepError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Countries configuration
  const countriesList = [
    { flag: '🇨🇮', name: "Côte d'Ivoire", code: '+225' },
    { flag: '🇹🇬', name: 'Togo', code: '+228' },
    { flag: '🇧🇯', name: 'Bénin', code: '+229' },
    { flag: '🇨🇲', name: 'Cameroun', code: '+237' },
  ];

  // --- WITHDRAW SUB-FORM STATE ---
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withAmount, setWithAmount] = useState<number>(5000);
  const [withCountry, setWithCountry] = useState(() => {
    return countriesList.find(c => c.code === currentUser?.countryCode) || countriesList[0];
  });
  const [withPhone, setWithPhone] = useState(() => {
    const defaultC = countriesList.find(c => c.code === currentUser?.countryCode) || countriesList[0];
    return `${defaultC.code} `;
  });
  const [withSuccess, setWithSuccess] = useState('');
  const [withError, setWithError] = useState('');

  const handleWithCountryChange = (countryCode: string) => {
    const chosen = countriesList.find(c => c.code === countryCode);
    if (chosen) {
      setWithCountry(chosen);
      const rawNumber = withPhone.replace(/^\+\d+\s*/, '');
      setWithPhone(`${chosen.code} ${rawNumber}`);
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 p-6">
        <p className="text-slate-500 font-sans text-sm">Veuillez d'abord vous connecter.</p>
      </div>
    );
  }

  // Handle image loading to base64 for proof of payment
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDepProof(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setDepSuccess('');
    setDepError('');

    if (depAmount <= 0) {
      setDepError('Veuillez introduire un montant valide supérieur à 0.');
      return;
    }

    if (!depProof) {
      setDepError('Veuillez télécharger la preuve de paiement (Capture d\'écran du transfert) obligatoire.');
      return;
    }

    const res = requestDeposit(depAmount, depOperator, depProof);
    if (res.success) {
      setDepSuccess('Votre déclaration de dépôt a été transmise avec succès ! Notre équipe vérifie sous 15 minutes.');
      setDepAmount(5000);
      setDepProof('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => {
        setDepSuccess('');
        setShowDepositModal(false);
      }, 5000);
    } else {
      setDepError(res.message);
    }
  };

  const submitWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    setWithSuccess('');
    setWithError('');

    if (withAmount <= 0) {
      setWithError('Montant invalide.');
      return;
    }

    if (!withPhone.trim() || withPhone.trim() === withCountry.code) {
      setWithError('Veuillez spécifier le numéro de téléphone Mobile Money.');
      return;
    }

    const currentHour = new Date().getHours();
    if (currentHour < settings.withdrawStartHour || currentHour >= settings.withdrawEndHour) {
      setWithError(`Les retraits sont disponibles uniquement de ${settings.withdrawStartHour.toString().padStart(2, '0')}h00 à ${settings.withdrawEndHour.toString().padStart(2, '0')}h00.`);
      return;
    }

    // Automatically construct standard beneficiary detail
    const finalBeneficiaryName = `Retrait Mobile (${withCountry.name})`;

    const res = requestWithdrawal(withAmount, withPhone, finalBeneficiaryName);
    if (res.success) {
      setWithSuccess('Votre demande de retrait a été enregistrée avec succès. Paiement en cours de virement.');
      setWithAmount(5000);
      setWithPhone(`${withCountry.code} `);
      setTimeout(() => {
        setWithSuccess('');
        setShowWithdrawModal(false);
      }, 5000);
    } else {
      setWithError(res.message);
    }
  };

  const handleCopyLink = () => {
    const inviteLink = `${window.location.origin}/?ref=${currentUser.referralCode}`;
    navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    setTimeout(() => {
      setLinkCopied(false);
    }, 2800);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentUser.referralCode);
    alert('Code d\'invitation copié : ' + currentUser.referralCode);
  };

  // Filter local user list elements
  const userInvests = investments.filter((i) => i.userId === currentUser.id);
  const userDeps = deposits.filter((d) => d.userId === currentUser.id);
  const userWiths = withdrawals.filter((w) => w.userId === currentUser.id);
  const userComs = commissions.filter((c) => c.referrerId === currentUser.id);

  // Build a unified list of transactions
  const unifiedTransactions = [
    ...userDeps.map(dep => ({
      id: `dep-${dep.id}`,
      type: 'deposit' as const,
      amount: dep.amount,
      date: new Date(dep.date),
      label: 'Dépôt',
      operator: dep.operator,
      status: dep.status,
      details: `Virement via ${dep.operator}`,
    })),
    ...userWiths.map(w => ({
      id: `with-${w.id}`,
      type: 'withdrawal' as const,
      amount: w.amount,
      date: new Date(w.date),
      label: 'Retrait',
      operator: 'Mobile Money',
      status: w.status,
      details: `Destinataire: ${w.recipientName} (${w.recipientPhone})`,
    })),
    ...userComs.map(com => ({
      id: `com-${com.id}`,
      type: 'revenue' as const,
      amount: com.amount,
      date: new Date(com.date),
      label: 'Revenu',
      operator: `Niveau ${com.level}`,
      status: 'PAID',
      details: `Filleul: ${com.referredName}`,
    })),
    ...userInvests.map(inv => ({
      id: `inv-${inv.id}`,
      type: 'purchase' as const,
      amount: inv.amount,
      date: new Date(inv.purchaseDate),
      label: 'Achat',
      operator: 'Cycle agricole',
      status: inv.status,
      details: `${inv.productName} (${inv.durationDays} Jours)`,
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const activeInvests = userInvests.filter((i) => i.status === 'ACTIVE');
  const finishedInvests = userInvests.filter((i) => i.status === 'COMPLETED');
  const stabilityInvests = userInvests.filter((i) => i.category === 'STABILITÉ');

  // Time Constraint Check for withdrawals styling
  const currentHour = new Date().getHours();
  const withdrawalsOpen = currentHour >= settings.withdrawStartHour && currentHour < settings.withdrawEndHour;

  return (
    <div id="profile-view-container" className="animate-fade-in space-y-4 pb-24 relative">
      
      {linkCopied && (
        <div id="profile-copied-toast animate-bounce" className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-[11px] font-sans font-extrabold tracking-wide px-4 py-2 rounded-full shadow-lg border border-emerald-400/30 flex items-center justify-center gap-1.5">
          <span>🤝</span>
          <span>Lien de parrainage copié avec succès</span>
        </div>
      )}
      
      {/* 💳 COMSIC PREMIUM AVATAR & BACKGROUND (IMAGE 3 THEME) */}
      <div 
        className="relative rounded-3xl p-5 overflow-hidden text-white shadow-xl border border-indigo-950"
        style={{
          backgroundImage: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 60%, #020617 100%)"
        }}
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        
        {/* Top right settings cog wheel icon */}
        <button
          onClick={() => {
            if (confirm('Voulez-vous vous déconnecter de votre compte Agro Récolte ?')) {
              logoutUser();
            }
          }}
          className="absolute top-5 right-5 p-1.5 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full transition-all cursor-pointer"
          title="Déconnexion"
        >
          <LogOut className="w-4.5 h-4.5 text-slate-205" />
        </button>

        <div className="flex items-center gap-4.5">
          {/* Circular avatar frame matching mockup initials */}
          <div className="w-15 h-15 rounded-full bg-[#8f96e8] text-slate-950 border-2 border-indigo-400 flex items-center justify-center font-sans font-black text-xl shadow-md select-none">
            {currentUser.fullName ? currentUser.fullName.substring(0, 2).toUpperCase() : 'RG'}
          </div>

          <div className="space-y-1">
            <h3 className="font-sans font-black text-md text-white tracking-tight leading-none flex items-center gap-1.5">
              {currentUser.fullName}
              <span className="text-[10px] bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold px-1.5 py-0.5 rounded-md uppercase">
                VIP 1
              </span>
            </h3>
            
            {/* Masked premium phone number formatting: e.g. 709*****19 */}
            <p className="font-mono text-xs text-indigo-200">
              {(() => {
                const ph = currentUser.phone;
                if (ph.length >= 6) {
                  return `${ph.substring(0, 3)}*****${ph.substring(ph.length - 2)}`;
                }
                return ph;
              })()}
            </p>

            {/* Click to copy user ID badge */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(currentUser.id);
                alert('ID Utilisateur copié : ' + currentUser.id);
              }}
              className="px-2 py-0.5 bg-white/10 hover:bg-white/20 active:scale-95 text-indigo-200 text-[10px] font-sans font-bold uppercase rounded-md flex items-center gap-1 transition-all cursor-pointer"
            >
              ID: {currentUser.id.substring(0, 6).toUpperCase()}
              <Clipboard className="w-3 h-3 text-slate-350" />
            </button>
          </div>
        </div>
      </div>

      {/* 💎 VIP1 CARD AND PROGRESSION BLOCK (ACCURATE TO THE USER'S SCREENSHOT MOCKUP) */}
      <div 
        id="vip-mockup-card" 
        className="rounded-3xl p-5 text-white shadow-xl relative overflow-hidden flex flex-col gap-4 border border-indigo-500/10"
        style={{
          backgroundImage: "linear-gradient(135deg, #4f46e5 0%, #311084 60%, #1e0954 100%)"
        }}
      >
        {/* Light overlay glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/15 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            {/* Blue cyan diamond icon matching mockup */}
            <span className="text-xl filter drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]">💎</span>
            <div>
              <span className="font-sans font-black text-lg tracking-tight block leading-none text-white">
                VIP1
              </span>
              <span className="text-[11px] text-indigo-200/90 font-sans font-bold block mt-1">
                Mise à niveau VIP2 manque encore <strong className="text-amber-400 font-extrabold">18 000.00</strong> FCFA
              </span>
            </div>
          </div>
          {/* Present box gift icon on the right as shown in mockup */}
          <div className="text-2xl animate-pulse shrink-0">
            🎁
          </div>
        </div>

        {/* Progress bar matching mockup screen (thin horizontal line) */}
        <div className="space-y-1">
          <div className="w-full bg-black/30 h-1.5 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400" 
              style={{ width: '38%' }}
            />
          </div>
          <div className="flex justify-between text-[8px] text-indigo-205 font-sans font-bold uppercase tracking-wider">
            <span>Progression: 38%</span>
            <span>VIP2 à 30 000 FCFA</span>
          </div>
        </div>
      </div>

      {/* 🛠️ ACTIVE ADMIN DASHBOARD MODE CARD TOGGLE - IF USER IS AN ADMIN */}
      {currentUser.role === 'admin' && setIsAdminView && (
        <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-4 shadow-md text-white flex justify-between items-center">
          <div className="space-y-0.5">
            <h4 className="font-sans font-black text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <span>⚙️</span> Mode Administrateur
            </h4>
            <p className="text-[10px] text-slate-400 leading-tight font-sans">
              Basculez vers l'espace de gestion et suivi
            </p>
          </div>
          <button
            id="toggle-admin-space-btn"
            onClick={() => setIsAdminView(true)}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-sans font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            Ouvrir
          </button>
        </div>
      )}

      {/* 📊 FOUR-COLUMN LINK BUTTON ROW (Recharger, Retirer, Mes Commandes, Mobile Money) */}
      <div className="grid grid-cols-4 gap-2 bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-2xs">
        {/* A. Recharger */}
        <button
          onClick={() => {
            if (setActiveTab) {
              setActiveTab('recharge');
            }
          }}
          className="flex flex-col items-center justify-center focus:outline-none focus:ring-0 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-md shadow-inner transition-transform group-hover:scale-105 active:scale-95">
            💳
          </div>
          <span className="text-[10px] font-sans font-extrabold text-slate-600 mt-1 text-center select-none truncate w-full">
            Recharger
          </span>
        </button>

        {/* B. Retirer */}
        <button
          onClick={() => {
            if (setActiveTab) {
              setActiveTab('retrait');
            }
          }}
          className="flex flex-col items-center justify-center focus:outline-none focus:ring-0 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-md shadow-inner transition-transform group-hover:scale-105 active:scale-95">
            💸
          </div>
          <span className="text-[10px] font-sans font-extrabold text-slate-600 mt-1 text-center select-none truncate w-full">
            Retirer
          </span>
        </button>

        {/* C. Mes Commandes */}
        <button
          onClick={() => {
            setActiveSubMenu('invests');
            const targetEl = document.getElementById('profile-submenus-accordion');
            if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center focus:outline-none focus:ring-0 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-md shadow-inner transition-transform group-hover:scale-105 active:scale-95">
            📜
          </div>
          <span className="text-[10px] font-sans font-extrabold text-slate-600 mt-1 text-center select-none truncate w-full">
            Commandes
          </span>
        </button>

        {/* D. Mobile Money Details */}
        <button
          onClick={() => {
            setActiveSubMenu('deposits');
            const targetEl = document.getElementById('profile-submenus-accordion');
            if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center focus:outline-none focus:ring-0 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-md shadow-inner transition-transform group-hover:scale-105 active:scale-95">
            📲
          </div>
          <span className="text-[10px] font-sans font-extrabold text-slate-600 mt-1 text-center select-none truncate w-full">
            Historique
          </span>
        </button>
      </div>

      {/* 💰 DUAL-BALANCE METRIC DISPLAY CARD: "Mon revenu" */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-2xs space-y-3">
        <h4 className="font-sans font-black text-xs text-slate-800 uppercase tracking-tight flex items-center gap-1.5 pb-2 border-b border-slate-100">
          💼 Mon Revenu
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="border-r border-slate-100/80 pr-2">
            <span className="font-mono text-base font-black text-slate-900 leading-none">
              {currentUser.balance.toLocaleString('fr-FR')}
            </span>
            <span className="text-[9px] font-sans font-bold text-slate-405 block uppercase mt-1">
              Solde de recharge
            </span>
          </div>

          <div className="pl-2">
            <span className="font-mono text-base font-black text-slate-900 leading-none text-emerald-600">
              {currentUser.totalEarnings.toLocaleString('fr-FR')}
            </span>
            <span className="text-[9px] font-sans font-bold text-slate-405 block uppercase mt-1">
              Solde de retrait
            </span>
          </div>
        </div>
      </div>

      {/* 📢 DUAL COLUMNS SHORTCUT CARDS (Inviter des amis / Roue de la chance) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Orange card: Inviter des amis */}
        <button
          onClick={handleCopyLink}
          type="button"
          className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-left p-3.5 rounded-2xl shadow-xs relative overflow-hidden group transition-all duration-150 active:scale-98 cursor-pointer"
        >
          <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-white/10 rounded-full blur-xs pointer-events-none" />
          <span className="text-lg block mb-1">👥</span>
          <h4 className="font-sans font-black text-xs leading-none">Inviter des amis</h4>
          <p className="text-[9px] text-amber-50/80 mt-1 pr-1 font-sans leading-snug">
            Invitez des amis pour gagner une commission.
          </p>
        </button>

        {/* Emerald card: Avis & Témoignages */}
        <button
          onClick={() => {
            const tabAvis = document.getElementById('nav-tab-avis');
            if (tabAvis) {
              tabAvis.click();
            }
          }}
          type="button"
          className="bg-gradient-to-br from-emerald-500 to-green-600 text-white text-left p-3.5 rounded-2xl shadow-xs relative overflow-hidden group transition-all duration-150 active:scale-98 cursor-pointer"
        >
          <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-white/10 rounded-full blur-xs pointer-events-none" />
          <span className="text-lg block mb-1">⭐</span>
          <h4 className="font-sans font-black text-xs leading-none">Avis & Retours</h4>
          <p className="text-[9px] text-emerald-50/80 mt-1 pr-1 font-sans leading-snug">
            Consultez les témoignages ou écrivez le vôtre !
          </p>
        </button>
      </div>

      {/* 🏷️ SECTION TITLE BLOCK FOR SUBMENUS */}
      <div className="pt-2">
        <h3 className="font-sans font-black text-xs text-[#2a3042] uppercase tracking-wide border-l-4 border-indigo-500 pl-2">
          | Service d'application
        </h3>
      </div>

      {/* 🗃️ DETAILED COLLAPSIBLE SUBMENUS ACCORDION */}
      <div id="profile-submenus-accordion" className="space-y-3">
        {[
          {
            id: 'invests',
            title: '📜 Mes Commandes & Évolution',
            icon: Briefcase,
            badge: `${userInvests.length} achat(s)`,
            content: (
              <div className="space-y-3 font-sans text-xs">
                {userInvests.length === 0 ? (
                  <div className="text-center py-6 space-y-2">
                    <p className="text-slate-400 font-sans text-[11px]">
                      Vous n'avez pas encore d'investissements actifs ou de commandes.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab && setActiveTab('produits')}
                      className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      🌾 Investir sur un produit
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userInvests.map((inv) => {
                      const dailyNetProfit = Math.round((inv.totalYield - inv.amount) / inv.durationDays);
                      const accumulatedNetProfit = Math.round(dailyNetProfit * inv.daysPassed);
                      const progressPct = Math.min(100, Math.round((inv.daysPassed / inv.durationDays) * 100));
                      const isActive = inv.status === 'ACTIVE';

                      return (
                        <div
                          id={`user-ordered-product-${inv.id}`}
                          key={inv.id}
                          className={`bg-white border rounded-2xl p-4 shadow-3xs space-y-3 transition-all hover:border-slate-200 ${
                            isActive ? 'border-amber-200' : 'border-slate-100'
                          }`}
                        >
                          {/* Card header */}
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                                {inv.category}
                              </span>
                              <h4 className="font-sans font-black text-slate-800 text-[12px] mt-1">
                                {inv.productName}
                              </h4>
                            </div>

                            <div>
                              {isActive ? (
                                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase animate-pulse">
                                  ● En Production
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                                  ✓ Terminé
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Grid metrics */}
                          <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-100/60 p-2.5 rounded-xl text-[10.5px]">
                            <div>
                              <span className="block text-[8.5px] text-slate-400 font-bold uppercase">Capital d'achat</span>
                              <strong className="font-mono text-slate-700 text-[11px]">
                                {inv.amount.toLocaleString()} FCFA
                              </strong>
                            </div>
                            <div>
                              <span className="block text-[8.5px] text-slate-400 font-bold uppercase">Retour attendu</span>
                              <strong className="font-mono text-emerald-600 text-[11px]">
                                {inv.totalYield.toLocaleString()} FCFA
                              </strong>
                            </div>
                            <div className="pt-1.5 border-t border-slate-200/50">
                              <span className="block text-[8.5px] text-slate-400 font-bold uppercase">Gain quotidien</span>
                              <strong className="font-mono text-indigo-600 text-[11px]">
                                +{dailyNetProfit.toLocaleString()} FCFA / jr
                              </strong>
                            </div>
                            <div className="pt-1.5 border-t border-slate-200/50">
                              <span className="block text-[8.5px] text-slate-400 font-bold uppercase">Revenu accumulé</span>
                              <strong className="font-mono text-emerald-700 text-[11px]">
                                +{accumulatedNetProfit.toLocaleString()} FCFA
                              </strong>
                            </div>
                          </div>

                          {/* Evolution Progress section */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase">
                              <span>Évolution : {progressPct}%</span>
                              <span>Jour {inv.daysPassed} / {inv.durationDays}</span>
                            </div>
                            <div className="w-full bg-slate-150 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isActive 
                                    ? 'bg-gradient-to-r from-amber-400 to-indigo-505 bg-indigo-500 animate-pulse' 
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>

                          {/* Dates footer */}
                          <div className="flex justify-between items-center text-[8.5px] text-slate-400 font-mono border-t border-slate-100/80 pt-2 shrink-0">
                            <span>Achat : {new Date(inv.purchaseDate).toLocaleDateString('fr-FR')}</span>
                            <span>Échéance : {new Date(inv.endDate).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ),
          },
          {
            id: 'history',
            title: '📊 Historique des Transactions',
            icon: History,
            badge: `${userDeps.length + userWiths.length + userComs.length + userInvests.length} opération(s)`,
            content: (
              <div className="space-y-3 font-sans text-xs">
                {/* Micro Filter Pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none border-b border-slate-100">
                  {[
                    { key: 'all', label: 'Tout', emoji: '📋' },
                    { key: 'deposit', label: 'Dépôts', emoji: '📥' },
                    { key: 'purchase', label: 'Achats', emoji: '🌾' },
                    { key: 'revenue', label: 'Revenus', emoji: '📈' },
                    { key: 'withdrawal', label: 'Retraits', emoji: '💸' }
                  ].map((pill) => {
                    const active = txFilter === pill.key;
                    return (
                      <button
                        key={pill.key}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTxFilter(pill.key as any);
                        }}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide select-none transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                          active
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        <span>{pill.emoji}</span>
                        <span>{pill.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Filtered list of transactions */}
                {unifiedTransactions.filter(tx => txFilter === 'all' || tx.type === txFilter).length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center font-sans">
                    Aucune transaction trouvée pour cette catégorie.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {unifiedTransactions
                      .filter(tx => txFilter === 'all' || tx.type === txFilter)
                      .map((tx) => (
                        <div
                          id={`tx-history-item-${tx.id}`}
                          key={tx.id}
                          className="p-3 bg-white border border-slate-100 rounded-2xl flex justify-between items-center shadow-2xs hover:border-slate-200 transition-all"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              {/* Icon Indicator for transaction types */}
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                tx.type === 'deposit' 
                                  ? 'bg-indigo-50 text-indigo-707 text-indigo-700' 
                                  : tx.type === 'withdrawal' 
                                  ? 'bg-rose-50 text-rose-707 text-rose-700' 
                                  : tx.type === 'purchase'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-emerald-50 text-emerald-707 text-emerald-700'
                              }`}>
                                {tx.label}
                              </span>
                              <span className="bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 text-[8.5px] rounded-md">
                                {tx.operator}
                              </span>
                            </div>
                            <p className="font-extrabold text-slate-800 text-xs">
                              {(tx.type === 'withdrawal' || tx.type === 'purchase') ? '-' : '+'}{tx.amount.toLocaleString()} FCFA
                            </p>
                            <p className="text-[10px] text-slate-500 leading-snug">
                              {tx.details}
                            </p>
                            <p className="text-[8.5px] text-slate-405 font-mono">
                              Le {tx.date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>

                          <div className="text-right">
                            {tx.type === 'deposit' && (
                              <>
                                {tx.status === 'PENDING' && (
                                  <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 text-[9.5px] rounded-full font-bold">En examen</span>
                                )}
                                {tx.status === 'VALIDATED' && (
                                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[9.5px] rounded-full font-bold">Crédité ✅</span>
                                )}
                                {tx.status === 'REFUSED' && (
                                  <span className="bg-rose-50 text-rose-700 border border-rose-150 px-2.5 py-0.5 text-[9.5px] rounded-full font-bold">Refusé ❌</span>
                                )}
                              </>
                            )}
                            {tx.type === 'withdrawal' && (
                              <>
                                {tx.status === 'PENDING' && (
                                  <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 text-[9.5px] rounded-full font-bold">En attente</span>
                                )}
                                {tx.status === 'PAID' && (
                                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[9.5px] rounded-full font-bold">Payé 💰</span>
                                )}
                                {tx.status === 'REFUSED' && (
                                  <span className="bg-rose-50 text-rose-700 border border-rose-150 px-2.5 py-0.5 text-[9.5px] rounded-full font-bold">Refusé ❌</span>
                                )}
                              </>
                            )}
                            {tx.type === 'revenue' && (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[9.5px] rounded-full font-bold">Succès ✨</span>
                            )}
                            {tx.type === 'purchase' && (
                              <>
                                {tx.status === 'ACTIVE' && (
                                  <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 text-[9.5px] rounded-full font-bold">En cours 🚜</span>
                                )}
                                {tx.status === 'COMPLETED' && (
                                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[9.5px] rounded-full font-bold">Terminé 🌾</span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ),
          },
          {
            id: 'team',
            title: '👥 Mon Équipe & Parrainage',
            icon: Users,
            badge: 'Inviter',
            content: (
              <div className="space-y-4 font-sans text-xs text-slate-700">
                {/* INVITATION DETAILS */}
                <div className="bg-emerald-50/40 border border-emerald-100/30 p-4 rounded-2xl space-y-3">
                  <h5 className="font-bold text-slate-800 text-xs">🎁 Récompenses de Parrainage AgriAfri</h5>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Recevez des commissions sur les dépôts de vos filleuls sur 3 niveaux généalogiques : <br />
                    • Niveau 1 : <strong className="text-emerald-700">{settings.commissionLevel1}%</strong> <br />
                    • Niveau 2 : <strong className="text-emerald-700">{settings.commissionLevel2}%</strong> <br />
                    • Niveau 3 : <strong className="text-emerald-700">{settings.commissionLevel3}%</strong>
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-100/30">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-medium">Mon Code Invitation</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-sm font-black text-slate-800 select-all tracking-wider">{currentUser.referralCode}</span>
                        <button id="btn-copy-code" onClick={handleCopyCode} className="p-1 bg-white hover:bg-slate-100 rounded-lg border border-slate-150 transition-colors">
                          <Clipboard className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-medium">Lien Invitation</p>
                      <button
                        id="btn-copy-link"
                        onClick={handleCopyLink}
                        className="mt-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-1 font-bold text-[10px] w-full transition-colors"
                      >
                        <Link className="w-3 h-3" />
                        Copier le lien
                      </button>
                    </div>
                  </div>
                </div>

                {/* TEAM STATS */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
                    <h5 className="font-sans font-black text-md text-slate-800">{currentUser.totalReferralGains.toLocaleString()} FCFA</h5>
                    <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Total Commissions Gagner</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
                    {/* Count unique referred user list */}
                    <h5 className="font-sans font-black text-md text-slate-800">
                      {userComs.length} Filleul(s)
                    </h5>
                    <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Membres Recommandés</p>
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: 'settings',
            title: '⚙️ Paramètres du Compte',
            icon: Settings,
            badge: 'Identité',
            content: (
              <div className="space-y-4 font-sans text-xs text-slate-700">
                <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl text-[10px] text-slate-500 leading-relaxed font-semibold">
                  🔒 Vos informations d'identification sont vérifiées et hautement sécurisées. Pour toute correction, veuillez contacter notre support officiellement.
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-xxs font-black text-slate-400 uppercase tracking-wider">
                      Nom complet de l'utilisateur
                    </label>
                    <div className="relative bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 flex items-center justify-between select-none opacity-80">
                      <span className="font-sans font-extrabold text-[#2a3042]">
                        {currentUser.fullName}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        🔒 Lecture seule
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xxs font-black text-slate-400 uppercase tracking-wider">
                      Numéro de téléphone de compte
                    </label>
                    <div className="relative bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 flex items-center justify-between select-none opacity-80">
                      <span className="font-mono font-bold text-[#2a3042]">
                        {currentUser.phone}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        🔒 Lecture seule
                      </span>
                    </div>
                  </div>

                  {currentUser.email && (
                    <div className="space-y-1">
                      <label className="block text-xxs font-black text-slate-400 uppercase tracking-wider">
                        E-mail associé
                      </label>
                      <div className="relative bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 flex items-center justify-between select-none opacity-80">
                        <span className="font-mono text-[10.5px] text-[#2a3042] font-semibold">
                          {currentUser.email}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          🔒 Lecture seule
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-amber-500/5 border border-amber-200/40 p-3 rounded-2xl text-center space-y-1.5">
                  <p className="font-black text-[9.5px] text-amber-800 uppercase tracking-wide">💡 Sécurisation de Compte</p>
                  <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
                    Afin d'éviter toute usurpation d'identité ou modification frauduleuse de coordonnées de paiement mobiles, la modification autonome de ces informations est inhibée.
                  </p>
                </div>
              </div>
            ),
          },
          {
            id: 'install-pwa',
            title: '📲 Installer cette Application',
            icon: Smartphone,
            badge: 'PWA Express',
            content: (
              <div className="space-y-4 font-sans text-xs text-slate-705 leading-relaxed">
                <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl text-center space-y-2">
                  <span className="text-2xl block animate-bounce">📱</span>
                  <h5 className="font-extrabold text-slate-800 text-xs">
                    Installez l'application AgriAfri sur votre mobile !
                  </h5>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                    Accédez instantanément à votre espace d'investissement participatif directement depuis votre écran d'accueil avec une expérience plus rapide, fluide et sans publicité. Économise votre forfait internet !
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      const promptEvt = (window as any).deferredPrompt;
                      if (promptEvt) {
                        promptEvt.prompt();
                        promptEvt.userChoice.then((choiceResult: any) => {
                          if (choiceResult.outcome === 'accepted') {
                            console.log('User accepted PWA installation');
                          } else {
                            console.log('User dismissed PWA installation');
                          }
                          (window as any).deferredPrompt = null;
                        });
                      } else {
                        alert("Pour lancer l'installation, appuyez sur le bouton partage ou sur le menu ⁝ de votre navigateur comme indiqué ci-dessous.");
                      }
                    }}
                    className="w-full mt-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs uppercase tracking-wide"
                  >
                    <Download className="w-4 h-4" />
                    Installer Maintenant PWA
                  </button>
                </div>

                {/* Android & iOS Walkthrough Cards */}
                <div className="space-y-3">
                  <h5 className="font-bold text-slate-850 text-[11px] uppercase tracking-wider pl-1 border-l-2 border-[#0c62e5]">
                    Guide d'installation pas à pas :
                  </h5>

                  {/* Android Instruction */}
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-extrabold text-[8px] uppercase">
                        Android (Chrome / Brave)
                      </span>
                      <span className="text-base select-none">🤖</span>
                    </div>
                    <ol className="list-decimal pl-4 space-y-1 text-[10px] leading-relaxed text-slate-600 font-semibold">
                      <li>Touchez l'icône de menu <strong className="text-slate-900">⁝ (trois points)</strong> dans le coin supérieur droit.</li>
                      <li>Sélectionnez l'option <strong className="text-emerald-700">"Installer l'application"</strong> ou <strong className="text-slate-950">"Ajouter à l'écran d'accueil"</strong>.</li>
                      <li>Confirmez l'installation et l'application sera disponible sur votre mobile !</li>
                    </ol>
                  </div>

                  {/* iOS Instruction */}
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-extrabold text-[8px] uppercase">
                        iPhone / iPad (Safari)
                      </span>
                      <span className="text-base select-none">🍏</span>
                    </div>
                    <ol className="list-decimal pl-4 space-y-1 text-[10px] leading-relaxed text-slate-600 font-semibold">
                      <li>Touchez le bouton de partage <strong className="text-slate-900">📤 (Partager)</strong> en bas de l'écran.</li>
                      <li>Faites défiler vers le bas et sélectionnez <strong className="text-emerald-700">"Sur l'écran d'accueil" ➕</strong>.</li>
                      <li>Appuyez sur <strong className="text-slate-950">"Ajouter"</strong> dans le coin supérieur droit pour valider !</li>
                    </ol>
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: 'about',
            title: 'ℹ️ À propos d\'Agrocapital',
            icon: Info,
            badge: 'Présentation',
            content: (
              <div className="space-y-3 font-sans text-xs text-slate-705 leading-relaxed">
                <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-2xl">
                  <h5 className="font-extrabold text-indigo-900 text-xs mb-1">🌱 Qu'est-ce que Agrocapital ?</h5>
                  <p className="text-[11px] text-slate-650">
                    <strong>Agrocapital</strong> est une plateforme technologique d’investissement agricole participatif d'Afrique de l'Ouest. Nous permettons aux épargnants et investisseurs de financer directement des exploitations agricoles concrètes de haute qualité (cultures maraîchères, élevage bovin, aviculture, arboriculture) et d’obtenir des bénéfices stables et garantis.
                  </p>
                </div>

                <div className="space-y-2">
                  <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">⚙️ Fonctionnement en 4 étapes :</h5>
                  
                  <div className="flex gap-2 items-start bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-sm">1️⃣</span>
                    <div>
                      <p className="font-black text-slate-800 text-xxs uppercase">FONDER VOTRE PORTFOLIO</p>
                      <p className="text-[10px] text-slate-500">Sélectionnez une catégorie disponible de production (Stabilité, Bien-être ou Activités) et investissez le prix d'achat initial à l'aide de votre solde.</p>
                    </div>
                  </div>

                  <div className="flex gap-2 items-start bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-sm">2️⃣</span>
                    <div>
                      <p className="font-black text-slate-800 text-xxs uppercase">EXPLOITATION SUR LE TERRAIN</p>
                      <p className="text-[10px] text-slate-500">Nos experts agronomes et fermiers partenaires exploitent les terres cultivables grâce aux fonds mutualisés pour maximiser les rendements.</p>
                    </div>
                  </div>

                  <div className="flex gap-2 items-start bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-sm">3️⃣</span>
                    <div>
                      <p className="font-black text-slate-800 text-xxs uppercase">GÉNÉRATION DES DIVIDENDES</p>
                      <p className="text-[10px] text-slate-500">Chaque produit dispose d'un cycle de vie défini (en jours). Votre investissement génère des bénéfices calculés quotidiennement, reversés sur votre solde de retrait.</p>
                    </div>
                  </div>

                  <div className="flex gap-2 items-start bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-sm">4️⃣</span>
                    <div>
                      <p className="font-black text-slate-800 text-xxs uppercase">RETRAIT DIRECT EN SÉCURITÉ</p>
                      <p className="text-[10px] text-slate-500">Faites vos demandes de retrait de vos gains sous forme de monnaie électronique localisée (MTN, Wave, Moov, Orange, Flooz) traitées rapidement sous 15 min.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl text-center">
                  <p className="font-bold text-amber-800 text-[10px] uppercase">🛡️ Securité & Garantie</p>
                  <p className="text-[9px] text-slate-550 mt-1">Tous les cycles de cultures à financement partagé font l'objet d'une assurance récolte premium couvrant l'investissement de base à 100%.</p>
                </div>
              </div>
            ),
          },
        ].map((item) => {
          const IconComponent = item.icon;
          const isExpanded = activeSubMenu === item.id;
          return (
            <div
              id={`profile-disclosure-${item.id}`}
              key={item.id}
              className="bg-zinc-50/50 border border-slate-100 rounded-3xl overflow-hidden transition-all duration-300"
            >
              {/* Disclosure Trigger Control */}
              <button
                id={`btn-disclosure-trigger-${item.id}`}
                onClick={() => setActiveSubMenu(isExpanded ? null : item.id)}
                className="w-full p-4 flex justify-between items-center font-sans font-bold text-slate-800 text-xs text-left cursor-pointer hover:bg-slate-50/30 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-white text-emerald-600 rounded-lg shadow-2xs border border-slate-100">
                    <IconComponent className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span>{item.title}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-bold border border-emerald-100/40">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {/* Disclosure Content Panel */}
              <div
                className={`transition-all duration-350 ease-in-out-expo overflow-hidden ${
                  isExpanded ? 'max-h-[1000px] border-t border-slate-50 bg-white p-4' : 'max-h-0'
                }`}
              >
                {item.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* 🚪 LOGOUT OPTION */}
      <div className="pt-2">
        <button
          id="profile-logout-btn"
          onClick={() => {
            logoutUser();
          }}
          className="w-full py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100/30 font-sans font-bold text-xs rounded-3xl flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter de mon compte
        </button>
      </div>

      {/* ================================= DEPOSIT DECLA MODAL ================================= */}
      {showDepositModal && false && (
        <div id="deposit-modal-overlay" className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 animate-scale-up my-8">
            {/* Header */}
            <div className="p-4 border-b border-emerald-50 flex justify-between items-center bg-emerald-500/5">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <h3 className="font-sans font-bold text-slate-800 text-sm">
                  Alimenter mon Compte
                </h3>
              </div>
              <button
                id="close-deposit-modal"
                onClick={() => setShowDepositModal(false)}
                className="p-1 px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={submitDeposit} className="p-5 space-y-4">
              {/* Deposit instruction Box */}
              <div className="bg-emerald-50/50 border border-emerald-100/30 rounded-2xl p-4 text-[11px] font-sans leading-relaxed text-emerald-800 space-y-1.5">
                <p className="font-bold uppercase text-[9px] tracking-wider text-emerald-900">Procédure obligatoire :</p>
                <p>1. Effectuez le transfert de fonds vers l'un de nos numéros officiels ci-dessous correspondant à votre réseau.</p>
                <div className="p-2.5 bg-white border border-emerald-100Rounded-xl space-y-1 font-mono text-xs font-semibold text-slate-700 rounded-xl my-2">
                  <p>• MTN Money : <strong className="text-emerald-700">{settings.operatorPhones.mobileMoney}</strong></p>
                  <p>• Moov Money : <strong className="text-emerald-700">{settings.operatorPhones.moovMoney}</strong></p>
                  <p>• Flooz : <strong className="text-emerald-700">{settings.operatorPhones.flooz}</strong></p>
                </div>
                <p>2. Prenez une capture d'écran de la confirmation de transfert Mobile Money du réseau.</p>
                <p>3. Téléversez-la ci-dessous pour validation par nos services.</p>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">
                  Montant à Déposer (FCFA)
                </label>
                <input
                  id="dep-amount-input"
                  type="number"
                  required
                  min="1000"
                  step="500"
                  value={depAmount}
                  onChange={(e) => setDepAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans text-slate-700 outline-none focus:border-emerald-500 font-bold transition-colors"
                />
              </div>

              {/* Network Provider Selector */}
              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">
                  Moyen de paiement / Réseau mobile
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Mobile Money', 'Moov Money', 'Flooz'].map((opName) => (
                    <button
                      id={`operator-choice-${opName.replace(' ', '')}`}
                      key={opName}
                      type="button"
                      onClick={() => setDepOperator(opName as any)}
                      className={`py-2 border text-xxs font-sans font-black rounded-lg transition-transform ${
                        depOperator === opName
                          ? 'bg-emerald-600 border-emerald-600 text-white scale-102'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {opName === 'Mobile Money' ? 'MTN / Wave' : opName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Proof Image Upload Frame */}
              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">
                  Importer la Preuve de transfert (Capture)
                </label>
                <div className="mt-1 border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl p-4 text-center transition-all cursor-pointer relative pt-6 pb-6 bg-slate-50">
                  <input
                    id="dep-proof-file"
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {depProof ? (
                    <div className="space-y-2">
                      <img src={depProof} alt="Preuve reçue" className="mx-auto h-24 max-w-full rounded-lg object-contain border bg-white" />
                      <p className="text-[10px] text-emerald-600 font-sans font-bold">Image chargée avec succès ! Cliquez pour changer.</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <PlusCircle className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xxs font-sans font-semibold text-slate-500">
                        Glisser-déposer ou sélectionner fichier
                      </p>
                      <p className="text-[9px] text-slate-400">JPG, PNG, PDF inférieur de 4Mo</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Banner */}
              {depError && (
                <p id="dep-error-alert" className="text-xs bg-rose-50 border border-rose-100 text-rose-700 p-2.5 rounded-xl text-center leading-relaxed">
                  ⚠️ {depError}
                </p>
              )}

              {depSuccess && (
                <p id="dep-success-alert" className="text-xs bg-emerald-50 border border-emerald-100 text-emerald-800 p-2.5 rounded-xl text-center leading-relaxed">
                  {depSuccess}
                </p>
              )}

              {/* Action Buttons */}
              {!depSuccess && (
                <div className="flex gap-2">
                  <button
                    id="dep-modal-cancel"
                    type="button"
                    onClick={() => setShowDepositModal(false)}
                    className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-sans font-semibold transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    id="dep-modal-submit"
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-sans font-bold shadow-md transition-colors"
                  >
                    Envoyer ma preuve
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ================================= WITHDRAWAL DECLA MODAL ================================= */}
      {showWithdrawModal && false && (
        <div id="withdraw-modal-overlay" className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">
            {/* Header */}
            <div className="p-4 border-b border-rose-50 flex justify-between items-center bg-rose-500/5">
              <div className="flex items-center gap-1.5">
                <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
                <h3 className="font-sans font-bold text-slate-800 text-sm">
                  Retrait de Fonds Mobile Money
                </h3>
              </div>
              <button
                id="close-withdraw-modal"
                onClick={() => setShowWithdrawModal(false)}
                className="p-1 px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <form onSubmit={submitWithdrawal} className="p-5 space-y-4">
              
              {/* Hour checking status block */}
              <div className={`p-3 rounded-2xl flex items-start gap-2 text-xxs leading-relaxed font-sans ${
                withdrawalsOpen 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-100/30' 
                  : 'bg-rose-50 text-rose-800 border-rose-100'
              }`}>
                <Clock className="w-4 h-4 shrink-0" />
                <div>
                  <p className="font-bold uppercase text-[9px]">Horaires Officiels de Retrait :</p>
                  <p>Les services de virement opèrent uniquement entre <strong>{settings.withdrawStartHour.toString().padStart(2, '0')}h00 et {settings.withdrawEndHour.toString().padStart(2, '0')}h00</strong> GMT.</p>
                  <p className="mt-1 font-bold">
                    {withdrawalsOpen 
                      ? '● GUICHET OUVERT : Votre demande sera traitée immédiatement.' 
                      : '✖ GUICHET FERMÉ : "Les retraits sont disponibles uniquement de 09h00 à 18h00."'
                    }
                  </p>
                </div>
              </div>

              {/* Country Selector */}
              <div>
                <label className="block text-xs font-sans font-bold text-slate-600 mb-1">
                  Sélectionner le Pays de Réception
                </label>
                <select
                  id="with-country-select"
                  value={withCountry.code}
                  onChange={(e) => handleWithCountryChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-sans font-semibold outline-none focus:border-amber-500 cursor-pointer"
                >
                  {countriesList.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Number Phone with Country Prefix */}
              <div>
                <label className="block text-xs font-sans font-bold text-slate-600 mb-1">
                  Numéro de Téléphone Mobile Money
                </label>
                <div className="flex items-stretch gap-1">
                  <div className="bg-slate-100 border border-slate-200 rounded-xl px-3 flex items-center justify-center font-mono text-xs text-slate-600 select-none shrink-0">
                    {withCountry.flag} {withCountry.code}
                  </div>
                  <input
                    id="with-phone-input"
                    type="tel"
                    required
                    placeholder="Ex: 07020304"
                    value={withPhone.replace(/^\+\d+\s*/, '')}
                    onChange={(e) => {
                      const cleanedVal = e.target.value.replace(/[^0-9\s]/g, '');
                      setWithPhone(`${withCountry.code} ${cleanedVal}`);
                    }}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Input Amount */}
              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">
                  Montant à Retirer (FCFA)
                </label>
                <input
                  id="with-amount-input"
                  type="number"
                  required
                  min={settings.minWithdrawAmount}
                  step="500"
                  value={withAmount}
                  onChange={(e) => setWithAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans text-slate-705 outline-none focus:border-emerald-500 font-bold transition-colors"
                />
                <p className="text-[10px] text-slate-400 mt-1">Montant min: {settings.minWithdrawAmount.toLocaleString()} FCFA. Solde disponible : {(currentUser?.balance || 0).toLocaleString()} FCFA</p>
              </div>

              {/* Errors Alerts */}
              {withError && (
                <p id="with-error-alert" className="text-xs bg-rose-50 border border-rose-100 text-rose-700 p-2.5 rounded-xl text-center leading-relaxed">
                  ⚠️ {withError}
                </p>
              )}

              {withSuccess && (
                <p id="with-success-alert" className="text-xs bg-emerald-50 border border-emerald-100 text-emerald-800 p-2.5 rounded-xl text-center leading-relaxed font-semibold">
                  {withSuccess}
                </p>
              )}

              {/* Buttons */}
              {!withSuccess && (
                <div className="flex gap-2">
                  <button
                    id="with-modal-cancel"
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-sans font-semibold transition-colors"
                  >
                    Fermer
                  </button>
                  <button
                    id="with-modal-submit"
                    type="submit"
                    disabled={!withdrawalsOpen}
                    className={`flex-1 py-2.5 text-white rounded-xl text-xs font-sans font-bold shadow-md transition-all ${
                      withdrawalsOpen 
                        ? 'bg-emerald-600 hover:bg-emerald-700 hover:scale-101 cursor-pointer' 
                        : 'bg-slate-350 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    Valider le retrait
                  </button>
                </div>
              )}
            </form>
          </div>
         </div>
       )}
    </div>
  );
};
