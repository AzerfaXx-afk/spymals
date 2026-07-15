import React, { useState, useEffect } from 'react';
import BouncyButton from './BouncyButton';

const STARTER_AVATARS = ['🦁', '🦊', '🐨', '🐼', '🐯', '🐻', '🦉', '🐱', '🐶', '🐸'];

const EditProfileModal = ({ profileData, onSave, onClose, isForce = false }) => {
    const [username, setUsername] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('🦁');
    const [showAnimalModal, setShowAnimalModal] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (profileData) {
            setUsername(profileData.username || '');
            setSelectedAvatar(profileData.avatar_emoji || '🦁');
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

                // Crop to square
                const size = Math.min(width, height);
                const xOffset = (width - size) / 2;
                const yOffset = (height - size) / 2;

                canvas.width = MAX_WIDTH;
                canvas.height = MAX_HEIGHT;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(
                    img,
                    xOffset, yOffset, size, size, // Source rect
                    0, 0, MAX_WIDTH, MAX_HEIGHT   // Dest rect
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-pop-in">
            <div className="bg-white/10 backdrop-blur-2xl border border-white/15 rounded-[36px] p-8 max-w-md w-full shadow-2xl relative text-left space-y-6">
                
                {/* Close button if not forced */}
                {!isForce && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/55 hover:text-white hover:bg-white/10 active:scale-95 transition-all z-20 cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {/* Header */}
                <div className="text-center">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                        {isForce ? "Finaliser votre Profil" : "Modifier votre Profil"}
                    </h3>
                    <p className="text-spy-lime text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                        Dossier d'agent secret
                    </p>
                </div>

                {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 flex items-start gap-3 animate-pop-in">
                        <span className="text-red-500 text-lg flex-none select-none">⚠️</span>
                        <p className="text-red-400 text-xs font-black uppercase tracking-wide leading-relaxed">{errorMsg}</p>
                    </div>
                )}

                <div className="space-y-4">
                    {/* Username input */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-2">Pseudo Agent</label>
                        <input
                            type="text"
                            required
                            placeholder="ex: Agent Cobra"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black/25 border border-white/10 rounded-2xl px-4 py-3.5 text-white font-bold text-sm focus:border-spy-lime focus:outline-none transition-colors shadow-inner"
                        />
                    </div>

                    {/* Avatar selector cards */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-2 block">
                            Avatar de l'agent
                        </label>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {/* Card 1: Predefined Animals */}
                            <button
                                type="button"
                                onClick={() => setShowAnimalModal(true)}
                                className={`rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer border transition-all duration-300 min-h-[96px] ${
                                    !selectedAvatar.startsWith('data:image/') && !selectedAvatar.startsWith('http')
                                        ? 'bg-spy-lime/10 border-spy-lime shadow-lg shadow-spy-lime/5'
                                        : 'bg-black/25 border-white/10 hover:border-white/20'
                                }`}
                            >
                                <div className="text-3xl filter drop-shadow-md select-none">
                                    {!selectedAvatar.startsWith('data:image/') && !selectedAvatar.startsWith('http') ? selectedAvatar : '🦁'}
                                </div>
                                <div className="text-center">
                                    <span className={`text-[10px] font-black uppercase tracking-wider block ${!selectedAvatar.startsWith('data:image/') && !selectedAvatar.startsWith('http') ? 'text-spy-lime' : 'text-white/60'}`}>
                                        Animaux Agents
                                    </span>
                                    <span className="text-[8px] text-white/30 block mt-0.5">Modifier l'animal</span>
                                </div>
                            </button>

                            {/* Card 2: Gallery / Google Photo */}
                            <label
                                className={`rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer border transition-all duration-300 min-h-[96px] relative overflow-hidden ${
                                    selectedAvatar.startsWith('data:image/') || selectedAvatar.startsWith('http')
                                        ? 'bg-spy-lime/10 border-spy-lime shadow-lg shadow-spy-lime/5'
                                        : 'bg-black/25 border-white/10 hover:border-white/20'
                                }`}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                {selectedAvatar.startsWith('data:image/') || selectedAvatar.startsWith('http') ? (
                                    <>
                                        <img src={selectedAvatar} alt="Photo" className="w-10 h-10 rounded-full object-cover border border-white/15 animate-pop-in" />
                                        <div className="text-center">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-spy-lime block">
                                                Photo Profil
                                            </span>
                                            <span className="text-[8px] text-white/30 block mt-0.5">Changer l'image</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-3xl text-white/40">📷</div>
                                        <div className="text-center">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-white/60 block">
                                                Photo Galerie
                                            </span>
                                            <span className="text-[8px] text-white/30 block mt-0.5">Importer une photo</span>
                                        </div>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <BouncyButton onClick={handleSave} className="w-full py-4 uppercase tracking-wider font-black">
                        Sauvegarder le dossier
                    </BouncyButton>
                </div>

            </div>

            {/* Animal Grid Modal */}
            {showAnimalModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-pop-in">
                    <div className="bg-spy-blue/90 border border-white/15 rounded-[32px] p-6 max-w-sm w-full shadow-2xl relative">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Sélectionner un Animal</h3>
                            <p className="text-[9px] font-black text-spy-lime uppercase tracking-widest mt-0.5">
                                Choisis ton avatar d'agent
                            </p>
                        </div>

                        <div className="grid grid-cols-5 gap-3.5 mb-6">
                            {STARTER_AVATARS.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => {
                                        setSelectedAvatar(emoji);
                                        setShowAnimalModal(false);
                                    }}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all border cursor-pointer ${
                                        selectedAvatar === emoji
                                            ? 'bg-spy-lime/20 border-spy-lime scale-110 shadow-lg shadow-spy-lime/20'
                                            : 'bg-black/35 border-white/10 hover:border-white/20 active:scale-95'
                                    }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>

                        <BouncyButton
                            type="button"
                            onClick={() => setShowAnimalModal(false)}
                            variant="secondary"
                            className="w-full py-4 text-xs font-black uppercase tracking-wider"
                        >
                            Fermer
                        </BouncyButton>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditProfileModal;
