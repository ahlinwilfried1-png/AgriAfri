/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product, ProductCategory, checkProductOpen } from '../types';
import {
  Sprout,
  CheckCircle,
  HelpCircle,
  X,
  Lock,
  Calendar,
  Layers,
  Sparkles,
  TreeDeciduous,
  Droplet,
  Leaf,
  Egg,
  Apple,
  Waves,
  Settings,
  Home,
  Database,
  Sun,
  ShieldCheck,
} from 'lucide-react';

// Help helper to match dynamic icons
const renderProductIcon = (iconName: string, category: ProductCategory) => {
  const cn = `w-6 h-6 ${
    category === 'STABILITÉ' 
      ? 'text-emerald-700' 
      : category === 'BIEN-ÊTRE' 
      ? 'text-rose-600' 
      : 'text-amber-600'
  }`;

  switch (iconName) {
    case 'Sprout': return <Sprout className={cn} />;
    case 'TreeDeciduous': return <TreeDeciduous className={cn} />;
    case 'Droplet': return <Droplet className={cn} />;
    case 'Leaf': return <Leaf className={cn} />;
    case 'Egg': return <Egg className={cn} />;
    case 'Apple': return <Apple className={cn} />;
    case 'Waves': return <Waves className={cn} />;
    case 'Settings': return <Settings className={cn} />;
    case 'Home': return <Home className={cn} />;
    case 'Database': return <Database className={cn} />;
    case 'Sun': return <Sun className={cn} />;
    default: return <Sprout className={cn} />;
  }
};

export const ProductsView: React.FC = () => {
  const { products, currentUser, investInProduct, investments, settings } = useApp();
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('STABILITÉ');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      if (settings?.simulatedTime) {
        setCurrentTime(settings.simulatedTime);
        return;
      }
      const now = new Date();
      setCurrentTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 4000);
    return () => clearInterval(interval);
  }, [settings?.simulatedTime]);

  const isRuleActive = settings?.requireStabilityToUnlockOthers ?? false;
  const hasActiveStability = currentUser
    ? investments.some((inv) => inv.userId === currentUser.id && inv.category === 'STABILITÉ' && inv.status === 'ACTIVE')
    : false;

  // We no longer lock any categories visually. They remain fully visible and open.
  const isCategoryLocked = (cat: ProductCategory) => {
    return false;
  };

  // Filter products by selected vertical category
  const filteredProducts = products.filter((p) => p.category === activeCategory && p.active);

  // Helper date calculation
  const getEndDateStr = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleInvestClick = (prod: Product) => {
    if (isRuleActive && prod.category !== 'STABILITÉ' && !hasActiveStability) {
      alert("Veuillez d'abord activer un produit de la catégorie Stabilité pour continuer.");
      return;
    }
    if (prod.category !== 'STABILITÉ') {
      const liveTimeStr = settings?.simulatedTime && settings.simulatedTime.trim() !== ''
        ? settings.simulatedTime.trim()
        : new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const status = checkProductOpen(prod, liveTimeStr);
      if (!status.isOpen) {
        alert(status.reason);
        return;
      }
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setSelectedProduct(prod);
  };

  const handleInvestSubmit = () => {
    if (!selectedProduct) return;
    setSuccessMessage(null);
    setErrorMessage(null);

    const res = investInProduct(selectedProduct.id);
    if (res.success) {
      setSuccessMessage('Félicitations ! Votre investissement a été validé.');
      setTimeout(() => {
        setSelectedProduct(null);
        setSuccessMessage(null);
      }, 2500);
    } else {
      setErrorMessage(res.message);
    }
  };

  // Modern cover themes for representation
  const getCoverGradient = (prodId: string, category: ProductCategory) => {
    if (category === 'STABILITÉ') {
      return 'from-emerald-500 via-teal-600 to-emerald-800';
    } else if (category === 'BIEN-ÊTRE') {
      return 'from-rose-450 via-pink-500 to-rose-600';
    } else {
      return 'from-amber-450 via-orange-500 to-amber-600';
    }
  };

  const selectCategory = (catId: ProductCategory) => {
    setActiveCategory(catId);
  };

  const getCategoryDetails = (catId: ProductCategory) => {
    switch (catId) {
      case 'STABILITÉ':
        return {
          title: '🌱 Cycle Stabilité d\'AgriAfri',
          desc: 'Le capital de cet investissement est bloqué durant tout le cycle de développement agricole. Aucun retrait anticipé n\'est possible.',
          badge: '💡 RENTABILITÉ MAXIMALE : Capital + bénéfices redistribués en intégralité le dernier jour.',
          themeColor: 'emerald',
          bgHeader: 'bg-emerald-50 text-emerald-800 border-emerald-100',
        };
      case 'BIEN-ÊTRE':
        return {
          title: '❤️ Cycle Bien-être (Proximité)',
          desc: 'Produits à cycles d\'exploitation rapides de proximité. Financement de projets d\'élevage de volailles et cultures maraîchères.',
          badge: '🔄 RÉINVESTISSEMENT REQUIS : Achat d\'un nouveau produit requis pour relancer un cycle.',
          themeColor: 'rose',
          bgHeader: 'bg-rose-50 text-rose-800 border-rose-100',
        };
      case 'ACTIVITÉS':
        return {
          title: '🚜 Secteur Activités Mécaniques',
          desc: 'Financement direct d\'outillage et équipements agricoles lourds (Tracteurs, Serres irriguées, Hydro-forages) en cycles programmés.',
          badge: '📈 OPTION DE RECOUPREMENT : Retours d\'intérêts versés de façon automatique à la clôture.',
          themeColor: 'amber',
          bgHeader: 'bg-amber-50 text-amber-800 border-amber-100',
        };
    }
  };

  return (
    <div id="products-view-container" className="animate-fade-in space-y-7 pb-24">
      
      {/* 🏷️ VERTICAL PREMIUM ONGLETS / SELECTION MENUS */}
      <div className="bg-white border border-slate-200/70 rounded-3xl p-4.5 shadow-2xs space-y-2.5">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold text-center block">
          Catégories Verticaux d'Investissement
        </p>
        <div className="flex flex-col gap-2">
          {[
            { id: 'STABILITÉ', label: 'Stabilité 🌱', desc: 'Cycles longs (Forts Rendements)' },
            { id: 'BIEN-ÊTRE', label: 'Bien-être ❤️', desc: 'Cycles courts (Maraîcher, Élevage)' },
            { id: 'ACTIVITÉS', label: 'Activités 🚜', desc: 'Machineries & Outillages' },
          ].map((item) => {
            const isActive = activeCategory === item.id;
            const locked = isCategoryLocked(item.id as ProductCategory);
            return (
              <button
                id={`filter-cat-${item.id}`}
                key={item.id}
                onClick={() => selectCategory(item.id as ProductCategory)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none text-left ${
                  isActive
                    ? item.id === 'STABILITÉ'
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md font-bold'
                      : item.id === 'BIEN-ÊTRE'
                      ? 'bg-rose-600 border-rose-600 text-white shadow-md font-bold'
                      : 'bg-amber-600 border-amber-600 text-white shadow-md font-bold'
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-205 text-slate-705'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-display text-xs font-black tracking-wide block uppercase flex items-center gap-1.5">
                    {item.label}
                    {locked && (
                      <span className="text-[9px] bg-rose-500/15 text-rose-650 px-1.5 py-0.5 rounded-md border border-rose-500/20 font-black">
                        🔒 VERROUILLÉ
                      </span>
                    )}
                  </span>
                  <span className={`text-[9px] mt-0.5 leading-tight ${isActive ? 'text-white/80' : 'text-slate-405'}`}>
                    {item.desc}
                  </span>
                </div>
                <span className="text-xs font-bold leading-none select-none">
                  {locked ? (
                    <span className="text-[10px] uppercase font-black text-rose-600 bg-rose-100/50 px-2 py-1 rounded-md">Verrouillé</span>
                  ) : isActive ? (
                    '● Actif'
                  ) : (
                    '○ Choisir'
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 📚 EXPOSÉ UNIQUE DE LA CATÉGORIE EN SENS VERTICAL (Séparé "à part") */}
      <div className="space-y-6">
        {(() => {
          const catId = activeCategory;
          const catDetails = getCategoryDetails(catId);
          const catProducts = products.filter((p) => p.category === catId && p.active);
          const lockedCategory = isCategoryLocked(catId);

          return (
            <div
              id={`section-cat-${catId}`}
              className="space-y-4 animate-fade-in"
            >
              {/* Lock Alert Box */}
              {lockedCategory && (
                <div id="stability-lock-alert" className="bg-rose-50/70 border border-rose-200 rounded-3xl p-5 flex items-start gap-3.5 shadow-2xs">
                  <div className="p-2 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
                    <Lock className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-xs font-sans font-black text-rose-900 uppercase tracking-widest">
                      🔒 Accès verrouillé
                    </h4>
                    <p className="text-xs font-sans font-medium text-rose-700 leading-relaxed mt-1">
                      Vous devez obligatoirement activer un produit de la catégorie Stabilité avant d'accéder aux produits Bien-être et Activités.
                    </p>
                  </div>
                </div>
              )}

              {/* Category Info Frame Block */}
              <div className="bg-white border border-slate-205 rounded-3xl p-5 shadow-2xs space-y-2">
                <h3 className="font-display font-black text-slate-800 text-sm tracking-tight uppercase flex items-center gap-1">
                  {catDetails.title}
                </h3>
                <p className="font-sans text-xs text-slate-500 leading-relaxed">
                  {catDetails.desc}
                </p>
                <div className={`text-[10px] py-1.5 px-3 rounded-xl font-sans font-bold border ${catDetails.bgHeader}`}>
                  {catDetails.badge}
                </div>
              </div>

              {/* Products List inside Category (VERTIQUEMENT - 1 seul produit par ligne) */}
              <div className="space-y-4">
                {catProducts.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-3xl border border-slate-100 text-slate-400">
                    <p className="text-xs font-sans">Aucun produit actif disponible dans la catégorie {catId} actuellement.</p>
                  </div>
                ) : (
                  catProducts.map((prod) => (
                    <div
                      id={`product-card-${prod.id}`}
                      key={prod.id}
                      className="bg-white border rounded-3xl overflow-hidden shadow-2xs transition-all duration-300 flex flex-col md:flex-row md:items-stretch border-slate-200/80 hover:border-emerald-500 hover:shadow-xs"
                    >
                      {/* Product Visual Area Header (left side on desktop, top on mobile) */}
                      <div className={`relative h-32 md:h-auto md:w-56 bg-gradient-to-br ${getCoverGradient(prod.id, prod.category)} flex flex-col justify-end p-4 text-white overflow-hidden shrink-0`}>
                        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                        <div className="absolute bottom-2 right-4 p-2 bg-white/20 backdrop-blur-md rounded-2xl border border-white/25">
                          {renderProductIcon(prod.iconName, prod.category)}
                        </div>
                        
                        {/* Category Tag */}
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 text-[8px] tracking-wider font-extrabold bg-black/35 backdrop-blur-md uppercase rounded-full">
                          {prod.category}
                        </span>
                        
                        {/* Cultivation Title */}
                        <h4 className="font-display font-black text-white text-base tracking-tight leading-tight filter drop-shadow-md pr-12">
                          {prod.name}
                        </h4>
                      </div>

                      {/* Info & Action area (expanded to the right) */}
                      <div className="flex-1 p-5 flex flex-col justify-between gap-4">
                        <div className="space-y-3">
                          <p className="text-xs text-slate-500 font-sans leading-relaxed">
                            {prod.description || 'Projet d’investissement agricole de premier choix, optimisé pour un rendement maximum et un développement local durable.'}
                          </p>

                          <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-100 p-2 rounded-2xl">
                            <div className="text-center border-r border-slate-200/50">
                              <p className="text-[9px] text-slate-400 uppercase font-sans tracking-wide">Prix d'entrée</p>
                              <p className="text-sm font-black text-slate-800 font-mono mt-0.5">
                                {prod.price.toLocaleString()} FCFA
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-[9px] text-slate-400 uppercase font-sans tracking-wide">Durée de cycle</p>
                              <p className="text-sm font-black text-slate-800 font-sans mt-0.5">
                                {prod.durationDays} Jours
                              </p>
                            </div>
                          </div>

                          <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-2xl flex items-center justify-between text-xs font-sans">
                            <span className="text-emerald-800 font-extrabold uppercase text-[10px]">Revenu Total Prévu</span>
                            <strong className="text-emerald-700 text-sm font-black font-mono">
                              {prod.totalRevenue.toLocaleString()} FCFA
                            </strong>
                          </div>
                        </div>

                        {/* Invest Footer Controls */}
                        <div className="border-t border-slate-50 pt-3 flex flex-col gap-2 mt-auto">
                          {prod.category !== 'STABILITÉ' && (() => {
                            const liveTimeStr = settings?.simulatedTime && settings.simulatedTime.trim() !== ''
                              ? settings.simulatedTime.trim()
                              : new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                            const status = checkProductOpen(prod, liveTimeStr);
                            return (
                              <div className={`text-[10px] py-1 px-2.5 rounded-xl font-sans font-bold flex items-center justify-between border ${
                                status.isOpen 
                                  ? 'bg-emerald-55 border-emerald-100/50 text-emerald-800' 
                                  : 'bg-rose-50 border-rose-100 text-rose-800'
                              }`}>
                                <span className="flex items-center gap-1">
                                  <span className={`w-1.5 h-1.5 rounded-full ${status.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                  Période de vente :
                                </span>
                                <span className={status.isOpen ? 'text-emerald-700' : 'text-rose-700'}>
                                  {status.isOpen ? 'Ouvert ' + (prod.closingTime ? `(ferme à ${prod.closingTime})` : prod.availabilityDurationMinutes ? `(ferme sous ${prod.availabilityDurationMinutes} min)` : '') : status.reason}
                                </span>
                              </div>
                            );
                          })()}

                          <div className="flex items-center justify-between gap-1.5">
                            <div className="text-left">
                              <p className="text-[8px] text-slate-400 font-sans font-bold uppercase">BÉNÉFICE NET</p>
                              <p className="text-[11px] font-black font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100/30">
                                +{(prod.totalRevenue - prod.price).toLocaleString()} FCFA
                              </p>
                            </div>
                            <button
                              id={`btn-invest-prod-${prod.id}`}
                              onClick={() => handleInvestClick(prod)}
                              className={`py-2 px-6 select-none shrink-0 font-sans font-extrabold text-xs rounded-xl flex items-center justify-center transition-all shadow-xs text-white cursor-pointer ${
                                prod.category === 'STABILITÉ'
                                  ? 'bg-emerald-600 hover:bg-emerald-700'
                                  : prod.category === 'BIEN-ÊTRE'
                                  ? 'bg-rose-600 hover:bg-rose-700'
                                  : 'bg-amber-600 hover:bg-amber-700'
                              }`}
                            >
                              Investir
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* INVESTMENT CONFIRMATION MODAL */}
      {selectedProduct && (
        <div id="invest-confirm-modal-overlay" className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">
            
            {/* Modal Header */}
            <div className={`p-4 border-b flex justify-between items-center ${
              selectedProduct.category === 'STABILITÉ'
                ? 'bg-emerald-500/5 border-emerald-50'
                : selectedProduct.category === 'BIEN-ÊTRE'
                ? 'bg-rose-500/5 border-rose-50'
                : 'bg-amber-500/5 border-amber-50'
            }`}>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                <h3 className="font-sans font-extrabold text-slate-800 text-sm">
                  Confirmer l'Investissement
                </h3>
              </div>
              <button
                id="close-invest-modal"
                onClick={() => setSelectedProduct(null)}
                className="p-1 px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="text-center pb-2 border-b border-dashed border-slate-100">
                <p className="text-[10px] font-sans text-slate-400 capitalize">PRODUIT SÉLECTIONNÉ</p>
                <h4 className="font-sans font-extrabold text-slate-800 text-md mt-0.5">
                  {selectedProduct.name}
                </h4>
              </div>

              {/* Data Rows */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-slate-400">Capital Requis :</span>
                  <span className="font-extrabold text-slate-800">{selectedProduct.price.toLocaleString()} FCFA</span>
                </div>

                <div className="flex justify-between text-xs font-sans">
                  <span className="text-slate-400">Durée du Cycle :</span>
                  <span className="font-bold text-slate-700">{selectedProduct.durationDays} Jours</span>
                </div>

                <div className="flex justify-between text-xs font-sans">
                  <span className="text-slate-400">Date Estimée de Fin :</span>
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 inline" />
                    {getEndDateStr(selectedProduct.durationDays)}
                  </span>
                </div>

                <div className="flex justify-between text-xs font-sans bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/20">
                  <span className="text-emerald-800 font-semibold">Revenu de Récolte :</span>
                  <span className="font-extrabold text-emerald-700">{selectedProduct.totalRevenue.toLocaleString()} FCFA</span>
                </div>

                <div className="flex justify-between text-xs font-sans bg-amber-50/50 p-2 rounded-xl border border-amber-100/20">
                  <span className="text-amber-800 font-semibold">Bénéfice Net :</span>
                  <span className="font-extrabold text-amber-600">
                    +{(selectedProduct.totalRevenue - selectedProduct.price).toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              {/* Category Safeguard */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-2 text-[10px] leading-relaxed text-slate-500 font-sans">
                <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  {selectedProduct.category === 'STABILITÉ' ? (
                    <span>
                      <strong>Verrouillage Stabilité</strong> : Les fonds sont engagés sur une période ferme de {selectedProduct.durationDays} jours. Aucun remboursement anticipé n'est permis.
                    </span>
                  ) : (
                    <span>
                      Le capital et l'intérêt accumulés seront automatiquement renvoyés sur votre compte principal le jour de récolte.
                    </span>
                  )}
                </div>
              </div>

              {/* Feedback Alert Messages */}
              {errorMessage && (
                <p id="invest-error-alert" className="text-xs bg-red-50 border border-red-100 text-red-700 p-2.5 rounded-xl text-center leading-relaxed">
                  ⚠️ {errorMessage}
                </p>
              )}

              {successMessage && (
                <div id="invest-success-alert" className="text-xs bg-emerald-50 border border-emerald-100 text-emerald-800 p-2.5 rounded-xl text-center flex flex-col items-center gap-1.5">
                  <CheckCircle className="w-5 h-5 text-emerald-600 animate-bounce" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Action buttons */}
              {!successMessage && (
                <div className="flex gap-2">
                  <button
                    id="invest-cancel-btn"
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-sans font-semibold transition-colors"
                  >
                    Fermer
                  </button>
                  <button
                    id="invest-confirm-btn"
                    onClick={handleInvestSubmit}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-sans font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Démarer le cycle
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
