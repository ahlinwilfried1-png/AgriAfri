/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { ProductsView } from './components/ProductsView';
import { ReviewsView } from './components/ReviewsView';
import { ProfileView } from './components/ProfileView';
import { AdminPanel } from './components/AdminPanel';
import { AuthScreens } from './components/AuthScreens';
import { OtpBanner } from './components/OtpBanner';
import { Shield, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';

function AppContent() {
  const { currentUser, logoutUser } = useApp();
  const [activeTab, setActiveTab] = useState<string>('accueil');
  const [isAdminView, setIsAdminView] = useState<boolean>(false);

  // If user is logged out, show register/login flows immediately
  if (!currentUser) {
    return (
      <div id="app-viewport-auth" className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4">
        <div className="w-full max-w-md min-h-screen sm:min-h-[850px] bg-slate-50 sm:rounded-[36px] sm:shadow-2xl overflow-hidden flex flex-col border border-slate-200/30">
          <AuthScreens onSuccess={() => setActiveTab('accueil')} />
        </div>
      </div>
    );
  }

  // Admin and normal user main hub
  return (
    <div id="app-viewport-main" className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4">
      {/* Dynamic Simulated Smartphone Device Frame Container */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[850px] bg-slate-50 sm:rounded-[36px] sm:shadow-2xl overflow-hidden flex flex-col relative border border-slate-200/30">
        
        {/* Floating SMS network simulator notification toast */}
        <OtpBanner />

        {/* Brand Application Sticky Header */}
        <Header
          isAdminView={isAdminView}
          setIsAdminView={setIsAdminView}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsAdminView(false); // Disable admin overlay view when navigating
          }}
        />

        {/* Dynamic Client view pages */}
        <main className="flex-1 overflow-y-auto px-4 pt-5 pb-20 scrollbar-none">
          
          {/* If Admin view is toggled, override client tabs */}
          {isAdminView ? (
            <div className="animate-fade-in space-y-4">
              {/* Back to client button indicator */}
              <button
                id="back-to-client-portal"
                onClick={() => setIsAdminView(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-250 text-slate-800 rounded-xl font-sans text-xs font-bold transition-all flex items-center gap-1.5"
                title="Retourner au portail client"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour au Espace Client
              </button>
              <AdminPanel />
            </div>
          ) : (
            <>
              {activeTab === 'accueil' && <HomeView setActiveTab={setActiveTab} />}
              {activeTab === 'produits' && <ProductsView />}
              {activeTab === 'avis' && <ReviewsView />}
              {activeTab === 'moi' && <ProfileView />}
            </>
          )}
        </main>

        {/* Brand Permanent Navigation Toolbar Stretched on bottom */}
        <BottomNav
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsAdminView(false); // Reset administrative views
          }}
          isAdmin={currentUser.role === 'admin'}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
