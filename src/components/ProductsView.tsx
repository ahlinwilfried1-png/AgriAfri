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
  ArrowLeft,
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

interface ProductsViewProps {
  setActiveTab?: (tab: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({ setActiveTab }) => {
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
    <div id="products-view-container" className="animate-fade-in flex flex-col pb-24 h-full">
      {/* 🔵 BLUE PRODUCT VIEW HEADER (IMAGE 2 DESIGN) */}
      <div className="bg-[#1b63eb] text-white -mx-4 -mt-4 px-4 py-3.5 mb-4 flex items-center justify-between shadow-md">
        <button
          onClick={() => {
            if (setActiveTab) {
              setActiveTab('accueil');
            } else {
              window.history.back();
            }
          }}
          className="p-1 text-white hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <span className="font-sans font-black text-sm tracking-wide">
          Liste d'investissement
        </span>
        <div className="w-5 h-5" /> {/* Empty buffer to balance */}
      </div>

      <div className="flex gap-3 items-start h-full">
        {/* 📋 LEFT SIDEBAR NAVIGATION CATEGORIES (STABLE, BIEN-ÊTRE, ACTIVITÉ) */}
        <div className="w-[85px] shrink-0 flex flex-col gap-2.5 bg-white/70 backdrop-blur-md p-1.5 py-3 rounded-2xl border border-white/40 shadow-2xs">
          {(['STABILITÉ', 'BIEN-ÊTRE', 'ACTIVITÉS'] as ProductCategory[]).map((cat) => {
            const isActive = activeCategory === cat;
            let iconLabel = "Stable";
            let IconEmoji = "⚡";
            if (cat === 'BIEN-ÊTRE') {
              iconLabel = "Bien-être";
              IconEmoji = "🎁";
            } else if (cat === 'ACTIVITÉS') {
              iconLabel = "Activité";
              IconEmoji = "🔥";
            }

            return (
              <button
                id={`filter-cat-${cat}`}
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#1b63eb] text-white shadow-sm scale-102'
                    : 'bg-transparent text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span className="text-lg leading-none mb-1">{IconEmoji}</span>
                <span className="text-[10px] font-sans font-black tracking-tight text-center truncate w-full">
                  {iconLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* 📚 RIGHT CONTENT LIST OF DETAILED PRODUCT CARDS */}
        <div className="flex-1 space-y-4 max-h-[700px] overflow-y-auto pr-0.5 scrollbar-none">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border border-slate-150 text-slate-400">
              <p className="text-xs font-sans">Aucun produit actif disponible.</p>
            </div>
          ) : (
            filteredProducts.map((prod) => {
              const isPurchased = investments.some((i) => i.productId === prod.id && i.userId === currentUser?.id && i.status === 'ACTIVE');
              const dailyRev = Math.round(prod.totalRevenue / prod.durationDays);
              const productImage = getProductRealImage(prod.name, prod.image);

              return (
                <div
                  id={`product-card-${prod.id}`}
                  key={prod.id}
                  className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xs hover:border-[#1b63eb] transition-all duration-150 flex flex-col"
                >
                  {/* Agricultural Category/Harvest Cover Image at top of card */}
                  <div className="w-full h-32 relative bg-slate-155 overflow-hidden">
                    <img 
                      src={productImage} 
                      alt={prod.name} 
                      className="w-full h-full object-cover animate-fade-in"
                      referrerPolicy="no-referrer"
                    />
                    {/* Floating dark agricultural text overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                      <div className="w-full flex justify-between items-center">
                        <span className="text-[10px] font-sans font-black text-emerald-300 uppercase tracking-widest bg-black/45 px-2 py-0.5 rounded-md">
                          💎 {prod.category}
                        </span>
                        <span className="text-[9px] font-sans font-bold text-white bg-emerald-600/90 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          AGRO RÉCOLTE
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Title and stats layout */}
                  <div className="p-3.5 space-y-2.5">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-sans font-black text-[#2a3042] text-xs uppercase tracking-wide">
                        {prod.name}
                      </h4>
                      <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping-once" />
                    </div>

                    {/* Table-like statistics checklist */}
                    <div className="space-y-1.5 border-t border-b border-dashed border-slate-100 py-2.5 text-xs text-slate-600">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-sans font-bold text-slate-400">Prix unitaire</span>
                        <span className="text-xs font-mono font-black text-rose-600">
                          FCFA {prod.price.toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-sans font-bold text-slate-400">Durée</span>
                        <span className="text-xs font-sans font-bold text-slate-800">
                          {prod.durationDays} Jours
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-sans font-bold text-slate-400">Revenus quotidiens</span>
                        <span className="text-xs font-sans font-bold text-slate-800">
                          FCFA {dailyRev.toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-sans font-bold text-slate-400">Revenu total</span>
                        <span className="text-xs font-sans font-bold text-slate-800">
                          FCFA {prod.totalRevenue.toLocaleString('fr-FR')}
                        </span>
                      </div>
                    </div>

                    {/* Crowdfunding micro progress and slots indicator */}
                    <div className="space-y-1 text-left font-sans">
                      <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                        <span>Financement du Projet</span>
                        <span className="text-emerald-600 font-extrabold">{45 + (prod.name.charCodeAt(0) % 50)}% Collecté</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full" 
                          style={{ width: `${45 + (prod.name.charCodeAt(0) % 50)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[9px] mt-0.5">
                        <span className="text-amber-600 font-extrabold bg-amber-50 px-1.5 py-0.5 rounded-sm uppercase">
                          ⚡ {3 + (prod.name.charCodeAt(1) % 15)} Parts Restantes
                        </span>
                        <span className="text-slate-400 font-semibold flex items-center gap-0.5">
                          🛡️ Garantie Récolte
                        </span>
                      </div>
                    </div>

                    {/* Bottom layout pill button */}
                    <button
                      id={`btn-invest-prod-${prod.id}`}
                      onClick={() => handleInvestClick(prod)}
                      className="w-full py-2.5 bg-[#1b63eb] hover:bg-blue-700 active:scale-98 transition-all text-white font-sans font-black text-xs uppercase tracking-wider rounded-3xl flex items-center justify-center gap-2 select-none shadow-xs cursor-pointer mt-1"
                    >
                      Investir maintenant
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>
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
