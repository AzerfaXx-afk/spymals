import React, { useState, useEffect } from 'react';
import { Camera, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { CartoonAvatar, CARTOON_AVATARS_LIST } from './CartoonAvatars';

const EditProfileModal = ({ profileData, onSave, onClose, isForce = false }) => {
    const [username, setUsername] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('fox-detective');
    const [showAnimalModal, setShowAnimalModal] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (profileData) {
            setUsername(profileData.username || '');
            setSelectedAvatar(profileData.avatar_emoji || 'fox-detective');
        }
    }, [profileData]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 128;
                const MAX_HEIGHT = 128;
                let width = img.width;
                let height = img.height;

                const size = Math.min(width, height);
                const xOffset = (width - size) / 2;
                const yOffset = (height - size) / 2;

                canvas.width = MAX_WIDTH;
                canvas.height = MAX_HEIGHT;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(
                    img,
                    xOffset, yOffset, size, size,
                    0, 0, MAX_WIDTH, MAX_HEIGHT
                );

                const base64 = canvas.toDataURL('image/jpeg', 0.8);
                setSelectedAvatar(base64);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        if (!username.trim()) {
            setErrorMsg("Le pseudo ne peut pas être vide.");
            return;
        }
        if (username.length > 20) {
            setErrorMsg("Le pseudo est trop long (max 20 caractères).");
            return;
        }
        setErrorMsg('');
        onSave({
            ...profileData,
            username: username.trim(),
            avatar_emoji: selectedAvatar
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-pop-in">
            <div className="max-w-sm w-full rounded-3xl p-6 relative text-left space-y-5 backdrop-blur-2xl transition-all duration-300"
                style={{
                    background: 'linear-gradient(180deg, rgba(15,23,42,0.96) 0%, rgba(2,6,23,0.98) 100%)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
            >
                {/* Close button if not forced */}
                {!isForce && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 active:scale-95 transition-all z-20 cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}

                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex items-center px-3 py-0.5 rounded-full bg-spy-lime/10 border border-spy-lime/30 text-spy-lime text-[8px] font-black uppercase tracking-widest mb-1">
                        DOSSIER D'AGENT SECRET
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-white">
                        {isForce ? "Finaliser votre Profil" : "Modifier votre Profil"}
                    </h3>
                    <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-spy-lime to-transparent mx-auto rounded-full mt-1"></div>
                </div>

                {errorMsg && (
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3.5 flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                        <p className="text-rose-300 text-xs font-bold leading-relaxed">{errorMsg}</p>
                    </div>
                )}

                <div className="space-y-4">
                    {/* Username input */}
                    <div className="space-y-1">
                        <label className="text-[9.5px] font-black uppercase tracking-widest text-white/45 pl-1">Pseudo Agent</label>
                        <input
                            type="text"
                            required
                            placeholder="ex: Agent Cobra"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-slate-950/80 border border-white/15 rounded-2xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-spy-lime/60 transition-colors shadow-inner"
                        />
                    </div>

                    {/* Avatar selector cards */}
                    <div className="space-y-1">
                        <label className="text-[9.5px] font-black uppercase tracking-widest text-white/45 pl-1 block">
                            Avatar de l'agent
                        </label>
                        
                        {(() => {
                            const isCustomImage = selectedAvatar.startsWith('data:image/') || selectedAvatar.startsWith('http');
                            const mascotPreviewId = isCustomImage 
                                ? (profileData?.avatar_emoji && !profileData.avatar_emoji.startsWith('data:') && !profileData.avatar_emoji.startsWith('http') ? profileData.avatar_emoji : 'fox-detective')
                                : selectedAvatar;

                            return (
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    {/* Card 1: Predefined Animal Mascots */}
                                    <button
                                        type="button"
                                        onClick={() => setShowAnimalModal(true)}
                                        className={`rounded-2xl p-3.5 flex flex-col items-center justify-center gap-2 cursor-pointer border transition-all duration-200 min-h-[100px] relative ${
                                            !isCustomImage
                                                ? 'bg-spy-lime/10 border-spy-lime shadow-[0_0_15px_rgba(204,255,0,0.15)]'
                                                : 'bg-white/5 border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="w-11 h-11 rounded-xl bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center">
                                            <CartoonAvatar id={mascotPreviewId} className="w-full h-full border-none shadow-none" />
                                        </div>
                                        <div className="text-center">
                                            <span className="text-[9.5px] font-black uppercase tracking-wider block text-white">
                                                Mascottes
                                            </span>
                                            <span className="text-[8px] text-spy-lime font-bold block mt-0.5">Choisir mascotte</span>
                                        </div>
                                        {!isCustomImage && (
                                            <CheckCircle2 className="w-4 h-4 text-spy-lime absolute top-2 right-2" />
                                        )}
                                    </button>

                                    {/* Card 2: Gallery / Photo */}
                                    <label
                                        className={`rounded-2xl p-3.5 flex flex-col items-center justify-center gap-2 cursor-pointer border transition-all duration-200 min-h-[100px] relative overflow-hidden ${
                                            isCustomImage
                                                ? 'bg-spy-lime/10 border-spy-lime shadow-[0_0_15px_rgba(204,255,0,0.15)]'
                                                : 'bg-white/5 border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        {isCustomImage ? (
                                            <>
                                                <img src={selectedAvatar} alt="Photo" className="w-11 h-11 rounded-xl object-cover border border-white/20 shadow-md" />
                                                <div className="text-center">
                                                    <span className="text-[9.5px] font-black uppercase tracking-wider block text-white">
                                                        Photo Galerie
                                                    </span>
                                                    <span className="text-[8px] text-spy-lime font-bold block mt-0.5">Changer l'image</span>
                                                </div>
                                                <CheckCircle2 className="w-4 h-4 text-spy-lime absolute top-2 right-2" />
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                                    <Camera className="w-6 h-6 text-white/60" />
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-[9.5px] font-black uppercase tracking-wider block text-white">
                                                        Photo Galerie
                                                    </span>
                                                    <span className="text-[8px] text-white/40 font-bold block mt-0.5">Importer photo</span>
                                                </div>
                                            </>
                                        )}
                                    </label>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                <div className="pt-2">
                    <button 
                        onClick={handleSave} 
                        className="w-full py-3.5 bg-gradient-to-r from-spy-lime via-[#d9ff33] to-spy-lime border-2 border-white rounded-2xl text-slate-950 font-black uppercase text-xs tracking-wider shadow-[0_4px_14px_rgba(204,255,0,0.3)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
                    >
                        Sauvegarder le dossier
                    </button>
                </div>

            </div>

            {/* Animal Grid Modal */}
            {showAnimalModal && (
                <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-[110] animate-pop-in">
                    <div className="max-w-sm w-full rounded-3xl p-6 relative backdrop-blur-2xl"
                        style={{
                            background: 'linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(2,6,23,0.99) 100%)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.9)'
                        }}
                    >
                        <div className="text-center mb-4">
                            <h4 className="text-lg font-black uppercase tracking-tight text-white">Sélectionner une Mascotte</h4>
                            <p className="text-[9px] font-black text-spy-lime uppercase tracking-widest mt-0.5">
                                Choisissez votre avatar d'agent
                            </p>
                        </div>

                        <div className="grid grid-cols-5 gap-2.5 mb-5">
                            {CARTOON_AVATARS_LIST.map((avatar) => (
                                <button
                                    key={avatar.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedAvatar(avatar.id);
                                        setShowAnimalModal(false);
                                    }}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all border cursor-pointer overflow-hidden ${
                                        selectedAvatar === avatar.id
                                            ? 'bg-spy-lime/20 border-spy-lime scale-105 shadow-[0_0_12px_rgba(204,255,0,0.3)]'
                                            : 'bg-white/5 border-white/10 hover:border-white/30 active:scale-95'
                                    }`}
                                >
                                    <CartoonAvatar id={avatar.id} className="w-full h-full border-none shadow-none" />
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowAnimalModal(false)}
                            className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-black uppercase text-xs tracking-wider transition-all cursor-pointer"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditProfileModal;
