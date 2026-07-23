import React, { useState } from 'react';
import { 
  CheckCircle2, Lock, Sparkles, 
  Compass, Cpu, Snowflake, Ghost, Gamepad2, Eye, Zap
} from 'lucide-react';
import { USERNAME_COLORS, PROFILE_BANNERS, THEMES_LIST } from './Profile';
import { supabase } from '../utils/supabaseClient';
import { useAudio } from '../contexts/AudioContext';
import { CartoonAvatar } from './CartoonAvatars';

const Shop = ({ user, profileData, onUpdateProfile, onBack }) => {
    const isGuest = !user;
    const { playSfx } = useAudio();
    const [selectedTab, setSelectedTab] = useState('colors'); // 'colors', 'banners', 'themes'
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Temporary preview states
    const [previewColorId, setPreviewColorId] = useState(null);
    const [previewBannerId, setPreviewBannerId] = useState(null);

    const coins = profileData?.coins || 0;
    const unlockedItems = profileData?.unlocked_items || ['default', 'theme-safari'];

    const equippedColor = profileData?.equipped_color || 'default';
    const equippedBanner = profileData?.equipped_banner || 'default';

    // Active or Previewed values for the Live Preview box
    const activeColorId = previewColorId || equippedColor;
    const activeBannerId = previewBannerId || equippedBanner;

    const activeColorObj = USERNAME_COLORS.find(c => c.id === activeColorId) || USERNAME_COLORS[0];
    const activeBannerObj = PROFILE_BANNERS.find(b => b.id === activeBannerId) || PROFILE_BANNERS[0];

    const isPreviewActive = (previewColorId && previewColorId !== equippedColor) || (previewBannerId && previewBannerId !== equippedBanner);

    const resetPreview = () => {
        setPreviewColorId(null);
        setPreviewBannerId(null);
    };

    // Handle Buy cosmetic item
    const handleBuyItem = async (itemId, price, type) => {
        setErrorMsg('');
        setSuccessMsg('');

        if (coins < price) {
            setErrorMsg("Croquettes insuffisantes ! Joue des parties pour en gagner.");
            playSfx('/sons/lose.mp3', { volumeMultiplier: 0.5 });
            return;
        }

        const newCoins = coins - price;
        const newUnlocked = [...unlockedItems, itemId];
        
        let equipUpdates = {};
        if (type === 'color') equipUpdates = { equipped_color: itemId };
        if (type === 'banner') equipUpdates = { equipped_banner: itemId };
        if (type === 'theme') equipUpdates = { equipped_theme: itemId.replace('theme-', '') };

        const updated = {
            ...profileData,
            coins: newCoins,
            unlocked_items: newUnlocked,
            ...equipUpdates
        };

        // Reset temporary previews
        resetPreview();

        if (isGuest) {
            onUpdateProfile(updated);
            setSuccessMsg("Objet acheté et équipé avec succès !");
            playSfx('/sons/confetti.mp3', { volumeMultiplier: 0.6 });
        } else {
            onUpdateProfile(updated); // optimistic update
            
            try {
                const { error } = await supabase
                    .from('spymals_profiles')
                    .update({
                        coins: newCoins,
                        unlocked_items: newUnlocked,
                        ...equipUpdates
                    })
                    .eq('id', user.id);

                if (error) throw error;
                
                setSuccessMsg("Achat validé et équipé sur ton dossier !");
                playSfx('/sons/confetti.mp3', { volumeMultiplier: 0.6 });
            } catch (err) {
                console.error("Failed to sync purchase:", err);
                setErrorMsg("Erreur lors de la synchronisation de l'achat.");
            }
        }
    };

    // Handle Equip already owned cosmetic item
    const handleEquipItem = async (type, itemId) => {
        setErrorMsg('');
        setSuccessMsg('');

        let equipUpdates = {};
        if (type === 'color') equipUpdates = { equipped_color: itemId };
        if (type === 'banner') equipUpdates = { equipped_banner: itemId };
        if (type === 'theme') equipUpdates = { equipped_theme: itemId };

        const updated = {
            ...profileData,
            ...equipUpdates
        };

        resetPreview();
        onUpdateProfile(updated);
        playSfx('/sons/confetti.mp3', { volumeMultiplier: 0.4 });
        setSuccessMsg("Équipement mis à jour !");

        if (!isGuest) {
            try {
                await supabase
                    .from('spymals_profiles')
                    .update(equipUpdates)
                    .eq('id', user.id);
            } catch (err) {
                console.error("Failed to sync equip:", err);
            }
        }
    };

    return (
        <div className="fixed inset-0 top-[70px] sm:top-[78px] overflow-y-auto no-scrollbar pointer-events-auto select-none z-10"
            style={{ paddingBottom: 'calc(140px + env(safe-area-inset-bottom, 0px))' }}
        >
            {/* Background Ambient Glow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-80 h-80 bg-spy-lime/10 rounded-full blur-3xl"></div>
            </div>

            <div className="z-10 text-center max-w-md mx-auto px-4 relative">
                
                {/* Standardized Header */}
                <div className="text-center mb-3 flex-shrink-0 w-full">
                    <div className="inline-flex items-center px-3 py-0.5 rounded-full bg-spy-lime/8 border border-spy-lime/25 text-spy-lime text-[7.5px] sm:text-[9px] font-black uppercase tracking-[0.15em] mb-0.5"
                        style={{ boxShadow: '0 2px 12px rgba(204,255,0,0.08)' }}
                    >
                        CENTRALE D'ÉQUIPEMENT
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight"
                        style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
                    >
                        BOUTIQUE
                    </h1>
                    <div className="w-14 sm:w-16 h-[2px] bg-gradient-to-r from-transparent via-spy-lime to-transparent mx-auto rounded-full mt-0.5 opacity-80 mb-2"></div>
                    
                    {/* 3D Croquette Balance Pill */}
                    <div className="bg-slate-950/90 border border-spy-lime/40 px-4 py-1.5 rounded-full inline-flex items-center gap-2 shadow-[0_4px_14px_rgba(0,0,0,0.4)]">
                        <img src="/croquette_coin_3d.png" alt="Croquettes" className="w-5 h-5 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                        <span className="text-xs sm:text-sm font-black text-spy-lime tracking-wide">{coins} CROQUETTES</span>
                    </div>
                </div>

                {/* Live Interactive Dossier Preview Card */}
                <div className="w-full bg-slate-950/90 border-2 border-white/15 rounded-3xl p-3.5 mb-4 shadow-[0_12px_35px_rgba(0,0,0,0.7)] text-left relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/50 flex items-center gap-1">
                            <Eye className="w-3 h-3 text-spy-lime" /> APERÇU EN DIRECT DU DOSSIER
                        </span>
                        {isPreviewActive && (
                            <button 
                                onClick={resetPreview}
                                className="text-[8px] font-black uppercase tracking-wider text-spy-lime bg-spy-lime/15 border border-spy-lime/30 px-2 py-0.5 rounded-full hover:bg-spy-lime/30 cursor-pointer"
                            >
                                Réinitialiser aperçu
                            </button>
                        )}
                    </div>

                    <div className={`p-3.5 rounded-2xl border-2 ${activeBannerObj.class} flex items-center justify-between shadow-md relative overflow-hidden`}>
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-11 h-11 rounded-2xl bg-slate-900/90 border-2 border-spy-lime overflow-hidden flex-shrink-0 shadow-md">
                                <CartoonAvatar id={profileData?.avatar_emoji} className="w-full h-full border-none shadow-none" />
                            </div>
                            <div>
                                <div className={`text-sm sm:text-base font-black uppercase tracking-tight ${activeColorObj.class}`}>
                                    {profileData?.username || 'Agent Invité'}
                                </div>
                                <span className="text-[9px] font-black uppercase text-spy-lime block mt-0.5">
                                    Niveau {profileData?.level || 1}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {errorMsg && (
                    <div className="mb-3 bg-red-500/15 border border-red-500/40 rounded-2xl p-2.5 text-center animate-pop-in">
                        <p className="text-red-400 text-[10px] font-black uppercase tracking-wider">{errorMsg}</p>
                    </div>
                )}
                {successMsg && (
                    <div className="mb-3 bg-spy-lime/15 border border-spy-lime/40 rounded-2xl p-2.5 text-center animate-pop-in">
                        <p className="text-spy-lime text-[10px] font-black uppercase tracking-wider">{successMsg}</p>
                    </div>
                )}

                {/* 3D Cartoon Tab Navigation Bar (3 Tabs) */}
                <div className="flex bg-slate-950/90 backdrop-blur-md p-1.5 rounded-2xl border-2 border-white/15 shadow-md w-full mb-4">
                    <button
                        type="button"
                        onClick={() => { setSelectedTab('colors'); setErrorMsg(''); setSuccessMsg(''); }}
                        className={`flex-1 py-2.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center ${
                            selectedTab === 'colors' 
                                ? 'bg-spy-lime text-slate-950 shadow-[0_3px_0_#88bb00] border border-white scale-[1.02]' 
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        Pseudos
                    </button>
                    <button
                        type="button"
                        onClick={() => { setSelectedTab('banners'); setErrorMsg(''); setSuccessMsg(''); }}
                        className={`flex-1 py-2.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center ${
                            selectedTab === 'banners' 
                                ? 'bg-spy-lime text-slate-950 shadow-[0_3px_0_#88bb00] border border-white scale-[1.02]' 
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        Bannières
                    </button>
                    <button
                        type="button"
                        onClick={() => { setSelectedTab('themes'); setErrorMsg(''); setSuccessMsg(''); }}
                        className={`flex-1 py-2.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center ${
                            selectedTab === 'themes' 
                                ? 'bg-spy-lime text-slate-950 shadow-[0_3px_0_#88bb00] border border-white scale-[1.02]' 
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        Thèmes
                    </button>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                    
                    {/* TAB 1: USERNAME COLORS */}
                    {selectedTab === 'colors' && (
                        USERNAME_COLORS.filter(c => c.price > 0).map(color => {
                            const isOwned = unlockedItems.includes(color.id);
                            const isEquipped = equippedColor === color.id;
                            const isPreviewed = previewColorId === color.id;

                            return (
                                <div 
                                    key={color.id} 
                                    className={`bg-slate-950/80 border-2 rounded-2xl p-3 flex items-center justify-between shadow-md transition-all duration-200 group ${
                                        isPreviewed || isEquipped ? 'border-spy-lime bg-spy-lime/5 shadow-[0_0_18px_rgba(204,255,0,0.15)]' : 'border-white/10 hover:border-white/25'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Color Swatch Preview Pill */}
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/15 flex items-center justify-center flex-shrink-0 shadow-inner">
                                            <span className={`text-base font-black ${color.class}`}>Ag</span>
                                        </div>

                                        <div className="text-left">
                                            <h4 className={`text-sm font-black uppercase tracking-tight ${color.class}`}>
                                                {color.label}
                                            </h4>
                                            <p className="text-white/40 text-[8.5px] font-black uppercase tracking-wider mt-0.5">
                                                Couleur de pseudo
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPreviewColorId(color.id)}
                                            className={`px-2.5 py-1.5 rounded-xl border text-[9.5px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                                                isPreviewed 
                                                    ? 'bg-spy-lime text-slate-950 border-white shadow-sm font-black' 
                                                    : 'bg-slate-900/90 text-spy-lime border-spy-lime/30 hover:bg-spy-lime/15'
                                            }`}
                                        >
                                            <Eye className="w-3 h-3" />
                                            <span>APERÇU</span>
                                        </button>

                                        {isEquipped ? (
                                            <span className="text-spy-lime text-[9.5px] font-black uppercase tracking-wider bg-spy-lime/15 px-3 py-1.5 rounded-xl border border-spy-lime/40 flex items-center gap-1 shadow-sm">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> ÉQUIPÉ
                                            </span>
                                        ) : isOwned ? (
                                            <button
                                                type="button"
                                                onClick={() => handleEquipItem('color', color.id)}
                                                className="bg-white/10 hover:bg-white/20 text-white font-black uppercase text-[10px] tracking-wider px-3 py-1.5 rounded-xl border border-white/20 transition-all cursor-pointer"
                                            >
                                                ÉQUIPER
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleBuyItem(color.id, color.price, 'color')}
                                                className="bg-gradient-to-b from-[#d9ff33] via-spy-lime to-[#77aa00] active:scale-95 text-slate-950 font-black uppercase text-[11px] tracking-wider px-3 py-1.5 rounded-xl border-2 border-white shadow-[0_4px_0_#446600] hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <span>{color.price}</span>
                                                <img src="/croquette_coin_3d.png" alt="Croquettes" className="w-4 h-4 object-contain" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* TAB 2: BANNERS */}
                    {selectedTab === 'banners' && (
                        PROFILE_BANNERS.filter(b => b.price > 0).map(banner => {
                            const isOwned = unlockedItems.includes(banner.id);
                            const isEquipped = equippedBanner === banner.id;
                            const isPreviewed = previewBannerId === banner.id;

                            return (
                                <div 
                                    key={banner.id} 
                                    className={`bg-slate-950/80 border-2 rounded-2xl p-3 flex items-center justify-between shadow-md transition-all duration-200 group ${
                                        isPreviewed || isEquipped ? 'border-spy-lime bg-spy-lime/5 shadow-[0_0_18px_rgba(204,255,0,0.15)]' : 'border-white/10 hover:border-white/25'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Banner Swatch Thumbnail */}
                                        <div className={`w-12 h-10 rounded-xl border-2 border-white/20 flex-shrink-0 ${banner.class} shadow-sm flex items-center justify-center`}>
                                            <div className="w-4 h-4 rounded-full bg-spy-lime/30 border border-spy-lime"></div>
                                        </div>

                                        <div className="text-left">
                                            <h4 className="text-sm font-black text-white uppercase tracking-tight">
                                                {banner.label}
                                            </h4>
                                            <p className="text-white/40 text-[8.5px] font-black uppercase tracking-wider mt-0.5">
                                                Fond de carte dossier
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPreviewBannerId(banner.id)}
                                            className={`px-2.5 py-1.5 rounded-xl border text-[9.5px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                                                isPreviewed 
                                                    ? 'bg-spy-lime text-slate-950 border-white shadow-sm font-black' 
                                                    : 'bg-slate-900/90 text-spy-lime border-spy-lime/30 hover:bg-spy-lime/15'
                                            }`}
                                        >
                                            <Eye className="w-3 h-3" />
                                            <span>APERÇU</span>
                                        </button>

                                        {isEquipped ? (
                                            <span className="text-spy-lime text-[9.5px] font-black uppercase tracking-wider bg-spy-lime/15 px-3 py-1.5 rounded-xl border border-spy-lime/40 flex items-center gap-1 shadow-sm">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> ÉQUIPÉ
                                            </span>
                                        ) : isOwned ? (
                                            <button
                                                type="button"
                                                onClick={() => handleEquipItem('banner', banner.id)}
                                                className="bg-white/10 hover:bg-white/20 text-white font-black uppercase text-[10px] tracking-wider px-3 py-1.5 rounded-xl border border-white/20 transition-all cursor-pointer"
                                            >
                                                ÉQUIPER
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleBuyItem(banner.id, banner.price, 'banner')}
                                                className="bg-gradient-to-b from-[#d9ff33] via-spy-lime to-[#77aa00] active:scale-95 text-slate-950 font-black uppercase text-[11px] tracking-wider px-3 py-1.5 rounded-xl border-2 border-white shadow-[0_4px_0_#446600] hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <span>{banner.price}</span>
                                                <img src="/croquette_coin_3d.png" alt="Croquettes" className="w-4 h-4 object-contain" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* TAB 3: THEMES */}
                    {selectedTab === 'themes' && (
                        THEMES_LIST.filter(t => t.price > 0).map(theme => {
                            const themeItemId = `theme-${theme.id}`;
                            const isOwned = unlockedItems.includes(themeItemId);
                            const isEquipped = profileData?.equipped_theme === theme.id;
                            const IconComp = theme.IconComponent || Eye;

                            return (
                                <div 
                                    key={theme.id} 
                                    className={`bg-slate-950/80 border-2 rounded-2xl p-3 flex items-center justify-between shadow-md transition-all duration-200 group ${
                                        isEquipped ? 'border-spy-lime bg-spy-lime/5 shadow-[0_0_18px_rgba(204,255,0,0.15)]' : 'border-white/10 hover:border-white/25'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Theme Visual Icon Swatch */}
                                        <div className={`w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center flex-shrink-0 shadow-sm ${theme.bg}`}>
                                            <IconComp className="w-5 h-5" />
                                        </div>

                                        <div className="text-left">
                                            <h4 className="text-sm font-black text-white uppercase tracking-tight">
                                                Thème {theme.label}
                                            </h4>
                                            <p className="text-white/40 text-[8.5px] font-black uppercase tracking-wider mt-0.5">
                                                Ambiance visuelle
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex-none">
                                        {isEquipped ? (
                                            <span className="text-spy-lime text-[9.5px] font-black uppercase tracking-wider bg-spy-lime/15 px-3 py-1.5 rounded-xl border border-spy-lime/40 flex items-center gap-1 shadow-sm">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> ÉQUIPÉ
                                            </span>
                                        ) : isOwned ? (
                                            <button
                                                type="button"
                                                onClick={() => handleEquipItem('theme', theme.id)}
                                                className="bg-white/10 hover:bg-white/20 text-white font-black uppercase text-[10px] tracking-wider px-3.5 py-2 rounded-xl border border-white/20 transition-all cursor-pointer"
                                            >
                                                ÉQUIPER
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleBuyItem(themeItemId, theme.price, 'theme')}
                                                className="bg-gradient-to-b from-[#d9ff33] via-spy-lime to-[#77aa00] active:scale-95 text-slate-950 font-black uppercase text-[11px] tracking-wider px-3.5 py-1.5 rounded-xl border-2 border-white shadow-[0_4px_0_#446600] hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <span>{theme.price}</span>
                                                <img src="/croquette_coin_3d.png" alt="Croquettes" className="w-4 h-4 object-contain" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}

                </div>

                {isGuest && (
                    <div className="w-full mt-6 bg-slate-950/90 border border-white/15 rounded-2xl p-3.5 text-center flex items-start gap-2.5 shadow-md">
                        <Lock className="w-4 h-4 text-spy-lime flex-shrink-0 mt-0.5" />
                        <p className="text-white/60 text-[9.5px] font-bold leading-relaxed uppercase tracking-wider text-left">
                            En mode Invité, les achats sont sauvegardés localement. Connecte-toi avec Google pour ne rien perdre !
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Shop;
