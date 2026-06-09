/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Phone, User, Landmark, ShieldCheck, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';

interface AuthScreensProps {
  onSuccess: () => void;
}

export const AuthScreens: React.FC<AuthScreensProps> = ({ onSuccess }) => {
  const { registerUser, loginUser, sendOTP, verifyOTP, resetPasswordByOTP } = useApp();

  const [isLoginView, setIsLoginView] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Common Phone Country indices structure
  const countries = [
    { code: '+225', name: 'Côte d\'Ivoire 🇨🇮' },
    { code: '+221', name: 'Sénégal 🇸🇳' },
    { code: '+226', name: 'Burkina Faso 🇧🇫' },
    { code: '+228', name: 'Togo 🇹🇬' },
    { code: '+229', name: 'Bénin 🇧🇯' },
    { code: '+223', name: 'Mali 🇲🇱' },
    { code: '+227', name: 'Niger 🇳🇪' },
    { code: '+237', name: 'Cameroun 🇨🇲' },
  ];

  // --- REGISTRATION FIELDS ---
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCountryCode, setRegCountryCode] = useState('+225');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regInviteCode, setRegInviteCode] = useState('');
  
  // OTP state machine
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  // --- LOGIN FIELDS ---
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // --- FORGOT FIELDS ---
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotOtpInput, setForgotOtpInput] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtpVerified, setForgotOtpVerified] = useState(false);
  const [forgotNewPassword, setForgotNewPassword] = useState('');

  // Password Visibility Toggle
  const [secureEyeRegister, setSecureEyeRegister] = useState(false);
  const [secureEyeLogin, setSecureEyeLogin] = useState(false);

  // Alert labels feedback
  const [authError, setAuthError] = useState<string | null>(null);

  // Triggers automated SMS OTP trigger for registration
  const triggerRegisterOTP = () => {
    setAuthError(null);
    if (!regName.trim() || !regPhone.trim()) {
      setAuthError('Veuillez spécifier votre Nom Complet et Numéro de téléphone pour recevoir le code OTP.');
      return;
    }
    if (regPassword.length < 4) {
      setAuthError('Le mot de passe doit faire au moins 4 caractères.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setAuthError('Confirmation de mot de passe invalide. Les mots de passe diffèrent.');
      return;
    }

    sendOTP(regPhone);
    setOtpSent(true);
    setAuthError(null);
    alert(`[Sim réseau] SMS envoyé avec succès au numéro ${regPhone}. Veuillez entrer le code reçu.`);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!regName.trim() || !regPhone.trim() || !regPassword.trim()) {
      setAuthError('Tous les champs sont requis.');
      return;
    }

    // OTP verification is strictly requested by the prompt ("Vérification OTP obligatoire")
    if (!otpVerified) {
      const match = verifyOTP(regPhone, otpInput);
      if (!match) {
        setAuthError('Le code OTP renseigné est incorrect ou expiré.');
        return;
      }
      setOtpVerified(true);
    }

    const signup = registerUser(regName, regPhone, regCountryCode, regPassword, regInviteCode);
    if (signup.success) {
      alert('Votre compte AgriAfri a été créé avec succès ! Connecté automatiquement.');
      onSuccess();
    } else {
      setAuthError(signup.message);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!loginPhone.trim() || !loginPassword.trim()) {
      setAuthError('Veuillez introduire votre numéro et mot de passe de connexion.');
      return;
    }

    const signIn = loginUser(loginPhone, loginPassword);
    if (signIn.success) {
      onSuccess();
    } else {
      setAuthError(signIn.message);
    }
  };

  // Trigger forgot OTP reset flow logic
  const triggerForgotOTP = () => {
    setAuthError(null);
    if (!forgotPhone.trim()) {
      setAuthError('Veuillez introduire votre numéro de téléphone.');
      return;
    }
    sendOTP(forgotPhone);
    setForgotOtpSent(true);
    alert(`Code OTP de réinitialisation envoyé par SMS au numéro : ${forgotPhone}`);
  };

  const handleForgotOTPVerify = () => {
    setAuthError(null);
    const valid = verifyOTP(forgotPhone, forgotOtpInput);
    if (valid) {
      setForgotOtpVerified(true);
      alert('Code de validation correct ! Veuillez saisir votre nouveau mot de passe.');
    } else {
      setAuthError('Code de validation incorrect.');
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!forgotNewPassword.trim() || forgotNewPassword.length < 4) {
      setAuthError('Nouveau mot de passe invalide.');
      return;
    }

    const res = resetPasswordByOTP(forgotPhone, forgotNewPassword);
    if (res.success) {
      alert('Mot de passe réinitialisé ! Vous pouvez vous connecter à présent.');
      setShowForgotModal(false);
      setForgotPhone('');
      setForgotOtpSent(false);
      setForgotOtpVerified(false);
      setForgotNewPassword('');
    } else {
      setAuthError(res.message);
    }
  };

  return (
    <div id="auth-screens-container" className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 animate-fade-in font-sans">
      <div className="w-full max-w-sm mx-auto space-y-6">
        
        {/* AGRICULTURAL LOGO / BRANDING CARARDS */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-600 text-white rounded-3xl flex items-center justify-center font-display font-black text-2xl shadow-md mx-auto">
            Ag
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-emerald-800 tracking-tight leading-none">
              AgriAfri
            </h1>
            <p className="font-sans text-[9px] text-slate-400 uppercase tracking-widest font-black mt-1">
              Plateforme d'investissement Agricole
            </p>
          </div>
        </div>

        {/* COMPREHENSIVE CARD BODY */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-700"></div>

          {/* Toggle View Switch header */}
          <div className="flex border-b border-slate-200 pb-4 mb-5 text-center">
            <button
              id="switch-view-login"
              type="button"
              onClick={() => {
                setIsLoginView(true);
                setAuthError(null);
              }}
              className={`flex-1 py-1 text-xs font-extrabold font-display transition-all cursor-pointer ${
                isLoginView ? 'text-emerald-700 border-b-2 border-emerald-600' : 'text-slate-400 hover:text-slate-650'
              }`}
            >
              Se Connecter
            </button>
            <button
              id="switch-view-register"
              type="button"
              onClick={() => {
                setIsLoginView(false);
                setAuthError(null);
              }}
              className={`flex-1 py-1 text-xs font-extrabold font-display transition-all cursor-pointer ${
                !isLoginView ? 'text-emerald-700 border-b-2 border-emerald-600' : 'text-slate-400 hover:text-slate-650'
              }`}
            >
              Créer un Compte
            </button>
          </div>

          {/* ERROR STATUS STRIP */}
          {authError && (
            <div id="auth-error-alert" className="mb-4 bg-red-50 border border-red-100 rounded-2xl p-3 text-xxs font-semibold text-rose-700 text-center leading-relaxed">
              ⚠️ {authError}
            </div>
          )}

          {/* ======================= VIEW: LOGIN SCREEN ======================= */}
          {isLoginView ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Phone Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Numéro de Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="login-phone"
                    type="tel"
                    required
                    placeholder="Ex: 0707070707"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-3 py-2.5 text-xs font-mono text-slate-700 outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-600">
                    Mot de passe
                  </label>
                  <button
                    id="btn-trigger-forgot-pswd"
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setAuthError(null);
                    }}
                    className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="login-password"
                    type={secureEyeLogin ? 'text' : 'password'}
                    required
                    placeholder="Saisissez votre mot de passe"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-slate-705 outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    id="login-eye-toggle"
                    type="button"
                    onClick={() => setSecureEyeLogin(!secureEyeLogin)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {secureEyeLogin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Trigger */}
              <button
                id="login-submit-btn"
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-xs rounded-2xl mt-4 cursor-pointer select-none transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
              >
                Se connecter en sécurité
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-slate-400 text-center font-semibold mt-2">
                Identifiants démo : <strong className="text-slate-700">0707070707</strong> / <strong className="text-slate-705">password</strong>
              </p>
            </form>
          ) : (
            /* ======================= VIEW: REGISTRATION SCREEN ======================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nom Complet
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="reg-name"
                    type="text"
                    required
                    placeholder="Ex: Kouamé N'Guessan"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-3 py-2.5 text-xs text-slate-700 outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Phone + Dial-code */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Numéro de Téléphone Mobile Money
                </label>
                <div className="flex gap-1.5">
                  {/* Custom indicatif pays list selection */}
                  <select
                    id="reg-country-code"
                    value={regCountryCode}
                    onChange={(e) => setRegCountryCode(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-2 py-2.5 text-xs font-sans text-slate-600 outline-none focus:border-emerald-500 shrink-0 w-28 text-center"
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code}
                      </option>
                    ))}
                  </select>

                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="reg-phone"
                      type="tel"
                      required
                      placeholder="Ex: 0102030405"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 text-xs font-mono text-slate-700 outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Password inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Mot de passe
                  </label>
                  <input
                    id="reg-password"
                    type={secureEyeRegister ? 'text' : 'password'}
                    required
                    placeholder="Min 4 caractères"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-705 outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Confirmer
                  </label>
                  <input
                    id="reg-confirm-password"
                    type={secureEyeRegister ? 'text' : 'password'}
                    required
                    placeholder="Identique"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-705 outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Optional Referral Invite Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Code de Parrainage (Optionnel)
                </label>
                <input
                  id="reg-invite"
                  type="text"
                  placeholder="Ex: KOFC39"
                  value={regInviteCode}
                  onChange={(e) => setRegInviteCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-mono text-slate-700 outline-none focus:border-emerald-500 uppercase tracking-widest"
                />
              </div>

              {/* SMS OTP TRIGGER WRAPPER */}
              <div className="space-y-2 border-t border-slate-50 pt-3">
                <div className="flex justify-between items-center bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/30">
                  <span className="text-[10px] text-slate-505 font-sans leading-relaxed">
                    Vérification par code OTP de sécurité requis :
                  </span>
                  {!otpSent ? (
                    <button
                      id="reg-btn-send-otp"
                      type="button"
                      onClick={triggerRegisterOTP}
                      className="px-2.5 py-1 text-[10px] bg-emerald-600 text-white rounded font-sans font-black tracking-wide shrink-0 transition-transform active:scale-95 cursor-pointer"
                    >
                      Recevoir OTP
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-800 font-bold">Code OTP généré !</span>
                  )}
                </div>

                {otpSent && (
                  <div>
                    <input
                      id="reg-otp-code-input"
                      type="text"
                      required
                      maxLength={6}
                      placeholder="Saisissez le code de validation à 6 chiffres"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-mono text-center tracking-[0.4em] font-semibold text-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* Register Button */}
              <button
                id="reg-submit-btn"
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-xs rounded-2xl mt-2 cursor-pointer select-none transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
              >
                S'enregistrer maintenant
                <ShieldCheck className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
      </div>

      {/* ======================= FORGOT PASSWORD MODAL ======================= */}
      {showForgotModal && (
        <div id="forgot-modal-overlay" className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">
            <div className="p-4 border-b border-rose-50 flex justify-between items-center bg-rose-500/5">
              <h3 className="font-sans font-extrabold text-slate-800 text-sm">
                Réinitialisation par OTP
              </h3>
              <button
                id="close-forgot-modal"
                onClick={() => setShowForgotModal(false)}
                className="p-1 px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-slate-505 font-sans text-xs leading-relaxed">
                Veuillez renseigner votre numéro de téléphone. Un code de sécurité unique vous sera expédié par simulation de SMS afin de configurer un nouveau mot de passe.
              </p>

              {/* Form elements for password recovery */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xxs font-semibold uppercase text-slate-500 tracking-wider">Téléphone de compte</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      id="forgot-phone-input"
                      type="tel"
                      placeholder="Ex: 0707070707"
                      value={forgotPhone}
                      onChange={(e) => setForgotPhone(e.target.value)}
                      className="flex-1 bg-slate-50 border rounded-xl px-3 py-2 text-xs font-mono"
                    />
                    {!forgotOtpSent && (
                      <button
                        id="forgot-otp-trigger-btn"
                        type="button"
                        onClick={triggerForgotOTP}
                        className="p-2 bg-emerald-600 text-white text-xxs rounded-xl font-sans font-bold select-none cursor-pointer"
                      >
                        Envoyer code
                      </button>
                    )}
                  </div>
                </div>

                {forgotOtpSent && !forgotOtpVerified && (
                  <div className="space-y-2">
                    <label className="block text-xxs font-semibold text-slate-600">Entrez le code de vérification reçu</label>
                    <div className="flex gap-2">
                      <input
                        id="forgot-otp-code"
                        type="text"
                        maxLength={6}
                        placeholder="Ex: 123456"
                        value={forgotOtpInput}
                        onChange={(e) => setForgotOtpInput(e.target.value)}
                        className="flex-1 bg-slate-50 border rounded-xl px-3 py-2 text-xs font-mono font-bold tracking-[0.2em] text-center"
                      />
                      <button
                        id="forgot-otp-verify-btn"
                        type="button"
                        onClick={handleForgotOTPVerify}
                        className="p-2 bg-slate-800 text-white text-[10px] font-sans font-bold rounded-xl"
                      >
                        Valider Code
                      </button>
                    </div>
                  </div>
                )}

                {forgotOtpVerified && (
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-3 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xxs font-semibold text-slate-600">Nouveau Mot de passe de compte</label>
                      <input
                        id="forgot-new-password"
                        type="password"
                        required
                        placeholder="Entrez au moins 4 caractères"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs mt-1"
                      />
                    </div>
                    
                    <button
                      id="forgot-submit-btn"
                      type="submit"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-sans font-bold rounded-xl shadow-md cursor-pointer"
                    >
                      Enregistrer le mot de passe
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
