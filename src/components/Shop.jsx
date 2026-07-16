import React, { useState } from 'react';
import { Coins, Palette, Sparkles, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';
import BouncyButton from './BouncyButton';
import BackArrow from './BackArrow';
import { USERNAME_COLORS, PROFILE_BANNERS, THEMES_LIST } from './Profile';
import { supabase } from '../utils/supabaseClient';
import { useAudio } from '../contexts/AudioContext';

const Shop = ({ user, profileData, onUpdateProfile, onBack }) => {
    const isGuest = !user;
    const { playSfx } = useAudio();
    const [selectedTab, setSelectedTab] = useState('colors'); // 'colors', 'banners', 'themes'
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const coins = profileData?.coins || 0;
    const unlockedItems = profileData?.unlocked_items || ['default', 'theme-safari'];

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

    // Live preview helper values
    const equippedColor = profileData?.equipped_color || 'default';
    const equippedBanner = profileData?.equipped_banner || 'default';
    const activeColorClass = USERNAME_COLORS.find(c => c.id === equippedColor)?.class || USERNAME_COLORS[0].class;
    const activeBanner = PROFILE_BANNERS.find(b => b.id === equippedBanner) || PROFILE_BANNERS[0];

    return (
        <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-20 bg-transparent relative overflow-y-auto no-scrollbar pb-24">
            <BackArrow onClick={onBack} />

            {/* Header */}
            <div className="z-10 text-center mb-6 max-w-md w-full mx-auto">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                    Boutique Agent
                </h2>
                <div className="flex items-center justify-center gap-1.5 mt-2 bg-black/45 px-4 py-2 rounded-full border-2 border-black inline-flex mx-auto shadow-[2px_2px_0_#000]">
                    <Coins className="w-4 h-4 text-spy-lime" />
                    <span className="text-sm font-black text-spy-lime font-display leading-none">{coins} Croquettes</span>
                </div>
            </div>

            {/* Live Preview Box */}
            <div className="z-10 w-full max-w-md bg-black/45 border-4 border-black rounded-[28px] p-4 mb-6 shadow-[4px_4px_0_#000] text-left">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-2 pl-1">Aperçu en direct de votre dossier :</span>
                <div className={`p-4 rounded-2xl border-2 border-black ${activeBanner.class} flex items-center justify-between`}>
                    <div>
                        <div className={`text-lg font-black uppercase tracking-tight ${activeColorClass}`}>
                            {profileData?.username || 'Agent Invité'}
                        </div>
                        <span className="text-[9px] font-black uppercase text-spy-lime mt-1 block">Niveau {profileData?.level || 1}</span>
                    </div>
                    <span className="text-xs bg-black/40 border border-white/10 px-2 py-1 rounded-lg text-white/70 font-black">PREVIEW</span>
                </div>
            </div>

            {/* Success/Error Alerts */}
            <div className="z-10 w-full max-w-md space-y-3">
                {errorMsg && (
                    <div className="bg-red-500/10 border-2 border-red-500/35 rounded-2xl p-4 text-center animate-pop-in">
                        <p className="text-red-400 text-xs font-black uppercase tracking-wider">{errorMsg}</p>
                    </div>
                )}
                {successMsg && (
                    <div className="bg-green-500/10 border-2 border-green-500/35 rounded-2xl p-4 text-center animate-pop-in">
                        <p className="text-green-400 text-xs font-black uppercase tracking-wider">{successMsg}</p>
                    </div>
                )}
            </div>

            {/* Tab Switched (3 Tabs) */}
            <div className="z-10 flex w-full max-w-md bg-black/25 rounded-2xl p-1 mb-6 border-2 border-black mt-4 shadow-[3px_3px_0_#000]">
                <button
                    type="button"
                    onClick={() => { setSelectedTab('colors'); setErrorMsg(''); setSuccessMsg(''); }}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${selectedTab === 'colors' ? 'bg-spy-lime text-spy-blue border border-black shadow-md' : 'text-white/60 hover:text-white'}`}
                >
                    Pseudos
                </button>
                <button
                    type="button"
                    onClick={() => { setSelectedTab('banners'); setErrorMsg(''); setSuccessMsg(''); }}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${selectedTab === 'banners' ? 'bg-spy-lime text-spy-blue border border-black shadow-md' : 'text-white/60 hover:text-white'}`}
                >
                    Bannières
                </button>
                <button
                    type="button"
                    onClick={() => { setSelectedTab('themes'); setErrorMsg(''); setSuccessMsg(''); }}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${selectedTab === 'themes' ? 'bg-spy-lime text-spy-blue border border-black shadow-md' : 'text-white/60 hover:text-white'}`}
                >
                    Thèmes
                </button>
            </div>

            {/* Products Grid */}
            <div className="z-10 w-full max-w-md space-y-4">
                {selectedTab === 'colors' && (
                    // COLORS SHOP
                    USERNAME_COLORS.filter(c => c.price > 0).map(color => {
                        const isOwned = unlockedItems.includes(color.id);
                        return (
                            <div key={color.id} className="bg-black/35 border-3 border-black rounded-[24px] p-4 flex items-center justify-between shadow-[4px_4px_0_#000]">
                                <div>
                                    <h4 className={`text-base font-black uppercase tracking-tight ${color.class}`}>
                                        {color.label}
                                    </h4>
                                    <p className="text-white/45 text-[9px] font-black uppercase tracking-wider mt-0.5">
                                        Style pour pseudo
                                    </p>
                                </div>

                                <div className="flex-none">
                                    {isOwned ? (
                                        <span className="text-spy-lime text-[10px] font-black uppercase tracking-widest bg-spy-lime/10 px-3 py-2 rounded-xl border border-spy-lime/25 flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Possédé
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleBuyItem(color.id, color.price)}
                                            className="bg-spy-lime active:scale-95 text-spy-blue font-black uppercase text-xs tracking-widest px-4 py-2.5 rounded-xl border-2 border-black shadow-[2px_2px_0_#000] hover:bg-spy-lime/90 transition-all flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <span>{color.price}</span>
                                            <Coins className="w-3.5 h-3.5 fill-current" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}

                {selectedTab === 'banners' && (
                    // BANNERS SHOP
                    PROFILE_BANNERS.filter(b => b.price > 0).map(banner => {
                        const isOwned = unlockedItems.includes(banner.id);
                        return (
                            <div key={banner.id} className="bg-black/35 border-3 border-black rounded-[24px] p-4 flex items-center justify-between shadow-[4px_4px_0_#000]">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl border-2 border-black flex-shrink-0 ${banner.previewClass}`}></div>
                                    <div>
                                        <h4 className="text-sm font-black text-white uppercase tracking-tight">
                                            {banner.label}
                                        </h4>
                                        <p className="text-white/45 text-[9px] font-black uppercase tracking-wider mt-0.5">
                                            Fond de profil
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-none">
                                    {isOwned ? (
                                        <span className="text-spy-lime text-[10px] font-black uppercase tracking-widest bg-spy-lime/10 px-3 py-2 rounded-xl border border-spy-lime/25 flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Possédé
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleBuyItem(banner.id, banner.price)}
                                            className="bg-spy-lime active:scale-95 text-spy-blue font-black uppercase text-xs tracking-widest px-4 py-2.5 rounded-xl border-2 border-black shadow-[2px_2px_0_#000] hover:bg-spy-lime/90 transition-all flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <span>{banner.price}</span>
                                            <Coins className="w-3.5 h-3.5 fill-current" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}

                {selectedTab === 'themes' && (
                    // THEMES SHOP
                    THEMES_LIST.filter(t => t.price > 0).map(theme => {
                        const themeItemId = `theme-${theme.id}`;
                        const isOwned = unlockedItems.includes(themeItemId);
                        return (
                            <div key={theme.id} className="bg-black/35 border-3 border-black rounded-[24px] p-4 flex items-center justify-between shadow-[4px_4px_0_#000]">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl w-9 h-9 bg-black/25 rounded-xl border border-white/5 flex items-center justify-center flex-shrink-0">{theme.icon}</span>
                                    <div>
                                        <h4 className="text-sm font-black text-white uppercase tracking-tight">
                                            Thème {theme.label}
                                        </h4>
                                        <p className="text-white/45 text-[9px] font-black uppercase tracking-wider mt-0.5">
                                            Décor d'ambiance
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-none">
                                    {isOwned ? (
                                        <span className="text-spy-lime text-[10px] font-black uppercase tracking-widest bg-spy-lime/10 px-3 py-2 rounded-xl border border-spy-lime/25 flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Possédé
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleBuyItem(themeItemId, theme.price)}
                                            className="bg-spy-lime active:scale-95 text-spy-blue font-black uppercase text-xs tracking-widest px-4 py-2.5 rounded-xl border-2 border-black shadow-[2px_2px_0_#000] hover:bg-spy-lime/90 transition-all flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <span>{theme.price}</span>
                                            <Coins className="w-3.5 h-3.5 fill-current" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {isGuest && (
                <div className="z-10 w-full max-w-md mt-8 bg-black/25 border-3 border-black rounded-2xl p-4 text-center flex items-start gap-3">
                    <Lock className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
                    <p className="text-white/55 text-[10px] font-black leading-relaxed uppercase tracking-wider text-left">
                        En mode Invité, les achats sont sauvegardés localement. Crée un compte pour ne pas les perdre en changeant d'appareil.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Shop;
