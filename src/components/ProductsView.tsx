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

// Helper function to resolve real professional photos for agricultural and farming products
export const getProductRealImage = (name: string, defaultImage?: string): string => {
  const norm = name.toLowerCase();
  if (norm.includes('mangue') || norm.includes('mango')) {
    return '/src/assets/images/mango_plantation_crop_1781088500216.png';
  }
  if (norm.includes('maïs') || norm.includes('mais') || norm.includes('corn')) {
    return '/src/assets/images/corn_field_gold_1781088517399.png';
  }
  if (norm.includes('poulet') || norm.includes('chicken') || norm.includes('volaille') || norm.includes('poultry') || norm.includes('egg')) {
    return '/src/assets/images/poultry_breeding_1781087460448.png';
  }
  if (norm.includes('cacao') || norm.includes('cocoa')) {
    return '/src/assets/images/cacao_ivory_coast_1781087425613.png';
  }
  if (norm.includes('anacarde') || norm.includes('cashew')) {
    return '/src/assets/images/anacarde_orchard_1781087442993.png';
  }
  if (norm.includes('solar') || norm.includes('solaire') || norm.includes('pompe') || norm.includes('irrigation') || norm.includes('forage')) {
    return '/src/assets/images/solar_forage_1781087475485.png';
  }
  if (norm.includes('hévéa') || norm.includes('hevea') || norm.includes('rubber') || norm.includes('latex')) {
    return 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=600';
  }
  if (norm.includes('tomate') || norm.includes('tomato')) {
    return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600';
  }
  if (norm.includes('banane') || norm.includes('banana') || norm.includes('plantain')) {
    return 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&q=80&w=600';
  }
  if (norm.includes('riz') || norm.includes('rice')) {
    return 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=600';
  }
  if (norm.includes('serre') || norm.includes('greenhouse')) {
    return 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=600';
  }
  if (norm.includes('silo') || norm.includes('entrepôt') || norm.includes('storage')) {
    return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600';
  }
  if (norm.includes('motoculteur') || norm.includes('tracteur') || norm.includes('settings') || norm.includes('mecanic') || norm.includes('mécanisation')) {
    return 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=600';
  }
  return defaultImage || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600';
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
      setSuccessMessage('✅ Achat réussi');
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
          bgHeader: 'bg-amber-50 text-amber-805 border-amber-100',
        };
    }
  };

  return (
    <div id="products-view-container" className="animate-fade-in space-y-5 pb-24">
      
      {/* 🏷️ HORIZONTAL PREMIUM ONGLETS / SELECTION MENUS */}
      <div className="bg-[#eceff3] p-1.5 rounded-2xl flex gap-1.5 shadow-2xs">
        {(['STABILITÉ', 'BIEN-ÊTRE', 'ACTIVITÉS'] as ProductCategory[]).map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              id={`filter-cat-${cat}`}
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-1 py-2.5 text-center text-[11px] font-sans font-black tracking-wider uppercase rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0f62fe] text-white shadow-sm'
                  : 'text-[#4e5d78] hover:text-slate-800'
              }`}
            >
              {cat === 'STABILITÉ' ? 'Stabilité' : cat === 'BIEN-ÊTRE' ? 'Bien-être' : 'Activités'}
            </button>
          );
        })}
      </div>

      {/* 📚 EXPOSÉ UNIQUE DE LA CATÉGORIE EN SENS VERTICAL */}
      <div className="space-y-4">
        {(() => {
          const catId = activeCategory;
          const catDetails = getCategoryDetails(catId);
          const catProducts = products.filter((p) => p.category === catId && p.active);

          return (
            <div id={`section-cat-${catId}`} className="space-y-4 animate-fade-in">
              
              {/* Category Info Banner */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-1">
                <h3 className="font-sans font-black text-[#2a324b] text-xs uppercase tracking-wide">
                  {catDetails.title}
                </h3>
                <p className="font-sans text-[10px] text-slate-400 font-semibold leading-relaxed">
                  {catDetails.desc}
                </p>
                <div className="text-[9px] text-[#0f62fe] font-sans font-bold uppercase tracking-wider pt-1">
                  💡 {catDetails.badge}
                </div>
              </div>

              {/* Products List inside Category (horizontal cards with images left, stats right) */}
              <div className="space-y-4">
                {catProducts.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-3xl border border-slate-100 text-slate-400">
                    <p className="text-xs font-sans">Aucun produit actif disponible actuellement.</p>
                  </div>
                ) : (
                  catProducts.map((prod) => {
                    const isPurchased = investments.some((i) => i.productId === prod.id && i.userId === currentUser?.id && i.status === 'ACTIVE');
                    const realImg = getProductRealImage(prod.name, prod.image);
                    const dailyRev = Math.round(prod.totalRevenue / prod.durationDays);

                    return (
                      <div
                        id={`product-card-${prod.id}`}
                        key={prod.id}
                        className="bg-white border border-slate-200/70 rounded-3xl overflow-hidden shadow-xs hover:border-[#0f62fe] transition-all duration-200"
                      >
                        {/* Title bar of product card */}
                        <div className="bg-slate-50/80 px-4.5 py-3 border-b border-slate-100 flex justify-between items-center">
                          <h4 className="font-sans font-black text-slate-800 text-xs sm:text-sm uppercase tracking-wide">
                            {prod.name}
                          </h4>
                          <span className="text-[9px] font-sans font-bold bg-[#ccd5fe] text-[#3b52d9] px-2.2 py-0.5 rounded-full select-none">
                            {prod.category}
                          </span>
                        </div>

                        {/* Card body content with direct stats layout */}
                        <div className="p-4 flex gap-4 items-start">
                          {/* Left product image with aspect-square preview */}
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/40 relative">
                            {realImg ? (
                              <img 
                                src={realImg} 
                                alt={prod.name} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-br ${getCoverGradient(prod.id, prod.category)}`} />
                            )}
                          </div>

                          {/* Right product financials table list */}
                          <div className="flex-1 space-y-1 text-slate-700">
                            <div className="flex justify-between items-center pb-1 border-b border-dashed border-slate-100">
                              <span className="text-[10px] font-sans font-bold text-slate-400">Prix du produit :</span>
                              <span className="text-xs font-black font-mono text-slate-800">{prod.price.toLocaleString()} FCFA</span>
                            </div>
                            <div className="flex justify-between items-center pb-1 border-b border-dashed border-slate-100">
                              <span className="text-[10px] font-sans font-bold text-slate-400">Revenu quotidien :</span>
                              <span className="text-xs font-black font-mono text-emerald-600">+{dailyRev.toLocaleString()} FCFA/Jour</span>
                            </div>
                            <div className="flex justify-between items-center pb-1 border-b border-dashed border-slate-100">
                              <span className="text-[10px] font-sans font-bold text-slate-400">Revenu total :</span>
                              <span className="text-xs font-black font-mono text-emerald-600">+{prod.totalRevenue.toLocaleString()} FCFA</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-sans font-bold text-slate-400">Cycle de retour :</span>
                              <span className="text-xs font-black font-sans text-slate-850">{prod.durationDays} Jours</span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom action bar inside product card */}
                        <div className="px-4 pb-4.5 space-y-2">
                          {/* Achat alert feedback bar */}
                          {isPurchased && (
                            <div className="text-[9px] py-1 px-3 rounded-lg font-sans font-bold bg-emerald-50 border border-emerald-100 text-emerald-850 text-center uppercase tracking-wide leading-none">
                              ✓ Achat réussi ! Producteur actif
                            </div>
                          )}

                          {/* Unlock rules blocker */}
                          {isRuleActive && prod.category !== 'STABILITÉ' && !hasActiveStability && (
                            <div className="text-[9px] py-1 px-3 rounded-lg font-sans font-extrabold bg-rose-50 border border-rose-100 text-rose-800 text-center uppercase tracking-wider animate-pulse leading-none">
                              ⚠️ Stabilité requise pour débloquer
                            </div>
                          )}

                          <div className="flex justify-between items-center gap-2">
                            {/* Open and closed hour label */}
                            {prod.category !== 'STABILITÉ' && (() => {
                              const liveTimeStr = settings?.simulatedTime && settings.simulatedTime.trim() !== ''
                                ? settings.simulatedTime.trim()
                                : new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                              const status = checkProductOpen(prod, liveTimeStr);
                              return (
                                <span className="text-[9px] font-bold font-sans text-slate-400 flex items-center gap-1">
                                  <span className={`w-1.5 h-1.5 rounded-full ${status.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-450'}`} />
                                  {status.isOpen ? 'Disponible' : 'Indisponible'}
                                </span>
                              );
                            })()}

                            <button
                              id={`btn-invest-prod-${prod.id}`}
                              onClick={() => handleInvestClick(prod)}
                              disabled={isRuleActive && prod.category !== 'STABILITÉ' && !hasActiveStability}
                              className={`ml-auto px-6 py-2 rounded-3xl text-xs font-sans font-black uppercase tracking-wider select-none shrink-0 transition-colors shadow-xs ${
                                isRuleActive && prod.category !== 'STABILITÉ' && !hasActiveStability
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                  : 'bg-[#9c2b2b] hover:bg-[#b03030] text-white cursor-pointer'
                              }`}
                            >
                              Acheter
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })
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
