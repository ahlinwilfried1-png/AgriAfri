/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Review } from '../types';
import {
  Star,
  Plus,
  Trash2,
  Edit,
  User,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Award,
  Users,
  Check,
  X,
} from 'lucide-react';

export const ReviewsView: React.FC = () => {
  const { reviews, addReview, updateReview, deleteReview, currentUser, deposits, withdrawals, users } = useApp();

  // Dialog controls
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [avatar, setAvatar] = useState('👨‍🌾');
  const [image, setImage] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Interactive statistics:
  const verifiedDepositsCount = deposits.filter((d) => d.status === 'VALIDATED').length + 845;
  const verifiedWithdrawalsCount = withdrawals.filter((w) => w.status === 'PAID').length + 512;
  const activeMembersCount = users.length + 32840;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      alert('Veuillez remplir tous les champs !');
      return;
    }
    addReview(name, avatar, rating, comment, image);
    setName('');
    setComment('');
    setRating(5);
    setImage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowAddModal(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    updateReview(editingReview.id, rating, comment);
    setEditingReview(null);
    setComment('');
  };

  const triggerEdit = (rev: Review) => {
    setEditingReview(rev);
    setRating(rev.rating);
    setComment(rev.comment);
  };

  // Is current view capable of admin controls?
  // We can let either real admin, or any user for evaluating purposes easily, or strictly user role-based
  const hasAdminControls = currentUser?.role === 'admin' || currentUser?.id === 'u-admin';

  return (
    <div id="reviews-view-container" className="animate-fade-in space-y-6 pb-24">
      
      {/* 📈 PERFORMANCE & STATISTIQUE METRICS BAR */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl p-5 text-white shadow-md">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-sans font-extrabold text-sm tracking-wide">
            ⭐ Notoriété d'AgriAfri
          </h3>
          <span className="bg-white/20 border border-white/20 text-[10px] font-sans px-2.5 py-0.5 rounded-full font-bold">
            Note: 4.9/5
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="bg-white/10 rounded-2xl p-2 border border-white/5">
            <h4 className="font-sans font-black text-xs sm:text-sm">{activeMembersCount.toLocaleString()}</h4>
            <p className="font-sans text-[8px] text-emerald-100 mt-1 uppercase tracking-wider font-semibold">Membres</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-2 border border-white/5">
            <h4 className="font-sans font-black text-xs sm:text-sm">{verifiedDepositsCount.toLocaleString()}</h4>
            <p className="font-sans text-[8px] text-emerald-100 mt-1 uppercase tracking-wider font-semibold">Dépôts Validés</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-2 border border-white/5">
            <h4 className="font-sans font-black text-xs sm:text-sm">{verifiedWithdrawalsCount.toLocaleString()}</h4>
            <p className="font-sans text-[8px] text-emerald-100 mt-1 uppercase tracking-wider font-semibold">Retraits Payés</p>
          </div>
        </div>
      </div>

      {/* 🎁 COMMENT HEADER WITH ADD ACTION */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-sans font-extrabold text-slate-800 text-base flex items-center gap-1.5">
            Témoignages Utilisateurs ({reviews.length})
          </h3>
          <p className="font-sans text-xs text-slate-500">
            Retours réels de nos investisseurs en Afrique
          </p>
        </div>

        {/* Add comment button (Admin gets immediate power, but also allow custom testimonials) */}
        <button
          id="btn-trigger-add-review"
          onClick={() => setShowAddModal(true)}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 text-xs font-sans font-bold transition-colors select-none"
        >
          <Plus className="w-4 h-4" />
          Écrire
        </button>
      </div>

      {/* 🎙️ REVIEWS LIST */}
      <div id="reviews-feed-container" className="space-y-3">
        {reviews.map((rev) => (
          <div
            id={`review-item-${rev.id}`}
            key={rev.id}
            className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-emerald-250 transition-all shadow-xs space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                {/* Avatar Frame */}
                <div className="w-10 h-10 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-center text-lg shadow-inner">
                  {rev.authorAvatar || '👤'}
                </div>
                {/* Author Credentials */}
                <div>
                  <h4 className="font-sans font-bold text-slate-800 text-xs flex items-center gap-1">
                    {rev.authorName}
                    {rev.isVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100 shrink-0" title="Compte d'investisseur vérifié" />
                    )}
                  </h4>
                  <p className="font-sans text-[10px] text-slate-400 font-medium">
                    {rev.date}
                  </p>
                </div>
              </div>

              {/* Star Rating Grid */}
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < rev.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Testimonial Message Body */}
            <p className="font-sans text-xs text-slate-600 leading-relaxed font-normal bg-slate-50/50 p-3 rounded-2xl border border-slate-100/30">
              "{rev.comment}"
            </p>

            {rev.imageUrl && (
              <div className="mt-2 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center max-h-64">
                <img src={rev.imageUrl} alt="Attachement utilisateur" className="max-h-64 object-cover" referrerPolicy="no-referrer" />
              </div>
            )}

            {/* Admin Controls Panel */}
            {hasAdminControls && (
              <div className="flex justify-end gap-2 pt-1 border-t border-slate-50">
                <button
                  id={`review-edit-btn-${rev.id}`}
                  onClick={() => triggerEdit(rev)}
                  className="px-2.5 py-1.5 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200/50 text-yellow-800 rounded-lg text-[10px] font-sans font-bold flex items-center gap-1 transition-colors select-none"
                >
                  <Edit className="w-3 h-3" />
                  Modifier
                </button>
                <button
                  id={`review-del-btn-${rev.id}`}
                  onClick={() => {
                    if (confirm('Voulez-vous supprimer ce commentaire de la plateforme ?')) {
                      deleteReview(rev.id);
                    }
                  }}
                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200/50 text-rose-800 rounded-lg text-[10px] font-sans font-bold flex items-center gap-1 transition-colors select-none"
                >
                  <Trash2 className="w-3 h-3" />
                  Supprimer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ADD REVIEW MODAL */}
      {showAddModal && (
        <div id="add-review-overlay" className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">
            <div className="p-4 border-b border-emerald-50 flex justify-between items-center bg-emerald-500/5">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <h3 className="font-sans font-bold text-slate-800 text-sm">
                  Publier un Témoignage
                </h3>
              </div>
              <button
                id="close-add-review"
                onClick={() => setShowAddModal(false)}
                className="p-1 px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">
                  Nom Complet ou Pseudo
                </label>
                <input
                  id="review-add-name-input"
                  type="text"
                  required
                  placeholder="Ex: Fatoumata Coulibaly"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans text-slate-700 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Avatar Selector Mini-panel */}
              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">
                  Choisir un Avatar
                </label>
                <div className="flex justify-between gap-1.5">
                  {['👨‍🌾', '👩‍💼', '👨‍💻', '👩‍🌾', '🤵', '🌍'].map((emoji) => (
                    <button
                      id={`emoji-btn-${emoji}`}
                      key={emoji}
                      type="button"
                      onClick={() => setAvatar(emoji)}
                      className={`flex-1 py-1 px-1.5 border rounded-lg text-lg transition-transform ${
                        avatar === emoji
                          ? 'bg-emerald-50 border-emerald-500 scale-110'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Star Selection */}
              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">
                  Note attribuée
                </label>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      id={`star-btn-rate-${i}`}
                      key={i}
                      type="button"
                      onClick={() => setRating(i + 1)}
                      className="text-amber-500"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          i < rating ? 'fill-amber-500' : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-slate-500 font-sans font-semibold ml-1">
                    {rating}/5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">
                  Votre commentaire
                </label>
                <textarea
                  id="review-add-msg-input"
                  required
                  rows={3}
                  placeholder="Partagez vos impressions sur AgriAfri..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-sans text-slate-700 outline-none focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  📸 Ajouter une photo (facultatif)
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-3 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <input
                    id="review-image-input"
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {image ? (
                    <div className="space-y-1">
                      <p className="text-[10px] text-emerald-600 font-bold">Image sélectionnée !</p>
                      <img src={image} alt="Review upload" className="max-h-20 mx-auto object-cover rounded-lg" referrerPolicy="no-referrer" />
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400">
                      Cliquez pour sélectionner ou glissez-déposez une image
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  id="review-add-close"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-sans font-semibold transition-colors"
                >
                  Fermer
                </button>
                <button
                  id="review-add-submit"
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-sans font-bold shadow-md transition-colors animate-pulse-once"
                >
                  Publier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT REVIEW MODAL */}
      {editingReview && (
        <div id="edit-review-overlay" className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100">
            <div className="p-4 border-b border-amber-50 flex justify-between items-center bg-amber-500/5">
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-amber-600" />
                <h3 className="font-sans font-bold text-slate-800 text-sm">
                  Modifier le Commentaire
                </h3>
              </div>
              <button
                id="close-edit-review"
                onClick={() => setEditingReview(null)}
                className="p-1 px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-4 space-y-3.5">
              <div className="bg-slate-50 p-3 rounded-2xl">
                <p className="text-[10px] font-sans text-slate-400">AUTEUR</p>
                <p className="font-sans font-bold text-xs text-slate-700 mt-0.5">
                  {editingReview.authorName} {editingReview.authorAvatar}
                </p>
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1 font-sans">
                  Note attribuée
                </label>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      id={`edit-star-btn-${i}`}
                      key={i}
                      type="button"
                      onClick={() => setRating(i + 1)}
                      className="text-amber-500"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          i < rating ? 'fill-amber-500' : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">
                  Commentaire
                </label>
                <textarea
                  id="review-edit-msg-input"
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-sans text-slate-700 outline-none focus:border-amber-500 transition-all resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  id="review-edit-close"
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="flex-1 py-2 bg-slate-50 hover:bg-slate-105 text-slate-500 rounded-xl text-xs font-sans font-semibold transition-colors"
                >
                  Fermer
                </button>
                <button
                  id="review-edit-submit"
                  type="submit"
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-sans font-bold shadow-md transition-colors"
                >
                  Confirmer la modification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
