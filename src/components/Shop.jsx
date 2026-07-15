import React, { useState } from 'react';
import BouncyButton from './BouncyButton';
import BackArrow from './BackArrow';
import { USERNAME_COLORS, PROFILE_BANNERS } from './Profile';
import { supabase } from '../utils/supabaseClient';
import { useAudio } from '../contexts/AudioContext';

const Shop = ({ user, profileData, onUpdateProfile, onBack }) => {
    const isGuest = !user;
    const { playSfx } = useAudio();
    const [selectedTab, setSelectedTab] = useState('colors');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const coins = profileData?.coins || 0;
    const unlockedItems = profileData?.unlocked_items || ['default'];

    const handleBuyItem = async (itemId, price) => {
        setErrorMsg('');
        setSuccessMsg('');

        if (coins < price) {
            setErrorMsg("Croquettes insuffisantes ! Joue des parties pour en gagner.");
            playSfx('/sons/lose.mp3', { volumeMultiplier: 0.5 });
            return;
        }

        const newCoins = coins - price;
        const newUnlocked = [...unlockedItems, itemId];
        const updated = {
            ...profileData,
            coins: newCoins,
            unlocked_items: newUnlocked
        };

        if (isGuest) {
            onUpdateProfile(updated);
            setSuccessMsg("Objet acheté avec succès ! Retrouve-le sur ton profil.");
            playSfx('/sons/confetti.mp3', { volumeMultiplier: 0.6 });
        } else {
            // Update online profile in Supabase
            onUpdateProfile(updated); // optimistic update
            
            try {
                const { error } = await supabase
                    .from('spymals_profiles')
                    .update({
                        coins: newCoins,
                        unlocked_items: newUnlocked
                    })
                    .eq('id', user.id);

                if (error) throw error;
                
                setSuccessMsg("Achat validé et synchronisé sur la centrale !");
                playSfx('/sons/confetti.mp3', { volumeMultiplier: 0.6 });
            } catch (err) {
                console.error("Failed to sync purchase:", err);
                setErrorMsg("Erreur lors de la synchronisation de l'achat.");
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-20 bg-spy-blue relative overflow-y-auto no-scrollbar pb-10">
            <BackArrow onClick={onBack} />

            {/* Header */}
            <div className="z-10 text-center mb-6 max-w-md w-full mx-auto">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                    Boutique Agent
                </h2>
                <div className="flex items-center justify-center gap-1.5 mt-1 bg-black/30 px-4 py-1.5 rounded-full border border-white/5 inline-block mx-auto">
                    <span className="text-base">🐾</span>
                    <span className="text-sm font-black text-spy-lime font-display leading-none">{coins} Croquettes</span>
                </div>
            </div>

            {/* Success/Error Alerts */}
            <div className="z-10 w-full max-w-md space-y-3">
                {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 text-center animate-pop-in">
                        <p className="text-red-400 text-xs font-black uppercase tracking-wider">{errorMsg}</p>
                    </div>
                )}
                {successMsg && (
                    <div className="bg-green-500/10 border border-green-500/25 rounded-2xl p-4 text-center animate-pop-in">
                        <p className="text-green-400 text-xs font-black uppercase tracking-wider">{successMsg}</p>
                    </div>
                )}
            </div>

            {/* Tab Switched */}
            <div className="z-10 flex w-full max-w-md bg-black/25 rounded-2xl p-1 mb-6 border border-white/5 mt-4">
                <button
                    type="button"
                    onClick={() => { setSelectedTab('colors'); setErrorMsg(''); setSuccessMsg(''); }}
                    className={`flex-1 py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${selectedTab === 'colors' ? 'bg-spy-lime text-spy-blue shadow-lg shadow-spy-lime/10' : 'text-white/60 hover:text-white'}`}
                >
                    Pseudos (Couleurs)
                </button>
                <button
                    type="button"
                    onClick={() => { setSelectedTab('banners'); setErrorMsg(''); setSuccessMsg(''); }}
                    className={`flex-1 py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${selectedTab === 'banners' ? 'bg-spy-lime text-spy-blue shadow-lg shadow-spy-lime/10' : 'text-white/60 hover:text-white'}`}
                >
                    Bannières Dossier
                </button>
            </div>

            {/* Products Grid */}
            <div className="z-10 w-full max-w-md space-y-4">
                {selectedTab === 'colors' ? (
                    // COLORS SHOP
                    USERNAME_COLORS.filter(c => c.price > 0).map(color => {
                        const isOwned = unlockedItems.includes(color.id);
                        return (
                            <div key={color.id} className="bg-white/5 border border-white/10 rounded-[28px] p-5 flex items-center justify-between shadow-xl backdrop-blur-md">
                                <div>
                                    <h4 className={`text-lg font-black uppercase tracking-tight ${color.class}`}>
                                        {color.label}
                                    </h4>
                                    <p className="text-white/45 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                                        Style pour pseudo
                                    </p>
                                </div>

                                <div className="flex-none">
                                    {isOwned ? (
                                        <span className="text-spy-lime text-xs font-black uppercase tracking-widest bg-spy-lime/10 px-3 py-2 rounded-xl border border-spy-lime/20">
                                            ✓ Possédé
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleBuyItem(color.id, color.price)}
                                            className="bg-spy-lime active:scale-95 text-spy-blue font-black uppercase text-xs tracking-widest px-4 py-2.5 rounded-xl border border-white/20 shadow-md hover:bg-spy-lime/90 transition-all flex items-center gap-1"
                                        >
                                            <span>{color.price}</span>
                                            <span>🐾</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    // BANNERS SHOP
                    PROFILE_BANNERS.filter(b => b.price > 0).map(banner => {
                        const isOwned = unlockedItems.includes(banner.id);
                        return (
                            <div key={banner.id} className="bg-white/5 border border-white/10 rounded-[28px] p-5 flex items-center justify-between shadow-xl backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl border border-white/15 ${banner.previewClass}`}></div>
                                    <div>
                                        <h4 className="text-base font-black text-white uppercase tracking-tight">
                                            {banner.label}
                                        </h4>
                                        <p className="text-white/45 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                                            Fond de profil
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-none">
                                    {isOwned ? (
                                        <span className="text-spy-lime text-xs font-black uppercase tracking-widest bg-spy-lime/10 px-3 py-2 rounded-xl border border-spy-lime/20">
                                            ✓ Possédé
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleBuyItem(banner.id, banner.price)}
                                            className="bg-spy-lime active:scale-95 text-spy-blue font-black uppercase text-xs tracking-widest px-4 py-2.5 rounded-xl border border-white/20 shadow-md hover:bg-spy-lime/90 transition-all flex items-center gap-1"
                                        >
                                            <span>{banner.price}</span>
                                            <span>🐾</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {isGuest && (
                <div className="z-10 w-full max-w-md mt-8 bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <p className="text-white/55 text-xs leading-relaxed">
                        💡 **Note** : En mode Invité, les achats sont sauvegardés localement. Crée un compte pour ne pas les perdre en changeant d'appareil !
                    </p>
                </div>
            )}
        </div>
    );
};

export default Shop;
