/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Coins, MessageSquare, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, isAdmin }) => {
  const navItems = [
    { id: 'accueil', name: 'Accueil', icon: Home },
    { id: 'produits', name: 'Investir', icon: Coins },
    { id: 'forum', name: 'Avis', icon: MessageSquare },
    { id: 'moi', name: 'Compte', icon: User },
  ];

  return (
    <nav id="bottom-navigation-bar" className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-205 shadow-md pb-safe z-40">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              id={`nav-tab-${item.id}`}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center flex-1 h-full py-2 transition-all group relative duration-200"
            >
              <div
                className={`p-1 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'text-emerald-600 scale-110'
                    : 'text-slate-400 group-hover:text-slate-600'
                }`}
              >
                <Icon className="w-5.5 h-5.5 stroke-[2.25]" />
              </div>
              <span
                className={`text-[10px] font-sans tracking-wide font-bold mt-0.5 transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-slate-500'
                }`}
              >
                {item.name}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping-once" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
