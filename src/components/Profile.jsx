import React, { useEffect, useState } from 'react';
import BouncyButton from './BouncyButton';
import BackArrow from './BackArrow';
import { supabase } from '../utils/supabaseClient';

export const USERNAME_COLORS = [
    { id: 'default', label: 'Blanc Classique', class: 'text-white', price: 0 },
    { id: 'lime', label: 'Néon Vert', class: 'text-spy-lime', price: 50 },
    { id: 'orange', label: 'Orange Feu', class: 'text-spy-orange', price: 50 },
    { id: 'pink', label: 'Rose Cyber', class: 'text-pink-400', price: 100 },
    { id: 'cyan', label: 'Cyan Électrique', class: 'text-cyan-400', price: 100 },
    { id: 'gold', label: 'Or Impérial', class: 'text-yellow-400 font-black drop-shadow-[0_2px_10px_rgba(234,179,8,0.4)]', price: 250 },
];

export const PROFILE_BANNERS = [
    { id: 'default', label: 'Dossier Standard', class: 'bg-white/5 border-white/10', price: 0, previewClass: 'bg-slate-800' },
    { id: 'jungle', label: 'Jungle Secrète', class: 'bg-gradient-to-br from-green-950/40 to-emerald-900/30 border-green-500/30', price: 100, previewClass: 'bg-gradient-to-r from-emerald-900 to-green-800' },
    { id: 'polar', label: 'Nuit Polaire', class: 'bg-gradient-to-br from-blue-950/40 to-cyan-950/30 border-cyan-500/30', price: 150, previewClass: 'bg-gradient-to-r from-blue-900 to-cyan-900' },
    { id: 'desert', label: 'Désert Furtif', class: 'bg-gradient-to-br from-amber-950/40 to-orange-950/30 border-amber-600/30', price: 150, previewClass: 'bg-gradient-to-r from-amber-800 to-yellow-900' },
    { id: 'cyber', label: 'Cyber Espion', class: 'bg-gradient-to-br from-purple-950/40 to-pink-950/30 border-purple-500/30', price: 200, previewClass: 'bg-gradient-to-r from-purple-900 to-pink-900' },
    { id: 'gold_banner', label: 'Agent d\'Or', class: 'bg-gradient-to-br from-yellow-950/50 to-amber-900/30 border-yellow-500/40 shadow-[inset_0_0_20px_rgba(234,179,8,0.15)]', price: 350, previewClass: 'bg-gradient-to-r from-yellow-600 to-amber-700' },
];

const getLevelTitle = (lvl) => {
    if (lvl <= 2) return 'Recrue de la Savane 🐾';
    if (lvl <= 5) return 'Espion Éclaireur 🕵️‍♂️';
    if (lvl <= 9) return 'Agent Double 🦊';
    if (lvl <= 14) return 'Maître de la Jungle 🦁';
    return 'Légende de l\'Ombre 👑';
};

const getXPNeeded = (lvl) => lvl * 150;

const Profile = ({ user, profileData, onUpdateProfile, onLogout, onBack, onOpenShop }) => {
    const isGuest = !user;
    const [equippedColor, setEquippedColor] = useState('default');
    const [equippedBanner, setEquippedBanner] = useState('default');
    const [unlockedItems, setUnlockedItems] = useState(['default']);

    // Fetch equipped cosmetics and unlocked list
    useEffect(() => {
        if (profileData) {
            setEquippedColor(profileData.equipped_color || 'default');
            setEquippedBanner(profileData.equipped_banner || 'default');
            setUnlockedItems(profileData.unlocked_items || ['default']);
        }
    }, [profileData]);

    const xpNeeded = getXPNeeded(profileData?.level || 1);
    const xpPercent = Math.min(100, Math.floor(((profileData?.xp || 0) / xpNeeded) * 100));

    const handleEquipColor = async (colorId) => {
        setEquippedColor(colorId);
        const updated = { ...profileData, equipped_color: colorId };
        
        if (isGuest) {
            onUpdateProfile(updated);
        } else {
            // Update in Supabase
            onUpdateProfile(updated); // optimistic update
            await supabase
                .from('spymals_profiles')
                .update({ equipped_color: colorId })
                .eq('id', user.id);
        }
    };

    const handleEquipBanner = async (bannerId) => {
        setEquippedBanner(bannerId);
        const updated = { ...profileData, equipped_banner: bannerId };
        
        if (isGuest) {
            onUpdateProfile(updated);
        } else {
            // Update in Supabase
            onUpdateProfile(updated); // optimistic update
            await supabase
                .from('spymals_profiles')
                .update({ equipped_banner: bannerId })
                .eq('id', user.id);
        }
    };

    const selectedBannerClass = PROFILE_BANNERS.find(b => b.id === equippedBanner)?.class || PROFILE_BANNERS[0].class;
    const selectedColorClass = USERNAME_COLORS.find(c => c.id === equippedColor)?.class || USERNAME_COLORS[0].class;

    return (
        <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-20 bg-spy-blue relative overflow-y-auto no-scrollbar pb-10">
            <BackArrow onClick={onBack} />

            {/* Title */}
            <div className="z-10 text-center mb-6 max-w-md w-full mx-auto">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                    Dossier Agent
                </h2>
                <p className="text-spy-lime text-[10px] font-black uppercase tracking-[0.2em]">
                    Données d'identification
                </p>
            </div>

            {/* Profile Card */}
            <div className={`z-10 w-full max-w-md border rounded-[32px] p-6 shadow-2xl backdrop-blur-2xl transition-all duration-500 mb-6 ${selectedBannerClass}`}>
                
                {/* Header (Avatar & Username & Title) */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-4xl shadow-inner select-none">
                        {profileData?.avatar_emoji || '🦁'}
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-2xl font-black uppercase tracking-tight break-all leading-tight ${selectedColorClass}`}>
                            {profileData?.username || 'Agent Invité'}
                        </h3>
                        <p className="text-spy-lime text-xs font-black uppercase tracking-wider mt-1">
                            {getLevelTitle(profileData?.level || 1)}
                        </p>
                        {isGuest && (
                            <span className="inline-block mt-2 bg-white/10 text-white/50 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-white/5">
                                Mode Invité
                            </span>
                        )}
                    </div>
                </div>

                {/* Level / XP Progress */}
                <div className="bg-black/30 rounded-2xl p-4 border border-white/5 mb-5">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Niveau {profileData?.level || 1}</span>
                        <span className="text-xs font-black text-white">{profileData?.xp || 0} / {xpNeeded} XP</span>
                    </div>
                    {/* Bar */}
                    <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-[2px] border border-white/5">
                        <div 
                            className="h-full bg-gradient-to-r from-spy-lime to-emerald-400 rounded-full shadow-[0_0_10px_rgba(204,255,0,0.4)] transition-all duration-500" 
                            style={{ width: `${xpPercent}%` }}
                        ></div>
                    </div>
                </div>

                {/* Currencies & Stats */}
                <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="bg-black/25 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Croquettes</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xl">🐾</span>
                            <span className="text-2xl font-black text-white font-display leading-none">{profileData?.coins || 0}</span>
                        </div>
                    </div>

                    <div className="bg-black/25 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Taux Victoires</span>
                        <div className="flex items-center gap-1">
                            <span className="text-2xl font-black text-white font-display leading-none">
                                {profileData?.games_played > 0 
                                    ? `${Math.floor(((profileData?.games_won || 0) / profileData.games_played) * 100)}%` 
                                    : '0%'
                                }
                            </span>
                        </div>
                    </div>
                </div>

                {/* Small stats row */}
                <div className="text-center pt-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/35">
                        Missions : {profileData?.games_played || 0} jouées · {profileData?.games_won || 0} réussies
                    </span>
                </div>
            </div>

            {/* Guest Warning */}
            {isGuest && (
                <div className="z-10 w-full max-w-md bg-spy-orange/10 border border-spy-orange/30 rounded-2xl p-4 mb-6 animate-pop-in">
                    <p className="text-spy-orange font-bold text-xs text-center leading-relaxed">
                        ⚠️ **Progression locale uniquement.** Connecte-toi pour sauvegarder ton XP, tes achats et jouer en ligne !
                    </p>
                </div>
            )}

            {/* Shop & Logins Actions */}
            <div className="z-10 w-full max-w-md space-y-4 mb-8">
                <BouncyButton onClick={onOpenShop} className="py-5 text-lg">
                    🛒 Visiter la Boutique 🐾
                </BouncyButton>

                {isGuest ? (
                    <BouncyButton onClick={onLogout} variant="secondary" className="py-4 text-xs">
                        🔑 Créer un compte / Se connecter
                    </BouncyButton>
                ) : (
                    <BouncyButton onClick={onLogout} variant="danger" className="py-4 text-xs">
                        🚪 Se déconnecter de la Centrale
                    </BouncyButton>
                )}
            </div>

            {/* Customization section */}
            {unlockedItems.length > 1 && (
                <div className="z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-xl space-y-6">
                    <h4 className="text-sm font-black uppercase tracking-widest text-white border-b border-white/10 pb-2">
                        🎨 Personnalisation débloquée
                    </h4>

                    {/* Pseudo colors list */}
                    <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Couleurs de Pseudo</span>
                        <div className="flex flex-wrap gap-2">
                            {USERNAME_COLORS.filter(c => unlockedItems.includes(c.id)).map(color => (
                                <button
                                    key={color.id}
                                    onClick={() => handleEquipColor(color.id)}
                                    className={`px-3 py-2 rounded-xl text-xs font-black border transition-all ${color.class} ${equippedColor === color.id ? 'bg-white/20 border-spy-lime' : 'bg-black/20 border-white/5 hover:border-white/15'}`}
                                >
                                    {color.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Banners list */}
                    <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Bannières de Dossier</span>
                        <div className="flex flex-wrap gap-2">
                            {PROFILE_BANNERS.filter(b => unlockedItems.includes(b.id)).map(banner => (
                                <button
                                    key={banner.id}
                                    onClick={() => handleEquipBanner(banner.id)}
                                    className={`px-3 py-2 rounded-xl text-xs font-black border flex items-center gap-2 transition-all ${equippedBanner === banner.id ? 'bg-white/20 border-spy-lime' : 'bg-black/20 border-white/5 hover:border-white/15'}`}
                                >
                                    <div className={`w-3.5 h-3.5 rounded-full border border-white/10 ${banner.previewClass}`}></div>
                                    <span className="text-white">{banner.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
