/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ForumPost } from '../types';
import {
  MessageSquare,
  Plus,
  Heart,
  ThumbsUp,
  Image,
  Trash2,
  CheckCircle2,
  Send,
  MessageCircle,
} from 'lucide-react';

export const ForumView: React.FC = () => {
  const {
    forumPosts,
    addForumPost,
    likeForumPost,
    addForumComment,
    deleteForumPost,
    currentUser,
  } = useApp();

  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [showAddPost, setShowAddPost] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePostImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) {
      alert('Veuillez écrire un message à partager.');
      return;
    }
    addForumPost(newPostText, newPostImage || undefined);
    setNewPostText('');
    setNewPostImage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowAddPost(false);
  };

  const handleAddComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addForumComment(postId, commentText);
    setCommentText('');
    setActiveCommentPostId(null);
  };

  const hasAdminControls = currentUser?.role === 'admin' || currentUser?.id === 'u-admin';

  return (
    <div id="forum-view-container" className="animate-fade-in space-y-6 pb-24">
      
      {/* 📣 ECO-SYSTEM FORUM BANNER */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-650 to-indigo-700 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 select-none pointer-events-none">
          <MessageCircle className="w-56 h-56" />
        </div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-sans font-extrabold text-sm tracking-wide">
            💬 Forum Communautaire AgriAfri
          </h3>
          <span className="bg-white/20 border border-white/20 text-[9px] font-sans px-2 py-0.5 rounded-full font-bold">
            Activité: Intense
          </span>
        </div>
        <p className="font-sans text-xs text-blue-100 max-w-sm">
          Discutez avec des milliers d'investisseurs d'Afrique, partagez vos astuces, fiers rendements et preuves de paiement !
        </p>
      </div>

      {/* ✍️ WRITE A POST SECTION */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-sans font-extrabold text-slate-800 text-base">
            Publications Récentes ({forumPosts.length})
          </h3>
          <p className="font-sans text-xs text-slate-500">
            Échanges et entraide en temps réel
          </p>
        </div>

        {currentUser && (
          <button
            id="btn-trigger-add-post"
            onClick={() => setShowAddPost(!showAddPost)}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 text-xs font-sans font-bold transition-colors select-none"
          >
            <Plus className="w-4 h-4" />
            Publier
          </button>
        )}
      </div>

      {/* ADD POST MODAL-LIKE BOX OR FORM */}
      {showAddPost && (
        <div className="bg-white border border-blue-100 rounded-3xl p-4 shadow-sm animate-scale-up space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="font-sans font-black text-xs text-slate-800 uppercase tracking-wider">
              Partager une information ou preuve
            </h4>
            <button
              onClick={() => setShowAddPost(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 p-1"
            >
              Fermer
            </button>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-3">
            <textarea
              id="forum-new-post-content"
              required
              rows={3}
              placeholder="Que voulez-vous dire à la communauté AgriAfri aujourd'hui ?"
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-sans text-slate-700 outline-none focus:border-blue-500 transition-all resize-none"
            />

            <div>
              <label className="block text-[10px] font-sans font-bold text-slate-500 mb-1">
                📸 Ajouter un fichier / capture d'écran (optionnel)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-3 text-center cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <input
                  id="forum-post-image-input"
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePostImageChange}
                  className="hidden"
                />
                {newPostImage ? (
                  <div className="space-y-1">
                    <p className="text-[10px] text-blue-600 font-bold">Image prête !</p>
                    <img src={newPostImage} alt="Post preview" className="max-h-24 mx-auto object-cover rounded-lg" referrerPolicy="no-referrer" />
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400">
                    Insérer une preuve de paiement, relevé, ou photo d'exploitation
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setNewPostText('');
                  setNewPostImage('');
                  setShowAddPost(false);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-150 text-slate-600 rounded-xl text-xs font-sans font-bold transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-sans font-black shadow-md transition-all"
              >
                Diffuser sur le forum
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 🎙️ PUBLIC PUBLICATIONS LIST */}
      <div id="forum-posts-list" className="space-y-4">
        {forumPosts.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-150 text-slate-400">
            Aucun message publié sur le forum pour le moment.
          </div>
        ) : (
          forumPosts.map((post) => {
            const isLikedByCurrentUser = currentUser ? post.likedBy?.includes(currentUser.id) : false;

            return (
              <div
                id={`forum-post-${post.id}`}
                key={post.id}
                className="bg-white border border-slate-150 rounded-3xl p-4.5 hover:border-blue-200 transition-all shadow-xs space-y-3.5"
              >
                {/* Header Information */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 border border-slate-205 rounded-xl flex items-center justify-center text-lg shadow-inner">
                      {post.authorAvatar || '👤'}
                    </div>
                    <div>
                      <h4 className="font-sans font-extrabold text-slate-800 text-xs flex items-center gap-1.5 leading-none">
                        {post.authorName}
                        {post.role === 'admin' ? (
                          <span className="bg-red-500/10 text-red-600 text-[8px] font-sans px-1.5 py-0.5 rounded font-black uppercase tracking-wide">
                            ADMINISTRATEUR
                          </span>
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100 shrink-0" />
                        )}
                      </h4>
                      <p className="font-sans text-[9px] text-slate-400 mt-1">
                        {post.date}
                      </p>
                    </div>
                  </div>

                  {hasAdminControls && (
                    <button
                      onClick={() => {
                        if (confirm('Voulez-vous supprimer cette publication de la communauté ?')) {
                          deleteForumPost(post.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Supprimer la publication"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Main Content Body */}
                <p className="font-sans text-xs text-slate-600 leading-relaxed font-normal whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Uploaded File Graphic */}
                {post.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-slate-150 bg-slate-50 max-h-72 flex justify-center items-center">
                    <img
                      src={post.imageUrl}
                      alt="Publication AgriAfri"
                      className="max-h-72 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Action panel (Likes, comment toggle) */}
                <div className="flex items-center gap-4 pt-1 border-t border-slate-50 text-slate-500">
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        alert('Veuillez vous connecter pour aimer les publications !');
                        return;
                      }
                      likeForumPost(post.id);
                    }}
                    className={`flex items-center gap-1.5 text-xs font-sans font-bold transition-colors py-1 px-1.5 rounded-lg ${
                      isLikedByCurrentUser
                        ? 'text-rose-600 bg-rose-50'
                        : 'hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isLikedByCurrentUser ? 'fill-rose-100' : ''}`} />
                    <span>{post.likes || 0} J'aime</span>
                  </button>

                  <button
                    onClick={() => {
                      if (activeCommentPostId === post.id) {
                        setActiveCommentPostId(null);
                      } else {
                        setActiveCommentPostId(post.id);
                        setCommentText('');
                      }
                    }}
                    className={`flex items-center gap-1.5 text-xs font-sans font-bold hover:text-slate-800 transition-colors py-1 px-1.5 rounded-lg ${
                      activeCommentPostId === post.id ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{post.comments?.length || 0} Commentaires</span>
                  </button>
                </div>

                {/* Comments Section */}
                {post.comments && post.comments.length > 0 && (
                  <div className="space-y-2.5 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                    {post.comments.map((comm) => (
                      <div key={comm.id} className="text-xs font-sans space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-slate-850 flex items-center gap-1">
                            {comm.authorAvatar} {comm.authorName}
                            {comm.role === 'admin' && (
                              <span className="bg-red-500/10 text-red-600 text-[7px] font-sans px-1 rounded uppercase font-black tracking-wide shrink-0">
                                Admin
                              </span>
                            )}
                          </span>
                          <span className="text-[8px] text-slate-400">{comm.date}</span>
                        </div>
                        <p className="text-slate-650 bg-white border border-slate-100 p-2 rounded-xl text-[11px] leading-relaxed">
                          {comm.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Write reply comment form */}
                {activeCommentPostId === post.id && currentUser && (
                  <form
                    onSubmit={(e) => handleAddComment(post.id, e)}
                    className="flex gap-1.5 pt-1.5 animate-scale-up"
                  >
                    <input
                      id={`comment-input-${post.id}`}
                      type="text"
                      required
                      placeholder="Votre commentaire..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-sans text-slate-700 outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="submit"
                      className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
