import React, { useState, useRef } from 'react';
import BouncyButton from './BouncyButton';

const PRESET_AVATARS = [
    { emoji: '🦁', name: 'Lion' }, { emoji: '🦊', name: 'Renard' }, { emoji: '🐼', name: 'Panda' },
    { emoji: '🐨', name: 'Koala' }, { emoji: '🐯', name: 'Tigre' }, { emoji: '🐵', name: 'Singe' },
    { emoji: '🐸', name: 'Grenouille' }, { emoji: '🦉', name: 'Hibou' }, { emoji: '🦄', name: 'Licorne' },
    { emoji: '🐲', name: 'Dragon' }, { emoji: '🐶', name: 'Chien' }, { emoji: '🐱', name: 'Chat' },
    { emoji: '🐰', name: 'Lapin' }, { emoji: '🐙', name: 'Poulpe' }, { emoji: '🐮', name: 'Vache' },
    { emoji: '🐷', name: 'Cochon' }, { emoji: '🐭', name: 'Souris' }, { emoji: '🐻', name: 'Ours' },
    { emoji: '🦖', name: 'T-Rex' }, { emoji: '🦈', name: 'Requin' }, { emoji: '🦀', name: 'Crabe' },
    { emoji: '🦋', name: 'Papillon' }
];

const EditPlayerModal = ({ player, onSave, onCancel }) => {
    const [name, setName] = useState(player.name);
    const [avatar, setAvatar] = useState(player.avatar);
    const [isCustomName, setIsCustomName] = useState(player.isCustom || false);
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);
    const fileInputRef = useRef(null);

    const handleSave = () => {
        const currentDefaultName = avatar.type === 'emoji'
            ? `Agent ${PRESET_AVATARS.find(a => a.emoji === avatar.value)?.name || 'Inconnu'}`
            : null;

        const finalIsCustom = name !== currentDefaultName;
        onSave({ ...player, name, avatar, isCustom: finalIsCustom });
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
        setIsCustomName(true);
    };

    const resetToDefault = () => {
        if (avatar.type === 'emoji') {
            const animal = PRESET_AVATARS.find(a => a.emoji === avatar.value);
            if (animal) {
                setName(`Agent ${animal.name}`);
                setIsCustomName(false);
            }
        }
    };

    const handleAvatarSelect = (animal) => {
        setAvatar({ type: 'emoji', value: animal.emoji });
        if (!isCustomName) {
            setName(`Agent ${animal.name}`);
        }
        setIsEditingAvatar(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar({ type: 'image', value: reader.result });
                setIsEditingAvatar(false);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in touch-none">
            {/* Modal Card */}
            <div className={`
                bg-[#1a2c4e] w-full max-w-md rounded-t-[40px] sm:rounded-[40px] 
                p-8 shadow-2xl flex flex-col items-center space-y-6 
                border-t border-white/10 sm:border border-white/5
                animate-slide-up bg-gradient-to-b from-[#1a2c4e] to-[#0a1629]
            `}>

                <div className="w-16 h-1 bg-white/10 rounded-full mb-2 sm:hidden"></div>

                <h3 className="text-2xl font-black text-white uppercase tracking-wider drop-shadow-md">
                    Modifier l'Agent
                </h3>

                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-4 relative group">
                    <div
                        onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                        className="w-32 h-32 rounded-full bg-black/20 flex items-center justify-center text-7xl 
                        border-4 border-spy-lime cursor-pointer shadow-[0_0_30px_rgba(204,255,0,0.2)]
                        hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden relative"
                    >
                        {/* Edit Overlay */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-2xl">✏️</span>
                        </div>

                        {avatar.type === 'image' ? (
                            <img src={avatar.value} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="filter drop-shadow-md">{avatar.value}</span>
                        )}
                    </div>
                </div>

                {/* Avatar Selection Grid (Collapse/Expand) */}
                {isEditingAvatar ? (
                    <div className="w-full bg-black/30 p-4 rounded-2xl animate-fade-in border border-white/5">
                        <div className="grid grid-cols-6 gap-2 mb-4 max-h-40 overflow-y-auto no-scrollbar">
                            {PRESET_AVATARS.map((animal) => (
                                <button
                                    key={animal.emoji}
                                    onClick={() => handleAvatarSelect(animal)}
                                    className="text-2xl aspect-square flex items-center justify-center bg-white/5 rounded-xl hover:bg-spy-lime hover:scale-110 transition-all"
                                    title={animal.name}
                                >
                                    {animal.emoji}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-center">
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="text-xs text-white/70 font-bold uppercase tracking-widest hover:text-white border border-white/20 px-4 py-2 rounded-full transition-colors"
                            >
                                📸 Importer Photo
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="h-4"></div> // Spacer to prevent jumps
                )}

                {/* Name Input */}
                <div className="w-full relative">
                    <label className="block text-spy-lime/70 text-[10px] font-bold uppercase tracking-widest mb-2 pl-4">Nom de code</label>
                    <input
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                        className="w-full bg-black/20 border-2 border-white/10 rounded-2xl px-6 py-4 text-white font-bold text-center text-xl focus:border-spy-lime focus:outline-none transition-all shadow-inner focus:bg-black/40"
                        autoFocus
                    />
                    {isCustomName && (
                        <button
                            onClick={resetToDefault}
                            className="absolute right-4 top-[38px] text-xs text-white/30 hover:text-spy-orange transition-colors"
                        >
                            ↺
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="flex w-full space-x-4 pt-4">
                    <BouncyButton variant="secondary" onClick={onCancel} className="flex-1 py-4 text-sm">
                        ANNULER
                    </BouncyButton>
                    <BouncyButton variant="primary" onClick={handleSave} className="flex-1 py-4 text-lg shadow-spy-lime/20 shadow-xl">
                        VALIDER
                    </BouncyButton>
                </div>

            </div>
        </div>
    );
};

export default EditPlayerModal;
