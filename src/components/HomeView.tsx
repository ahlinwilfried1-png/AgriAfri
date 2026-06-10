/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Coins,
  TrendingUp,
  Package,
  MessageCircle,
  Send,
  HelpCircle,
  ArrowUpRight,
  ChevronRight,
  X,
  PlusCircle,
  AlertCircle,
  Copy,
  Share2,
  Gift,
  ShieldCheck,
  HeartHandshake,
  BookOpen
} from 'lucide-react';

interface HomeViewProps {
  setActiveTab: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ setActiveTab }) => {
  const {
    currentUser,
    settings,
    users,
    investments,
    deposits,
    createTicket,
    requestDeposit,
    requestWithdrawal,
    updateUserBalance,
    editUserDetail,
    addNotificationForUser
  } = useApp();

  const [linkCopied, setLinkCopied] = useState(false);
  const [showTeamDetails, setShowTeamDetails] = useState(false);

  // Dynamic calculations for user's parrainage/referral circle levels
  const level1Users = currentUser ? users.filter(u => u.referredBy === currentUser.referralCode) : [];
  const level1Active = level1Users.filter(u => investments.some(inv => inv.userId === u.id && inv.status === 'ACTIVE'));

  const level1Codes = level1Users.map(u => u.referralCode);
  const level2Users = currentUser && level1Codes.length > 0 ? users.filter(u => u.referredBy && level1Codes.includes(u.referredBy)) : [];
  const level2Active = level2Users.filter(u => investments.some(inv => inv.userId === u.id && inv.status === 'ACTIVE'));

  const level2Codes = level2Users.map(u => u.referralCode);
  const level3Users = currentUser && level2Codes.length > 0 ? users.filter(u => u.referredBy && level2Codes.includes(u.referredBy)) : [];
  const level3Active = level3Users.filter(u => investments.some(inv => inv.userId === u.id && inv.status === 'ACTIVE'));

  const handleCopyLink = () => {
    if (!currentUser) return;
    const inviteLink = `${window.location.origin}/register?ref=${currentUser.referralCode}`;
    navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    setTimeout(() => {
      setLinkCopied(false);
    }, 2800);
  };

  const handleCopyCode = () => {
    if (!currentUser) return;
    navigator.clipboard.writeText(currentUser.referralCode);
    alert('Code d\'invitation copié : ' + currentUser.referralCode);
  };

  const handleShareLink = () => {
    if (!currentUser) return;
    const inviteLink = `${window.location.origin}/register?ref=${currentUser.referralCode}`;
    if (navigator.share) {
      navigator.share({
        title: 'AgriAfri Parrainage',
        text: `Rejoignez-moi sur AgriAfri et commencez à investir ! Mon code d'invitation est : ${currentUser.referralCode}`,
        url: inviteLink,
      }).catch((err) => console.log(err));
    } else {
      navigator.clipboard.writeText(inviteLink);
      alert('Lien de parrainage copié (Prêt à partager) :\n' + inviteLink);
    }
  };

  // Dialog controls
  const [showSubmitTicket, setShowSubmitTicket] = useState(false);
  const [ticketSubject, setTicketSubject] = useState<'Dépôt non crédité' | 'Assistance technique' | 'Retrait retardé' | 'Autre réclamation'>('Assistance technique');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState('');
  const [ticketProof, setTicketProof] = useState<string>('');
  const ticketFileInputRef = useRef<HTMLInputElement>(null);

  // Standalone modals for quick-action shortcuts
  const [showTasksModal, setShowTasksModal] = useState(false);

  // Persisted task claiming array
  const [claimedTasks, setClaimedTasks] = useState<string[]>(() => {
    if (!currentUser) return [];
    try {
      const stored = localStorage.getItem(`claimed_tasks_${currentUser.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const totalTaskCommissions = claimedTasks.reduce((acc, taskId) => {
    if (taskId === 'task_10') return acc + 500;
    if (taskId === 'task_20') return acc + 1000;
    if (taskId === 'task_50') return acc + 3000;
    return acc;
  }, 0);

  const handleClaimTask = (taskId: string, rewardAmount: number) => {
    if (!currentUser) return;
    if (claimedTasks.includes(taskId)) return;

    // Credit rewards to the user balance and totalEarnings
    updateUserBalance(currentUser.id, rewardAmount, 'add');
    const updatedEarnings = (currentUser.totalEarnings || 0) + rewardAmount;
    editUserDetail(currentUser.id, { totalEarnings: updatedEarnings });

    const newClaimed = [...claimedTasks, taskId];
    setClaimedTasks(newClaimed);
    localStorage.setItem(`claimed_tasks_${currentUser.id}`, JSON.stringify(newClaimed));

    addNotificationForUser(
      currentUser.id,
      "Récompense de Tâche " + (taskId === "task_10" ? "10" : taskId === "task_20" ? "20" : "50") + " Activations Réclamée ! 🎉",
      `Félicitations ! Votre prime de ${rewardAmount.toLocaleString()} FCFA a été créditée avec succès.`
    );

    alert(`Félicitations ! Vous avez réclamé ${rewardAmount.toLocaleString()} FCFA de commission de tâche avec succès.`);
  };



  // Local stats calculations
  const totalRealUsers = users.length + 32840;
  const activeProductsCount = useApp().products.filter((p) => p.active).length;
  const totalRealDepositsAmount = deposits.filter(d => d.status === 'VALIDATED').reduce((acc, curr) => acc + curr.amount, 0) + 148900000;
  const totalRealEarningsAmount = investments.filter(i => i.status === 'COMPLETED').reduce((acc, curr) => acc + curr.totalYield - curr.amount, 0) + 42400000;

  const handleTicketFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTicketProof(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Veuillez vous inscrire ou vous connecter pour ouvrir un dossier d\'assistance.');
      return;
    }
    if (!ticketMessage.trim()) {
      alert('Veuillez renseigner votre message.');
      return;
    }
    const res = createTicket(ticketSubject, ticketMessage, ticketProof || undefined);
    if (res.success) {
      setTicketSuccess('Votre demande d\'assistance a été ouverte avec succès ! Nos équipes vous répondront rapidement.');
      setTicketMessage('');
      setTicketProof('');
      if (ticketFileInputRef.current) ticketFileInputRef.current.value = '';
      setTimeout(() => {
        setTicketSuccess('');
        setShowSubmitTicket(false);
      }, 5000);
    }
  };



  return (
    <div id="home-view-container" className="animate-fade-in space-y-5 pb-24 relative">
      
      {linkCopied && (
        <div id="home-copied-toast animate-bounce" className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-[11px] font-sans font-extrabold tracking-wide px-4 py-2 rounded-full shadow-lg border border-emerald-400/30 flex items-center justify-center gap-1.5">
          <span>🤝</span>
          <span>Lien de parrainage copié avec succès</span>
        </div>
      )}
      
      {/* 🚀 WELCOME BANNER (AGRO RÉCOLTE THEME) */}
      <div 
        className="relative rounded-3xl p-6 overflow-hidden text-center flex flex-col items-center justify-center min-h-[175px] bg-slate-950 border border-emerald-900/40 shadow-xl"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.75) 100%), url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=600')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
        
        <h1 className="font-sans font-black text-3.5xl sm:text-4xl uppercase tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-b from-emerald-100 via-emerald-300 to-teal-500 filter drop-shadow-[0_2px_10px_rgba(16,185,129,0.5)]">
          AGRO RÉCOLTE
        </h1>
        <p className="font-sans font-extrabold text-[9px] uppercase tracking-[0.3em] text-emerald-400/95 mt-1.5">
          CONFIANCE. RENDEMENT. PROSPÉRITÉ.
        </p>

        {/* Float user balance pill */}
        <div className="mt-4 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 animate-ping"></span>
          <span className="text-[10px] font-sans font-bold text-emerald-300 uppercase tracking-wider">Solde:</span>
          <span className="font-mono text-xs font-black text-white">{currentUser ? currentUser.balance.toLocaleString('fr-FR') : '0'} FCFA</span>
        </div>
      </div>

      {/* 💳 DYNAMIC SHORTCUT ACTIONS (RECHARGE, RETRAIT, MON ÉQUIPE, TELEGRAM) */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4.5 flex justify-between items-center gap-2 border border-white/40 shadow-xs">
        {/* 1. Recharger */}
        <button
          onClick={() => setActiveTab('recharge')}
          className="flex flex-col items-center flex-1 focus:outline-none group cursor-pointer"
        >
          <div className="w-13 h-13 rounded-full bg-[#ccd5fe]/70 border border-blue-200/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-2xs">
            <Coins className="w-6 h-6 text-[#1b63eb] stroke-[2.25]" />
          </div>
          <span className="text-[11px] font-sans font-extrabold text-[#4c5a71] mt-2 select-none">
            Recharger
          </span>
        </button>

        {/* 2. Retirer */}
        <button
          onClick={() => setActiveTab('retrait')}
          className="flex flex-col items-center flex-1 focus:outline-none group cursor-pointer"
        >
          <div className="w-13 h-13 rounded-full bg-[#ccd5fe]/70 border border-blue-200/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-2xs">
            <TrendingUp className="w-6 h-6 text-[#1b63eb] stroke-[2.25]" />
          </div>
          <span className="text-[11px] font-sans font-extrabold text-[#4c5a71] mt-2 select-none">
            Retirer
          </span>
        </button>

        {/* 3. Mon Équipe (Triggers the combined Team Dashboard automatically) */}
        <button
          onClick={() => setShowTeamDetails(true)}
          className="flex flex-col items-center flex-1 focus:outline-none group cursor-pointer"
        >
          <div className="w-13 h-13 rounded-full bg-[#ccd5fe]/70 border border-blue-200/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-2xs" id="btn-shortcut-team">
            <Users className="w-6 h-6 text-[#1b63eb] stroke-[2.25]" />
          </div>
          <span className="text-[11px] font-sans font-extrabold text-[#4c5a71] mt-2 select-none">
            Mon Équipe
          </span>
        </button>

        {/* 4. Telegram */}
        <a
          href={settings.telegramLink}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center flex-1 focus:outline-none group text-center"
        >
          <div className="w-13 h-13 rounded-full bg-[#ccd5fe]/70 border border-blue-200/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-2xs mx-auto">
            <Send className="w-6 h-6 text-[#1b63eb] stroke-[2.25]" />
          </div>
          <span className="text-[11px] font-sans font-extrabold text-[#4c5a71] mt-2 select-none">
            Telegram
          </span>
        </a>
      </div>

      {/* 🤝 SECTION DE PARRAINAGE ET RECOMMANDATION (Récompenses d'invitation) */}
      <div className="relative bg-white border border-slate-150 rounded-2xl p-4 shadow-xs space-y-3">
        {/* Yellow/Orange flower/star badge on the right matching mockup */}
        <div className="absolute top-4 right-4 text-amber-500 text-base">
          🌟
        </div>

        <div>
          <h3 className="font-sans font-black text-xs text-[#2a3042] tracking-tight">
            Récompenses d'invitation
          </h3>
          <p className="text-[9.5px] font-sans font-semibold text-slate-400 leading-tight">
            Investissez ensemble, enrichissez-vous ensemble
          </p>
        </div>

        <div className="space-y-2">
          {/* 1. Code d'invitation Row as in Screenshot */}
          <div className="bg-[#fafaff] border border-slate-100 rounded-xl p-2.5 flex justify-between items-center gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-rose-150/70 flex items-center justify-center text-sm text-rose-500 shrink-0 select-none">
                🔗
              </div>
              <div className="overflow-hidden">
                <span className="text-[9.5px] text-slate-400 font-bold block uppercase leading-none">Code d'invitation</span>
                <span className="text-xs font-black text-slate-800 font-mono block mt-1 tracking-wider uppercase">
                  {currentUser?.referralCode || 'DA9DF4'}
                </span>
              </div>
            </div>
            <button
              id="btn-copy-code-home"
              type="button"
              onClick={handleCopyCode}
              className="px-4.5 py-1.5 bg-[#ea5454] hover:bg-rose-600 text-white rounded-full text-[11px] font-sans font-black tracking-wide select-none shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
            >
              Copier
            </button>
          </div>

          {/* 2. Lien d'invitation Row as in Screenshot */}
          <div className="bg-[#fafaff] border border-slate-100 rounded-xl p-2.5 flex justify-between items-center gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-indigo-150/70 flex items-center justify-center text-sm text-indigo-500 shrink-0 select-none">
                🚀
              </div>
              <div className="overflow-hidden">
                <span className="text-[9.5px] text-slate-400 font-bold block uppercase leading-none">Lien d'invitation</span>
                <span className="text-[11px] font-semibold text-[#1b63eb] font-mono block mt-1 truncate max-w-[155px] sm:max-w-xs">
                  {`${window.location.origin}/register?ref=${currentUser?.referralCode || 'DA9DF4'}`}
                </span>
              </div>
            </div>
            <button
              id="btn-copy-link-home"
              type="button"
              onClick={handleCopyLink}
              className="px-4.5 py-1.5 bg-[#ea5454] hover:bg-rose-600 text-white rounded-full text-[11px] font-sans font-black tracking-wide select-none shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
            >
              Copier
            </button>
          </div>
        </div>
      </div>

      {/* 🤝 PROGRAMME DE RÉCOMPENSES DE CONTRATS & TÂCHES (Tasks Rewards Only) */}
      <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs space-y-4">
        <h3 className="font-sans font-black text-sm text-[#2a3042] tracking-tight">
          🤝 Programme de Fidélité AgriAfri
        </h3>

        <div className="space-y-3">
          <div 
            onClick={() => setShowTasksModal(true)}
            className="flex items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 cursor-pointer transition-colors hover:bg-slate-100/80 active:scale-99"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg shadow-inner text-emerald-600">
                🎁
              </div>
              <div>
                <h4 className="font-sans font-extrabold text-xs text-slate-850 leading-none">
                  Primes & Récompenses de tâches
                </h4>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-normal font-sans pr-2">
                  Encouragez le développement agricole et obtenez des bourses d'incitation journalières.
                </p>
              </div>
            </div>
            
            <button
              id="btn-tasks-home-trigger"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowTasksModal(true);
              }}
              className="px-5 py-2 bg-[#1b63eb] hover:bg-blue-700 text-white rounded-full text-[10px] font-sans font-black tracking-wide uppercase shrink-0 transition-colors cursor-pointer"
            >
              Aller
            </button>
          </div>
        </div>
      </div>

      {/* 🛡️ SÉCURITÉ ET ENGAGEMENT PROFESSIONNEL AGRIAFRI */}
      <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-xs text-slate-800 uppercase tracking-wider">
              🛡️ Investissement Garanti & Sécurisé
            </h3>
            <p className="text-[9px] font-sans font-semibold text-emerald-600 uppercase tracking-widest mt-0.5">
              Agrément Coopérative Agricole d'État
            </p>
          </div>
        </div>

        {/* Dynamic Trust Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-center">
            <span className="text-emerald-600 text-base font-black font-mono block">52K+</span>
            <span className="text-[8px] font-sans font-bold text-slate-400 uppercase tracking-tight block mt-1">Actifs</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-center">
            <span className="text-emerald-700 text-base font-black font-mono block">98.7%</span>
            <span className="text-[8px] font-sans font-bold text-slate-400 uppercase tracking-tight block mt-1">Rendements</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-center">
            <span className="text-amber-600 text-base font-black font-mono block">1.5B+</span>
            <span className="text-[8px] font-sans font-bold text-slate-400 uppercase tracking-tight block mt-1">FCFA Versés</span>
          </div>
        </div>

        {/* Bento Trust Elements */}
        <div className="space-y-3 font-sans">
          <div className="flex items-start gap-3 bg-emerald-50/20 p-3 rounded-2xl border border-emerald-50">
            <div className="p-1.5 bg-emerald-500 text-white rounded-lg select-none shrink-0 text-xs">
              🌾
            </div>
            <div className="space-y-0.5">
              <h4 className="text-[11px] font-black text-slate-800 leading-tight">Projets Agro-concrets</h4>
              <p className="text-[9.5px] text-slate-500 font-semibold leading-relaxed">
                Chaque franc investi est directement alloué au financement de matériel (poulaillers, forages solaires, engrais organiques) et à l'achat de récoltes garanties sur contrat d'achat d'État.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-amber-50/25 p-3 rounded-2xl border border-amber-50">
            <div className="p-1.5 bg-amber-500 text-white rounded-lg select-none shrink-0 text-xs">
              🤝
            </div>
            <div className="space-y-0.5">
              <h4 className="text-[11px] font-black text-slate-800 leading-tight">Zéro Risque Climatique</h4>
              <p className="text-[9.5px] text-slate-500 font-semibold leading-relaxed">
                Grâce à notre fonds mutuel d'assurance agricole partenaire (Axa & Saham Assurances), vos rendements de base restent garantis même en cas d'imprévu météorologique ou de sécheresse.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-blue-50/20 p-3 rounded-2xl border border-blue-50">
            <div className="p-1.5 bg-blue-600 text-white rounded-lg select-none shrink-0 text-xs">
              📱
            </div>
            <div className="space-y-0.5">
              <h4 className="text-[11px] font-black text-slate-800 leading-tight">Transactions Traçables & Instantanées</h4>
              <p className="text-[9.5px] text-slate-500 font-semibold leading-relaxed">
                Dépôts et retraits ultra-rapides via Orange Money, MTN Mobile Money, Moov Flooz et Wave. Vos requêtes sont créditées en moins de 15 minutes avec traçabilité par reçu numérique.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Educational Expandable Questions */}
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <h4 className="font-display font-bold text-[10px] text-slate-400 uppercase tracking-widest mb-1 pl-1">
            💡 Guide de l'investisseur averti
          </h4>
          
          <details className="group border border-slate-100 rounded-xl bg-slate-50 overflow-hidden cursor-pointer">
            <summary className="p-2.5 flex items-center justify-between text-[10.5px] font-black text-slate-700 select-none">
              <span>Comment fonctionne le cycle de rendement ?</span>
              <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="p-2.5 bg-white border-t border-slate-50 text-[10px] text-slate-500 leading-relaxed font-semibold">
              Lorsque vous activez un produit d'investissement (par exemple le maïs ou l'élevage de volailles), les fonds sont alloués aux fermiers locaux. Les gains s'accumulent de manière journalière ou cyclique. Vous pouvez retirer vos intérêts directement à tout moment vers votre portefeuille mobile.
            </p>
          </details>

          <details className="group border border-slate-100 rounded-xl bg-slate-50 overflow-hidden cursor-pointer">
            <summary className="p-2.5 flex items-center justify-between text-[10.5px] font-black text-slate-700 select-none">
              <span>Puis-je parrainer des amis et gagner des commissions ?</span>
              <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="p-2.5 bg-white border-t border-slate-50 text-[10px] text-slate-500 leading-relaxed font-semibold">
              Oui ! AgriAfri propose un système de recommandation généreux à 3 niveaux. Vous gagnez des commissions directes sur chaque dépôt de vos filleuls de niveau 1 (10%), niveau 2 (5%), et niveau 3 (2%), en plus des tours gratuits sur la Roue de la chance !
            </p>
          </details>
        </div>
      </div>

      {/* 🎧 ASSISTANCE CLIENTS & CANAUX CANAL SUPPORT */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
        <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-widest mb-4">
          🎧 Assistance Client & support officiel
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* WHATSAPP */}
          <a
            id="support-direct-wa"
            href={settings.whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="p-4 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-150 hover:border-emerald-350 rounded-2xl flex flex-col items-center text-center gap-2 transition-all"
          >
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-xs text-slate-800">WhatsApp direct</h4>
              <p className="text-[9px] text-slate-400 mt-1 font-medium">Chat & Échanges 15min</p>
            </div>
          </a>

          {/* TELEGRAM */}
          <a
            id="support-direct-tg"
            href={settings.telegramLink}
            target="_blank"
            rel="noreferrer"
            className="p-4 bg-sky-50/50 hover:bg-sky-50 border border-sky-150 hover:border-sky-350 rounded-2xl flex flex-col items-center text-center gap-2 transition-all"
          >
            <div className="p-2.5 bg-sky-600 text-white rounded-xl">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-xs text-slate-800">Telegram Canal</h4>
              <p className="text-[9px] text-slate-400 mt-1 font-medium">Infos & Signaux quotidiens</p>
            </div>
          </a>

          {/* SERVICE CLIENT TICKETS */}
          <button
            id="support-direct-ticket"
            type="button"
            onClick={() => {
              if (!currentUser) {
                alert('Veuillez vous connecter pour écrire au service client.');
              } else {
                setTicketSubject('Assistance technique');
                setShowSubmitTicket(true);
              }
            }}
            className="p-4 bg-amber-50/50 hover:bg-amber-50 border border-amber-150 hover:border-amber-300 rounded-2xl flex flex-col items-center text-center gap-2 transition-all cursor-pointer"
          >
            <div className="p-2.5 bg-amber-500 text-white rounded-xl">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-xs text-slate-800">Service Client</h4>
              <p className="text-[9px] text-slate-400 mt-1 font-medium">Réclamations & Aide Agri</p>
            </div>
          </button>
        </div>
      </div>

      {/* Standalone pages handles Deposit and Withdrawal now */}



      {/* TICKET SUBMISSION MODAL */}
      {showSubmitTicket && (
        <div id="ticket-modal-overlay" className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100">
            <div className="p-4 border-b border-amber-50 flex justify-between items-center bg-amber-500/5">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-600" />
                <h3 className="font-sans font-bold text-slate-800 text-sm">
                  Ouvrir un ticket d'assistance
                </h3>
              </div>
              <button
                id="close-ticket-modal"
                onClick={() => setShowSubmitTicket(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTicketSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">
                  Motif du ticket
                </label>
                <select
                  id="ticket-subject-select"
                  value={ticketSubject}
                  onChange={(e: any) => setTicketSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans text-slate-700 outline-none focus:border-amber-400 transition-colors"
                >
                  <option value="Assistance technique">Assistance technique</option>
                  <option value="Retrait retardé">Retrait retardé</option>
                  <option value="Dépôt non crédité">Dépôt non crédité</option>
                  <option value="Autre réclamation">Autre réclamation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">
                  Décrivez votre problème en détail
                </label>
                <textarea
                  id="ticket-message-area"
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  rows={4}
                  placeholder="Veuillez spécifier la date, l'opérateur mobile money, le montant et le numéro de téléphone utilisé pour accélérer la résolution..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-sans text-slate-700 outline-none focus:border-amber-400 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">
                  Capture d'écran / Preuve de dépôt (Optionnel)
                </label>
                <div 
                  onClick={() => ticketFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-xl p-3 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <input
                    id="ticket-screenshot-file"
                    type="file"
                    ref={ticketFileInputRef}
                    accept="image/*"
                    onChange={handleTicketFileChange}
                    className="hidden"
                  />
                  {ticketProof ? (
                    <div className="space-y-1">
                      <p className="text-[10px] text-amber-600 font-bold">Capture jointe ! Tapez ici pour modifier.</p>
                      <img src={ticketProof} alt="Ticket Proof" className="max-h-20 mx-auto object-cover rounded shadow-xs" referrerPolicy="no-referrer" />
                    </div>
                  ) : (
                    <div className="text-slate-400 text-center space-y-1">
                      <p className="text-[10px]">Cliquez ici pour joindre une photo</p>
                      <p className="text-[8px] text-slate-350">Format JPEG, PNG ou capture d'écran mobile</p>
                    </div>
                  )}
                </div>
              </div>

              {ticketSuccess && (
                <p id="ticket-success-msg" className="text-xs bg-emerald-50 border border-emerald-100 text-emerald-800 p-2.5 rounded-xl text-center leading-relaxed">
                  {ticketSuccess}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  id="ticket-cancel-btn"
                  type="button"
                  onClick={() => setShowSubmitTicket(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-250 text-slate-600 rounded-xl text-xs font-sans font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  id="ticket-submit-btn"
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-xs font-sans font-bold shadow-sm transition-colors"
                >
                  Envoyer le ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔮 TEAM DETAILS POPUP MODAL (MON ÉQUIPE DE COOPÉRATIVE) */}
      {showTeamDetails && (
        <div id="team-details-overlay" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#f8fafc] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-indigo-200/20 animate-scale-up max-h-[85vh] flex flex-col">
            
            {/* Header section matching branding */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-[#ea5454] text-white">
              <div className="flex items-center gap-2">
                <span className="text-lg">👥</span>
                <h3 className="font-sans font-black text-xs uppercase tracking-wider">
                  Mon Équipe
                </h3>
              </div>
              <button
                id="close-team-details"
                onClick={() => setShowTeamDetails(false)}
                className="w-7 h-7 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center font-bold text-xs select-none transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4.5 flex-1">
              
              {/* Informative advice banner */}
              <div className="bg-indigo-50 border border-indigo-100/50 p-3 rounded-2xl text-[10px] text-indigo-950 font-sans font-semibold leading-relaxed relative overflow-hidden">
                <div className="absolute -right-3 -bottom-3 text-lg opacity-15">💰</div>
                📌 Chaque nouvel investissement de vos parrainés génère instantanément des bonus crédités sur votre Solde de retrait !
              </div>

              {/* 🏅 NIVEAU D'ÉQUIPE - CONSOLIDATED STATS TABLE */}
              <div className="space-y-2.5">
                <h4 className="font-sans font-black text-[10px] text-slate-400 uppercase tracking-widest leading-none pl-1">
                  📊 TABLEAU DES COMMISSIONS
                </h4>

                <div className="space-y-2">
                  {/* Level 1 Item Row */}
                  <div className="bg-amber-500/5 border border-amber-200/40 rounded-2xl p-3 flex items-center justify-between gap-2 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-2xs select-none">
                        🥇
                      </div>
                      <div>
                        <span className="font-mono text-xs font-black text-slate-800 leading-none">30%</span>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase mt-0.5">Remise Niv 1</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-extrabold text-slate-700 block">{level1Users.length}</span>
                      <span className="text-[8.5px] text-slate-400/80 font-bold block uppercase leading-none">Total invité</span>
                    </div>
                    <div className="text-right pr-1">
                      <span className="font-mono text-xs font-extrabold text-amber-600 block">{level1Active.length}</span>
                      <span className="text-[8.5px] text-slate-400/80 font-bold block uppercase leading-none">Activé</span>
                    </div>
                  </div>

                  {/* Level 2 Item Row */}
                  <div className="bg-indigo-500/5 border border-indigo-200/40 rounded-2xl p-3 flex items-center justify-between gap-2 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-indigo-950 flex items-center justify-center font-black text-xs shadow-2xs select-none">
                        🥈
                      </div>
                      <div>
                        <span className="font-mono text-xs font-black text-slate-800 leading-none">5%</span>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase mt-0.5">Lv 2 Rebate</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-extrabold text-slate-700 block">{level2Users.length}</span>
                      <span className="text-[8.5px] text-slate-400/80 font-bold block uppercase leading-none">Total invité</span>
                    </div>
                    <div className="text-right pr-1">
                      <span className="font-mono text-xs font-extrabold text-[#111827] block text-[#1b63eb]">{level2Active.length}</span>
                      <span className="text-[8.5px] text-slate-400/80 font-bold block uppercase leading-none">Activé</span>
                    </div>
                  </div>

                  {/* Level 3 Item Row */}
                  <div className="bg-rose-500/5 border border-rose-200/40 rounded-2xl p-3 flex items-center justify-between gap-2 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-rose-450 text-white flex items-center justify-center font-black text-xs shadow-2xs select-none">
                        🥉
                      </div>
                      <div>
                        <span className="font-mono text-xs font-black text-slate-800 leading-none">1%</span>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase mt-0.5">Lv 3 Rebate</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-extrabold text-slate-700 block">{level3Users.length}</span>
                      <span className="text-[8.5px] text-slate-400/80 font-bold block uppercase leading-none">Total invité</span>
                    </div>
                    <div className="text-right pr-1">
                      <span className="font-mono text-xs font-extrabold text-rose-500 block">{level3Active.length}</span>
                      <span className="text-[8.5px] text-slate-400/80 font-bold block uppercase leading-none">Activé</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DETAILS AND MEMBERS LISTINGS */}
              <div className="space-y-3.5 pt-2 border-t border-slate-100">
                <h4 className="font-sans font-black text-[10px] text-slate-400 uppercase tracking-widest pl-1 mb-1">
                  👥 MEMBRES PAR SECTEUR
                </h4>

                {/* LEVEL 1 LIST */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center bg-amber-500/10 p-2 rounded-xl border border-amber-300/20">
                    <span className="text-[9.5px] font-black text-amber-900 uppercase">🥇 Niveau 1 (Remise 30%)</span>
                    <span className="text-[9px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded-full">{level1Users.length} invité(s)</span>
                  </div>
                  {level1Users.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic py-1 pl-2 font-medium">Aucun parrainé direct.</p>
                  ) : (
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                      {level1Users.map((u) => {
                        const isActive = investments.some(inv => inv.userId === u.id && inv.status === 'ACTIVE');
                        return (
                          <div key={u.id} className="bg-white border border-slate-150 p-2 rounded-xl flex justify-between items-center text-[10px]">
                            <div>
                              <p className="font-sans font-extrabold text-[#2a3042]">{u.fullName}</p>
                              <p className="text-[9px] text-slate-400 font-mono mt-0.5">{u.phone.replace(/(\d{2})\d+(\d{3})/, '$1••••$2')}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-extrabold ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                              {isActive ? '🌾 Actif' : '😴 Inactif'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* LEVEL 2 LIST */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center bg-indigo-500/10 p-2 rounded-xl border border-indigo-300/20">
                    <span className="text-[9.5px] font-black text-indigo-900 uppercase">🥈 Niveau 2 (Rebate 5%)</span>
                    <span className="text-[9px] font-bold text-indigo-800 bg-white px-2 py-0.5 rounded-full">{level2Users.length} invité(s)</span>
                  </div>
                  {level2Users.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic py-1 pl-2 font-medium">Aucun parrainé secondaire.</p>
                  ) : (
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                      {level2Users.map((u) => {
                        const isActive = investments.some(inv => inv.userId === u.id && inv.status === 'ACTIVE');
                        return (
                          <div key={u.id} className="bg-white border border-slate-150 p-2 rounded-xl flex justify-between items-center text-[10px]">
                            <div>
                              <p className="font-sans font-extrabold text-[#2a3042]">{u.fullName}</p>
                              <p className="text-[9px] text-slate-400 font-mono mt-0.5">{u.phone.replace(/(\d{2})\d+(\d{3})/, '$1••••$2')}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-extrabold ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                              {isActive ? '🌾 Actif' : '😴 Inactif'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* LEVEL 3 LIST */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center bg-rose-500/10 p-2 rounded-xl border border-rose-300/20">
                    <span className="text-[9.5px] font-black text-rose-900 uppercase">🥉 Niveau 3 (Rebate 1%)</span>
                    <span className="text-[9px] font-bold text-rose-800 bg-white px-2 py-0.5 rounded-full">{level3Users.length} invité(s)</span>
                  </div>
                  {level3Users.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic py-1 pl-2 font-medium">Aucun parrainé niv 3.</p>
                  ) : (
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                      {level3Users.map((u) => {
                        const isActive = investments.some(inv => inv.userId === u.id && inv.status === 'ACTIVE');
                        return (
                          <div key={u.id} className="bg-white border border-slate-150 p-2 rounded-xl flex justify-between items-center text-[10px]">
                            <div>
                              <p className="font-sans font-extrabold text-[#2a3042]">{u.fullName}</p>
                              <p className="text-[9px] text-slate-400 font-mono mt-0.5">{u.phone.replace(/(\d{2})\d+(\d{3})/, '$1••••$2')}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-extrabold ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                              {isActive ? '🌾 Actif' : '😴 Inactif'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
              <a
                href={settings.telegramLink}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-2xs select-none transition-all cursor-pointer"
                title="Support en ligne"
              >
                🎧 Support
              </a>
              <button
                type="button"
                onClick={() => setShowTeamDetails(false)}
                className="flex-1 py-2.5 bg-[#ea5454] hover:bg-[#d84343] text-white font-sans font-black text-xs text-center rounded-xl transition-colors cursor-pointer uppercase tracking-wider"
              >
                Fermer l'aperçu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔮 STUNNING SYSTEM TASK REWARDS POPUP MODAL */}
      {showTasksModal && currentUser && (
        <div id="tasks-system-overlay" className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-3 overflow-y-auto">
          <div className="bg-[#f2f4f8] rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 animate-scale-up max-h-[92vh] flex flex-col relative text-slate-800">
            
            {/* Clean Modal Header */}
            <div className="bg-white border-b border-slate-200 px-5 py-4 flex justify-between items-center shrink-0">
              <h3 className="font-sans font-black text-sm text-[#0c62e5] uppercase tracking-tight flex items-center gap-2">
                🏆 Récompense des tâches
              </h3>
              <button 
                onClick={() => setShowTasksModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
                title="Fermer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Scroll Area */}
            <div className="flex-1 overflow-y-auto pb-6">

              {/* White Form Card Body Wrapper starting directly with Centre de missions */}
              <div className="p-4 space-y-4">

                {/* Title Section: Centre de missions */}
                <div className="space-y-0.5 pl-1.5">
                  <h3 className="font-sans font-black text-[#1f2937] text-xs uppercase tracking-wider">
                    Centre de missions
                  </h3>
                  <p className="text-[10px] text-slate-505 font-sans font-medium">
                    Après avoir complété chaque mission, vous recevrez une récompense
                  </p>
                </div>

                {/* 📋 LIST OF TASK ITEMS */}
                <div className="space-y-3">

                  {/* Task Item 1: 10 people */}
                  <div className="bg-white border border-slate-150 rounded-2xl p-4 space-y-3.5 shadow-sm">
                    <div className="flex gap-3 items-start">
                      {/* Exclamation blue circular badge */}
                      <div className="w-8 h-8 rounded-full bg-[#0c62e5] text-white flex items-center justify-center font-sans font-black text-sm select-none shrink-0 filter drop-shadow-2xs">
                        !
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-sans font-black text-slate-800 text-[11.5px] leading-snug">
                          Inviter à activer 10 personnes
                        </h4>
                        
                        {/* Target Grid Metrics Row */}
                        <div className="grid grid-cols-3 gap-1 pt-3 text-left">
                          <div>
                            <span className="font-sans text-[9px] text-slate-400 block uppercase font-bold">Récompense</span>
                            <span className="font-mono text-[11px] font-black text-slate-800 block mt-0.5">FCFA 500.00</span>
                          </div>
                          <div>
                            <span className="font-sans text-[9px] text-slate-400 block uppercase font-bold">Exigé</span>
                            <span className="font-mono text-[11.5px] font-extrabold text-slate-800 block mt-0.5">10</span>
                          </div>
                          <div>
                            <span className="font-sans text-[9px] text-slate-400 block uppercase font-bold">Complété</span>
                            <span className="font-mono text-[11.5px] font-extrabold text-slate-800 block mt-0.5">
                              {level1Active.length}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Claim dynamic button */}
                      <div className="shrink-0 pt-1">
                        {claimedTasks.includes('task_10') ? (
                          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-sans font-black rounded-lg border border-emerald-100 uppercase block tracking-wider">
                            Réclamé
                          </span>
                        ) : (
                          <button
                            disabled={level1Active.length < 10}
                            onClick={() => handleClaimTask('task_10', 500)}
                            className={`px-3.5 py-1.5 rounded-lg text-[10px] font-sans font-black uppercase tracking-wider transition-all select-none ${
                              level1Active.length >= 10
                                ? 'bg-[#0c62e5] hover:bg-blue-700 text-white cursor-pointer shadow-sm'
                                : 'bg-[#cbcdd6] text-white cursor-not-allowed'
                            }`}
                          >
                            Réclamer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Task Item 2: 20 people */}
                  <div className="bg-white border border-slate-150 rounded-2xl p-4 space-y-3.5 shadow-sm">
                    <div className="flex gap-3 items-start">
                      {/* Exclamation blue circular badge */}
                      <div className="w-8 h-8 rounded-full bg-[#0c62e5] text-white flex items-center justify-center font-sans font-black text-sm select-none shrink-0 filter drop-shadow-2xs">
                        !
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-sans font-black text-slate-800 text-[11.5px] leading-snug">
                          Inviter à activer 20 personnes
                        </h4>
                        
                        {/* Target Grid Metrics Row */}
                        <div className="grid grid-cols-3 gap-1 pt-3 text-left">
                          <div>
                            <span className="font-sans text-[9px] text-slate-400 block uppercase font-bold">Récompense</span>
                            <span className="font-mono text-[11px] font-black text-slate-800 block mt-0.5">FCFA 1000.00</span>
                          </div>
                          <div>
                            <span className="font-sans text-[9px] text-slate-400 block uppercase font-bold">Exigé</span>
                            <span className="font-mono text-[11.5px] font-extrabold text-slate-800 block mt-0.5">20</span>
                          </div>
                          <div>
                            <span className="font-sans text-[9px] text-slate-400 block uppercase font-bold">Complété</span>
                            <span className="font-mono text-[11.5px] font-extrabold text-slate-800 block mt-0.5">
                              {level1Active.length}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Claim dynamic button */}
                      <div className="shrink-0 pt-1">
                        {claimedTasks.includes('task_20') ? (
                          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-sans font-black rounded-lg border border-emerald-100 uppercase block tracking-wider">
                            Réclamé
                          </span>
                        ) : (
                          <button
                            disabled={level1Active.length < 20}
                            onClick={() => handleClaimTask('task_20', 1000)}
                            className={`px-3.5 py-1.5 rounded-lg text-[10px] font-sans font-black uppercase tracking-wider transition-all select-none ${
                              level1Active.length >= 20
                                ? 'bg-[#0c62e5] hover:bg-blue-700 text-white cursor-pointer shadow-sm'
                                : 'bg-[#cbcdd6] text-white cursor-not-allowed'
                            }`}
                          >
                            Réclamer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Task Item 3: 50 people with visual progress bar at bottom */}
                  <div className="bg-white border border-slate-150 rounded-2xl p-4 space-y-3.5 shadow-sm relative">
                    <div className="flex gap-3 items-start pb-1">
                      {/* Green circle clock outline icon */}
                      <div className="w-8 h-8 rounded-full border-2 border-emerald-500 text-emerald-600 flex items-center justify-center font-sans font-black text-xs select-none shrink-0">
                        🕒
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-sans font-black text-slate-800 text-[11.5px] leading-snug">
                          Inviter à activer 50 personnes
                        </h4>
                        
                        {/* Target Grid Metrics Row */}
                        <div className="grid grid-cols-3 gap-1 pt-3 text-left">
                          <div>
                            <span className="font-sans text-[9px] text-slate-400 block uppercase font-bold">Récompense</span>
                            <span className="font-mono text-[11px] font-black text-slate-800 block mt-0.5">FCFA 3000.00</span>
                          </div>
                          <div>
                            <span className="font-sans text-[9px] text-slate-400 block uppercase font-bold">Exigé</span>
                            <span className="font-mono text-[11.5px] font-extrabold text-slate-800 block mt-0.5">50</span>
                          </div>
                          <div>
                            <span className="font-sans text-[9px] text-slate-400 block uppercase font-bold">Complété</span>
                            <span className="font-mono text-[11.5px] font-extrabold text-slate-800 block mt-0.5">
                              {level1Active.length}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Claim dynamic button */}
                      <div className="shrink-0 pt-1">
                        {claimedTasks.includes('task_50') ? (
                          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-sans font-black rounded-lg border border-emerald-100 uppercase block tracking-wider">
                            Réclamé
                          </span>
                        ) : (
                          <button
                            disabled={level1Active.length < 50}
                            onClick={() => handleClaimTask('task_50', 3000)}
                            className={`px-3.5 py-1.5 rounded-lg text-[10px] font-sans font-black uppercase tracking-wider transition-all select-none ${
                              level1Active.length >= 50
                                ? 'bg-[#0c62e5] hover:bg-blue-700 text-white cursor-pointer shadow-sm'
                                : 'bg-[#cbcdd6] text-white cursor-not-allowed'
                            }`}
                          >
                            Réclamer
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar with "21/50" Beneath as in mock screen */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                        <div 
                          className="bg-[#0c62e5] h-full rounded-full transition-all duration-350"
                          style={{ width: `${Math.min(100, Math.round((level1Active.length / 50) * 100))}%` }}
                        />
                      </div>
                      <div className="text-[9.5px] font-mono font-black text-[#0c62e5] text-left">
                        {level1Active.length} / 50
                      </div>
                    </div>

                    {/* Blue Headsets Support Bubble on right bottom of the card corner */}
                    <a
                      href={settings.telegramLink}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute right-3.5 -bottom-2 w-10 h-10 rounded-full bg-[#0c62e5] text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer shrink-0"
                      title="Support client"
                    >
                      🎧
                    </a>
                  </div>

                </div>

              </div>

            </div>

            {/* Close footer panel */}
            <div className="p-3.5 border-t border-slate-200 bg-white flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowTasksModal(false)}
                className="w-full py-3 bg-[#ea5454] hover:bg-[#d84343] text-white font-sans font-black text-xs text-center rounded-2xl cursor-pointer uppercase tracking-wider"
              >
                Fermer l'espace récompenses
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
