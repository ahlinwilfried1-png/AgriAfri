/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, User, ProductCategory } from '../types';
import {
  ShieldAlert,
  Users,
  Wallet,
  ArrowDownCircle,
  Package,
  Star,
  HelpCircle,
  Settings,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Clock,
  Coins,
  ArrowUpRight,
  UserX,
  UserCheck,
  Eye,
  Camera,
  Play,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    users,
    products,
    deposits,
    withdrawals,
    investments,
    tickets,
    reviews,
    settings,
    commissions,
    progressTimeByOneDay,
    instantCompleteAllCycles,
    verifyDeposit,
    verifyWithdrawal,
    replyToTicket,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    updateUserBalance,
    toggleUserBlock,
    deleteUser,
    editUserDetail,
    updateSettings,
    deleteReview,
  } = useApp();

  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'dashboard' | 'users' | 'deposits' | 'withdrawals' | 'products' | 'support' | 'commissions' | 'settings'>('dashboard');

  // Interactive local states
  const [targetProofImage, setTargetProofImage] = useState<string | null>(null);
  const [showReplyModalFor, setShowReplyModalFor] = useState<string | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  
  // User edit state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [balanceAdjustmentAmount, setBalanceAdjustmentAmount] = useState<number>(0);

  // New Product state
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<ProductCategory>('BIEN-ÊTRE');
  const [newProdPrice, setNewProdPrice] = useState<number>(10000);
  const [newProdDuration, setNewProdDuration] = useState<number>(7);
  const [newProdRevenue, setNewProdRevenue] = useState<number>(14000);
  const [newProdIcon, setNewProdIcon] = useState('Sprout');
  const [newProdDescription, setNewProdDescription] = useState('');

  // Product Edit state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProdName, setEditProdName] = useState('');
  const [editProdCategory, setEditProdCategory] = useState<ProductCategory>('BIEN-ÊTRE');
  const [editProdPrice, setEditProdPrice] = useState<number>(10000);
  const [editProdDuration, setEditProdDuration] = useState<number>(7);
  const [editProdRevenue, setEditProdRevenue] = useState<number>(14000);
  const [editProdIcon, setEditProdIcon] = useState('Sprout');
  const [editProdDescription, setEditProdDescription] = useState('');

  // --- STATISTICS CALCULATIONS ---
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter((u) => !u.blocked).length;
  const blockedUsersCount = users.filter((u) => u.blocked).length;
  
  const totalDepositsSum = deposits.filter((d) => d.status === 'VALIDATED').reduce((acc, curr) => acc + curr.amount, 0);
  const totalWithdrawalsSum = withdrawals.filter((w) => w.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);
  const totalDistributedDividends = investments.filter((i) => i.status === 'COMPLETED').reduce((acc, curr) => acc + (curr.totalYield - curr.amount), 0);

  const activeInvestmentsCount = investments.filter((i) => i.status === 'ACTIVE').length;
  const finishedInvestmentsCount = investments.filter((i) => i.status === 'COMPLETED').length;

  const usersWithActiveStability = users.filter((u) =>
    investments.some((inv) => inv.userId === u.id && inv.category === 'STABILITÉ' && inv.status === 'ACTIVE')
  ).length;

  const usersWithFullAccessCount = (settings.requireStabilityToUnlockOthers ?? true)
    ? usersWithActiveStability
    : users.length;

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    addProduct({
      name: newProdName,
      category: newProdCategory,
      price: newProdPrice,
      durationDays: newProdDuration,
      totalRevenue: newProdRevenue,
      active: true,
      iconName: newProdIcon,
      description: newProdDescription || 'Aucune description disponible pour cette culture.',
    });

    setNewProdName('');
    setNewProdDescription('');
    setShowNewProductModal(false);
  };

  const triggerProductEdit = (p: Product) => {
    setEditingProduct(p);
    setEditProdName(p.name);
    setEditProdCategory(p.category);
    setEditProdPrice(p.price);
    setEditProdDuration(p.durationDays);
    setEditProdRevenue(p.totalRevenue);
    setEditProdIcon(p.iconName || 'Sprout');
    setEditProdDescription(p.description || '');
  };

  const handleProductEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct.id, {
      name: editProdName,
      category: editProdCategory,
      price: editProdPrice,
      durationDays: editProdDuration,
      totalRevenue: editProdRevenue,
      iconName: editProdIcon,
      description: editProdDescription || 'Aucune description disponible pour cette culture.',
    });
    setEditingProduct(null);
    alert('Culture d\'investissement mise à jour avec succès !');
  };

  const handleUserBalanceAction = (userId: string, mode: 'add' | 'subtract') => {
    if (balanceAdjustmentAmount <= 0) {
      alert('Veuillez spécifier une somme supérieure à 0.');
      return;
    }
    const finalAmount = mode === 'add' ? balanceAdjustmentAmount : -balanceAdjustmentAmount;
    updateUserBalance(userId, finalAmount, 'add');
    setBalanceAdjustmentAmount(0);
    setEditingUserId(null);
    alert('Solde utilisateur modifié avec succès !');
  };

  const handleUserSaveInfo = (userId: string) => {
    editUserDetail(userId, { fullName: editUserName, phone: editUserPhone });
    setEditingUserId(null);
    alert('Profil édité avec succès !');
  };

  const submitTicketReply = (id: string) => {
    if (!ticketReplyText.trim()) return;
    replyToTicket(id, ticketReplyText);
    setTicketReplyText('');
    setShowReplyModalFor(null);
    alert('Réponse envoyée au client !');
  };

  return (
    <div id="admin-panel-main" className="animate-fade-in space-y-6 pb-24">
      
      {/* 🛡️ ADMIN SECTION TITLE BAR */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 flex justify-between items-center shadow-lg">
        <div>
          <h2 className="font-sans font-black text-sm tracking-wide text-amber-500 uppercase flex items-center gap-1.5 leading-none">
            <ShieldAlert className="w-5 h-5 text-amber-500 animate-pulse" />
            Portail Administrateur AgriAfri
          </h2>
          <p className="font-sans text-[10px] text-slate-400 mt-1">
            Gérer les investissements, valider les dépôts et retraits en temps réel
          </p>
        </div>
      </div>

      {/* 🔌 SECONDARY TAB NAVIGATION METADATA */}
      <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none border-b border-slate-100">
        {[
          { id: 'dashboard', name: 'Dashboard', icon: ShieldAlert },
          { id: 'users', name: 'Utilisateurs', icon: Users },
          { id: 'deposits', name: 'Dépôts', icon: Wallet },
          { id: 'withdrawals', name: 'Retraits', icon: ArrowDownCircle },
          { id: 'products', name: 'Produits', icon: Package },
          { id: 'support', name: 'Tickets', icon: HelpCircle },
          { id: 'commissions', name: 'Commissions', icon: Star },
          { id: 'settings', name: 'Paramètres', icon: Settings },
        ].map((subTab) => {
          const Icon = subTab.icon;
          const isSelected = activeAdminSubTab === subTab.id;
          return (
            <button
              id={`admin-subtab-${subTab.id}`}
              key={subTab.id}
              onClick={() => setActiveAdminSubTab(subTab.id as any)}
              className={`px-3.5 py-2 font-sans text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 transition-all select-none ${
                isSelected
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {subTab.name}
            </button>
          );
        })}
      </div>

      {/* ======================= TAB 1: DASHBOARD OVERVIEW ======================= */}
      {activeAdminSubTab === 'dashboard' && (
        <div id="admin-tab-dashboard" className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
              <span className="text-[10px] text-slate-400 font-sans font-semibold uppercase tracking-wider">Membres totaux</span>
              <h4 className="font-sans font-black text-lg text-slate-850 mt-1">{totalUsersCount}</h4>
              <p className="text-[9px] text-emerald-600 mt-2 font-semibold">● {activeUsersCount} actifs</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
              <span className="text-[10px] text-slate-400 font-sans font-semibold uppercase tracking-wider">Cumul Dépôts</span>
              <h4 className="font-sans font-black text-lg text-emerald-600 mt-1">{totalDepositsSum.toLocaleString()} F</h4>
              <p className="text-[9px] text-slate-450 mt-2">Dépôts validés</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
              <span className="text-[10px] text-slate-400 font-sans font-semibold uppercase tracking-wider">Retraits Validés</span>
              <h4 className="font-sans font-black text-lg text-rose-600 mt-1">{totalWithdrawalsSum.toLocaleString()} F</h4>
              <p className="text-[9px] text-slate-450 mt-2">Payé aux clients</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
              <span className="text-[10px] text-slate-400 font-sans font-semibold uppercase tracking-wider">Bénéfices Distribués</span>
              <h4 className="font-sans font-black text-lg text-amber-500 mt-1">{totalDistributedDividends.toLocaleString()} F</h4>
              <p className="text-[9px] text-amber-600 mt-2 font-semibold">+ Intérêts de récolte</p>
            </div>
          </div>

          {/* Cycles summary card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="font-sans font-bold text-xs text-slate-800 uppercase tracking-widest mb-2">📦 Statut des Cycles Agricoles</h4>
              <div className="grid grid-cols-2 gap-2 mt-4 text-center">
                <div className="bg-emerald-50 text-emerald-800 border-emerald-100 border p-3.5 rounded-2xl">
                  <h5 className="font-sans font-black text-md">{activeInvestmentsCount}</h5>
                  <p className="text-[9px] uppercase tracking-wider mt-1 text-slate-500">Cycles Actifs</p>
                </div>
                <div className="bg-slate-50 border-slate-100 border p-3.5 rounded-2xl text-slate-700">
                  <h5 className="font-sans font-black text-md">{finishedInvestmentsCount}</h5>
                  <p className="text-[9px] uppercase tracking-wider mt-1 text-slate-400">Cycles Terminés</p>
                </div>
              </div>
            </div>

            {/* 🕒 TIME WARP SIMULATOR WIDGET (Crucial for test evaluation!) */}
            <div className="p-4 bg-amber-50/50 border border-amber-100/50 rounded-2xl space-y-3 flex flex-col justify-between">
              <div>
                <h5 className="font-sans font-black text-xs text-amber-800 uppercase flex items-center gap-1.5">
                  <Clock className="w-4 h-4 animate-spin-slow" />
                  Accélérateur Temporel de Simulation
                </h5>
                <p className="font-sans text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                  Pour tester les gains et la fin des récoltes sans attendre 200 jours, utilisez ces déclencheurs de test :
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  id="admin-simulate-day-btn"
                  onClick={() => {
                    progressTimeByOneDay();
                    alert('Simulation : Un jour est passé. Les cycles actifs avancent et récoltes de fin créditent automatiquement les comptes !');
                  }}
                  className="py-2 px-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-xs font-sans font-bold text-slate-900 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer select-none"
                >
                  <Play className="w-3.5 h-3.5" />
                  Simuler +1 Jour
                </button>
                
                <button
                  id="admin-complete-cycles-btn"
                  onClick={() => {
                    if (confirm('Voulez-vous forcer instantanément la réussite de tous les investissements en cours ?')) {
                      instantCompleteAllCycles();
                      alert('Tous les cycles actifs ont été liquidés au profit des soldes clients !');
                    }
                  }}
                  className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 text-xs font-sans font-bold rounded-xl transition-all select-none cursor-pointer"
                >
                  Clôturer Cycles
                </button>
              </div>
            </div>
          </div>

          {/* 🛡️ STATISTIQUES DES RÈGLES D'ACCÈS */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-5 shadow-2xs grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <h4 className="font-sans font-bold text-xs text-emerald-950 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <span>🌱 Règle d'Accès Stabilité</span>
                {(settings.requireStabilityToUnlockOthers ?? true) ? (
                  <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black animate-pulse">ACTIF</span>
                ) : (
                  <span className="text-[9px] bg-slate-300 text-slate-700 px-2 py-0.5 rounded-full font-black">INACTIF</span>
                )}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Lorsque cette règle est activée, les utilisateurs doivent obligatoirement détenir au moins un produit "Stabilité" actif pour débloquer l'accès aux catégories "Bien-être" et "Activités".
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-100 p-3 rounded-2xl text-center shadow-3xs flex flex-col justify-center">
                <p className="text-[9px] text-slate-400 uppercase font-sans tracking-wide">Stabilité Actif</p>
                <p className="text-base font-mono font-black text-emerald-800 mt-1">{usersWithActiveStability}</p>
                <p className="text-[8px] text-slate-500 mt-0.5">Utilisateurs</p>
              </div>
              <div className="bg-white border border-slate-100 p-3 rounded-2xl text-center shadow-3xs flex flex-col justify-center">
                <p className="text-[9px] text-slate-400 uppercase font-sans tracking-wide">Accès d'autres catégories</p>
                <p className="text-base font-mono font-black text-rose-700 mt-1">{usersWithFullAccessCount}</p>
                <p className="text-[8px] text-slate-500 mt-0.5">Utilisateurs</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 2: GESTION UTILISATEURS ======================= */}
      {activeAdminSubTab === 'users' && (
        <div id="admin-tab-users" className="space-y-4">
          <h3 className="font-sans font-extrabold text-slate-850 text-xs uppercase tracking-wider">
            Membres Requis ({users.length})
          </h3>
          
          <div className="space-y-3">
            {users.map((u) => (
              <div
                id={`admin-user-row-${u.id}`}
                key={u.id}
                className="bg-white border border-slate-100 rounded-3xl p-5 shadow-2xs space-y-4 hover:border-emerald-100 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-sans font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      {u.fullName}
                      {u.blocked && (
                        <span className="bg-rose-100 text-rose-700 text-[8px] font-sans font-bold px-1.5 py-0.5 rounded-full uppercase">Bloqué</span>
                      )}
                    </h4>
                    <p className="font-sans text-[10px] text-slate-400 font-medium">
                      Phone: <span className="font-mono font-bold text-slate-600">{u.countryCode} {u.phone}</span> • Code invitation unique : <span className="font-mono font-bold text-emerald-700">{u.referralCode}</span>
                    </p>
                    <div className="flex flex-wrap gap-2.5 mt-2 bg-slate-50 border border-slate-100 p-2 rounded-xl text-[9px] font-sans">
                      <span className="text-slate-500 font-bold">Filiation & Parrainage :</span>
                      <span className="text-slate-700">Filleuls : <strong className="text-slate-900">{users.filter((target) => target.referredBy === u.referralCode).length}</strong></span>
                      <span className="text-emerald-700 font-semibold">Gains Commission : <strong>{(u.totalReferralGains || 0).toLocaleString()} FCFA</strong></span>
                      {u.referredBy && (
                        <span className="text-blue-700 font-medium">Parrain : <strong className="font-mono text-blue-900">{u.referredBy}</strong></span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-sans text-[9px] text-slate-400">Balance Actuelle</p>
                    <h5 className="font-sans font-black text-sm text-emerald-600">{u.balance.toLocaleString()} FCFA</h5>
                  </div>
                </div>

                {/* Sub edit settings area */}
                {editingUserId === u.id ? (
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-400 uppercase font-sans">Ajuster Nom</label>
                        <input
                          id="adjust-name-input"
                          type="text"
                          value={editUserName}
                          onChange={(e) => setEditUserName(e.target.value)}
                          className="w-full bg-white border rounded-lg px-2 py-1 text-xs font-sans text-slate-700 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-400 uppercase font-sans">Ajuster Phone</label>
                        <input
                          id="adjust-phone-input"
                          type="text"
                          value={editUserPhone}
                          onChange={(e) => setEditUserPhone(e.target.value)}
                          className="w-full bg-white border rounded-lg px-2 py-1 text-xs font-sans text-slate-750 outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <label className="block text-[9px] text-slate-400 uppercase font-sans mb-1">Montant à ajouter/déduire</label>
                      <div className="flex gap-2">
                        <input
                          id="adjust-balance-input"
                          type="number"
                          placeholder="Ex: 50000"
                          value={balanceAdjustmentAmount || ''}
                          onChange={(e) => setBalanceAdjustmentAmount(Number(e.target.value))}
                          className="flex-1 bg-white border rounded-lg px-2 py-1 text-xs font-sans font-bold text-slate-700 outline-none"
                        />
                        <button
                          id="admin-add-balance-btn"
                          type="button"
                          onClick={() => handleUserBalanceAction(u.id, 'add')}
                          className="py-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xxs font-sans font-bold"
                        >
                          + Créditer
                        </button>
                        <button
                          id="admin-sub-balance-btn"
                          type="button"
                          onClick={() => handleUserBalanceAction(u.id, 'subtract')}
                          className="py-1 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xxs font-sans font-bold"
                        >
                          - Débiter
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-150">
                      <button
                        id="user-save-btn"
                        onClick={() => handleUserSaveInfo(u.id)}
                        className="py-1 px-2.5 bg-slate-800 text-white text-xxs rounded font-sans font-bold"
                      >
                        Sauvegarder Info
                      </button>
                      <button
                        id="user-cancel-edit-btn"
                        onClick={() => setEditingUserId(null)}
                        className="py-1 px-2 text-slate-500 bg-slate-200 text-xxs rounded font-sans font-bold"
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 justify-end pt-2.5 border-t border-slate-50">
                    <button
                      id={`btn-edit-usr-${u.id}`}
                      onClick={() => {
                        setEditingUserId(u.id);
                        setEditUserName(u.fullName);
                        setEditUserPhone(u.phone);
                        setBalanceAdjustmentAmount(0);
                      }}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-sans font-bold transition-colors select-none"
                    >
                      <Edit className="w-3 h-3 inline mr-1" /> Ajuster Balance / Info
                    </button>

                    <button
                      id={`btn-block-usr-${u.id}`}
                      onClick={() => toggleUserBlock(u.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-[10px] font-sans font-bold transition-colors select-none flex items-center gap-1 ${
                        u.blocked
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      {u.blocked ? (
                        <>
                          <UserCheck className="w-3 h-3" /> Débloquer
                        </>
                      ) : (
                        <>
                          <UserX className="w-3 h-3" /> Bloquer
                        </>
                      )}
                    </button>

                    {u.role !== 'admin' && (
                      <button
                        id={`btn-del-usr-${u.id}`}
                        onClick={() => {
                          if (confirm('Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur de la plateforme AgriAfri ?')) {
                            deleteUser(u.id);
                          }
                        }}
                        className="px-2.5 py-1.5 bg-rose-600 text-white hover:bg-rose-700 rounded-xl text-[10px] font-sans font-bold transition-colors select-none"
                      >
                        <Trash2 className="w-3 h-3 inline mr-0.5" /> Supprimer
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= TAB 3: GESTION DÉPÔTS ======================= */}
      {activeAdminSubTab === 'deposits' && (
        <div id="admin-tab-deposits" className="space-y-4">
          <h3 className="font-sans font-extrabold text-slate-850 text-xs uppercase tracking-wider">
            Examen des Declarations Transferts ({deposits.length})
          </h3>

          <div className="space-y-3">
            {deposits.length === 0 ? (
              <p className="text-center py-10 text-slate-400 bg-white rounded-3xl border text-sm font-sans">Aucune déclaration de dépôt disponible.</p>
            ) : (
              deposits.map((dep) => (
                <div
                  id={`admin-dep-row-${dep.id}`}
                  key={dep.id}
                  className="bg-white border border-slate-100 rounded-3xl p-5 hover:border-emerald-100 transition-all shadow-2xs space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-sans font-bold text-slate-800 text-xs">
                        {dep.amount.toLocaleString()} FCFA
                      </h4>
                      <p className="font-sans text-[10px] text-slate-500 font-medium">
                        De : <strong className="text-slate-800">{dep.userFullName}</strong> ({dep.userPhone})
                      </p>
                      <p className="font-sans text-[9px] text-slate-400">
                        Date de déclaration : {new Date(dep.date).toLocaleString('fr-FR')} • Opérateur : <strong className="text-slate-700">{dep.operator}</strong>
                      </p>
                    </div>

                    <div>
                      {dep.status === 'PENDING' && (
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 text-[9px] rounded-full font-bold">En vérification</span>
                      )}
                      {dep.status === 'VALIDATED' && (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[9px] rounded-full font-bold">Validé &amp; Crédité ✅</span>
                      )}
                      {dep.status === 'REFUSED' && (
                        <span className="bg-rose-100 text-rose-800 px-2 py-0.5 text-[9px] rounded-full font-bold">Refusé ❌</span>
                      )}
                    </div>
                  </div>

                  {/* Attachment Preuve Action */}
                  <div className="flex flex-wrap gap-2 items-center justify-between pt-2.5 border-t border-slate-50">
                    <div>
                      {dep.paymentProofImage ? (
                        <button
                          id={`btn-view-proof-${dep.id}`}
                          onClick={() => setTargetProofImage(dep.paymentProofImage || null)}
                          className="px-2.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100 rounded-xl text-[10px] font-sans font-bold flex items-center gap-1 transition-colors select-none"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          Voir la Preuve (Capture d'écran)
                        </button>
                      ) : (
                        <span className="text-[10px] font-sans text-slate-400 font-semibold italic">Aucune image fournie</span>
                      )}
                    </div>

                    {dep.status === 'PENDING' && (
                      <div className="flex gap-1.5">
                        <button
                          id={`btn-deny-dep-${dep.id}`}
                          onClick={() => verifyDeposit(dep.id, false)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-sans font-bold transition-all shadow-xs"
                        >
                          Refuser
                        </button>
                        <button
                          id={`btn-approve-dep-${dep.id}`}
                          onClick={() => verifyDeposit(dep.id, true)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-sans font-bold transition-all shadow-xs"
                        >
                          Valider & Créditer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================= TAB 4: GESTION RETRAITS ======================= */}
      {activeAdminSubTab === 'withdrawals' && (
        <div id="admin-tab-withdrawals" className="space-y-4">
          <h3 className="font-sans font-extrabold text-slate-850 text-xs uppercase tracking-wider">
            Retraits Demandés ({withdrawals.length})
          </h3>

          <div className="space-y-3">
            {withdrawals.length === 0 ? (
              <p className="text-center py-10 text-slate-400 bg-white rounded-3xl border text-sm font-sans">Aucun retrait en cours.</p>
            ) : (
              withdrawals.map((w) => (
                <div
                  id={`admin-with-row-${w.id}`}
                  key={w.id}
                  className="bg-white border border-slate-100 rounded-3xl p-5 hover:border-emerald-100 transition-all shadow-2xs space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-sans font-black text-rose-600 text-sm">
                        -{w.amount.toLocaleString()} FCFA
                      </h4>
                      <p className="font-sans text-[11px] text-slate-700 mt-1 font-semibold">
                        Vers Mobile Wallet : <span className="font-mono">{w.recipientPhone}</span>
                      </p>
                      <p className="font-sans text-[10px] text-slate-500 font-medium">
                        Bénéficiaire : <strong className="text-slate-800 font-bold">{w.recipientName}</strong>
                      </p>
                      <p className="font-sans text-[9px] text-slate-400">
                        Date : {new Date(w.date).toLocaleString('fr-FR')} • Client : {w.userPhone}
                      </p>
                    </div>

                    <div>
                      {w.status === 'PENDING' && (
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 text-[9px] rounded-full font-bold">En attente de virement</span>
                      )}
                      {w.status === 'PAID' && (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[9px] rounded-full font-bold">Transféré 💰</span>
                      )}
                      {w.status === 'REFUSED' && (
                        <span className="bg-rose-100 text-rose-800 px-2 py-0.5 text-[9px] rounded-full font-bold">Refusé ❌</span>
                      )}
                    </div>
                  </div>

                  {w.status === 'PENDING' && (
                    <div className="flex justify-end gap-1.5 pt-2.5 border-t border-slate-50">
                      <button
                        id={`btn-deny-with-${w.id}`}
                        onClick={() => verifyWithdrawal(w.id, false)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-sans font-bold transition-all shadow-xs"
                      >
                        Refuser &amp; Rembourser
                      </button>
                      <button
                        id={`btn-approve-with-${w.id}`}
                        onClick={() => verifyWithdrawal(w.id, true)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-sans font-bold transition-all shadow-xs"
                      >
                        Valider comme PAYÉ
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================= TAB 5: GESTION PRODUITS AGRICOLES ======================= */}
      {activeAdminSubTab === 'products' && (
        <div id="admin-tab-products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-sans font-extrabold text-slate-850 text-xs uppercase tracking-wider">
              Variétés Agricoles au Catalogue ({products.length})
            </h3>
            <button
              id="admin-btn-add-product"
              onClick={() => setShowNewProductModal(true)}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-sans font-bold rounded-xl flex items-center gap-1 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Nouvelle offre
            </button>
          </div>

          <div className="space-y-3">
            {products.map((p) => (
              <div
                id={`admin-product-row-${p.id}`}
                key={p.id}
                className="bg-white border border-slate-100 rounded-3xl p-5 hover:border-emerald-100 shadow-2xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-sans font-bold text-slate-800 text-xs">
                      {p.name}
                    </h4>
                    <span className="bg-slate-100 text-slate-700 font-bold tracking-wider px-2 py-0.5 text-[9px] rounded-md mt-1 inline-block">
                      {p.category}
                    </span>
                    <p className="font-sans text-[10px] text-slate-400 mt-1">
                      Prix : <strong>{p.price.toLocaleString()} FCFA</strong> • Cycle : <strong>{p.durationDays} Jours</strong>
                    </p>
                    <p className="font-sans text-[11px] text-emerald-600 font-semibold">
                      Recette attendue : {p.totalRevenue.toLocaleString()} FCFA
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5 text-right">
                    <span className={`px-2 py-0.5 text-[9px] rounded-full font-bold select-none text-nowrap self-end ${
                      p.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-150 text-slate-500'
                    }`}>
                      {p.active ? 'Actif au catalogue' : 'Désactivé'}
                    </span>
                  </div>
                </div>

                {/* Advanced Programming Section for BIEN-ÊTRE & ACTIVITÉS categories */}
                {p.category !== 'STABILITÉ' && (
                  <div className="bg-slate-50 border border-slate-205 rounded-2xl p-4.5 space-y-3 mt-2 text-xs">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 pb-2 border-b border-slate-200/50">
                      <span className="font-sans font-black text-slate-800 uppercase text-[9px] tracking-widest flex items-center gap-1">
                        ⚙️ Programmation & Période d'achat ({p.category})
                      </span>
                      <span className="font-sans text-[10px] font-bold text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded-lg">
                        Investisseurs : <strong className="text-emerald-700 font-mono">{investments.filter(inv => inv.productId === p.id).length}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">H. d'ouverture (ex: 10:00)</label>
                        <input 
                          type="text" 
                          placeholder="HH:MM" 
                          value={p.openingTime || ''} 
                          onChange={(e) => updateProduct(p.id, { openingTime: e.target.value || undefined })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono mt-1 text-slate-700 outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">H. de fermeture (ex: 10:10)</label>
                        <input 
                          type="text" 
                          placeholder="HH:MM" 
                          value={p.closingTime || ''} 
                          onChange={(e) => updateProduct(p.id, { closingTime: e.target.value || undefined })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono mt-1 text-slate-700 outline-none focus:border-rose-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">Durée (en minutes)</label>
                        <input 
                          type="number" 
                          placeholder="Ex: 10" 
                          value={p.availabilityDurationMinutes || ''} 
                          onChange={(e) => updateProduct(p.id, { availabilityDurationMinutes: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs mt-1 text-slate-705 outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Manual Controls */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 mt-2.5">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase mr-1">Disponibilité manuelle :</span>
                      <button
                        type="button"
                        onClick={() => updateProduct(p.id, { manualOpened: true, manualClosed: false })}
                        className={`px-3 py-1 rounded-xl text-[10px] font-extrabold transition-all border shrink-0 cursor-pointer ${
                          p.manualOpened 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                            : 'bg-white hover:bg-slate-100 text-emerald-800 border-emerald-150'
                        }`}
                      >
                        ✓ Ouvrir manuellement
                      </button>
                      <button
                        type="button"
                        onClick={() => updateProduct(p.id, { manualClosed: true, manualOpened: false })}
                        className={`px-3 py-1 rounded-xl text-[10px] font-extrabold transition-all border shrink-0 cursor-pointer ${
                          p.manualClosed 
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs' 
                            : 'bg-white hover:bg-slate-100 text-rose-800 border-rose-150'
                        }`}
                      >
                        ✕ Fermer manuellement
                      </button>
                      {(p.manualOpened || p.manualClosed) && (
                        <button
                          type="button"
                          onClick={() => updateProduct(p.id, { manualOpened: false, manualClosed: false })}
                          className="px-2.5 py-1 bg-slate-105 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer"
                        >
                          Réinitialiser
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* CRUD Controls */}
                <div className="flex justify-end gap-1 text-nowrap pt-2.5 border-t border-slate-50">
                  <button
                    id={`btn-edit-prod-${p.id}`}
                    onClick={() => triggerProductEdit(p)}
                    className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-805 border border-amber-250 rounded-lg text-[9px] font-sans font-bold transition-all cursor-pointer"
                  >
                    Modifier
                  </button>
                  <button
                    id={`btn-toggle-prod-${p.id}`}
                    onClick={() => toggleProductStatus(p.id)}
                    className={`px-2 py-1.5 border hover:bg-slate-50 rounded-lg text-[9px] font-sans font-bold transition-all ${
                      p.active ? 'text-amber-750 border-amber-200' : 'text-emerald-750 border-emerald-200'
                    }`}
                  >
                    {p.active ? 'Désactiver' : 'Activer'}
                  </button>
                  <button
                    id={`btn-del-prod-${p.id}`}
                    onClick={() => {
                      if (confirm('Supprimer définitivement ce produit de la plateforme ?')) {
                        deleteProduct(p.id);
                      }
                    }}
                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-[9px] font-sans font-bold transition-all"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= TAB 6: GESTION SUPPORT ======================= */}
      {activeAdminSubTab === 'support' && (
        <div id="admin-tab-support" className="space-y-4">
          <h3 className="font-sans font-extrabold text-slate-850 text-xs uppercase tracking-wider">
            Boite de Réclamations Utilisateurs ({tickets.length})
          </h3>

          <div className="space-y-3">
            {tickets.length === 0 ? (
              <p className="text-center py-10 text-slate-400 bg-white rounded-3xl border text-sm font-sans">Aucune réclamation de client reçue.</p>
            ) : (
              tickets.map((t) => (
                <div
                  id={`admin-ticket-row-${t.id}`}
                  key={t.id}
                  className="bg-white border border-slate-100 rounded-3xl p-5 hover:border-emerald-100 transition-all shadow-2xs space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-sans font-bold text-slate-850 text-xs flex items-center gap-1.5">
                        <span className="inline-block w-2.5 h-2.5 bg-red-400 rounded-full"></span>
                        {t.subject}
                      </h4>
                      <p className="font-sans text-[10px] text-slate-400 mt-0.5">
                        Auteur : <strong className="text-slate-800">{t.userFullName}</strong> ({t.userPhone})
                      </p>
                      <p className="font-sans text-[9px] text-slate-400">
                        Date de soumission : {new Date(t.date).toLocaleString('fr-FR')}
                      </p>
                    </div>

                    <div>
                      {t.status === 'PENDING' ? (
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] rounded-full font-bold">A repondre</span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] rounded-full font-bold">Résolu ✅</span>
                      )}
                    </div>
                  </div>

                  <p className="font-sans text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100/30">
                    "{t.message}"
                  </p>

                  {t.reply && (
                    <div className="bg-emerald-50/50 border border-emerald-100/30 p-3 rounded-2xl text-xs font-sans text-emerald-900">
                      <strong>Ma Réponse :</strong> "{t.reply}"
                    </div>
                  )}

                  {t.status === 'PENDING' && (
                    <div className="space-y-2 pt-2 border-t border-slate-50">
                      {showReplyModalFor === t.id ? (
                        <div className="space-y-2">
                          <textarea
                            id="reply-ticket-text"
                            rows={3}
                            placeholder="Écrivez votre réponse officielle de support client d'AgriAfri..."
                            value={ticketReplyText}
                            onChange={(e) => setTicketReplyText(e.target.value)}
                            className="w-full bg-slate-50 border p-3 rounded-xl text-xs font-sans text-slate-700 outline-none"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              id="reply-ticket-cancel"
                              onClick={() => setShowReplyModalFor(null)}
                              className="px-3 py-1 bg-slate-100 text-slate-500 rounded text-xxs font-bold"
                            >
                              Fermer
                            </button>
                            <button
                              id="reply-ticket-submit"
                              onClick={() => submitTicketReply(t.id)}
                              className="px-3 py-1 bg-emerald-600 text-white rounded text-xxs font-bold"
                            >
                              Transmettre
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-right">
                          <button
                            id={`btn-open-reply-${t.id}`}
                            onClick={() => setShowReplyModalFor(t.id)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-755 text-white text-[10px] font-sans font-bold rounded-xl transition-all"
                          >
                            Répondre au ticket
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================= TAB 7: EDIT PARAMETERS ======================= */}
      {activeAdminSubTab === 'settings' && (
        <div id="admin-tab-settings" className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
          <h3 className="font-sans font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">
            🎛️ Configuration Globale de la Plateforme
          </h3>

          <div className="space-y-3.5">
            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">Redirection Canal WhatsApp</label>
              <input
                id="edit-whatsapp-link"
                type="text"
                value={settings.whatsappLink}
                onChange={(e) => updateSettings({ whatsappLink: e.target.value })}
                className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs font-sans text-slate-700"
              />
            </div>

            {/* Telegram */}
            <div>
              <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">Lien Canal Telegram Officiel</label>
              <input
                id="edit-telegram-link"
                type="text"
                value={settings.telegramLink}
                onChange={(e) => updateSettings({ telegramLink: e.target.value })}
                className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs font-sans text-slate-705"
              />
            </div>

            {/* Condition d'accès Stabilité */}
            <div className="bg-emerald-50 border border-emerald-150 rounded-2xl p-4.5 space-y-2 col-span-full md:col-span-1">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-sans font-black text-emerald-950 flex items-center gap-1.5 uppercase tracking-wider">
                    🌱 Règle d'accès Stabilité
                  </h4>
                  <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                    Obliger l'utilisateur à activer au moins un produit Stabilité avant de pouvoir investir dans Bien-être ou Activités.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                  <input
                    id="toggle-require-stability"
                    type="checkbox"
                    checked={settings.requireStabilityToUnlockOthers ?? false}
                    onChange={(e) => updateSettings({ requireStabilityToUnlockOthers: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-205 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            {/* Simulated Time Field */}
            <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4.5 space-y-2">
              <h4 className="text-xs font-sans font-black text-amber-950 flex items-center gap-1.5 uppercase tracking-wider">
                ⏰ Simulation de l'heure du système (Tests de Programmation)
              </h4>
              <p className="text-[11px] text-amber-900 leading-relaxed font-semibold">
                Saisissez une heure spécifique pour tester les ouvertures et fermetures automatiques des produits Bien-être et Activités (ex: "10:05"). Laissez vide pour utiliser l'heure réelle en temps réel du navigateur.
              </p>
              <div>
                <input
                  id="settings-simulated-time"
                  type="text"
                  placeholder="HH:MM (Laissez vide pour l'heure réelle)"
                  value={settings.simulatedTime || ''}
                  onChange={(e) => updateSettings({ simulatedTime: e.target.value || undefined })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-705 outline-none"
                />
                {settings.simulatedTime ? (
                  <span className="text-[10px] text-amber-800 font-bold block mt-1.5">
                    ⚠️ Mode simulé actif : l'heure globale est bloquée à <strong className="text-slate-800">{settings.simulatedTime}</strong>
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-800 font-bold block mt-1.5">
                    ✓ Mode temps réel actif : utilisation de l'heure locale réelle du navigateur ({new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})
                  </span>
                )}
              </div>
            </div>

            {/* Withdrawal timings constraints */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">Début Heure Retraits (H)</label>
                <input
                  id="edit-withdraw-start"
                  type="number"
                  min="0"
                  max="23"
                  value={settings.withdrawStartHour}
                  onChange={(e) => updateSettings({ withdrawStartHour: Number(e.target.value) })}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs font-sans font-bold text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">Fin Heure Retraits (H)</label>
                <input
                  id="edit-withdraw-end"
                  type="number"
                  min="0"
                  max="23"
                  value={settings.withdrawEndHour}
                  onChange={(e) => updateSettings({ withdrawEndHour: Number(e.target.value) })}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs font-sans font-bold text-slate-700"
                />
              </div>
            </div>

            {/* MTW/Moov Money Transfer Numbers */}
            <div className="space-y-2 border-t pt-3 border-dashed">
              <span className="block text-xs font-sans font-extrabold text-slate-800">Numéros mobiles d'expédition d'AgriAfri</span>
              
              <div>
                <label className="block text-[10px] text-slate-500 font-sans">MTN Money destination</label>
                <input
                  id="edit-phone-mtn"
                  type="text"
                  value={settings.operatorPhones.mobileMoney}
                  onChange={(e) => updateSettings({
                    operatorPhones: { ...settings.operatorPhones, mobileMoney: e.target.value }
                  })}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-1.5 text-xs font-mono text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-sans">Moov Money destination</label>
                <input
                  id="edit-phone-moov"
                  type="text"
                  value={settings.operatorPhones.moovMoney}
                  onChange={(e) => updateSettings({
                    operatorPhones: { ...settings.operatorPhones, moovMoney: e.target.value }
                  })}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-1.5 text-xs font-mono text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-sans">Flooz destination</label>
                <input
                  id="edit-phone-flooz"
                  type="text"
                  value={settings.operatorPhones.flooz}
                  onChange={(e) => updateSettings({
                    operatorPhones: { ...settings.operatorPhones, flooz: e.target.value }
                  })}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-1.5 text-xs font-mono text-slate-750"
                />
              </div>
            </div>

            {/* Parrainage commissions settings */}
            <div className="grid grid-cols-3 gap-2 border-t pt-3 border-dashed">
              <div>
                <label className="block text-[9px] font-sans text-slate-500">Com. Niveau 1 (%)</label>
                <input
                  id="edit-com-l1"
                  type="number"
                  value={settings.commissionLevel1}
                  onChange={(e) => updateSettings({ commissionLevel1: Number(e.target.value) })}
                  className="w-full bg-slate-50 border rounded-xl px-2 py-1.5 text-xs font-bold font-sans text-slate-700 text-center"
                />
              </div>
              <div>
                <label className="block text-[9px] font-sans text-slate-500">Com. Niveau 2 (%)</label>
                <input
                  id="edit-com-l2"
                  type="number"
                  value={settings.commissionLevel2}
                  onChange={(e) => updateSettings({ commissionLevel2: Number(e.target.value) })}
                  className="w-full bg-slate-50 border rounded-xl px-2 py-1.5 text-xs font-bold font-sans text-slate-700 text-center"
                />
              </div>
              <div>
                <label className="block text-[9px] font-sans text-slate-500">Com. Niveau 3 (%)</label>
                <input
                  id="edit-com-l3"
                  type="number"
                  value={settings.commissionLevel3}
                  onChange={(e) => updateSettings({ commissionLevel3: Number(e.target.value) })}
                  className="w-full bg-slate-50 border rounded-xl px-2 py-1.5 text-xs font-bold font-sans text-slate-700 text-center"
                />
              </div>
            </div>
            
            <p className="bg-emerald-50 text-emerald-800 text-[9px] font-sans font-medium rounded-lg p-2.5 leading-relaxed">
              *Toutes les modifications saisies ci-dessus prennent effet instantanément pour les utilisateurs sur l'ensemble de l'application !
            </p>
          </div>
        </div>
      )}

      {/* ======================= TAB 8: ENREGISTREMENTS PARRAINAGE & COMMISSIONS ======================= */}
      {activeAdminSubTab === 'commissions' && (
        <div id="admin-tab-commissions" className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="font-sans font-extrabold text-slate-850 text-xs uppercase tracking-wider">
              Historique des Commissions de Parrainage ({(commissions || []).length})
            </h3>
          </div>

          <div className="space-y-3">
            {(!commissions || commissions.length === 0) ? (
              <p className="text-center py-10 text-slate-400 bg-white rounded-3xl border text-xs font-sans">
                Aucune commission n'a été payée pour le moment.
              </p>
            ) : (
              commissions.map((c) => {
                const beneficiary = users.find((usr) => usr.id === c.referrerId);
                return (
                  <div
                    id={`commission-item-${c.id}`}
                    key={c.id}
                    className="bg-white border border-slate-100 rounded-3xl p-4 shadow-2xs hover:border-emerald-100 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-50 text-emerald-800 font-sans font-black text-[9px] px-2 py-0.5 rounded-md">
                          Niveau {c.level}
                        </span>
                        <h4 className="font-sans font-bold text-slate-800 text-xs">
                          {beneficiary?.fullName || `Utilisateur ID: ${c.referrerId}`}
                        </h4>
                      </div>
                      <p className="font-sans text-[10px] text-slate-400 mt-1">
                        Généré par l'achat de : <strong className="text-slate-700">{c.referredName}</strong> • Date : <span className="font-mono">{new Date(c.date).toLocaleString('fr-FR')}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-sans font-black text-xs text-emerald-600 bg-emerald-50/50 px-3 py-1.5 rounded-xl border border-emerald-100/30">
                        + {c.amount.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ======================= EDIT EXISTING PRODUCT DIALOG ======================= */}
      {editingProduct && (
        <div id="editproduct-modal-overlay" className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">
            <div className="p-4 border-b border-amber-50 flex justify-between items-center bg-amber-500/5">
              <h3 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wide">
                Modifier la Culture Agricole
              </h3>
              <button
                id="close-editproduct-modal"
                onClick={() => setEditingProduct(null)}
                className="p-1 px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProductEditSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">Nom de la Culture</label>
                <input
                  id="edit-prod-name"
                  type="text"
                  required
                  placeholder="Ex: Hévéa Premium de San-Pédro"
                  value={editProdName}
                  onChange={(e) => setEditProdName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-sans text-slate-705"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1 font-sans">Catégorie Verticale</label>
                <select
                  id="edit-prod-cat"
                  value={editProdCategory}
                  onChange={(e) => setEditProdCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs font-sans text-slate-700 outline-none"
                >
                  <option value="BIEN-ÊTRE">BIEN-ÊTRE (3-30 jours, élevages de proximité)</option>
                  <option value="ACTIVITÉS">ACTIVITÉS (3-30 jours, machineries et équipement)</option>
                  <option value="STABILITÉ">STABILITÉ (Cycles longs, capital verrouillé)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 font-sans">Prix (FCFA)</label>
                  <input
                    id="edit-prod-price"
                    type="number"
                    required
                    value={editProdPrice}
                    onChange={(e) => setEditProdPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border rounded-xl px-2 py-1.5 text-xs text-slate-700 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-sans font-sans">Durée (Jours)</label>
                  <input
                    id="edit-prod-duration"
                    type="number"
                    required
                    value={editProdDuration}
                    onChange={(e) => setEditProdDuration(Number(e.target.value))}
                    className="w-full bg-slate-50 border rounded-xl px-2 py-1.5 text-xs text-slate-700 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-sans">Revenu (FCFA)</label>
                  <input
                    id="edit-prod-revenue"
                    type="number"
                    required
                    value={editProdRevenue}
                    onChange={(e) => setEditProdRevenue(Number(e.target.value))}
                    className="w-full bg-slate-50 border rounded-xl px-2 py-1.5 text-xs text-slate-700 font-bold text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">Choix d'Icône Visuelle</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { val: 'Sprout', label: '🌱 Sprout' },
                    { val: 'TreeDeciduous', label: '🌳 Verger' },
                    { val: 'Leaf', label: '🍃 Leaf' },
                    { val: 'Egg', label: '🥚 Volaille' },
                    { val: 'Apple', label: '🍏 Fruit' },
                    { val: 'Waves', label: '🌊 Riz' },
                    { val: 'Settings', label: '⚙️ Outils' },
                    { val: 'Sun', label: '☀️ Forage' },
                  ].map((icOption) => (
                    <button
                      id={`edit-choice-${icOption.val}`}
                      key={icOption.val}
                      type="button"
                      onClick={() => setEditProdIcon(icOption.val)}
                      className={`py-1 text-[10px] font-sans border rounded-lg transition-colors ${
                        editProdIcon === icOption.val
                          ? 'bg-amber-50 border-amber-500 text-amber-805 font-bold'
                          : 'bg-white text-slate-650 hover:bg-slate-50'
                      }`}
                    >
                      {icOption.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">Description de la culture</label>
                <textarea
                  id="edit-prod-desc"
                  rows={2}
                  placeholder="Expliquez brièvement le projet agricole..."
                  value={editProdDescription}
                  onChange={(e) => setEditProdDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-sans text-slate-700 outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 text-center pt-2">
                <button
                  id="editprod-cancel-btn"
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-sans font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  id="editprod-submit-btn"
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-550 hover:bg-amber-600 text-slate-900 rounded-xl text-xs font-sans font-bold shadow"
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= IMAGE PROOF DETAILED DIALOG ======================= */}
      {targetProofImage && (
        <div id="image-view-overlay" className="fixed inset-0 bg-black/85 flex items-center justify-center z-55 p-4 animate-fade-in" onClick={() => setTargetProofImage(null)}>
          <div className="relative bg-white rounded-3xl p-3 max-w-sm w-full shadow-2xl flex flex-col gap-2 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center text-xs font-sans font-bold border-b pb-1">
              <span>Photo - Preuve d'Envoi client</span>
              <button id="close-image-viewer" className="p-1 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full" onClick={() => setTargetProofImage(null)}>✕</button>
            </div>
            <img src={targetProofImage} alt="Validation du dépôt" className="max-h-[60vh] max-w-full rounded-2xl object-contain border bg-slate-50" />
            <p className="text-xxs text-slate-500 font-sans mt-1">Cliquez sur FERMER ou à l'extérieur pour retourner au tableau de bord.</p>
          </div>
        </div>
      )}

      {/* ======================= CREATE NEW PRODUCT DIALOG ======================= */}
      {showNewProductModal && (
        <div id="newproduct-modal-overlay" className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">
            <div className="p-4 border-b border-emerald-50 flex justify-between items-center bg-emerald-500/5">
              <h3 className="font-sans font-bold text-slate-800 text-sm">
                Ajouter une Nouvelle Variété au Catalogue
              </h3>
              <button
                id="close-newproduct-modal"
                onClick={() => setShowNewProductModal(false)}
                className="p-1 px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">Nom de la Culture</label>
                <input
                  id="new-prod-name"
                  type="text"
                  required
                  placeholder="Ex: Hévéa Premium de San-Pédro"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-sans text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">Catégorie Verticale</label>
                <select
                  id="new-prod-cat"
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs font-sans text-slate-700 outline-none"
                >
                  <option value="BIEN-ÊTRE">BIEN-ÊTRE (3-30 jours, élevages de proximité)</option>
                  <option value="ACTIVITÉS">ACTIVITÉS (3-30 jours, machineries et équipement)</option>
                  <option value="STABILITÉ">STABILITÉ (Cycles longs, capital verrouillé)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 font-sans">Prix (FCFA)</label>
                  <input
                    id="new-prod-price"
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border rounded-xl px-2 py-1.5 text-xs text-slate-705 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-sans">Durée (Jours)</label>
                  <input
                    id="new-prod-duration"
                    type="number"
                    required
                    value={newProdDuration}
                    onChange={(e) => setNewProdDuration(Number(e.target.value))}
                    className="w-full bg-slate-50 border rounded-xl px-2 py-1.5 text-xs text-slate-705 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-sans">Revenu (FCFA)</label>
                  <input
                    id="new-prod-revenue"
                    type="number"
                    required
                    value={newProdRevenue}
                    onChange={(e) => setNewProdRevenue(Number(e.target.value))}
                    className="w-full bg-slate-50 border rounded-xl px-2 py-1.5 text-xs text-slate-705 font-bold text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">Choix d'Icône Visuelle</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { val: 'Sprout', label: '🌱 Sprout' },
                    { val: 'TreeDeciduous', label: '🌳 Verger' },
                    { val: 'Leaf', label: '🍃 Leaf' },
                    { val: 'Egg', label: '🥚 Volaille' },
                    { val: 'Apple', label: '🍏 Fruit' },
                    { val: 'Waves', label: '🌊 Riz' },
                    { val: 'Settings', label: '⚙️ Outils' },
                    { val: 'Sun', label: '☀️ Forage' },
                  ].map((icOption) => (
                    <button
                      id={`icon-choice-${icOption.val}`}
                      key={icOption.val}
                      type="button"
                      onClick={() => setNewProdIcon(icOption.val)}
                      className={`py-1 text-[10px] font-sans border rounded-lg transition-colors ${
                        newProdIcon === icOption.val
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                          : 'bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {icOption.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">Description de la culture</label>
                <textarea
                  id="new-prod-desc"
                  rows={2}
                  placeholder="Expliquez brièvement le projet agricole..."
                  value={newProdDescription}
                  onChange={(e) => setNewProdDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-sans text-slate-700 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 text-center pt-2">
                <button
                  id="newprod-cancel-btn"
                  type="button"
                  onClick={() => setShowNewProductModal(false)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-sans font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  id="newprod-submit-btn"
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-sans font-bold shadow-md transition-colors"
                >
                  Ajouter Culture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
