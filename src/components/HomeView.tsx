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
  Gift
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

  const handleCopyLink = () => {
    if (!currentUser) return;
    const inviteLink = `${window.location.origin}/register?ref=${currentUser.referralCode}`;
    navigator.clipboard.writeText(inviteLink);
    alert('Lien de parrainage copié avec succès ! \n' + inviteLink);
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

  // Dual standalone modals for quick-action shortcuts
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showRetraitModal, setShowRetraitModal] = useState(false);
  const [showWheelModal, setShowWheelModal] = useState(false);

  // Recharge workflow fields
  const [recAmount, setRecAmount] = useState<number>(5000);
  const [recOperator, setRecOperator] = useState<'Mobile Money' | 'Moov Money' | 'Flooz'>('Mobile Money');
  const [recProof, setRecProof] = useState<string>('');
  const [recSuccess, setRecSuccess] = useState('');
  const [recError, setRecError] = useState('');
  const recFileInputRef = useRef<HTMLInputElement>(null);

  // Countries configuration
  const countriesList = [
    { flag: '🇨🇮', name: "Côte d'Ivoire", code: '+225' },
    { flag: '🇹🇬', name: 'Togo', code: '+228' },
    { flag: '🇧🇯', name: 'Bénin', code: '+229' },
    { flag: '🇨🇲', name: 'Cameroun', code: '+237' },
  ];

  // Retrait workflow fields
  const [retAmount, setRetAmount] = useState<number>(5000);
  const [retCountry, setRetCountry] = useState(() => {
    return countriesList.find(c => c.code === currentUser?.countryCode) || countriesList[0];
  });
  const [retPhone, setRetPhone] = useState(() => {
    const defaultC = countriesList.find(c => c.code === currentUser?.countryCode) || countriesList[0];
    return `${defaultC.code} `;
  });
  const [retSuccess, setRetSuccess] = useState('');
  const [retError, setRetError] = useState('');

  const handleRetCountryChange = (countryCode: string) => {
    const chosen = countriesList.find(c => c.code === countryCode);
    if (chosen) {
      setRetCountry(chosen);
      const rawNumber = retPhone.replace(/^\+\d+\s*/, '');
      setRetPhone(`${chosen.code} ${rawNumber}`);
    }
  };

  // Roue de chance game states
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelResultMsg, setWheelResultMsg] = useState('');

  const sectors = [
    { label: '500 FCFA', value: 500, color: '#e11d48' },     // rose-600
    { label: 'Perdu', value: 0, color: '#475569' },          // slate-600
    { label: '2 500 FCFA', value: 2500, color: '#16a34a' },  // green-600
    { label: '100 FCFA', value: 100, color: '#ea580c' },     // orange-600
    { label: 'Perdu', value: 0, color: '#475569' },          // slate-600
    { label: '5 000 FCFA', value: 5000, color: '#0284c7' },  // sky-600
    { label: '300 FCFA', value: 300, color: '#d97706' },     // amber-600
    { label: '10 000 FCFA', value: 10000, color: '#7c3aed' } // violet-600
  ];

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

  const handleRecFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRecProof(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRecSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecSuccess('');
    setRecError('');

    if (recAmount <= 0) {
      setRecError('Veuillez insérer un montant supérieur à 0.');
      return;
    }
    if (!recProof) {
      setRecError('Veuillez joindre la capture d\'écran de votre transfert mobile money (preuve de paiement obligatoire).');
      return;
    }

    const res = requestDeposit(recAmount, recOperator, recProof);
    if (res.success) {
      setRecSuccess('Recharge enregistrée ! L\'administration créditera votre solde après vérification sous 15 minutes.');
      setRecAmount(5000);
      setRecProof('');
      if (recFileInputRef.current) recFileInputRef.current.value = '';
      setTimeout(() => {
        setRecSuccess('');
        setShowRechargeModal(false);
      }, 5000);
    } else {
      setRecError(res.message);
    }
  };

  const handleRetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRetSuccess('');
    setRetError('');

    if (retAmount <= 0) {
      setRetError('Montant invalide.');
      return;
    }
    if (!retPhone.trim() || retPhone.trim() === retCountry.code) {
      setRetError('Veuillez spécifier le numéro de téléphone Mobile Money.');
      return;
    }

    const currentHour = new Date().getHours();
    if (currentHour < settings.withdrawStartHour || currentHour >= settings.withdrawEndHour) {
      setRetError(`Les retraits sont ouverts uniquement de ${settings.withdrawStartHour}h00 à ${settings.withdrawEndHour}h05.`);
      return;
    }

    // Automatically construct a nice beneficiary string with the country chosen
    const finalBeneficiaryName = `Retrait Mobile (${retCountry.name})`;

    const res = requestWithdrawal(retAmount, retPhone, finalBeneficiaryName);
    if (res.success) {
      setRetSuccess('Demande de retrait reçue. Le virement est en cours de traitement par notre équipe financière.');
      setRetAmount(5000);
      setRetPhone(`${retCountry.code} `);
      setTimeout(() => {
        setRetSuccess('');
        setShowRetraitModal(false);
      }, 5000);
    } else {
      setRetError(res.message);
    }
  };

  const spinWheel = () => {
    if (isSpinning) return;
    if (!currentUser) return;

    const hasFreeSpin = currentUser.freeSpins !== undefined && currentUser.freeSpins > 0;

    if (!hasFreeSpin && currentUser.balance < 500) {
      alert("Solde insuffisant pour tourner la roue (coût: 500 FCFA). Veuillez inviter des amis pour cumuler des tours de roue gratuits !");
      return;
    }

    // Spend spin payment or consume free spin
    if (hasFreeSpin) {
      editUserDetail(currentUser.id, { freeSpins: Math.max(0, (currentUser.freeSpins || 0) - 1) });
    } else {
      updateUserBalance(currentUser.id, -500, 'add');
    }

    setIsSpinning(true);
    setWheelResultMsg('');

    const sectorIndex = Math.floor(Math.random() * sectors.length);
    const chosenSector = sectors[sectorIndex];
    
    // Choose rotation degree: spin at least 5 times and land on target slice (each slice is 45 deg)
    const sectorAngle = 360 - (sectorIndex * 45) - 22.5;
    const finalRot = wheelRotation + (360 * 6) + sectorAngle;
    
    setWheelRotation(finalRot);

    setTimeout(() => {
      setIsSpinning(false);
      if (chosenSector.value > 0) {
        updateUserBalance(currentUser.id, chosenSector.value, 'add');
        setWheelResultMsg(`Félicitations 🎉 ! Vous avez gagné ${chosenSector.value.toLocaleString()} FCFA sur votre solde principal !`);
        addNotificationForUser(
          currentUser.id,
          'Victoire Roue de Chance 🎡',
          `Vous avez remporté ${chosenSector.value.toLocaleString()} FCFA sur la Roue de Chance ${hasFreeSpin ? '(Tour Gratuit de Parrainage utilisé !)' : '(coût spin: 500 FCFA)'}.`
        );
      } else {
        setWheelResultMsg("Oh, c'est perdu pour cette fois 😮 ! Retentez votre chance !");
        addNotificationForUser(
          currentUser.id,
          'Roue de Chance 🎡',
          `Spin effectué ${hasFreeSpin ? 'gratuitement via un bonus de parrainage' : 'pour 500 FCFA'}. Aucun gain n'a été obtenu cette fois-ci.`
        );
      }
    }, 4500);
  };

  return (
    <div id="home-view-container" className="animate-fade-in space-y-6 pb-24">
      
      {/* 🚀 WELCOME BANNER & STATISTICS (ROCKY GOLD THEME) */}
      <div 
        className="relative rounded-3xl p-6 overflow-hidden text-center flex flex-col items-center justify-center min-h-[170px] bg-slate-950 border border-amber-900/40 shadow-xl"
        style={{
          backgroundImage: "radial-gradient(circle at center, rgba(139, 92, 26, 0.45) 0%, rgba(9, 9, 11, 0.98) 100%)"
        }}
      >
        {/* Glowing orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none animate-pulse" />
        
        <h1 className="font-sans font-black text-3xl sm:text-4xl uppercase tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 filter drop-shadow-[0_2px_12px_rgba(245,158,11,0.5)]">
          ROCKY GOLD
        </h1>
        <p className="font-sans font-extrabold text-[9px] uppercase tracking-[0.3em] text-amber-500/80 mt-1.5">
          STRENGTH. VALUE. LEGACY.
        </p>

        {/* Float user balance pill */}
        <div className="mt-4 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
          <span className="text-[10px] font-sans font-bold text-amber-300 uppercase tracking-wider">Solde:</span>
          <span className="font-mono text-xs font-black text-white">{currentUser ? currentUser.balance.toLocaleString('fr-FR') : '0'} FCFA</span>
        </div>
      </div>

      {/* 💳 DYNAMIC SHORTCUT ACTIONS (RECHARGE, RETRAIT, MON ÉQUIPE, TELEGRAM) */}
      <div className="bg-[#eceff3] rounded-3xl p-4.5 flex justify-between items-center gap-2">
        {/* 1. Recharger */}
        <button
          onClick={() => setShowRechargeModal(true)}
          className="flex flex-col items-center flex-1 focus:outline-none group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#ccd5fe] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xs">
            <Coins className="w-6 h-6 text-[#3b52d9]" />
          </div>
          <span className="text-[11px] font-sans font-extrabold text-[#2a3042] mt-2 select-none">
            Recharger
          </span>
        </button>

        {/* 2. Retirer */}
        <button
          onClick={() => setShowRetraitModal(true)}
          className="flex flex-col items-center flex-1 focus:outline-none group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#ccd5fe] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xs">
            <TrendingUp className="w-6 h-6 text-[#3b52d9]" />
          </div>
          <span className="text-[11px] font-sans font-extrabold text-[#2a3042] mt-2 select-none">
            Retirer
          </span>
        </button>

        {/* 3. Mon Équipe */}
        <button
          onClick={() => setActiveTab('moi')}
          className="flex flex-col items-center flex-1 focus:outline-none group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#ccd5fe] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xs">
            <Users className="w-6 h-6 text-[#3b52d9]" />
          </div>
          <span className="text-[11px] font-sans font-extrabold text-[#2a3042] mt-2 select-none">
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
          <div className="w-12 h-12 rounded-2xl bg-[#ccd5fe] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xs mx-auto">
            <Send className="w-6 h-6 text-[#3b52d9]" />
          </div>
          <span className="text-[11px] font-sans font-extrabold text-[#2a3042] mt-2 select-none">
            Telegram
          </span>
        </a>
      </div>

      {/* 🤝 SECTION DE PARRAINAGE ET RECOMMANDATION (Récompenses d'invitation) */}
      <div className="relative bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs space-y-4">
        {/* Floating yellow present icon top-right */}
        <div className="absolute top-4 right-4 bg-amber-500 text-white p-2 rounded-xl shadow-xs">
          <Gift className="w-4 h-4 text-white" />
        </div>

        <div>
          <h3 className="font-sans font-black text-sm text-[#2a324b] tracking-tight">
            Récompenses d'invitation
          </h3>
          <p className="text-[11px] font-sans font-semibold text-slate-400 mt-0.5 leading-tight">
            Investissez ensemble, enrichissez-vous ensemble
          </p>
        </div>

        <div className="bg-[#f0f4f9] rounded-2xl p-3 flex justify-between items-center gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] text-slate-400 font-bold block uppercase leading-none">Lien d'invitation</span>
              <span className="text-xs font-semibold text-[#3b52d9] font-mono block mt-1 truncate max-w-[200px]">
                {`${window.location.origin}/register?ref=${currentUser?.referralCode || 'OK937'}`}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-4 py-2 bg-[#9c2b2b] hover:bg-[#b03030] text-white rounded-3xl text-xs font-sans font-black tracking-wide select-none shadow-xs transition-colors cursor-pointer shrink-0"
          >
            Copier
          </button>
        </div>
      </div>

      {/* 🎡 CENTRE D'ACTIVITÉS DE BIEN-ÊTRE (Roue & Tâches) */}
      <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs space-y-4">
        <h3 className="font-sans font-black text-sm text-[#2a324b] tracking-tight">
          Centre d'activités de bien-être
        </h3>

        <div className="space-y-3.5">
          {/* Item 1: Roue de la chance */}
          <div className="flex items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100/60 flex items-center justify-center text-lg shadow-inner">
                🎡
              </div>
              <div>
                <h4 className="font-sans font-extrabold text-xs text-slate-800 leading-none">
                  Roue de la chance
                </h4>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-normal font-sans">
                  Taux de gain du tirage au sort de 100%
                </p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setShowWheelModal(true)}
              className="px-3.5 py-2 bg-[#9c2b2b] hover:bg-[#b03030] text-white rounded-3xl text-xxs font-sans font-black uppercase shrink-0 transition-colors cursor-pointer"
            >
              Tirage au sort
            </button>
          </div>

          {/* Item 2: Récompenses de tâches */}
          <div className="flex items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100/60 flex items-center justify-center text-lg shadow-inner">
                📬
              </div>
              <div>
                <h4 className="font-sans font-extrabold text-xs text-slate-800 leading-none">
                  Récompenses de tâches
                </h4>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-normal font-sans pr-2">
                  Complétez des tâches et gagnez un salaire supplémentaire
                </p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setActiveTab('moi')}
              className="px-4 py-2 bg-[#9c2b2b] hover:bg-[#b03030] text-white rounded-3xl text-xxs font-sans font-black uppercase shrink-0 transition-colors cursor-pointer"
            >
              Aller
            </button>
          </div>
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

      {/* RECHARGE / DÉPÔT SHORTCUT MODAL */}
      {showRechargeModal && (
        <div id="shortcut-deposit-overlay" className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-emerald-500/5">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-600" />
                <h3 className="font-display font-extrabold text-slate-850 text-sm">
                  Effectuer une Recharge (Dépôt)
                </h3>
              </div>
              <button
                id="close-shortcut-deposit"
                onClick={() => setShowRechargeModal(false)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-sans font-bold text-slate-600 mb-1">
                  1. Choisir l'opérateur Mobile Money
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Mobile Money', 'Moov Money', 'Flooz'] as const).map((op) => (
                    <button
                      id={`rec-op-${op}`}
                      key={op}
                      type="button"
                      onClick={() => setRecOperator(op)}
                      className={`py-2 px-1 rounded-xl text-[10px] font-sans font-bold transition-all border ${
                        recOperator === op
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {op === 'Mobile Money' ? 'Wave/MTN' : op}
                    </button>
                  ))}
                </div>
                {/* Visual operator info display */}
                <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-[10px] text-emerald-800 mt-2">
                  <span className="font-bold">Numéro de transfert : </span>
                  <span className="font-mono">{recOperator === 'Mobile Money' ? settings.operatorPhones.mobileMoney : recOperator === 'Moov Money' ? settings.operatorPhones.moovMoney : settings.operatorPhones.flooz}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-slate-600 mb-1">
                  2. Montant du transfert (FCFA)
                </label>
                <input
                  id="rec-amount"
                  type="number"
                  required
                  min={500}
                  step={500}
                  value={recAmount}
                  onChange={(e) => setRecAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans font-semibold outline-none focus:border-emerald-650"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-slate-600 mb-1">
                  3. Preuve de paiement (Screenshot)
                </label>
                <div 
                  onClick={() => recFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-3 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <input
                    id="shortcut-rec-file"
                    type="file"
                    ref={recFileInputRef}
                    accept="image/*"
                    onChange={handleRecFileChange}
                    className="hidden"
                  />
                  {recProof ? (
                    <div className="space-y-1">
                      <p className="text-[10px] text-emerald-600 font-bold">Lien image validé !</p>
                      <img src={recProof} alt="Proof" className="max-h-20 mx-auto object-cover rounded" referrerPolicy="no-referrer" />
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400">
                      Cliquez pour ajouter l'image du transfert
                    </p>
                  )}
                </div>
              </div>

              {recSuccess && (
                <p className="text-xs bg-emerald-50 border border-emerald-100 text-emerald-800 p-2.5 rounded-xl text-center font-medium leading-relaxed">
                  {recSuccess}
                </p>
              )}
              {recError && (
                <p className="text-xs bg-rose-50 border border-rose-100 text-rose-800 p-2.5 rounded-xl text-center font-medium leading-relaxed">
                  {recError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  id="shortcut-rec-cancel"
                  type="button"
                  onClick={() => setShowRechargeModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-sans font-bold"
                >
                  Annuler
                </button>
                <button
                  id="shortcut-rec-submit"
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-display font-extrabold shadow"
                >
                  Déclarer Dépôt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WITHDRAWAL / RETRAIT SHORTCUT MODAL */}
      {showRetraitModal && (
        <div id="shortcut-withdraw-overlay" className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-amber-500/5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <h3 className="font-display font-extrabold text-slate-850 text-sm">
                  Effectuer un Retrait (Virement)
                </h3>
              </div>
              <button
                id="close-shortcut-withdraw"
                onClick={() => setShowRetraitModal(false)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRetSubmit} className="p-5 space-y-4">
              {/* Country Selector */}
              <div>
                <label className="block text-xs font-sans font-bold text-slate-600 mb-1">
                  1. Sélectionner le Pays de Réception
                </label>
                <select
                  id="ret-country-select"
                  value={retCountry.code}
                  onChange={(e) => handleRetCountryChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-sans font-semibold outline-none focus:border-amber-500 cursor-pointer"
                >
                  {countriesList.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Money Number with Dial Prefix */}
              <div>
                <label className="block text-xs font-sans font-bold text-slate-600 mb-1">
                  2. Numéro de téléphone Mobile Money
                </label>
                <div className="flex items-stretch gap-1">
                  <div className="bg-slate-100 border border-slate-200 rounded-xl px-3 flex items-center justify-center font-mono text-xs text-slate-600 select-none shrink-0">
                    {retCountry.flag} {retCountry.code}
                  </div>
                  <input
                    id="ret-phone"
                    type="tel"
                    required
                    placeholder="Ex: 07020304"
                    value={retPhone.replace(/^\+\d+\s*/, '')}
                    onChange={(e) => {
                      const cleanedVal = e.target.value.replace(/[^0-9\s]/g, '');
                      setRetPhone(`${retCountry.code} ${cleanedVal}`);
                    }}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Amount of Withdrawal */}
              <div>
                <label className="block text-xs font-sans font-bold text-slate-600 mb-1">
                  3. Montant du Retrait (FCFA)
                </label>
                <input
                  id="ret-amount"
                  type="number"
                  required
                  min={1000}
                  step={500}
                  value={retAmount}
                  onChange={(e) => setRetAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans font-semibold outline-none focus:border-amber-500"
                />
                <p className="text-[9px] text-slate-400 mt-1 font-sans">
                  Minimum {settings.minWithdrawAmount} FCFA. Solde disponible : {(currentUser?.balance || 0).toLocaleString()} FCFA
                </p>
              </div>

              {retSuccess && (
                <p className="text-xs bg-emerald-50 border border-emerald-100 text-emerald-800 p-2.5 rounded-xl text-center font-medium leading-relaxed">
                  {retSuccess}
                </p>
              )}
              {retError && (
                <p className="text-xs bg-rose-50 border border-rose-100 text-rose-800 p-2.5 rounded-xl text-center font-medium leading-relaxed">
                  {retError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  id="shortcut-ret-cancel"
                  type="button"
                  onClick={() => setShowRetraitModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-sans font-bold"
                >
                  Annuler
                </button>
                <button
                  id="shortcut-ret-submit"
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-xs font-display font-extrabold shadow"
                >
                  Retirer maintenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROUE DE CHANCE / WHEEL OF FORTUNE SHORTCUT MODAL */}
      {showWheelModal && (
        <div id="shortcut-wheel-overlay" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 relative animate-scale-up">
            <div className="p-4 border-b border-rose-100 flex justify-between items-center bg-rose-500/5">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎡</span>
                <h3 className="font-display font-extrabold text-slate-850 text-sm">
                  Roue de la Fortune AgriAfri
                </h3>
              </div>
              <button
                id="close-shortcut-wheel"
                onClick={() => {
                  if (!isSpinning) setShowWheelModal(false);
                }}
                disabled={isSpinning}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex flex-col items-center space-y-4">
              <div className="text-center w-full">
                {currentUser?.freeSpins && currentUser.freeSpins > 0 ? (
                  <span className="bg-emerald-500/10 text-emerald-800 text-[10px] font-sans font-extrabold px-3 py-1.5 rounded-full inline-block animate-pulse border border-emerald-500/20 mb-2">
                    🎉 BONUS : {currentUser.freeSpins} TOUR{currentUser.freeSpins > 1 ? 'S' : ''} GRATUIT{currentUser.freeSpins > 1 ? 'S' : ''} DISPONIBLE{currentUser.freeSpins > 1 ? 'S' : ''} !
                  </span>
                ) : null}
                <p className="text-[11px] font-sans text-slate-500 leading-relaxed">
                  Tentez votre chance ! Chaque tour de roue coûte <span className="font-bold text-slate-800">500 FCFA</span> ou 1 tour gratuit de parrainage. Les gains sont instantanés.
                </p>
              </div>

              {/* WHEEL CONTAINER */}
              <div className="relative flex flex-col items-center py-4">
                {/* Absolute Pointer Pin */}
                <div className="w-6 h-6 bg-emerald-600 rounded-b-full shadow-md z-20 flex items-center justify-center text-white mb-[-12px] relative">
                  ▼
                </div>
                {/* The Rotating Wheel */}
                <div 
                  className="w-60 h-60 rounded-full border-4 border-slate-800 shadow-2xl relative overflow-hidden transition-transform duration-[4500ms] ease-out bg-slate-900"
                  style={{ transform: `rotate(${wheelRotation}deg)` }}
                >
                  {sectors.map((sec, idx) => (
                    <div 
                      key={idx} 
                      className="absolute top-0 right-0 w-1/2 h-1/2 origin-bottom-left"
                      style={{ 
                        transform: `rotate(${idx * 45}deg) skewY(45deg)`,
                        backgroundColor: sec.color,
                        borderRight: '1px solid rgba(255,255,255,0.15)',
                        borderBottom: '1px solid rgba(255,255,255,0.15)'
                      }}
                    >
                      <div 
                        className="absolute text-white font-display font-black text-[9px]"
                        style={{
                          bottom: '15px',
                          right: '15px',
                          transform: 'skewY(-45deg) rotate(22.5deg) translate(20px, 10px)',
                          width: '60px',
                          textAlign: 'center'
                        }}
                      >
                        {sec.label}
                      </div>
                    </div>
                  ))}
                  {/* Center Hub */}
                  <div className="absolute inset-0 m-auto w-10 h-10 bg-slate-905 border-2 border-slate-800 rounded-full flex items-center justify-center z-10 shadow-lg">
                    <span className="text-[9px] font-black text-emerald-400">AGRI</span>
                  </div>
                </div>
              </div>

              {/* RESULTS & STATUS */}
              <div className="w-full text-center space-y-2">
                <p className="text-[10px] uppercase font-sans text-slate-400 flex items-center justify-center gap-1.5">
                  <span>Votre solde : <b className="font-mono text-emerald-700">{currentUser?.balance.toLocaleString()} FCFA</b></span>
                  {currentUser?.freeSpins && currentUser.freeSpins > 0 ? (
                    <span className="text-[9px] font-extrabold bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-md animate-pulse">
                      🎫 {currentUser.freeSpins} Spin{currentUser.freeSpins > 1 ? 's' : ''} Gratuit{currentUser.freeSpins > 1 ? 's' : ''}
                    </span>
                  ) : null}
                </p>

                {wheelResultMsg && (
                  <p id="wheel-result-msg" className="text-xs bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-xl leading-relaxed font-bold animate-pulse">
                    {wheelResultMsg}
                  </p>
                )}

                <button
                  id="btn-spin-wheel"
                  onClick={spinWheel}
                  disabled={isSpinning}
                  className="w-full py-3 bg-rose-650 hover:bg-rose-700 text-white rounded-2xl text-xs font-display font-black shadow-md tracking-wider uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase shrink-0 cursor-pointer"
                >
                  {isSpinning 
                    ? '🎡 Rotation en cours...' 
                    : currentUser?.freeSpins && currentUser.freeSpins > 0 
                    ? '🍀 Lancer (TOUR GRATUIT 🎉)' 
                    : '🍀 Lancer (500 FCFA)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};
