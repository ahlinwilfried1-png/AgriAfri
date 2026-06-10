/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Coins, ArrowLeft, Clipboard, Check } from 'lucide-react';

interface RechargePageProps {
  setActiveTab: (tab: string) => void;
}

export const RechargePage: React.FC<RechargePageProps> = ({ setActiveTab }) => {
  const { currentUser, settings, requestDeposit } = useApp();
  const [operator, setOperator] = useState<'Mobile Money' | 'Moov Money' | 'Flooz'>('Mobile Money');
  const [amount, setAmount] = useState<number | ''>('');
  const [proof, setProof] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const currentOpPhone = operator === 'Mobile Money' 
    ? settings.operatorPhones.mobileMoney 
    : operator === 'Moov Money' 
    ? settings.operatorPhones.moovMoney 
    : settings.operatorPhones.flooz;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(currentOpPhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProof(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!amount || Number(amount) < 500) {
      setErrorMsg('Le montant minimum de recharge est de 500 FCFA.');
      return;
    }

    if (!proof) {
      setErrorMsg('Veuillez ajouter une preuve ou photo du transfert de paiement pour examen.');
      return;
    }

    const res = requestDeposit(Number(amount), operator, proof);
    if (res && res.success) {
      setSuccessMsg('Recharge déclarée avec succès ! L\'administration créditera votre solde après vérification sous 15 minutes.');
      setAmount('');
      setProof('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('accueil');
      }, 4000);
    } else {
      setErrorMsg(res?.message || 'Une erreur est survenue lors de la soumission.');
    }
  };

  return (
    <div className="animate-fade-in space-y-4 pb-12">
      {/* Dynamic Navigation Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3 bg-white/70 backdrop-blur-md sticky top-0 z-10 px-1 py-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('accueil')}
          className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-700 transition-colors"
          title="Retourner à l'accueil"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-sans font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
            <Coins className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
            Recharge de Solde
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase leading-none mt-0.5">
            Agro Récolte Finances
          </p>
        </div>
      </div>

      {/* Main Form content wrapper */}
      <div className="bg-white rounded-3xl p-5 border border-slate-250 shadow-sm space-y-4 text-slate-800">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* STEP 1: Operator Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide">
              1. Sélectionnez votre opérateur Mobile Money
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Mobile Money', 'Moov Money', 'Flooz'] as const).map((op) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setOperator(op)}
                  className={`py-2 px-1 rounded-xl text-[10.5px] font-sans font-black transition-all border ${
                    operator === op
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {op === 'Mobile Money' ? 'Wave/MTN' : op}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: Transfer Instructions */}
          <div className="bg-emerald-500/5 border border-emerald-600/10 p-3.5 rounded-2xl space-y-2.5">
            <h4 className="font-sans font-bold text-emerald-800 text-xs uppercase tracking-wide">
              Instructions de transfert :
            </h4>
            <p className="text-[11px] text-slate-600 leading-normal">
              Veuillez transférer le montant de votre recharge sur le numéro officiel <strong>{operator === 'Mobile Money' ? 'Wave / MTN' : operator}</strong> ci-dessous :
            </p>
            
            <div className="bg-white border border-slate-150 p-2.5 rounded-xl flex items-center justify-between shadow-xs">
              <span className="font-mono text-xs font-extrabold text-slate-800 tracking-wider">
                {currentOpPhone}
              </span>
              <button
                type="button"
                onClick={handleCopyPhone}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[9px] font-sans font-black uppercase tracking-wider transition-all flex items-center gap-1 shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" /> Copié !
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3 h-3" /> Copier
                  </>
                )}
              </button>
            </div>
            
            <p className="text-[9px] text-emerald-700/80 leading-snug font-medium italic">
              ⓘ Les frais d'envoi sont à votre charge. Notre équipe valide le transfert sous 15 min après réception de la demande.
            </p>
          </div>

          {/* STEP 3: Transfer Amount */}
          <div className="space-y-1">
            <label className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide">
              2. Saisir le montant transféré (FCFA)
            </label>
            <input
              type="number"
              required
              min={500}
              step={500}
              placeholder="Ex : 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono font-extrabold outline-none focus:border-emerald-550 shadow-inner"
            />
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              Montant de recharge minimum admis : <strong>500 FCFA</strong>
            </p>
          </div>

          {/* STEP 4: Proof Image Upload */}
          <div className="space-y-1">
            <label className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide">
              3. Télécharger la capture d'écran de preuve
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer hover:bg-slate-50/50 transition-colors"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {proof ? (
                <div className="space-y-1.5">
                  <p className="text-[10.5px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Capture d'écran enregistrée
                  </p>
                  <img src={proof} alt="Proof" className="max-h-36 mx-auto object-cover rounded-xl border shadow-xs" referrerPolicy="no-referrer" />
                  <p className="text-[9px] text-slate-400">Cliquez pour modifier la capture d'écran</p>
                </div>
              ) : (
                <div className="space-y-1 py-1">
                  <span className="text-3xl select-none">📷</span>
                  <p className="text-[11px] text-slate-500 font-bold block pt-1">
                    Joindre une capture du reçu de paiement
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium">
                    (Format PNG, JPG tolérés)
                  </p>
                </div>
              )}
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
              onClick={() => setActiveTab('accueil')}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-display font-black shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
            >
              Soumettre recharge
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
