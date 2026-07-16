import React, { useState, useEffect } from 'react';
import { Camera, AlertTriangle, X } from 'lucide-react';
import BouncyButton from './BouncyButton';
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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-pop-in">
            <div className="card-cartoon max-w-sm w-full p-6 relative text-left space-y-5 bg-[#fffdf5] text-black">
                
                {/* Close button if not forced */}
                {!isForce && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 border-2 border-black flex items-center justify-center text-black hover:bg-black/20 active:scale-95 transition-all z-20 cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}

                {/* Header */}
                <div className="text-center">
                    <h3 className="text-xl font-black uppercase tracking-tight">
                        {isForce ? "Finaliser votre Profil" : "Modifier votre Profil"}
                    </h3>
                    <p className="text-spy-orange text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                        Dossier d'agent secret
                    </p>
                </div>

                {errorMsg && (
                    <div className="bg-red-500/10 border-2 border-red-500 rounded-2xl p-4 flex items-start gap-3 animate-pop-in">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-red-700 text-xs font-black uppercase tracking-wide leading-relaxed">{errorMsg}</p>
                    </div>
                )}

                <div className="space-y-4">
                    {/* Username input */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/60 pl-1">Pseudo Agent</label>
                        <input
                            type="text"
                            required
                            placeholder="ex: Agent Cobra"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-white border-3 border-black rounded-2xl px-4 py-3 text-black font-bold text-sm focus:outline-none transition-colors shadow-[2px_2px_0_#000]"
                        />
                    </div>

                    {/* Avatar selector cards */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/60 pl-1 block">
                            Avatar de l'agent
                        </label>
                        
                        <div className="grid grid-cols-2 gap-4 pt-1">
                            {/* Card 1: Predefined Animals */}
                            <button
                                type="button"
                                onClick={() => setShowAnimalModal(true)}
                                className={`rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer border-3 transition-all duration-300 min-h-[96px] ${
                                    !selectedAvatar.startsWith('data:image/') && !selectedAvatar.startsWith('http')
                                        ? 'bg-spy-lime/25 border-black shadow-[3px_3px_0_#000] scale-102 font-black'
                                        : 'bg-white border-black hover:bg-slate-50'
                                }`}
                            >
                                <CartoonAvatar id={selectedAvatar} className="w-12 h-12 border-none shadow-none" />
                                <div className="text-center">
                                    <span className="text-[9px] font-black uppercase tracking-wider block">
                                        Mascottes Cartoon
                                    </span>
                                    <span className="text-[8px] opacity-60 block mt-0.5">Modifier la mascotte</span>
                                </div>
                            </button>

                            {/* Card 2: Gallery / Photo */}
                            <label
                                className={`rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer border-3 transition-all duration-300 min-h-[96px] relative overflow-hidden ${
                                    selectedAvatar.startsWith('data:image/') || selectedAvatar.startsWith('http')
                                        ? 'bg-spy-lime/25 border-black shadow-[3px_3px_0_#000] scale-102 font-black'
                                        : 'bg-white border-black hover:bg-slate-50'
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
                                        <img src={selectedAvatar} alt="Photo" className="w-12 h-12 rounded-full object-cover border-2 border-black animate-pop-in" />
                                        <div className="text-center">
                                            <span className="text-[9px] font-black uppercase tracking-wider block">
                                                Photo Profil
                                            </span>
                                            <span className="text-[8px] opacity-60 block mt-0.5">Changer l'image</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Camera className="w-8 h-8 text-black" />
                                        <div className="text-center">
                                            <span className="text-[9px] font-black uppercase tracking-wider block">
                                                Photo Galerie
                                            </span>
                                            <span className="text-[8px] opacity-60 block mt-0.5">Importer photo</span>
                                        </div>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <button 
                        onClick={handleSave} 
                        className="btn-cartoon-primary w-full py-3.5 uppercase tracking-wider font-black text-sm shadow-[4px_4px_0_#000]"
                    >
                        Sauvegarder le dossier
                    </button>
                </div>

            </div>

            {/* Animal Grid Modal */}
            {showAnimalModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-pop-in">
                    <div className="card-cartoon max-w-sm w-full p-6 relative bg-[#fffdf5] text-black">
                        <div className="text-center mb-5">
                            <h3 className="text-lg font-black uppercase tracking-tight">Sélectionner une Mascotte</h3>
                            <p className="text-[9px] font-black text-spy-orange uppercase tracking-widest mt-0.5">
                                Choisi ton avatar d'agent
                            </p>
                        </div>

                        <div className="grid grid-cols-5 gap-3 mb-6">
                            {CARTOON_AVATARS_LIST.map((avatar) => (
                                <button
                                    key={avatar.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedAvatar(avatar.id);
                                        setShowAnimalModal(false);
                                    }}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all border-2 cursor-pointer ${
                                        selectedAvatar === avatar.id
                                            ? 'bg-spy-lime/25 border-black scale-110 shadow-[2px_2px_0_#000]'
                                            : 'bg-white border-black/10 hover:border-black active:scale-95'
                                    }`}
                                >
                                    <CartoonAvatar id={avatar.id} className="w-10 h-10 border-none shadow-none" />
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowAnimalModal(false)}
                            className="btn-cartoon-secondary w-full py-3 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0_#000]"
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
