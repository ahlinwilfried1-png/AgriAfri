/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Gift, Coins, Award, Sparkles, Star } from 'lucide-react';

export const RoueView: React.FC = () => {
  const { currentUser, updateUserBalance, editUserDetail, addNotificationForUser } = useApp();
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

  if (!currentUser) return null;

  return (
    <div id="roue-view-page" className="animate-fade-in space-y-6 pb-24 text-center">
      {/* Page header title card */}
      <div className="bg-gradient-to-br from-[#0f62fe] to-[#3b82f6] text-white rounded-3xl p-5 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <span className="bg-white/20 border border-white/20 text-[10px] uppercase font-sans font-black tracking-widest px-3 py-1 rounded-full text-white inline-block">
          🎁 Événement de Bien-être
        </span>
        <h2 className="font-sans font-black text-lg mt-3">
          Roue de la Fortune AgriAfri
        </h2>
        <p className="font-sans text-xs text-blue-100/90 mt-1 max-w-xs mx-auto leading-relaxed">
          Taux de réussite garanti de 100% ! Gagnez jusqu'à 10 000 FCFA instantanément.
        </p>
      </div>

      {/* Main Wheel Box Card */}
      <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs flex flex-col items-center">
        {currentUser.freeSpins && currentUser.freeSpins > 0 ? (
          <span className="bg-emerald-500/10 text-emerald-800 text-[10px] font-sans font-extrabold px-3 py-1.5 rounded-full inline-block animate-pulse border border-emerald-500/20 mb-3">
            🎉 BONUS : {currentUser.freeSpins} TOUR{currentUser.freeSpins > 1 ? 'S' : ''} GRATUIT{currentUser.freeSpins > 1 ? 'S' : ''} DISPONIBLE{currentUser.freeSpins > 1 ? 'S' : ''} !
          </span>
        ) : null}

        {/* Dynamic wheel layout */}
        <div className="relative flex flex-col items-center py-4">
          {/* Pointer Pin pin */}
          <div className="w-6 h-6 bg-[#0f62fe] rounded-b-full shadow-md z-20 flex items-center justify-center text-white mb-[-12px] relative font-black text-xxs">
            ▼
          </div>
          {/* Rotating segment board */}
          <div 
            className="w-56 h-56 rounded-full border-4 border-slate-800 shadow-2xl relative overflow-hidden transition-transform duration-[4500ms] ease-out bg-slate-900"
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
                  className="absolute text-white font-sans font-extrabold text-[9px]"
                  style={{
                    bottom: '15px',
                    right: '15px',
                    transform: 'skewY(-45deg) rotate(22.5deg) translate(18px, 8px)',
                    width: '60px',
                    textAlign: 'center'
                  }}
                >
                  {sec.label}
                </div>
              </div>
            ))}
            {/* Inner target dot */}
            <div className="absolute inset-0 m-auto w-10 h-10 bg-slate-950 border-2 border-slate-800 rounded-full flex items-center justify-center z-10 shadow-lg">
              <span className="text-[9px] font-black text-blue-400">AGRI</span>
            </div>
          </div>
        </div>

        {/* Action controllers */}
        <div className="w-full text-center space-y-3 mt-4">
          <p className="text-[10px] uppercase font-sans text-slate-400 font-bold flex items-center justify-center gap-1">
            <span>Votre solde : <b className="font-mono text-emerald-600">{currentUser.balance.toLocaleString()} FCFA</b></span>
            {currentUser.freeSpins && currentUser.freeSpins > 0 ? (
              <span className="text-[9px] font-extrabold bg-[#e0f2fe] text-blue-600 px-1.5 py-0.5 rounded-md">
                🎫 {currentUser.freeSpins} Spin
              </span>
            ) : null}
          </p>

          {wheelResultMsg && (
            <p id="wheel-view-result" className="text-xs bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-2xl leading-relaxed font-black animate-pulse">
              {wheelResultMsg}
            </p>
          )}

          <button
            id="view-spin-wheel-btn"
            onClick={spinWheel}
            disabled={isSpinning}
            className="w-full py-3.5 bg-[#0f62fe] hover:bg-blue-700 text-white rounded-3xl text-xs font-sans font-black shadow-md tracking-wider uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98"
          >
            {isSpinning 
              ? '🎡 Tirage du sort en cours...' 
              : currentUser.freeSpins && currentUser.freeSpins > 0 
              ? '🍀 Lancer (Tour Gratuit 🎉)' 
              : '🍀 Lancer (500 FCFA)'}
          </button>
        </div>
      </div>
    </div>
  );
};
