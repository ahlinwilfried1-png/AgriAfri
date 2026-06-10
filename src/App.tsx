/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
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
import { RechargePage } from './components/RechargePage';
import { RetraitPage } from './components/RetraitPage';
import { Shield, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';

function AppContent() {
  const { currentUser, logoutUser, settings, tickets, createTicket, sendMessageInTicket, markTicketAsRead } = useApp();
  const [activeTab, setActiveTab] = useState<string>('accueil');
  const [isAdminView, setIsAdminView] = useState<boolean>(false);

  // --- FLOATING SUPPORT MODAL STATE & DYNAMIC DISCUSSION BOARDS ---
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [ticketSubject, setTicketSubject] = useState<'Dépôt non crédité' | 'Assistance technique' | 'Retrait retardé' | 'Autre réclamation'>('Assistance technique');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketProof, setTicketProof] = useState<string>('');
  const [ticketSuccess, setTicketSuccess] = useState('');
  const profileTicketFileInputRef = useRef<HTMLInputElement>(null);

  // New Chat session states
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  // Auto clear REPONDU state when user reads the ticket responses
  useEffect(() => {
    if (activeTicketId) {
      const activeTicket = tickets.find(t => t.id === activeTicketId);
      if (activeTicket && activeTicket.messageStatus === 'REPONDU') {
        markTicketAsRead(activeTicketId);
      }
    }
  }, [activeTicketId, tickets, markTicketAsRead]);
  const [chatMessageText, setChatMessageText] = useState('');
  const [chatProof, setChatProof] = useState<string>('');
  const chatProofFileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileTicketFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTicketProof(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim()) {
      alert('Veuillez saisir votre message d\'explication.');
      return;
    }
    const res = createTicket(ticketSubject, ticketMessage, ticketProof || undefined);
    if (res && res.success) {
      setTicketSuccess('Votre demande d’assistance a été soumise avec succès.');
      setTicketMessage('');
      setTicketProof('');
      if (profileTicketFileInputRef.current) profileTicketFileInputRef.current.value = '';
      setTimeout(() => {
        setTicketSuccess('');
        setShowNewTicketForm(false);
      }, 3500);
    }
  };

  const handleChatProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setChatProof(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicketId) return;
    if (!chatMessageText.trim() && !chatProof) return;
    
    sendMessageInTicket(activeTicketId, chatMessageText || "Preuve déposée", 'user', chatProof || undefined);
    setChatMessageText('');
    setChatProof('');
    if (chatProofFileInputRef.current) chatProofFileInputRef.current.value = '';
  };

  // If user is logged out, show register/login flows immediately
  if (!currentUser) {
    return (
      <div id="app-viewport-auth" className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4">
        <div 
          className="w-full max-w-md min-h-screen sm:min-h-[850px] sm:rounded-[36px] sm:shadow-2xl overflow-hidden flex flex-col border border-slate-200/30 bg-cover bg-center"
          style={{
            backgroundImage: "linear-gradient(to bottom, rgba(248, 250, 252, 0.94) 0%, rgba(248, 250, 252, 0.96) 100%), url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800')"
          }}
        >
          <AuthScreens onSuccess={() => setActiveTab('accueil')} />
        </div>
      </div>
    );
  }

  // Admin and normal user main hub
  return (
    <div id="app-viewport-main" className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 animate-fade-in">
      {/* Dynamic Simulated Smartphone Device Frame Container - Unified background matching all pages */}
      <div 
        className="w-full max-w-md min-h-screen sm:min-h-[850px] sm:rounded-[40px] sm:shadow-2xl overflow-hidden flex flex-col relative border border-slate-300/40 bg-cover bg-center"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(248, 250, 252, 0.93) 0%, rgba(248, 250, 252, 0.95) 100%), url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800')"
        }}
      >
        
        {/* Floating SMS network simulator notification toast */}
        <OtpBanner />

        {/* Brand Application Sticky Header (Visible for all logged-in users to provide branding, trusts, and notifications) */}
        {currentUser && (
          <Header
            isAdminView={isAdminView}
            setIsAdminView={setIsAdminView}
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setIsAdminView(false); // Disable admin overlay view when navigating
            }}
          />
        )}

        {/* Dynamic Client view pages */}
        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-20 scrollbar-none bg-transparent">
          
          {/* If Admin view is toggled, override client tabs */}
          {isAdminView && currentUser.role === 'admin' ? (
            <div className="animate-fade-in space-y-4 pt-4">
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
              {activeTab === 'produits' && <ProductsView setActiveTab={setActiveTab} />}
              {activeTab === 'forum' && <ReviewsView />}
              {activeTab === 'moi' && (
                <ProfileView 
                  isAdminView={isAdminView} 
                  setIsAdminView={setIsAdminView} 
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === 'recharge' && <RechargePage setActiveTab={setActiveTab} />}
              {activeTab === 'retrait' && <RetraitPage setActiveTab={setActiveTab} />}
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

        {/* 🎧 FLOATING EMERALD SUPPORT HEADSET BUTTON (CASQUE DE SUPPORT EMERAUDE) - Visible everywhere EXCEPT Home page */}
        {activeTab !== 'accueil' && (
          <button
            type="button"
            onClick={() => setShowSupportModal(true)}
            className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-2xl border-2 border-white cursor-pointer active:scale-95 transition-all z-40 animate-bounce"
            style={{ animationDuration: '2.5s' }}
            title="Centre d'aide & Support"
            id="btn-floating-support-trigger"
          >
            <span className="text-2xl select-none filter drop-shadow-sm">🎧</span>
          </button>
        )}

        {/* 🔮 MODAL POPUP - CENTRE D'AIDE & SUPPORT OFFICIEL */}
        {showSupportModal && (
          <div id="support-modal-overlay" className="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-3 overflow-y-auto font-sans">
            <div className="bg-[#f8f9fa] rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 animate-scale-up max-h-[92vh] flex flex-col text-slate-800">
              
              {/* Header section with emerald style */}
              <div className="bg-emerald-600 text-white px-5 py-4 pb-5 flex justify-between items-center shrink-0">
                <div className="space-y-1">
                  <h3 className="font-sans font-black text-xs uppercase tracking-wide flex items-center gap-2">
                    <span>🎧</span> Centre d'aide & Support
                  </h3>
                  <p className="text-[10px] text-emerald-100 opacity-90 font-medium leading-none">
                    Assistance client 7j/7 d'AgriAfri
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowSupportModal(false);
                    setShowNewTicketForm(false);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
                  title="Fermer"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                {/* Contact channels */}
                <div className="grid grid-cols-2 gap-3 shrink-0">
                  {/* Channel 1: Telegram */}
                  <a
                    href={settings?.telegramLink || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white border border-slate-200 p-3 rounded-2xl flex flex-col items-center text-center justify-between gap-2.5 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all group"
                  >
                    <span className="text-2xl select-none filter drop-shadow-sm">🗣️</span>
                    <div>
                      <h4 className="font-sans font-black text-[11px] text-emerald-600 uppercase">Telegram</h4>
                      <p className="text-[9px] text-slate-500 mt-0.5 leading-snug font-medium">Assistance directe</p>
                    </div>
                    <span className="w-full py-1.5 bg-emerald-600 group-hover:bg-emerald-700 text-white font-sans font-extrabold text-[9px] uppercase tracking-wide rounded-lg text-center select-none">
                      Telegram
                    </span>
                  </a>

                  {/* Channel 2: WhatsApp */}
                  <a
                    href={settings?.whatsappLink || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white border border-slate-200 p-3 rounded-2xl flex flex-col items-center text-center justify-between gap-2.5 shadow-sm hover:border-emerald-450 hover:shadow-md transition-all group"
                  >
                    <span className="text-2xl select-none filter drop-shadow-sm">💬</span>
                    <div>
                      <h4 className="font-sans font-black text-[11px] text-emerald-600 uppercase">WhatsApp</h4>
                      <p className="text-[9px] text-slate-500 mt-0.5 leading-snug font-medium">Communauté officielle</p>
                    </div>
                    <span className="w-full py-1.5 bg-emerald-500 group-hover:bg-emerald-605 text-white font-sans font-extrabold text-[9px] uppercase tracking-wide rounded-lg text-center select-none">
                      WhatsApp
                    </span>
                  </a>
                </div>

                {/* SECTION: Support de discussion board */}
                <div className="bg-white border border-slate-200 rounded-3xl p-4 space-y-3.5 shadow-xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <h4 className="font-sans font-black text-xs text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                      <span>💬</span> Support de discussion
                    </h4>
                    {activeTicketId ? (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTicketId(null);
                          setChatMessageText('');
                          setChatProof('');
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans font-extrabold text-[9.5px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                      >
                        ← Salons
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowNewTicketForm(!showNewTicketForm)}
                        className="px-2.5 py-1 bg-[#f3f4f6] hover:bg-slate-200 text-slate-707 font-sans font-extrabold text-[9.5px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        {showNewTicketForm ? '✕ Annuler' : '✍️ Ouvrir salon'}
                      </button>
                    )}
                  </div>

                  {activeTicketId ? (
                    (() => {
                      const t = tickets.find(ticket => ticket.id === activeTicketId);
                      if (!t) return <p className="text-[10px] text-slate-405 font-sans text-center py-4">Salon introuvable.</p>;
                      
                      const chatMsgs = t.messages || [];
                      const formattedMsgs = chatMsgs.length > 0 ? chatMsgs : [
                        {
                          id: 'msg-init-' + t.id,
                          sender: 'user' as const,
                          text: t.message,
                          date: t.date,
                          image: t.screenshotImage
                        },
                        ...(t.reply ? [{
                          id: 'msg-rep-' + t.id,
                          sender: 'admin' as const,
                          text: t.reply,
                          date: t.date,
                          image: undefined
                        }] : [])
                      ];

                      return (
                        <div className="space-y-3">
                          <div className="bg-slate-50 border p-2 rounded-xl text-[9px] text-emerald-600 font-sans font-bold uppercase tracking-wide flex justify-between">
                            <span>Salon : {t.subject}</span>
                            <span className="font-mono text-[8.5px] text-slate-400">{new Date(t.date).toLocaleDateString('fr-FR')}</span>
                          </div>

                          {/* Chat Messages flow thread */}
                          <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1 flex flex-col pt-1">
                            {formattedMsgs.map((msg, idx) => {
                              const isSelf = msg.sender === 'user';
                              return (
                                <div key={msg.id || idx} className={`flex items-start gap-1.5 max-w-[90%] ${isSelf ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}>
                                  {!isSelf && <span className="text-[10px] shrink-0 select-none bg-emerald-100 p-1 rounded-full text-emerald-700">🎧</span>}
                                  <div className={`p-2.5 rounded-2xl text-[10px] leading-relaxed font-sans font-semibold ${
                                    isSelf 
                                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                                  }`}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                    {msg.image && (
                                      <a href={msg.image} target="_blank" rel="noreferrer" className="block mt-1.5 rounded overflow-hidden">
                                        <img src={msg.image} alt="Preuve" className="max-h-24 object-cover" referrerPolicy="no-referrer" />
                                      </a>
                                    )}
                                    <span className={`block text-[8px] text-right mt-1 font-mono ${isSelf ? 'text-emerald-200' : 'text-slate-400'}`}>
                                      {new Date(msg.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  {isSelf && <span className="text-[10px] shrink-0 select-none bg-emerald-100 p-1 rounded-full text-emerald-700">🧑</span>}
                                </div>
                              );
                            })}
                          </div>

                          {/* Input Area */}
                          <form onSubmit={handleChatSubmit} className="pt-2 border-t border-slate-150 space-y-1.5">
                            {chatProof && (
                              <div className="p-1 bg-slate-100 rounded-lg max-w-max mx-auto border relative">
                                <img src={chatProof} alt="Preuve" className="max-h-16 object-cover rounded shadow-2xs" referrerPolicy="no-referrer" />
                                <button
                                  type="button"
                                  onClick={() => setChatProof('')}
                                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-600 text-white rounded-full flex items-center justify-center text-[8px] font-bold"
                                >
                                  ✕
                                </button>
                              </div>
                            )}

                            <div className="flex gap-1.5 items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
                              <button
                                type="button"
                                onClick={() => chatProofFileInputRef.current?.click()}
                                className="p-1 hover:bg-slate-200 rounded-full transition-colors cursor-pointer text-slate-500 shrink-0"
                                title="Image"
                              >
                                📷
                              </button>
                              <input
                                type="file"
                                accept="image/*"
                                ref={chatProofFileInputRef}
                                onChange={handleChatProofFileChange}
                                className="hidden"
                              />

                              <input
                                type="text"
                                required={!chatProof}
                                value={chatMessageText}
                                onChange={(e) => setChatMessageText(e.target.value)}
                                placeholder="Tapez votre réponse..."
                                className="w-full bg-transparent text-xs text-slate-707 font-sans outline-none py-1 font-semibold"
                              />

                              <button
                                type="submit"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white py-1 px-3 rounded-lg text-[9.5px] font-sans font-black uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
                              >
                                Envoyer
                              </button>
                            </div>
                          </form>
                        </div>
                      );
                    })()
                  ) : showNewTicketForm ? (
                    <form onSubmit={handleProfileTicketSubmit} className="space-y-3 p-1 animate-fade-in">
                      <p className="text-[9.5px] text-emerald-600 font-sans font-semibold leading-relaxed">
                        Expliquez votre situation ci-dessous. Un conseiller vous répondra.
                      </p>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Motif </label>
                        <select
                          value={ticketSubject}
                          onChange={(e: any) => setTicketSubject(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-sans text-slate-700 outline-none focus:border-emerald-600 font-medium"
                        >
                          <option value="Dépôt non crédité">📥 Dépôt non reçu ou non crédité</option>
                          <option value="Retrait retardé">💸 Demande de retrait en attente</option>
                          <option value="Assistance technique">⚙️ Assistance technique & bugs</option>
                          <option value="Autre réclamation">📋 Autre réclamation générale</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Message</label>
                        <textarea
                          required
                          value={ticketMessage}
                          onChange={(e) => setTicketMessage(e.target.value)}
                          rows={3}
                          placeholder="Description heure, numéro ou transaction..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-sans text-slate-700 outline-none focus:border-emerald-600 leading-relaxed resize-none font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-semibold">Preuve (Optionnelle)</label>
                        <button
                          type="button"
                          onClick={() => profileTicketFileInputRef.current?.click()}
                          className="w-full py-2 border border-dashed border-slate-300 hover:border-emerald-600 rounded-xl flex items-center justify-center gap-1.5 bg-slate-50 text-[10px] text-slate-500 font-medium transition-colors cursor-pointer select-none"
                        >
                          📷 {ticketProof ? "Modifier la capture" : "Téléverser capture"}
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          ref={profileTicketFileInputRef}
                          onChange={handleProfileTicketFileChange}
                          className="hidden"
                        />
                        {ticketProof && (
                          <div className="mt-1.5 p-1 bg-slate-100 rounded-lg max-w-max mx-auto border relative">
                            <img src={ticketProof} alt="Preuve d'image" className="max-h-24 object-cover rounded shadow-2xs" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => setTicketProof('')}
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-600 text-white rounded-full flex items-center justify-center text-[8px] font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>

                      {ticketSuccess && (
                        <p className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-800 p-2 rounded-xl text-center font-bold">
                          {ticketSuccess}
                        </p>
                      )}

                      {!ticketSuccess && (
                        <button
                          type="submit"
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-black text-[10.5px] uppercase tracking-wider rounded-xl cursor-pointer shadow-sm transition-colors mt-1.5"
                        >
                          Envoyer
                        </button>
                      )}
                    </form>
                  ) : (
                    <div className="space-y-3.5">
                      {/* List existing tickets */}
                      {tickets.filter(t => t.userId === currentUser.id).length === 0 ? (
                        <div className="py-6 text-center space-y-2">
                          <p className="text-[10px] text-slate-400 font-sans font-medium">
                            Aucune discussion en cours dans votre salon.
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowNewTicketForm(true)}
                            className="px-3 py-1.5 bg-[#f3f4f6] text-slate-700 hover:bg-indigo-100 text-[10px] font-sans font-black rounded-lg uppercase tracking-wide cursor-pointer"
                          >
                            ✍️ Lancer une discussion
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
                          {tickets
                            .filter(t => t.userId === currentUser.id)
                            .map((t) => (
                              <button
                                id={`ticket-salon-${t.id}`}
                                key={t.id}
                                type="button"
                                onClick={() => setActiveTicketId(t.id)}
                                className="w-full text-left p-3 rounded-2xl border border-slate-100 hover:border-emerald-150 hover:bg-emerald-50/25 transition-all space-y-2 flex flex-col cursor-pointer bg-white"
                              >
                                <div className="flex justify-between items-center w-full text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                  <span>📁 {t.subject}</span>
                                  <span className="font-mono">{new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</span>
                                </div>

                                <div className="flex justify-between items-center w-full">
                                  <p className="text-slate-600 text-[10px] truncate max-w-[60%] font-medium">
                                    {t.message}
                                  </p>
                                  {(() => {
                                    const status = t.messageStatus || 'NON_LU';
                                    if (status === 'NON_LU') {
                                      return (
                                        <span className="bg-rose-100 text-rose-800 text-[8px] px-1.5 py-0.5 rounded font-black uppercase flex items-center gap-0.5">
                                          <span>🕒</span> Envoyé (Non lu)
                                        </span>
                                      );
                                    } else if (status === 'LU') {
                                      return (
                                        <span className="bg-amber-100 text-amber-900 text-[8px] px-1.5 py-0.5 rounded font-black uppercase flex items-center gap-0.5">
                                          <span>👀</span> Lu par support
                                        </span>
                                      );
                                    } else {
                                      return (
                                        <span className="bg-emerald-100 text-emerald-800 text-[8px] px-1.5 py-0.5 rounded font-black uppercase flex items-center gap-0.5 animate-pulse">
                                          <span>💬</span> Répondu !
                                        </span>
                                      );
                                    }
                                  })()}
                                </div>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-3 text-[9.5px] text-slate-500 leading-normal font-sans font-medium">
                  🛡️ Agrocapital assure une traçabilité totale sur vos tickets. Nos agents ne demandent jamais votre mot de passe.
                </div>

              </div>

              {/* Footer close option */}
              <div className="p-3.5 border-t border-slate-200 bg-[#ffffff] flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowSupportModal(false);
                    setShowNewTicketForm(false);
                  }}
                  className="w-full py-3 bg-[#ea5454] hover:bg-[#d84343] text-white font-sans font-black text-xs text-center rounded-2xl cursor-pointer uppercase tracking-wider shadow-xs transition-colors"
                >
                  Fermer l'Assistance
                </button>
              </div>

            </div>
          </div>
        )}
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
