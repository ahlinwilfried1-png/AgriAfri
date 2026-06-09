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
} from 'lucide-react';

export const ProfileView: React.FC = () => {
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
  } = useApp();

  // Active expanded accordion sub-menu
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

  // --- DEPOSIT SUB-FORM STATE ---
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depAmount, setDepAmount] = useState<number>(5000);
  const [depOperator, setDepOperator] = useState<'Mobile Money' | 'Moov Money' | 'Flooz'>('Mobile Money');
  const [depProof, setDepProof] = useState<string>('');
  const [depSuccess, setDepSuccess] = useState('');
  const [depError, setDepError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- WITHDRAW SUB-FORM STATE ---
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withAmount, setWithAmount] = useState<number>(5000);
  const [withPhone, setWithPhone] = useState('');
  const [withName, setWithName] = useState('');
  const [withSuccess, setWithSuccess] = useState('');
  const [withError, setWithError] = useState('');

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

    if (!withPhone.trim() || !withName.trim()) {
      setWithError('Veuillez remplir le numéro Mobile Money et le Nom du bénéficiaire.');
      return;
    }

    const currentHour = new Date().getHours();
    if (currentHour < settings.withdrawStartHour || currentHour >= settings.withdrawEndHour) {
      setWithError(`Les retraits sont disponibles uniquement de ${settings.withdrawStartHour.toString().padStart(2, '0')}h00 à ${settings.withdrawEndHour.toString().padStart(2, '0')}h00.`);
      return;
    }

    const res = requestWithdrawal(withAmount, withPhone, withName);
    if (res.success) {
      setWithSuccess('Votre demande de retrait a été enregistrée avec succès. Paiement en cours de virement.');
      setWithAmount(5000);
      setWithPhone('');
      setWithName('');
      setTimeout(() => {
        setWithSuccess('');
        setShowWithdrawModal(false);
      }, 5000);
    } else {
      setWithError(res.message);
    }
  };

  const handleCopyLink = () => {
    const inviteLink = `${window.location.origin}/register?ref=${currentUser.referralCode}`;
    navigator.clipboard.writeText(inviteLink);
    alert('Lien de parrainage copié avec succès ! \n' + inviteLink);
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

  const activeInvests = userInvests.filter((i) => i.status === 'ACTIVE');
  const finishedInvests = userInvests.filter((i) => i.status === 'COMPLETED');
  const stabilityInvests = userInvests.filter((i) => i.category === 'STABILITÉ');

  // Time Constraint Check for withdrawals styling
  const currentHour = new Date().getHours();
  const withdrawalsOpen = currentHour >= settings.withdrawStartHour && currentHour < settings.withdrawEndHour;

  return (
    <div id="profile-view-container" className="animate-fade-in space-y-6 pb-24">
      
      {/* 🌱 ÉVOLUTION DU PRODUIT STABILITÉ */}
      <div className="bg-white border-2 border-emerald-500/30 rounded-3xl p-5 shadow-xs space-y-4">
        <h3 className="font-display font-black text-slate-800 text-sm flex items-center gap-1.5 text-emerald-800 border-b border-slate-100 pb-2.5">
          🌱 Évolution du Produit Stabilité
        </h3>
        {stabilityInvests.length === 0 ? (
          <div className="text-center py-5 font-sans">
            <p className="text-xs text-slate-400">Vous n'avez pas encore investi dans la catégorie Stabilité.</p>
            <p className="text-[10px] text-slate-500 mt-1">
              Les produits Stabilité vous offrent des rendements exceptionnels débloqués en fin de récolte.
            </p>
          </div>
        ) : (
          <div className="space-y-4 divide-y divide-slate-100">
            {stabilityInvests.map((inv) => {
              const daysElapsed = inv.daysPassed;
              const daysRemaining = Math.max(0, inv.durationDays - inv.daysPassed);
              const progressPercent = Math.min(100, Math.round((inv.daysPassed / inv.durationDays) * 100));
              const isActive = inv.status === 'ACTIVE';

              return (
                <div key={inv.id} className="space-y-3.5 pt-3 first:pt-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-sans font-bold text-slate-800 text-xs leading-tight">
                        {inv.productName}
                      </h4>
                      <span className={`inline-block text-[8px] font-sans font-bold px-2 py-0.5 rounded-full mt-1.5 uppercase tracking-wider ${
                        isActive 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        Statut : {isActive ? 'Actif' : 'Terminé'}
                      </span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[8px] text-slate-400 uppercase font-sans tracking-wider block font-bold">Montant investi</span>
                      <span className="font-mono text-xs font-black text-slate-800 mt-0.5 block">
                        {inv.amount.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>

                  {/* High quality Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-sans">
                      <span className="text-slate-500 font-semibold">Progression du cycle: {daysElapsed} / {inv.durationDays} Jours</span>
                      <strong className="text-emerald-700 font-black">{progressPercent}%</strong>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-150">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isActive ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Numeric metadata breakdown */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-100 p-2 rounded-2xl text-center text-[10px] font-sans">
                    <div>
                      <span className="block text-[8px] text-slate-400 uppercase font-bold tracking-wider">Jours écoulés</span>
                      <strong className="text-slate-705 font-bold block mt-0.5 font-mono">{daysElapsed} j</strong>
                    </div>
                    <div className="border-l border-r border-slate-200">
                      <span className="block text-[8px] text-slate-400 uppercase font-bold tracking-wider">Jours restants</span>
                      <strong className="text-slate-705 font-bold block mt-0.5 font-mono">{daysRemaining} j</strong>
                    </div>
                    <div>
                      <span className="block text-[8px] text-emerald-850 uppercase font-bold tracking-wider">Revenu Total Prévu</span>
                      <strong className="text-emerald-705 font-bold block mt-0.5 font-mono">
                        {inv.totalYield.toLocaleString()} FCFA
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 💳 PREMIUM USER BALANCE & METRICS CARD */}
      <div className="bg-emerald-800 rounded-3xl p-6 text-white shadow-lg shadow-emerald-900/10 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-emerald-700/50 blur-xl"></div>
        
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-sans tracking-widest text-emerald-300 font-bold">
              Solde Principal
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
              {currentUser.balance.toLocaleString()} <span className="text-xs font-normal text-emerald-200">FCFA</span>
            </h2>
          </div>

          <div className="w-10 h-10 bg-emerald-700 hover:bg-emerald-600 rounded-xl flex items-center justify-center font-display font-black text-sm text-white shadow-inner select-none uppercase" title={currentUser.fullName}>
            {currentUser.fullName
              ? currentUser.fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
              : 'U'}
          </div>
        </div>

        {/* Quick User identity stats */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 border-t border-emerald-700/60 pt-4 text-xs font-sans text-emerald-100">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-emerald-300 font-bold">Nom complet</p>
            <p className="font-semibold text-white mt-0.5 truncate">{currentUser.fullName}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-emerald-300 font-bold">Téléphone</p>
            <p className="font-semibold text-white mt-0.5 font-mono">{currentUser.countryCode} {currentUser.phone}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-emerald-300 font-bold">Revenus Cumulés</p>
            <p className="font-extrabold text-amber-300 mt-0.5">+{currentUser.totalEarnings.toLocaleString()} FCFA</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-emerald-300 font-bold">Membre depuis</p>
            <p className="font-semibold text-white mt-0.5">
              {new Date(currentUser.signupDate).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </div>

      {/* 🚀 WALLET DEPOSIT AND WITHDRAWAL FLOATING ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            id="profile-action-deposit"
            onClick={() => {
              setDepSuccess('');
              setDepError('');
              setShowDepositModal(true);
            }}
            className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-extrabold text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/10 transition-all select-none cursor-pointer"
          >
            <ArrowUpCircle className="w-4 h-4" />
            Déposer des fonds
          </button>
          
          <button
            id="profile-action-withdraw"
            onClick={() => {
              setWithSuccess('');
              setWithError('');
              setShowWithdrawModal(true);
            }}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-755 text-white font-sans font-extrabold text-xs rounded-2xl flex items-center justify-center gap-1.5 border border-slate-700 transition-all select-none cursor-pointer"
          >
            <ArrowDownCircle className="w-4 h-4" />
            Retirer de l'argent
          </button>
        </div>

      {/* 🗃️ DETAILED COLLAPSIBLE SUBMENUS ACCORDION */}
      <div id="profile-submenus-accordion" className="space-y-3">
        {[
          {
            id: 'invests',
            title: '💼 Mes Investissements Agricoles',
            icon: Briefcase,
            badge: activeInvests.length > 0 ? `${activeInvests.length} actif(s)` : null,
            content: (
              <div className="space-y-4">
                {/* ACTIVE PROJECTS CONTAINER */}
                <div>
                  <h4 className="font-sans font-bold text-xs text-emerald-800 uppercase tracking-wide mb-2 flex items-center gap-1">
                    🌱 Cycles en cours d'exploitation ({activeInvests.length})
                  </h4>
                  {activeInvests.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100 text-center font-sans">
                      Aucun capital actif pour le moment.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {activeInvests.map((inv) => {
                        const progressPercent = Math.min(100, Math.round((inv.daysPassed / inv.durationDays) * 100));
                        return (
                          <div
                            id={`user-active-inv-${inv.id}`}
                            key={inv.id}
                            className="bg-white border border-slate-100 hover:border-emerald-100 rounded-2xl p-4 shadow-2xs space-y-2.5 transition-all"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-sans font-bold text-slate-800 text-xs">
                                  {inv.productName}
                                </h5>
                                <span className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-md mt-1 inline-block uppercase tracking-wider">
                                  {inv.category}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono text-xs font-bold text-slate-800">
                                  Price: {inv.amount.toLocaleString()} FCFA
                                </span>
                                <p className="font-sans text-[10px] text-emerald-600 font-semibold mt-0.5">
                                  Dividende total : {inv.totalYield.toLocaleString()} FCFA
                                </p>
                              </div>
                            </div>

                            {/* PROGRESSBAR */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] text-slate-500 font-sans">
                                <span>Cycle: {inv.daysPassed}/{inv.durationDays} Jours</span>
                                <span className="font-bold text-emerald-700">{progressPercent}%</span>
                              </div>
                              <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                  style={{ width: `${progressPercent}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-[10px] font-sans text-slate-400 bg-slate-50 p-2 rounded-lg">
                              <span>Achat: {new Date(inv.purchaseDate).toLocaleDateString('fr-FR')}</span>
                              <span className="font-semibold text-slate-600">Récolte: {new Date(inv.endDate).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* FINISHED PROJECTS CONTAINER */}
                <div className="pt-2 border-t border-slate-50">
                  <h4 className="font-sans font-bold text-xs text-slate-500 uppercase tracking-wide mb-2">
                    ✅ Recettes Agri clôturées ({finishedInvests.length})
                  </h4>
                  {finishedInvests.length === 0 ? (
                    <p className="text-xs text-slate-350 text-center py-2 font-sans">
                      Aucun produit n'est encore arrivé à expiration.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {finishedInvests.map((inv) => (
                        <div
                          id={`user-finished-inv-${inv.id}`}
                          key={inv.id}
                          className="bg-slate-50/50 border border-slate-100 rounded-2xl p-3 flex justify-between items-center text-xs font-sans hover:bg-slate-50"
                        >
                          <div>
                            <p className="font-bold text-slate-700">{inv.productName}</p>
                            <span className="text-[10px] text-slate-400">Durée : {inv.durationDays} Jours</span>
                          </div>
                          <div className="text-right">
                            <p className="font-extrabold text-emerald-700">+{inv.totalYield.toLocaleString()} FCFA</p>
                            <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-lg font-bold">Terminé</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ),
          },
          {
            id: 'deposits',
            title: '📥 Historique des Dépôts',
            icon: History,
            badge: userDeps.length > 0 ? `${userDeps.length} virement(s)` : null,
            content: (
              <div className="space-y-2 font-sans text-xs">
                {userDeps.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Aucune transaction de dépôt déclarée.</p>
                ) : (
                  userDeps.map((dep) => (
                    <div
                      id={`user-deposit-${dep.id}`}
                      key={dep.id}
                      className="p-3 bg-white border border-slate-100 rounded-2xl flex justify-between items-center"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-800">{dep.amount.toLocaleString()} FCFA</span>
                          <span className="bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 text-[9px] rounded-md">{dep.operator}</span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Déclaré le {new Date(dep.date).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div className="text-right">
                        {dep.status === 'PENDING' && (
                          <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 text-[10px] rounded-full font-bold">En examen</span>
                        )}
                        {dep.status === 'VALIDATED' && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 text-[10px] rounded-full font-bold">Crédité ✅</span>
                        )}
                        {dep.status === 'REFUSED' && (
                          <span className="bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 text-[10px] rounded-full font-bold">Refusé ❌</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ),
          },
          {
            id: 'withdrawals',
            title: '💸 Historique des Retraits',
            icon: ArrowDownCircle,
            badge: userWiths.length > 0 ? `${userWiths.length} demande(s)` : null,
            content: (
              <div className="space-y-2 font-sans text-xs">
                {userWiths.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center font-sans">Aucun retrait demandé.</p>
                ) : (
                  userWiths.map((w) => (
                    <div
                      id={`user-withdrawal-${w.id}`}
                      key={w.id}
                      className="p-3 bg-white border border-slate-100 rounded-2xl flex justify-between items-center"
                    >
                      <div className="space-y-1">
                        <p className="font-extrabold text-slate-800">{w.amount.toLocaleString()} FCFA</p>
                        <p className="text-[10px] text-slate-400">Destinataire: {w.recipientName} ({w.recipientPhone})</p>
                        <p className="text-[9px] text-slate-400">Demandé le {new Date(w.date).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>

                      <div className="text-right">
                        {w.status === 'PENDING' && (
                          <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 text-[10px] rounded-full font-bold">En attente</span>
                        )}
                        {w.status === 'PAID' && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 text-[10px] rounded-full font-bold">Payé 💰</span>
                        )}
                        {w.status === 'REFUSED' && (
                          <span className="bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-0.5 text-[10px] rounded-full font-bold">Refusé ❌</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ),
          },
          {
            id: 'commissions',
            title: '📈 Historique des Revenus',
            icon: Coins,
            badge: userComs.length > 0 ? `+${userComs.reduce((acc, c) => acc + c.amount, 0).toLocaleString()} FCFA` : null,
            content: (
              <div className="space-y-2.5 font-sans text-xs">
                {userComs.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Aucune commission créditée pour l'instant.</p>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Détail des commissions de parrainage :</p>
                    {userComs.map((com) => (
                      <div
                        id={`user-commission-${com.id}`}
                        key={com.id}
                        className="p-3 bg-white border border-slate-100 rounded-2xl flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold text-slate-700">Filleul: {com.referredName}</p>
                          <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-1.5 py-0.1 rounded-md">
                            Niveau {com.level}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-emerald-700">+{com.amount.toLocaleString()} FCFA</p>
                          <span className="font-mono text-[9px] text-slate-400">
                            {new Date(com.date).toLocaleDateString('fr-FR')}
                          </span>
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
            if (confirm('Voulez-vous vraiment vous déconnecter d\'AgriAfri ?')) {
              logoutUser();
            }
          }}
          className="w-full py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100/30 font-sans font-bold text-xs rounded-3xl flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter de mon compte
        </button>
      </div>

      {/* ================================= DEPOSIT DECLA MODAL ================================= */}
      {showDepositModal && (
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
      {showWithdrawModal && (
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
                <p className="text-[10px] text-slate-400 mt-1">Montant min: {settings.minWithdrawAmount.toLocaleString()} FCFA</p>
              </div>

              {/* Number Phone */}
              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">
                  Numéro de Téléphone Mobile Money
                </label>
                <input
                  id="with-phone-input"
                  type="tel"
                  required
                  placeholder="Ex: 07 48 99 88 77"
                  value={withPhone}
                  onChange={(e) => setWithPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans text-slate-700 outline-none focus:border-emerald-500 font-mono transition-colors"
                />
              </div>

              {/* Recipient Full Name */}
              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">
                  Nom Complet du Bénéficiaire
                </label>
                <input
                  id="with-name-input"
                  type="text"
                  required
                  placeholder="Ex: Yao Koffi Paul"
                  value={withName}
                  onChange={(e) => setWithName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans text-slate-700 outline-none focus:border-emerald-500 transition-colors"
                />
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
