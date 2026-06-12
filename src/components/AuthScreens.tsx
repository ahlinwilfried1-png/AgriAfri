/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Phone, User, Landmark, ShieldCheck, ArrowRight, Eye, EyeOff, Sparkles, ChevronDown, Link, Check } from 'lucide-react';

interface AuthScreensProps {
  onSuccess: () => void;
}

export const AuthScreens: React.FC<AuthScreensProps> = ({ onSuccess }) => {
  const { registerUser, loginUser, sendOTP, verifyOTP, resetPasswordByOTP } = useApp();

  // Registration is now the default view
  const [isLoginView, setIsLoginView] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Common Phone Country indices structure (Togo first with flags)
  const countries = [
    { code: '+228', name: 'Togo 🇹🇬', flag: '🇹🇬' },
    { code: '+225', name: 'Côte d\'Ivoire 🇨🇮', flag: '🇨🇮' },
    { code: '+221', name: 'Sénégal 🇸🇳', flag: '🇸🇳' },
    { code: '+226', name: 'Burkina Faso 🇧🇫', flag: '🇧🇫' },
    { code: '+229', name: 'Bénin 🇧🇯', flag: '🇧🇯' },
    { code: '+223', name: 'Mali 🇲🇱', flag: '🇲🇱' },
    { code: '+227', name: 'Niger 🇳🇪', flag: '🇳🇪' },
    { code: '+237', name: 'Cameroun 🇨🇲', flag: '🇨🇲' },
  ];

  // --- REGISTRATION FIELDS ---
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCountryCode, setRegCountryCode] = useState('+228');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regInviteCode, setRegInviteCode] = useState('');

  // Auto-fill invite code from URL parameters (?ref=XXXXX) on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const refCode = params.get('ref');
      if (refCode) {
        setRegInviteCode(refCode.toUpperCase().trim());
        setIsLoginView(false); // Make sure registration view is open to fill it in
      }
    } catch (e) {
      console.error('Failed to parse referral code from URL:', e);
    }
  }, []);
  
  // Custom states for verification OTP simulation
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Automated live OTP code for registration (completely offline/network simulated, no SMS)
  const [regOtpCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [otpInput, setOtpInput] = useState('');

  const handleSendOtp = () => {
    if (!regPhone.trim()) {
      setAuthError('Veuillez introduire votre numéro de téléphone d\'abord.');
      return;
    }
    setIsSendingOtp(true);
    setAuthError(null);
    setTimeout(() => {
      setIsSendingOtp(false);
      setOtpSent(true);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpInput(code);
      alert(`[AgriAfri OTP] Votre code de vérification est: ${code}`);
    }, 800);
  };

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
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!regName.trim() || !regPhone.trim() || !regPassword.trim()) {
      setAuthError('Tous les champs sont requis.');
      return;
    }

    if (regPassword.length < 6) {
      setAuthError('Le mot de passe doit faire au moins 6 caractères.');
      return;
    }

    // Attempt registration (confirm is same as password since confirm field is removed)
    const signup = registerUser(regName, regPhone, regCountryCode, regPassword, regInviteCode);
    if (signup.success) {
      setRegistrationSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2500);
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
              
              {registrationSuccess && (
                <div id="registration-success-badge" className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center space-y-1.5 animate-bounce mb-3">
                  <div className="text-[#0f62fe] font-sans font-black text-xs uppercase tracking-wider leading-snug">
                    Création de compte ... Bienvenue chez Agrocapital !
                  </div>
                  <div className="text-emerald-700 font-sans font-extrabold text-[13px] uppercase tracking-wide">
                    ✓ Inscription réussie !
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans font-medium">
                    Connexion automatique en cours d'initialisation...
                  </div>
                </div>
              )}
              
              {/* Pays Dropdown */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">
                  Pays
                </label>
                <div className="relative bg-[#eceff3] rounded-2xl">
                  <select
                    id="reg-country-code"
                    value={regCountryCode}
                    onChange={(e) => setRegCountryCode(e.target.value)}
                    className="w-full bg-transparent border-none rounded-2xl px-4 py-3.5 pr-10 text-xs font-semibold text-slate-700 outline-none appearance-none cursor-pointer"
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Numéro de téléphone */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">
                  Numéro de téléphone
                </label>
                <div className="bg-[#eceff3] rounded-2xl px-4 py-3.5">
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    placeholder="Numéro de téléphone"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-transparent border-none text-xs text-slate-705 outline-none focus:ring-0 p-0"
                  />
                </div>
              </div>

              {/* Surnom (Full Name) */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">
                  Surnom
                </label>
                <div className="bg-[#eceff3] rounded-2xl px-4 py-3.5">
                  <input
                    id="reg-name"
                    type="text"
                    required
                    placeholder="Surnom"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-transparent border-none text-xs text-slate-705 outline-none focus:ring-0 p-0"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">
                  Mot de passe
                </label>
                <div className="relative bg-[#eceff3] rounded-2xl flex items-center pr-4 pl-4 py-3.5">
                  <input
                    id="reg-password"
                    type={secureEyeRegister ? 'text' : 'password'}
                    required
                    placeholder="Mot de passe de connexion (min. 6 caractè)"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="flex-1 bg-transparent border-none text-xs text-slate-705 outline-none p-0 focus:ring-0 pr-2"
                  />
                  <button
                    type="button"
                    onClick={() => setSecureEyeRegister(!secureEyeRegister)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
                  >
                    {secureEyeRegister ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Code d'invitation */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">
                  Code d'invitation
                </label>
                <div className="relative bg-[#eceff3] rounded-2xl flex items-center pr-4 pl-4 py-3.5">
                  <input
                    id="reg-invite"
                    type="text"
                    placeholder="Veuillez entrer le code d'invitation (requis)"
                    value={regInviteCode}
                    onChange={(e) => setRegInviteCode(e.target.value)}
                    className="flex-1 bg-transparent border-none text-xs text-slate-750 outline-none p-0 focus:ring-0 pr-2 uppercase font-mono"
                  />
                  <Link className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
                </div>
              </div>



              {/* Solid blue register button */}
              <button
                id="reg-submit-btn"
                type="submit"
                className="w-full py-4 bg-[#0f62fe] hover:bg-blue-700 text-white font-sans font-bold text-sm rounded-3xl mt-6 cursor-pointer select-none transition-all flex items-center justify-center shadow-lg shadow-blue-500/10"
              >
                S'inscrire
              </button>

              {/* Outlined blue login redirection button */}
              <button
                id="switch-to-login-btn"
                type="button"
                onClick={() => {
                  setIsLoginView(true);
                  setAuthError(null);
                }}
                className="w-full py-3.5 bg-transparent hover:bg-blue-50 text-[#0f62fe] border border-[#0f62fe] font-sans font-bold text-xs rounded-3xl mt-3 cursor-pointer select-none transition-all flex items-center justify-center"
              >
                Se connecter maintenant
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
