/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Send, CheckCircle, AlertTriangle } from 'lucide-react';

interface RetraitPageProps {
  setActiveTab: (tab: string) => void;
}

export const RetraitPage: React.FC<RetraitPageProps> = ({ setActiveTab }) => {
  const { currentUser, settings, requestWithdrawal } = useApp();

  const countriesList = [
    { flag: '🇨🇮', name: "Côte d'Ivoire", code: '+225' },
    { flag: '🇹🇬', name: 'Togo', code: '+228' },
    { flag: '🇧🇯', name: 'Bénin', code: '+229' },
    { flag: '🇨🇲', name: 'Cameroun', code: '+237' },
  ];

  // Initialize selected country based on user's country code or default
  const [retCountry, setRetCountry] = useState(() => {
    return countriesList.find(c => c.code === currentUser?.countryCode) || countriesList[0];
  });

  const [retPhone, setRetPhone] = useState(() => {
    const defaultC = countriesList.find(c => c.code === currentUser?.countryCode) || countriesList[0];
    return `${defaultC.code} `;
  });

  const [amount, setAmount] = useState<number | ''>('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!currentUser) return null;

  const handleCountryChange = (countryCode: string) => {
    const chosen = countriesList.find(c => c.code === countryCode);
    if (chosen) {
      setRetCountry(chosen);
      const rawNumber = retPhone.replace(/^\+\d+\s*/, '');
      setRetPhone(`${chosen.code} ${rawNumber}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!amount) {
      setErrorMsg('Veuillez saisir un montant à retirer.');
      return;
    }

    const numericAmount = Number(amount);
    
    // Check validation rules
    if (numericAmount < settings.minWithdrawAmount) {
      setErrorMsg(`Le montant minimum de retrait est de ${settings.minWithdrawAmount.toLocaleString('fr-FR')} FCFA.`);
      return;
    }

    if (numericAmount > currentUser.balance) {
      setErrorMsg(`Votre solde est insuffisant. Solde disponible : ${currentUser.balance.toLocaleString('fr-FR')} FCFA.`);
      return;
    }

    // Prepare receiver data
    const finalBeneficiaryName = `Retrait Mobile (${retCountry.name})`;
    const cleanPhone = retPhone.trim();

    if (cleanPhone.replace(/^\+\d+\s*/, '').length < 6) {
      setErrorMsg('Veuillez saisir un numéro de téléphone Mobile Money valide.');
      return;
    }

    const res = requestWithdrawal(numericAmount, cleanPhone, finalBeneficiaryName);
    if (res && res.success) {
      setSuccessMsg(`Votre demande de retrait de ${numericAmount.toLocaleString('fr-FR')} FCFA vers ${cleanPhone} a bien été enregistrée pour traitement (durée estimée: 15 minutes).`);
      setAmount('');
      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('moi'); // Navigate to account page to see balance update/history
      }, 4000);
    } else {
      setErrorMsg(res?.message || 'La demande a été rejetée par le protocole financier.');
    }
  };

  return (
    <div className="animate-fade-in space-y-4 pb-12">
      {/* Dynamic Navigation Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3 bg-white/70 backdrop-blur-md sticky top-0 z-10 px-1 py-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('moi')}
          className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-700 transition-colors"
          title="Retourner à mon compte"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-sans font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
            <Send className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
            Demander un Retrait
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase leading-none mt-0.5">
            Agro Récolte Retraits
          </p>
        </div>
      </div>

      {/* Main withdrawal content wrapper */}
      <div className="bg-white rounded-3xl p-5 border border-slate-250 shadow-sm space-y-4 text-slate-800">
        
        {/* Timing Information Box */}
        <div className="bg-amber-500/5 border border-amber-600/10 p-3 rounded-2xl space-y-1.5">
          <p className="font-sans font-black text-amber-800 text-[10px] uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Horaires de traitement :
          </p>
          <p className="text-[10.5px] text-slate-600 leading-normal">
            Tous les retraits mobile money sont traités manuellement par l'administration 7j/7 entre <strong>08:00 et 22:00</strong>. Délai moyen : <strong>15 minutes</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* STEP 1: Country Selector */}
          <div className="space-y-1">
            <label className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide">
              1. Sélectionnez le pays de réception
            </label>
            <select
              value={retCountry.code}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-sans font-extrabold outline-none focus:border-amber-505 cursor-pointer shadow-inner"
            >
              {countriesList.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* STEP 2: Mobile Money Number */}
          <div className="space-y-1">
            <label className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide">
              2. Numéro de téléphone Mobile Money
            </label>
            <div className="flex items-stretch gap-1.5">
              <div className="bg-slate-100 border border-slate-200 rounded-xl px-3 flex items-center justify-center font-mono text-xs text-slate-600 select-none shrink-0 font-bold">
                {retCountry.flag} {retCountry.code}
              </div>
              <input
                type="tel"
                required
                placeholder="Ex : 07894512"
                value={retPhone.replace(/^\+\d+\s*/, '')}
                onChange={(e) => {
                  const cleanedVal = e.target.value.replace(/[^0-9]/g, '');
                  setRetPhone(`${retCountry.code} ${cleanedVal}`);
                }}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono font-bold outline-none focus:border-amber-505 shadow-inner"
              />
            </div>
            <p className="text-[9.5px] text-slate-400 font-sans mt-0.5">
              Nous supportons automatiquement Orange Money, MTN, Moov, Wave, Flooz du pays sélectionné.
            </p>
          </div>

          {/* STEP 3: Withdrawal Amount */}
          <div className="space-y-1">
            <label className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide">
              3. Saisir le montant du Retrait (FCFA)
            </label>
            <input
              type="number"
              required
              min={settings.minWithdrawAmount}
              step={500}
              placeholder={`Min ${settings.minWithdrawAmount} FCFA`}
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono font-extrabold outline-none focus:border-amber-505 shadow-inner"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>Minimum : <strong>{settings.minWithdrawAmount.toLocaleString('fr-FR')} FCFA</strong></span>
              <span className="text-amber-700 font-bold">Solde disponible : {(currentUser?.balance || 0).toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>

          {/* Messages */}
          {successMsg && (
            <p className="text-[11px] bg-emerald-50 border border-emerald-100 text-emerald-800 p-2.5 rounded-xl text-center font-bold animate-fade-in leading-relaxed">
              {successMsg}
            </p>
          )}
          {errorMsg && (
            <p className="text-[11px] bg-rose-50 border border-rose-100 text-rose-800 p-2.5 rounded-xl text-center font-bold animate-fade-in leading-relaxed">
              {errorMsg}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('moi')}
              className="flex-1 py-3 bg-slate-105 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-xs font-display font-black shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
            >
              Lancer le retrait
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
