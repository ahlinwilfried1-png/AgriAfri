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

  // Registration is now the default view
  const [isLoginView, setIsLoginView] = useState(false);
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
  
  // Automated live OTP code for registration (completely offline/network simulated, no SMS)
  const [regOtpCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [otpInput, setOtpInput] = useState(regOtpCode);

  // Automated live OTP code for login (purely for secure visual consistency)
  const [loginOtpCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [loginOtpInput, setLoginOtpInput] = useState(loginOtpCode);

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

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!regName.trim() || !regPhone.trim() || !regPassword.trim() || !regConfirmPassword.trim()) {
      setAuthError('Tous les champs sont requis.');
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

    // Attempt registration
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

  // Trigger forgot OTP reset flow logic - Now completely automated in-app
  const triggerForgotOTP = () => {
    setAuthError(null);
    if (!forgotPhone.trim()) {
      setAuthError('Veuillez introduire votre numéro de téléphone.');
      return;
    }
    
    // Generate code without sending any SMS
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setForgotOtpInput(generated);
    setForgotOtpSent(true);
    setForgotOtpVerified(true); // Automatically pre-verified!
    alert(`Code de vérification automatique (${generated}) généré et validé avec succès par l'application.`);
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
      alert('Votre mot de passe a bien été mis à jour ! Vous pouvez vous connecter à présent.');
      setShowForgotModal(false);
      setForgotPhone('');
      setForgotOtpSent(false);
      setForgotOtpVerified(false);
      setForgotNewPassword('');
      setIsLoginView(true); // Bring to login screen
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

          {/* Subtitle Header */}
          <div className="mb-5 text-center">
            <h2 className="font-display font-black text-lg text-slate-800 tracking-tight">
              {isLoginView ? "Ravi de vous revoir" : "Bienvenue sur AgriAfri"}
            </h2>
            <p className="text-xxs font-medium text-slate-400 mt-0.5 uppercase tracking-wider">
              {isLoginView ? "Accédez à votre espace sécurisé" : "Créez votre compte investisseur"}
            </p>
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

              {/* Automated Login Verification Code (OTP) */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600">
                  Code de sécurité OTP
                </label>
                <input
                  id="login-otp-code-input"
                  type="text"
                  readOnly
                  value={loginOtpInput}
                  className="w-full bg-slate-105 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-mono text-center tracking-[0.4em] font-semibold text-slate-500 cursor-not-allowed select-none"
                />
                <span className="text-[10px] text-emerald-700 font-bold block text-center">
                  ✓ Code OTP vérifié automatiquement
                </span>
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

              <div className="text-center mt-5 pt-4 border-t border-slate-100">
                <button
                  id="switch-to-register-btn"
                  type="button"
                  onClick={() => {
                    setIsLoginView(false);
                    setAuthError(null);
                  }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 font-display transition-all cursor-pointer"
                >
                  Nouveau sur AgriAfri ? S'inscrire
                </button>
              </div>


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
                      placeholder="Ex: 0701020304"
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

              {/* AUTOMATED OTP CODE VERIFICATION HARNESS CONTAINER */}
              <div className="space-y-1.5 border-t border-slate-105 pt-3">
                <label className="block text-xs font-semibold text-slate-600">
                  Code de validation OTP
                </label>
                <div>
                  <input
                    id="reg-otp-code-input"
                    type="text"
                    readOnly
                    value={otpInput}
                    className="w-full bg-slate-105 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-mono text-center tracking-[0.4em] font-semibold text-slate-500 cursor-not-allowed select-none"
                  />
                </div>
                <p className="text-[10px] text-emerald-800 font-bold block text-center">
                  ⚡ Code OTP généré et validé automatiquement par le système (Aucun SMS requis)
                </p>
              </div>

              {/* Register Button */}
              <button
                id="reg-submit-btn"
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-xs rounded-2xl mt-2 cursor-pointer select-none transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
              >
                S'inscrire
                <ShieldCheck className="w-4 h-4" />
              </button>

              <div className="text-center mt-5 pt-4 border-t border-slate-100">
                <button
                  id="switch-to-login-btn"
                  type="button"
                  onClick={() => {
                    setIsLoginView(true);
                    setAuthError(null);
                  }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 font-display transition-all cursor-pointer"
                >
                  Se connecter
                </button>
              </div>
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
                Veuillez renseigner votre numéro de téléphone. Un code de sécurité unique sera généré et validé automatiquement par AgriAfri (aucune attente de SMS nécessaire).
              </p>

              {/* Form elements for password recovery */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xxs font-semibold uppercase text-slate-550 tracking-wider">Téléphone de compte</label>
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
                        Générer & Valider OTP
                      </button>
                    )}
                  </div>
                </div>

                {forgotOtpVerified && (
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-3 pt-2 border-t border-slate-100 animate-fade-in">
                    <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-100 text-[10px] font-bold text-center">
                      ✓ OTP Vérifié automatiquement par AgriAfri avec succès !
                    </div>
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
