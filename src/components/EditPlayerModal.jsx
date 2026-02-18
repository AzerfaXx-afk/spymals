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
        // If name matches default pattern for the current avatar, treat as not custom for future
        const currentDefaultName = avatar.type === 'emoji'
            ? `Agent ${PRESET_AVATARS.find(a => a.emoji === avatar.value)?.name || 'Inconnu'}`
            : null;

        // We update isCustom based on whether they deviated from default
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-spy-blue border border-white/20 w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col items-center space-y-6">

                <h3 className="text-2xl font-black text-white uppercase tracking-wider">
                    Modifier l'Agent
                </h3>

                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-4">
                    <div
                        onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                        className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center text-6xl border-4 border-spy-lime cursor-pointer hover:bg-white/20 transition-colors overflow-hidden"
                    >
                        {avatar.type === 'image' ? (
                            <img src={avatar.value} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span>{avatar.value}</span>
                        )}
                    </div>
                    <span className="text-sm text-spy-lime font-bold uppercase tracking-widest">
                        Tapez pour changer
                    </span>
                </div>

                {/* Avatar Selection Grid (shown if editing) */}
                {isEditingAvatar && (
                    <div className="w-full bg-black/20 p-4 rounded-xl animate-fade-in">
                        <div className="grid grid-cols-6 gap-2 mb-4">
                            {PRESET_AVATARS.map((animal) => (
                                <button
                                    key={animal.emoji}
                                    onClick={() => handleAvatarSelect(animal)}
                                    className="text-2xl p-2 bg-white/10 rounded-lg hover:bg-spy-lime/50 transition-colors"
                                    title={animal.name}
                                >
                                    {animal.emoji}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-center">
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="text-sm text-white font-bold underline hover:text-spy-orange"
                            >
                                Importer une image
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

                {/* Name Input */}
                <div className="w-full">
                    <div className="flex justify-between items-center mb-2 px-2">
                        <label className="block text-white/60 text-sm font-bold uppercase">Nom de code</label>
                        {isCustomName && (
                            <button onClick={resetToDefault} className="text-xs text-spy-orange font-bold uppercase hover:underline">
                                Réinitialiser
                            </button>
                        )}
                    </div>
                    <input
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                        className="w-full bg-white/10 border-2 border-white/20 rounded-full px-6 py-3 text-white font-bold text-center text-xl focus:border-spy-lime focus:outline-none transition-colors"
                        autoFocus
                    />
                </div>

                {/* Actions */}
                <div className="flex w-full space-x-4 pt-2">
                    <BouncyButton variant="secondary" onClick={onCancel} className="flex-1">
                        Annuler
                    </BouncyButton>
                    <BouncyButton variant="primary" onClick={handleSave} className="flex-1">
                        Valider
                    </BouncyButton>
                </div>

            </div>
        </div>
    );
};

export default EditPlayerModal;
