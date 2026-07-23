import React, { useState, useRef } from 'react';
import { Camera, Check, X, Edit2, RotateCcw, Lock, Sparkles } from 'lucide-react';
import { CartoonAvatar, CARTOON_AVATARS_LIST } from './CartoonAvatars';

const PRESET_AVATARS = CARTOON_AVATARS_LIST;

const EditPlayerModal = ({ player, profileData, onSave, onCancel }) => {
    const getDefaultName = (av) => {
        if (av.type === 'emoji') {
            const animal = PRESET_AVATARS.find(a => a.id === av.value);
            if (animal) return `Agent ${animal.label}`;
        }
        return 'Agent Secret';
    };

    const unlockedItems = profileData?.unlocked_items || ['default', 'lime', 'orange'];

    const [name, setName] = useState(player.isCustom ? player.name : '');
    const [avatar, setAvatar] = useState(player.avatar);
    const [pseudoColor, setPseudoColor] = useState(player.pseudoColor || 'text-white');
    const [isCustomName, setIsCustomName] = useState(player.isCustom || false);
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);
    const fileInputRef = useRef(null);

    const COLOR_PALETTE = [
        { id: 'default', class: 'text-white', bgClass: 'bg-white', label: 'Blanc Classique', price: 0, unlocked: true },
        { id: 'lime', class: 'text-spy-lime', bgClass: 'bg-spy-lime', label: 'Néon Lime', price: 0, unlocked: true },
        { id: 'orange', class: 'text-spy-orange', bgClass: 'bg-spy-orange', label: 'Orange Espion', price: 0, unlocked: true },
        { id: 'cyan', class: 'text-cyan-400', bgClass: 'bg-cyan-400', label: 'Cyan Cyber', price: 50, unlocked: unlockedItems.includes('cyan') },
        { id: 'purple', class: 'text-purple-400', bgClass: 'bg-purple-400', label: 'Violet Infiltré', price: 100, unlocked: unlockedItems.includes('purple') },
        { id: 'pink', class: 'text-pink-400', bgClass: 'bg-pink-400', label: 'Rose Néon', price: 100, unlocked: unlockedItems.includes('pink') },
        { id: 'gold', class: 'text-yellow-400 font-black drop-shadow-[0_2px_10px_rgba(234,179,8,0.4)]', bgClass: 'bg-yellow-400', label: 'Or Impérial', price: 250, unlocked: unlockedItems.includes('gold') },
    ];

    const selectedColorObj = COLOR_PALETTE.find(c => c.class === pseudoColor) || COLOR_PALETTE[0];

    const handleSave = () => {
        const finalName = name.trim() !== '' ? name.trim() : player.name;
        const finalIsCustom = name.trim() !== '';
        onSave({ ...player, name: finalIsCustom ? finalName : getDefaultName(avatar), avatar, isCustom: finalIsCustom, pseudoColor });
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
        setIsCustomName(e.target.value.trim() !== '');
    };

    const resetToDefault = () => {
        setName('');
        setIsCustomName(false);
    };

    const handleAvatarSelect = (animal) => {
        setAvatar({ type: 'emoji', value: animal.id });
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-pop-in touch-none">
            {/* Modal Card */}
            <div className={`
                card-cartoon w-full max-w-sm rounded-t-[36px] sm:rounded-[36px] 
                p-6 shadow-[0_20px_50px_rgba(0,0,0,0.95)] flex flex-col items-center space-y-5 
                bg-gradient-to-b from-[#162744] via-[#0e1b30] to-[#08101e]
                border-[3.5px] border-white/20 relative overflow-hidden z-10
            `}>

                <div className="w-12 h-1 bg-white/20 rounded-full mb-1 sm:hidden"></div>

                <div className="bg-spy-lime/10 px-3 py-1 rounded-full border border-spy-lime/30">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-spy-lime">Personnalisation Agent</span>
                </div>

                <h3 className="text-2xl font-black text-white uppercase tracking-tight text-shadow-md">
                    Modifier l'Agent
                </h3>

                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-3 relative group">
                    <div
                        onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                        className="w-28 h-28 rounded-full bg-black/40 flex items-center justify-center
                        border-4 border-spy-lime cursor-pointer shadow-[0_0_30px_rgba(204,255,0,0.3)]
                        hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden relative"
                    >
                        {/* Edit Overlay */}
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit2 className="w-6 h-6 text-spy-lime" />
                            <span className="text-[9px] font-black text-white uppercase mt-1">Changer</span>
                        </div>

                        {avatar.type === 'image' ? (
                            <img src={avatar.value} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <CartoonAvatar id={avatar.value} className="w-full h-full border-none shadow-none" />
                        )}
                    </div>

                    {/* Visual Button to Toggle Avatar Picker */}
                    <button
                        type="button"
                        onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                        className="text-xs font-black uppercase tracking-wider text-spy-lime hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                        <Edit2 className="w-3.5 h-3.5" /> {isEditingAvatar ? 'Fermer le choix' : 'Changer l\'avatar'}
                    </button>
                </div>

                {/* Avatar Selection Grid (Collapse/Expand) */}
                {isEditingAvatar && (
                    <div className="w-full bg-black/40 p-3 rounded-2xl animate-fade-in border-2 border-white/10 shadow-inner">
                        <div className="grid grid-cols-4 gap-2 mb-3 max-h-44 overflow-y-auto custom-scrollbar p-1">
                            {PRESET_AVATARS.map((animal) => {
                                const isSelected = avatar.value === animal.id;
                                return (
                                    <button
                                        key={animal.id}
                                        type="button"
                                        onClick={() => handleAvatarSelect(animal)}
                                        className={`p-1.5 flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer border ${
                                            isSelected 
                                                ? 'bg-spy-lime/20 border-spy-lime scale-105 shadow-[0_0_12px_rgba(204,255,0,0.4)]' 
                                                : 'bg-white/5 border-white/10 hover:bg-white/15'
                                        }`}
                                    >
                                        <CartoonAvatar id={animal.id} className="w-10 h-10 border-none shadow-none" />
                                        <span className="text-[8.5px] font-black text-white/80 mt-1 uppercase truncate max-w-[55px] text-center">
                                            {animal.label.split(' ')[0]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex justify-center">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs text-white font-black uppercase tracking-wider hover:text-spy-lime border-2 border-white/20 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/15 transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <Camera className="w-4 h-4 text-spy-lime" /> Importer Photo
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
                )}

                {/* Code Name Input */}
                <div className="w-full relative">
                    <label className="block text-spy-lime text-[10px] font-black uppercase tracking-widest mb-1.5 pl-1">
                        Nom de code Agent
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            placeholder={getDefaultName(avatar)}
                            className={`w-full bg-black/40 border-2 border-white/15 rounded-2xl px-4 py-3 font-black text-center text-lg focus:border-spy-lime focus:outline-none transition-all shadow-inner placeholder:text-white/25 ${pseudoColor}`}
                            autoFocus
                        />
                        {isCustomName && (
                            <button
                                onClick={resetToDefault}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-spy-orange transition-colors p-1 cursor-pointer"
                                title="Réinitialiser"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Color Picker Swatches with Gamified Lock Status */}
                    <div className="flex flex-col items-center gap-1.5 mt-3 w-full">
                        <div className="flex items-center justify-center gap-2">
                            {COLOR_PALETTE.map((color) => (
                                <button
                                    key={color.id}
                                    type="button"
                                    onClick={() => setPseudoColor(color.class)}
                                    className={`w-7 h-7 rounded-full ${color.bgClass} border-2 transition-all cursor-pointer relative flex items-center justify-center ${
                                        pseudoColor === color.class 
                                            ? 'scale-125 border-white shadow-[0_0_14px_rgba(255,255,255,0.8)] ring-2 ring-spy-lime' 
                                            : color.unlocked 
                                                ? 'border-black/60 hover:scale-110 opacity-80 hover:opacity-100'
                                                : 'border-black/80 opacity-50 hover:opacity-80'
                                    }`}
                                    title={color.unlocked ? `${color.label} (Débloquée)` : `${color.label} (🔒 À débloquer en Boutique)`}
                                >
                                    {!color.unlocked ? (
                                        <Lock className="w-3.5 h-3.5 text-black stroke-[3] drop-shadow-sm" />
                                    ) : pseudoColor === color.class ? (
                                        <div className="w-2 h-2 rounded-full bg-black shadow-sm" />
                                    ) : null}
                                </button>
                            ))}
                        </div>
                        <span className="text-[9.5px] font-black uppercase tracking-wider text-white/70 bg-black/40 px-3 py-1 rounded-full border border-white/10 mt-1 flex items-center gap-1.5 shadow-inner">
                            <span>Couleur : <span className={selectedColorObj.class}>{selectedColorObj.label}</span></span>
                            <span className="text-white/30">•</span>
                            {selectedColorObj.unlocked ? (
                                <span className="text-spy-lime flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-spy-lime" /> Débloquée
                                </span>
                            ) : (
                                <span className="text-amber-400 flex items-center gap-1">
                                    <Lock className="w-3 h-3 text-amber-400" /> À débloquer dans le Shop
                                </span>
                            )}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex w-full gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn-cartoon-secondary flex-1 py-3 text-xs font-black uppercase tracking-wider cursor-pointer shadow-[0_4px_0_#000] active:translate-y-1 active:shadow-[0_0_0_#000] flex items-center justify-center gap-1.5"
                    >
                        <X className="w-4 h-4 stroke-[3]" /> ANNULER
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="btn-cartoon-primary flex-1 py-3 text-sm font-black uppercase tracking-wider cursor-pointer shadow-[0_4px_0_#000] active:translate-y-1 active:shadow-[0_0_0_#000] flex items-center justify-center gap-1.5"
                    >
                        <Check className="w-4 h-4 stroke-[3]" /> VALIDER
                    </button>
                </div>

            </div>
        </div>
    );
};

export default EditPlayerModal;

