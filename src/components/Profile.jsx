import React, { useEffect, useState } from 'react';
import { 
  Edit3, Award, Sliders, MessageSquare, 
  HelpCircle, LogOut, LogIn, Palette, Lock, CheckCircle2, ChevronDown, ChevronUp,
  Compass, Cpu, Snowflake, Ghost, Gamepad2, Mail
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import EditProfileModal from './EditProfileModal';
import { useAudio } from '../contexts/AudioContext';
import { CartoonAvatar } from './CartoonAvatars';

export const USERNAME_COLORS = [
    { id: 'default', label: 'Blanc Classique', class: 'text-white', price: 0 },
    { id: 'lime', label: 'Néon Vert', class: 'text-spy-lime', price: 50 },
    { id: 'orange', label: 'Orange Feu', class: 'text-spy-orange', price: 50 },
    { id: 'pink', label: 'Rose Cyber', class: 'text-pink-400', price: 100 },
    { id: 'cyan', label: 'Cyan Électrique', class: 'text-cyan-400', price: 100 },
    { id: 'gold', label: 'Or Impérial', class: 'text-yellow-400 font-black drop-shadow-[0_2px_10px_rgba(234,179,8,0.4)]', price: 250 },
];

export const PROFILE_BANNERS = [
    { id: 'default', label: 'Classique', class: 'bg-gradient-to-br from-slate-900/90 to-slate-950/90 border-white/10', previewClass: 'bg-slate-800', price: 0 },
    { id: 'jungle', label: 'Jungle Secrète', class: 'bg-gradient-to-br from-emerald-950/90 via-slate-900/90 to-stone-950/90 border-emerald-500/25', previewClass: 'bg-emerald-600', price: 100 },
    { id: 'cyber', label: 'Néon Grid', class: 'bg-gradient-to-br from-purple-950/90 via-slate-900/90 to-indigo-950/90 border-pink-500/25', previewClass: 'bg-purple-600', price: 150 },
    { id: 'agent_gold', label: 'Élite Or', class: 'bg-gradient-to-br from-yellow-950/90 via-amber-900/90 to-stone-950/90 border-yellow-500/30', previewClass: 'bg-amber-500', price: 300 },
];

export const THEMES_LIST = [
    { id: 'safari', label: 'Safari', bg: 'bg-[#aadd00] text-slate-950', IconComponent: Compass, price: 0, desc: 'Ambiance Verte & Tactique' },
    { id: 'cyber', label: 'Cyber', bg: 'bg-cyan-400 text-slate-950', IconComponent: Cpu, price: 100, desc: 'Néon Cyan & Matrix' },
    { id: 'polar', label: 'Polar', bg: 'bg-blue-500 text-white', IconComponent: Snowflake, price: 150, desc: 'Bleu Glacé & Flocons' },
    { id: 'spooky', label: 'Spooky', bg: 'bg-orange-500 text-slate-950', IconComponent: Ghost, price: 200, desc: 'Nuit Orange Sombre' },
    { id: 'retro', label: 'Retro', bg: 'bg-lime-500 text-slate-950', IconComponent: Gamepad2, price: 250, desc: 'Arcade Pixel 8-Bit' }
];

export const getLevelTitle = (lvl) => {
    if (lvl >= 15) return 'Légende Spymals';
    if (lvl >= 12) return 'Maître Espion';
    if (lvl >= 8) return 'Agent d\'Élite';
    if (lvl >= 5) return 'Détective Confirmé';
    if (lvl >= 3) return 'Espion Junior';
    return 'Recrue Curieuse';
};

export const getNextRankTitleInfo = (lvl) => {
    if (lvl < 3) return { nextTitle: 'Espion Junior', nextLvl: 3 };
    if (lvl < 5) return { nextTitle: 'Détective Confirmé', nextLvl: 5 };
    if (lvl < 8) return { nextTitle: 'Agent d\'Élite', nextLvl: 8 };
    if (lvl < 12) return { nextTitle: 'Maître Espion', nextLvl: 12 };
    if (lvl < 15) return { nextTitle: 'Légende Spymals', nextLvl: 15 };
    return { nextTitle: 'Niveau Max Reint !', nextLvl: 15 };
};

const getXPNeeded = (lvl) => lvl * 150;

const FAQ_ITEMS = [
    {
        q: "C'est quoi 'Recrue Curieuse', 'Espion Junior'... ?",
        a: "Ce sont vos Titres de Grade d'Agent ! Ils s'améliorent automatiquement au fur et à mesure que vous gagnez des parties et accumulez de l'XP pour monter de niveau (Recrue Curieuse → Espion Junior → Détective Confirmé → Agent d'Élite → Maître Espion → Légende Spymals)."
    },
    {
        q: "Comment marquer des points d'XP et monter de niveau ?",
        a: "Gagnez des points d'XP à chaque fin de partie ! Démasquer l'imposteur en tant que civil ou rester indétectable en tant qu'imposteur vous donne un bonus d'XP. Chaque niveau franchi vous rapporte des Croquettes."
    },
    {
        q: "À quoi servent les Croquettes ?",
        a: "Vous pouvez dépenser vos Croquettes dans la Boutique pour débloquer de magnifiques bannières de dossier, des thèmes cartoon animés et des couleurs de pseudonyme exclusives."
    },
    {
        q: "Le mode En Ligne est-il gratuit ?",
        a: "Oui, le mode en ligne est entièrement gratuit et synchronisé en temps réel. Créez un salon pour obtenir un code, partagez-le avec vos amis et lancez la partie à distance !"
    },
    {
        q: "Mes données sont-elles sauvegardées ?",
        a: "Si vous jouez avec un compte connecté, votre progression est sauvegardée de façon permanente en ligne. En mode invité, elle est stockée uniquement sur ce navigateur."
    }
];

const Profile = ({ user, profileData, onUpdateProfile, onLogout, onBack }) => {
    const isGuest = !user;
    const { musicVolume, setMusicVolume, sfxVolume, setSfxVolume } = useAudio();

    const [equippedColor, setEquippedColor] = useState('default');
    const [equippedBanner, setEquippedBanner] = useState('default');
    const [equippedTheme, setEquippedTheme] = useState('safari');
    const [unlockedItems, setUnlockedItems] = useState(['default']);
    const [showEditModal, setShowEditModal] = useState(false);

    // Collapsible Accordion sections: 'custom', 'audio', 'feedback', 'faq' (null = all closed by default)
    const [activeSection, setActiveSection] = useState(null);

    // Feedback inputs
    const [feedbackEmail, setFeedbackEmail] = useState(isGuest ? '' : user?.email || '');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackSent, setFeedbackSent] = useState(false);
    const [sendingFeedback, setSendingFeedback] = useState(false);

    // FAQ index
    const [faqOpenIndex, setFaqOpenIndex] = useState(null);

    // Fetch equipped cosmetics, theme, and unlocked list
    useEffect(() => {
        if (profileData) {
            setEquippedColor(profileData.equipped_color || 'default');
            setEquippedBanner(profileData.equipped_banner || 'default');
            setEquippedTheme(profileData.equipped_theme || 'safari');
            setUnlockedItems(profileData.unlocked_items || ['default']);
        }
    }, [profileData]);

    const xpNeeded = getXPNeeded(profileData?.level || 1);
    const xpPercent = Math.min(100, Math.floor(((profileData?.xp || 0) / xpNeeded) * 100));

    const handleSaveProfile = async (updatedData) => {
        onUpdateProfile(updatedData);
        setShowEditModal(false);
        if (!isGuest) {
            await supabase
                .from('spymals_profiles')
                .update({
                    username: updatedData.username,
                    avatar_emoji: updatedData.avatar_emoji
                })
                .eq('id', user.id);
        }
    };

    const handleEquipTheme = async (themeId) => {
        const isUnlocked = themeId === 'safari' || unlockedItems.includes(`theme-${themeId}`);
        if (!isUnlocked) return;

        setEquippedTheme(themeId);
        const updated = { ...profileData, equipped_theme: themeId };
        onUpdateProfile(updated);
        
        if (!isGuest) {
            await supabase
                .from('spymals_profiles')
                .update({ equipped_theme: themeId })
                .eq('id', user.id);
        }
    };

    const handleEquipColor = async (colorId) => {
        setEquippedColor(colorId);
        const updated = { ...profileData, equipped_color: colorId };
        onUpdateProfile(updated);
        
        if (!isGuest) {
            await supabase
                .from('spymals_profiles')
                .update({ equipped_color: colorId })
                .eq('id', user.id);
        }
    };

    const handleEquipBanner = async (bannerId) => {
        setEquippedBanner(bannerId);
        const updated = { ...profileData, equipped_banner: bannerId };
        onUpdateProfile(updated);
        
        if (!isGuest) {
            await supabase
                .from('spymals_profiles')
                .update({ equipped_banner: bannerId })
                .eq('id', user.id);
        }
    };

    const handleSendFeedback = async (e) => {
        e.preventDefault();
        if (!feedbackMessage.trim()) return;

        setSendingFeedback(true);
        try {
            const { error: dbError } = await supabase
                .from('spymals_feedback')
                .insert({
                    username: profileData?.username || 'Agent Invité',
                    email: feedbackEmail || 'non-renseigne',
                    message: feedbackMessage,
                    created_at: new Date().toISOString()
                });

            if (dbError) {
                const saved = JSON.parse(localStorage.getItem('spyMals_local_feedbacks') || '[]');
                saved.push({
                    username: profileData?.username || 'Agent Invité',
                    email: feedbackEmail,
                    message: feedbackMessage,
                    date: new Date().toISOString()
                });
                localStorage.setItem('spyMals_local_feedbacks', JSON.stringify(saved));
            }

            await fetch('/api/send-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: profileData?.username || 'Agent Invité',
                    email: feedbackEmail || 'non-renseigne',
                    message: feedbackMessage
                })
            }).catch(() => {});
            
            setFeedbackSent(true);
            setFeedbackMessage('');
            setTimeout(() => setFeedbackSent(false), 5000);
        } catch (err) {
            console.error("Feedback error:", err);
        } finally {
            setSendingFeedback(false);
        }
    };

    const selectedColorClass = USERNAME_COLORS.find(c => c.id === equippedColor)?.class || USERNAME_COLORS[0].class;

    const toggleSection = (sectionName) => {
        setActiveSection(activeSection === sectionName ? null : sectionName);
    };

    return (
        /* Smooth Full Scrollable Container — Standardized top header alignment */
        <div className="fixed inset-0 top-[70px] sm:top-[78px] overflow-y-auto no-scrollbar pointer-events-auto select-none z-10"
            style={{ paddingBottom: 'calc(140px + env(safe-area-inset-bottom, 0px))' }}
        >
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[140px]"
                    style={{ background: 'radial-gradient(circle, rgba(204,255,0,0.08) 0%, rgba(204,255,0,0.02) 50%, transparent 80%)' }}
                ></div>
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-[120px]"
                    style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 80%)' }}
                ></div>
            </div>

            <div className="relative z-10 max-w-md mx-auto px-3 sm:px-5 flex flex-col items-center pt-1">
                
                {/* ═══════════ HEADER ═══════════ */}
                <div className="text-center mb-3.5 sm:mb-4 w-full">
                    <div className="inline-flex items-center px-3 py-0.5 rounded-full bg-spy-lime/8 border border-spy-lime/25 text-spy-lime text-[7.5px] sm:text-[9px] font-black uppercase tracking-[0.15em] mb-1"
                        style={{ boxShadow: '0 2px 12px rgba(204,255,0,0.08)' }}
                    >
                        DONNÉES D'IDENTIFICATION
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight"
                        style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
                    >
                        DOSSIER AGENT
                    </h1>
                    <div className="w-14 sm:w-16 h-[2px] bg-gradient-to-r from-transparent via-spy-lime to-transparent mx-auto rounded-full mt-1 opacity-80"></div>
                </div>

                {/* ═══════════ MAIN PROFILE CARD ═══════════ */}
                <div className="w-full rounded-3xl p-5 mb-4 backdrop-blur-2xl transition-all duration-300 relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(2,6,23,0.98) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)'
                    }}
                >
                    {/* Top profile banner highlight */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-spy-lime to-transparent opacity-40"></div>

                    {/* Avatar & Info Row (Clickable to Edit) */}
                    <div 
                        onClick={() => setShowEditModal(true)}
                        className="flex items-center gap-4 mb-4 cursor-pointer p-2 rounded-2xl hover:bg-white/[0.04] transition-all group"
                        title="Modifier le profil"
                    >
                        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0 relative group-hover:scale-105 group-hover:border-spy-lime transition-all duration-200"
                            style={{ boxShadow: '0 6px 20px rgba(0,0,0,0.5)' }}
                        >
                            <CartoonAvatar id={profileData?.avatar_emoji} className="w-full h-full border-none shadow-none" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                <Edit3 className="w-5 h-5 text-spy-lime" />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <h2 className={`text-xl sm:text-2xl font-black uppercase tracking-wide truncate group-hover:text-spy-lime transition-colors ${selectedColorClass}`}>
                                    {profileData?.username || 'Agent Invité'}
                                </h2>
                                <Edit3 className="w-4 h-4 text-white/40 group-hover:text-spy-lime transition-colors flex-shrink-0" />
                            </div>

                            <div className="flex items-center gap-1.5 text-spy-lime text-xs font-black uppercase tracking-wider mb-1">
                                <Award className="w-3.5 h-3.5 text-spy-lime" />
                                <span>{getLevelTitle(profileData?.level || 1)}</span>
                            </div>

                            {user?.email ? (
                                <div className="flex items-center gap-1.5 text-white/60 text-[10px] font-bold tracking-wide mt-1">
                                    <Mail className="w-3 h-3 text-spy-lime flex-shrink-0" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                            ) : isGuest && (
                                <span className="inline-block bg-white/5 text-white/50 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border border-white/10 mt-1">
                                    Mode Invité (Local)
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Level / XP Progress */}
                    {(() => {
                        const nextRankInfo = getNextRankTitleInfo(profileData?.level || 1);
                        return (
                            <div className="rounded-2xl p-3.5 border border-white/8 mb-4"
                                style={{ background: 'rgba(255,255,255,0.02)' }}
                            >
                                <div className="flex justify-between items-end mb-1.5">
                                    <span className="text-[9.5px] font-black uppercase tracking-widest text-white/45">
                                        NIVEAU {profileData?.level || 1}
                                    </span>
                                    <span className="text-[10px] font-black text-white/80">
                                        {profileData?.xp || 0} / {xpNeeded} XP
                                    </span>
                                </div>
                                {/* 3D XP Bar */}
                                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner mb-2">
                                    <div 
                                        className="h-full bg-gradient-to-r from-spy-lime via-[#d8ff33] to-spy-lime rounded-full transition-all duration-500"
                                        style={{
                                            width: `${xpPercent}%`,
                                            boxShadow: '0 0 12px rgba(204,255,0,0.5)'
                                        }}
                                    ></div>
                                </div>
                                
                                {/* Next Rank Upgrade Target */}
                                <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-bold text-white/50 bg-white/[0.03] px-2.5 py-1 rounded-xl border border-white/5">
                                    <span>PROCHAIN GRADE :</span>
                                    <span className="text-spy-lime font-black uppercase tracking-wider">
                                        {nextRankInfo.nextTitle} (Niv. {nextRankInfo.nextLvl})
                                    </span>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Stats Grid with 3D Croquette Image */}
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        {/* Croquettes Box */}
                        <div className="rounded-2xl p-3.5 border border-white/8 flex flex-col items-center justify-center relative overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.02)' }}
                        >
                            <span className="text-[8.5px] font-black uppercase tracking-widest text-white/40 mb-1">
                                CROQUETTES
                            </span>
                            <div className="flex items-center gap-2">
                                <img src="/croquette_coin_3d.png" alt="Croquettes" className="w-6 h-6 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                                <span className="text-xl sm:text-2xl font-black text-white leading-none">
                                    {profileData?.coins || 0}
                                </span>
                            </div>
                        </div>

                        {/* Win Rate Box */}
                        <div className="rounded-2xl p-3.5 border border-white/8 flex flex-col items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.02)' }}
                        >
                            <span className="text-[8.5px] font-black uppercase tracking-widest text-white/40 mb-1">
                                TAUX VICTOIRES
                            </span>
                            <span className="text-xl sm:text-2xl font-black text-spy-lime leading-none">
                                {profileData?.games_played > 0 
                                    ? `${Math.floor(((profileData?.games_won || 0) / profileData.games_played) * 100)}%` 
                                    : '0%'
                                }
                            </span>
                        </div>
                    </div>

                    {/* Missions Summary */}
                    <div className="text-center pt-1">
                        <span className="text-[8.5px] font-bold uppercase tracking-wider text-white/35">
                            Missions : {profileData?.games_played || 0} jouées · {profileData?.games_won || 0} réussies
                        </span>
                    </div>
                </div>

                {/* ═══════════ ACCORDION LIST (Menus Déroulants) ═══════════ */}
                <div className="w-full space-y-3 mb-4">
                    
                    {/* 1. PERSONNALISATION */}
                    <div className="rounded-2xl border border-white/10 overflow-hidden transition-all duration-200"
                        style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(2,6,23,0.95) 100%)' }}
                    >
                        <button
                            onClick={() => toggleSection('custom')}
                            className="w-full px-4 py-3.5 text-left font-black text-xs sm:text-sm text-white flex items-center justify-between cursor-pointer hover:bg-white/[0.03] transition-colors"
                        >
                            <div className="flex items-center gap-2.5">
                                <Palette className="w-4.5 h-4.5 text-spy-lime" />
                                <span className="uppercase tracking-wider">Personnalisation</span>
                            </div>
                            {activeSection === 'custom' ? <ChevronUp className="w-4 h-4 text-spy-lime" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                        </button>

                        {activeSection === 'custom' && (
                            <div className="p-4 border-t border-white/8 space-y-5 bg-black/20">
                                {/* Thèmes */}
                                <div className="space-y-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">Thèmes d'Ambiance</span>
                                    <div className="grid grid-cols-2 gap-2">
                                        {THEMES_LIST.map(theme => {
                                            const isUnlocked = theme.id === 'safari' || unlockedItems.includes(`theme-${theme.id}`);
                                            const isEquipped = equippedTheme === theme.id;
                                            const ThemeIcon = theme.IconComponent;
                                            return (
                                                <button
                                                    key={theme.id}
                                                    onClick={() => isUnlocked && handleEquipTheme(theme.id)}
                                                    className={`p-2.5 rounded-xl text-xs font-black border flex items-center justify-between transition-all cursor-pointer ${
                                                        isEquipped 
                                                            ? `${theme.bg} border-white shadow-[0_4px_12px_rgba(0,0,0,0.4)]` 
                                                            : isUnlocked 
                                                                ? 'bg-white/5 text-white border-white/10 hover:border-white/20' 
                                                                : 'bg-white/[0.02] text-white/30 border-white/5 cursor-not-allowed'
                                                    }`}
                                                    disabled={!isUnlocked}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <ThemeIcon className="w-4 h-4" />
                                                        <span>{theme.label}</span>
                                                    </span>
                                                    {!isUnlocked && <Lock className="w-3.5 h-3.5 opacity-40" />}
                                                    {isEquipped && <CheckCircle2 className="w-4 h-4" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Pseudo colors */}
                                <div className="space-y-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">Couleurs de Pseudo</span>
                                    <div className="flex flex-wrap gap-2">
                                        {USERNAME_COLORS.filter(c => unlockedItems.includes(c.id)).map(color => (
                                            <button
                                                key={color.id}
                                                onClick={() => handleEquipColor(color.id)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 ${color.class} ${
                                                    equippedColor === color.id 
                                                        ? 'bg-white/15 border-spy-lime shadow-[0_2px_8px_rgba(204,255,0,0.2)]' 
                                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                                }`}
                                            >
                                                <span>{color.label}</span>
                                                {equippedColor === color.id && <CheckCircle2 className="w-3.5 h-3.5 text-spy-lime" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Banners */}
                                <div className="space-y-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">Bannières de Dossier</span>
                                    <div className="flex flex-wrap gap-2">
                                        {PROFILE_BANNERS.filter(b => unlockedItems.includes(b.id)).map(banner => (
                                            <button
                                                key={banner.id}
                                                onClick={() => handleEquipBanner(banner.id)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-2 transition-all cursor-pointer ${
                                                    equippedBanner === banner.id 
                                                        ? 'bg-white/15 border-spy-lime shadow-[0_2px_8px_rgba(204,255,0,0.2)]' 
                                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                                }`}
                                            >
                                                <div className={`w-3.5 h-3.5 rounded-full border border-white/20 ${banner.previewClass}`}></div>
                                                <span className="text-white">{banner.label}</span>
                                                {equippedBanner === banner.id && <CheckCircle2 className="w-3.5 h-3.5 text-spy-lime" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. PARAMÈTRES AUDIO */}
                    <div className="rounded-2xl border border-white/10 overflow-hidden transition-all duration-200"
                        style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(2,6,23,0.95) 100%)' }}
                    >
                        <button
                            onClick={() => toggleSection('audio')}
                            className="w-full px-4 py-3.5 text-left font-black text-xs sm:text-sm text-white flex items-center justify-between cursor-pointer hover:bg-white/[0.03] transition-colors"
                        >
                            <div className="flex items-center gap-2.5">
                                <Sliders className="w-4.5 h-4.5 text-spy-lime" />
                                <span className="uppercase tracking-wider">Paramètres Audio</span>
                            </div>
                            {activeSection === 'audio' ? <ChevronUp className="w-4 h-4 text-spy-lime" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                        </button>

                        {activeSection === 'audio' && (
                            <div className="p-4 border-t border-white/8 space-y-4 bg-black/20">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-black uppercase text-white/70">
                                        <span>Musique</span>
                                        <span className="text-spy-lime">{Math.round(musicVolume * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={musicVolume}
                                        onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                                        className="w-full h-2 rounded-lg bg-slate-950 appearance-none cursor-pointer accent-[#ccff00]"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-black uppercase text-white/70">
                                        <span>Effets Sonores</span>
                                        <span className="text-spy-lime">{Math.round(sfxVolume * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={sfxVolume}
                                        onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                                        className="w-full h-2 rounded-lg bg-slate-950 appearance-none cursor-pointer accent-[#ccff00]"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. SUGGESTIONS & RETOURS */}
                    <div className="rounded-2xl border border-white/10 overflow-hidden transition-all duration-200"
                        style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(2,6,23,0.95) 100%)' }}
                    >
                        <button
                            onClick={() => toggleSection('feedback')}
                            className="w-full px-4 py-3.5 text-left font-black text-xs sm:text-sm text-white flex items-center justify-between cursor-pointer hover:bg-white/[0.03] transition-colors"
                        >
                            <div className="flex items-center gap-2.5">
                                <MessageSquare className="w-4.5 h-4.5 text-spy-lime" />
                                <span className="uppercase tracking-wider">Suggestions & Fiches</span>
                            </div>
                            {activeSection === 'feedback' ? <ChevronUp className="w-4 h-4 text-spy-lime" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                        </button>

                        {activeSection === 'feedback' && (
                            <div className="p-4 border-t border-white/8 bg-black/20">
                                {feedbackSent ? (
                                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-emerald-400 text-xs font-black text-center">
                                        Suggestion transmise avec succès, Agent !
                                    </div>
                                ) : (
                                    <form onSubmit={handleSendFeedback} className="space-y-3">
                                        <div>
                                            <label className="block text-[9px] font-black uppercase tracking-wider text-white/45 mb-1 pl-1">Email de réponse</label>
                                            <input 
                                                type="email"
                                                value={feedbackEmail}
                                                onChange={(e) => setFeedbackEmail(e.target.value)}
                                                className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-white/10 rounded-xl text-xs font-bold focus:outline-none focus:border-spy-lime/50 transition-colors"
                                                placeholder="votre-email@exemple.com"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black uppercase tracking-wider text-white/45 mb-1 pl-1">Message / Suggestion</label>
                                            <textarea 
                                                value={feedbackMessage}
                                                onChange={(e) => setFeedbackMessage(e.target.value)}
                                                className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-white/10 rounded-xl text-xs font-bold h-20 focus:outline-none focus:border-spy-lime/50 transition-colors resize-none"
                                                placeholder="Comment pouvons-nous améliorer SpyMals ?"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={sendingFeedback}
                                            className="w-full py-2.5 bg-gradient-to-r from-spy-lime via-[#d9ff33] to-spy-lime text-slate-950 font-black uppercase text-xs tracking-wider rounded-xl shadow-[0_4px_14px_rgba(204,255,0,0.3)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            <span>{sendingFeedback ? "Envoi en cours..." : "ENVOYER LA FICHE"}</span>
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 4. AIDE & FAQ */}
                    <div className="rounded-2xl border border-white/10 overflow-hidden transition-all duration-200"
                        style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(2,6,23,0.95) 100%)' }}
                    >
                        <button
                            onClick={() => toggleSection('faq')}
                            className="w-full px-4 py-3.5 text-left font-black text-xs sm:text-sm text-white flex items-center justify-between cursor-pointer hover:bg-white/[0.03] transition-colors"
                        >
                            <div className="flex items-center gap-2.5">
                                <HelpCircle className="w-4.5 h-4.5 text-spy-lime" />
                                <span className="uppercase tracking-wider">Aide & FAQ</span>
                            </div>
                            {activeSection === 'faq' ? <ChevronUp className="w-4 h-4 text-spy-lime" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                        </button>

                        {activeSection === 'faq' && (
                            <div className="p-4 border-t border-white/8 space-y-2 bg-black/20">
                                {FAQ_ITEMS.map((item, index) => (
                                    <div 
                                        key={index} 
                                        className="border border-white/8 rounded-xl bg-slate-950/60 overflow-hidden"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setFaqOpenIndex(faqOpenIndex === index ? null : index)}
                                            className="w-full px-3.5 py-2.5 text-left font-black text-xs text-white flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
                                        >
                                            <span className="pr-3 leading-snug">{item.q}</span>
                                            {faqOpenIndex === index ? <ChevronUp className="w-4 h-4 text-spy-lime flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0" />}
                                        </button>
                                        {faqOpenIndex === index && (
                                            <div className="px-3.5 pb-3 text-[11px] font-bold text-white/70 leading-relaxed border-t border-white/5 pt-2">
                                                {item.a}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* ═══════════ LOGIN / LOGOUT BUTTON ═══════════ */}
                <div className="w-full">
                    {isGuest ? (
                        <button
                            onClick={onLogout}
                            className="w-full py-3.5 bg-gradient-to-r from-spy-lime via-[#d9ff33] to-spy-lime border-2 border-white rounded-2xl text-slate-950 font-black uppercase text-xs tracking-wider shadow-[0_4px_14px_rgba(204,255,0,0.3)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            <LogIn className="w-4 h-4 fill-current" />
                            <span>Créer un compte / Connexion</span>
                        </button>
                    ) : (
                        <button
                            onClick={onLogout}
                            className="w-full py-3.5 bg-rose-600/90 hover:bg-rose-600 border border-rose-500/40 rounded-2xl text-white font-black uppercase text-xs tracking-wider shadow-[0_4px_14px_rgba(225,29,72,0.3)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>SE DÉCONNECTER</span>
                        </button>
                    )}
                </div>

                {/* Edit Profile Modal */}
                {showEditModal && (
                    <EditProfileModal
                        profileData={profileData}
                        onSave={handleSaveProfile}
                        onClose={() => setShowEditModal(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default Profile;
