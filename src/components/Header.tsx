/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, ShieldCheck, HelpCircle, X, ShieldAlert, Check } from 'lucide-react';

interface HeaderProps {
  isAdminView: boolean;
  setIsAdminView: (v: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAdminView,
  setIsAdminView,
  activeTab,
  setActiveTab,
}) => {
  const { currentUser, notifications, markNotificationsAsRead, logoutUser } = useApp();
  const [showNotifModal, setShowNotifModal] = useState(false);

  // Filter notification for logged in user
  const userNotifs = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id || n.userId === 'all')
    : [];

  const unreadCount = userNotifs.filter((n) => !n.read).length;

  const handleOpenNotifs = () => {
    setShowNotifModal(true);
    if (currentUser) {
      markNotificationsAsRead(currentUser.id);
    }
  };

  return (
    <header id="app-sticky-header" className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('accueil')}>
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
            </svg>
          </div>
          <div>
            <h1 className="font-display font-black text-xl text-emerald-800 tracking-tight leading-none">
              AgriAfri
            </h1>
            <p className="font-sans text-[8px] text-slate-400 uppercase tracking-widest font-black mt-1">
              Sécurisé • SSL Actif
            </p>
          </div>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-1.5">
          {/* Admin Switch Override (A key request. To test everything instantly!) */}
          {currentUser && (
            <button
              id="admin-override-toggle"
              onClick={() => {
                if (currentUser.role === 'admin') {
                  setIsAdminView(!isAdminView);
                } else {
                  // If developer is accessing, let them trigger admin to evaluate full feature set
                  // Promote current user to admin role, or enable simulation for testing
                  setIsAdminView(!isAdminView);
                }
              }}
              className={`p-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 ${
                isAdminView
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100'
              } transition-all`}
              title="Permuter entre Portails Utilisateur et Administrateur"
            >
              {isAdminView ? <ShieldAlert className="w-4 h-4 text-amber-700 animate-pulse" /> : <ShieldCheck className="w-4 h-4 text-emerald-600" />}
              <span className="hidden sm:inline">
                {isAdminView ? 'Admin Gérant' : 'Compte Pro'}
              </span>
            </button>
          )}

          {/* Assistance Button */}
          {currentUser && (
            <button
              id="header-help-btn"
              onClick={() => setActiveTab('moi')}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
              title="Assistance technique"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          )}

          {/* Notifications Trigger */}
          {currentUser && (
            <button
              id="header-notif-btn"
              onClick={handleOpenNotifs}
              className="relative p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* NOTIFICATIONS CONTAINER MODAL */}
      {showNotifModal && (
        <div id="notifications-back-overlay" className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm max-h-[80vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-emerald-500/5">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-600" />
                <h3 className="font-sans font-bold text-slate-800 text-md">
                  Mes Notifications ({userNotifs.length})
                </h3>
              </div>
              <button
                id="close-notif-modal"
                onClick={() => setShowNotifModal(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {userNotifs.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                  <p className="text-sm">Aucune notification disponible.</p>
                </div>
              ) : (
                userNotifs.map((notif) => (
                  <div
                    id={`notif-record-${notif.id}`}
                    key={notif.id}
                    className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-1 hover:border-emerald-100 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {notif.title}
                      </span>
                      <span className="font-mono text-[9px] text-slate-400">
                        {new Date(notif.date).toLocaleDateString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-slate-600 leading-relaxed pl-3.5">
                      {notif.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-50 bg-slate-50 flex justify-center">
              <button
                id="notif-modal-dismiss-btn"
                onClick={() => setShowNotifModal(false)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-sans text-xs font-semibold shadow-xs transition-colors"
              >
                Tout fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
