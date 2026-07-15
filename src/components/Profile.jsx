import React, { useEffect, useState } from 'react';
import BouncyButton from './BouncyButton';
import BackArrow from './BackArrow';
import { supabase } from '../utils/supabaseClient';
import EditProfileModal from './EditProfileModal';
import { useAudio } from '../contexts/AudioContext';

export const USERNAME_COLORS = [
    { id: 'default', label: 'Blanc Classique', class: 'text-white', price: 0 },
    { id: 'lime', label: 'Néon Vert', class: 'text-spy-lime', price: 50 },
    { id: 'orange', label: 'Orange Feu', class: 'text-spy-orange', price: 50 },
    { id: 'pink', label: 'Rose Cyber', class: 'text-pink-400', price: 100 },
    { id: 'cyan', label: 'Cyan Électrique', class: 'text-cyan-400', price: 100 },
    { id: 'gold', label: 'Or Impérial', class: 'text-yellow-400 font-black drop-shadow-[0_2px_10px_rgba(234,179,8,0.4)]', price: 250 },
];

export const PROFILE_BANNERS = [
    { id: 'default', label: 'Classique', class: 'bg-gradient-to-br from-slate-900/90 to-slate-950/90 border-white/10', previewClass: 'bg-slate-950', price: 0 },
    { id: 'jungle', label: 'Jungle Secrète', class: 'bg-gradient-to-br from-emerald-950/90 via-slate-900/90 to-stone-950/90 border-emerald-500/25', previewClass: 'bg-emerald-950', price: 100 },
    { id: 'cyber', label: 'Néon Grid', class: 'bg-gradient-to-br from-purple-950/90 via-slate-900/90 to-indigo-950/90 border-pink-500/25', previewClass: 'bg-purple-950', price: 150 },
    { id: 'agent_gold', label: 'Élite Or', class: 'bg-gradient-to-br from-yellow-950/90 via-amber-900/90 to-stone-950/90 border-yellow-500/30', previewClass: 'bg-yellow-900', price: 300 },
];

const getLevelTitle = (lvl) => {
    if (lvl >= 15) return 'Maître Espion 🎖️';
    if (lvl >= 10) return 'Agent d\'Élite 🌟';
    if (lvl >= 5) return 'Détective Confirmé 🔍';
    if (lvl >= 3) return 'Espion Junior 👟';
    return 'Recrue Curieuse 🐾';
};

const getXPNeeded = (lvl) => lvl * 150;

const FAQ_ITEMS = [
    {
        q: "Comment marquer des points et monter de niveau ?",
        a: "Gagnez des points d'XP à chaque fin de partie ! Démasquer l'imposteur en tant que civil ou rester indétectable en tant qu'imposteur vous donne un bonus d'XP. Chaque niveau franchi vous rapporte 50 pièces."
    },
    {
        q: "À quoi servent les pièces Spymals (🐾) ?",
        a: "Vous pouvez dépenser vos pièces dans la Boutique pour débloquer de superbes bannières de dossier et des couleurs de pseudonyme exclusives."
    },
    {
        q: "Le mode En Ligne est-il gratuit ?",
        a: "Oui, le mode en ligne est entièrement gratuit et synchronisé en temps réel. Créez un salon pour obtenir un code, partagez-le avec vos amis et lancez la partie à distance !"
    },
    {
        q: "Mes données sont-elles sauvegardées ?",
        a: "Si vous jouez avec un compte connecté (e.g. Google), votre progression est sauvegardée de façon permanente en ligne. En mode invité, elle est stockée uniquement sur ce navigateur."
    }
];

const Profile = ({ user, profileData, onUpdateProfile, onLogout, onBack, onOpenShop }) => {
    const isGuest = !user;
    const { musicVolume, setMusicVolume, sfxVolume, setSfxVolume } = useAudio();

    const [equippedColor, setEquippedColor] = useState('default');
    const [equippedBanner, setEquippedBanner] = useState('default');
    const [equippedTheme, setEquippedTheme] = useState('safari');
    const [unlockedItems, setUnlockedItems] = useState(['default']);
    const [showEditModal, setShowEditModal] = useState(false);

    // Feedback inputs
    const [feedbackEmail, setFeedbackEmail] = useState(isGuest ? '' : user.email || '');
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
            const { error } = await supabase
                .from('spymals_feedback')
                .insert({
                    username: profileData?.username || 'Agent Invité',
                    email: feedbackEmail || 'non-renseigne',
                    message: feedbackMessage,
                    created_at: new Date().toISOString()
                });

            if (error) {
                console.warn("Could not write to spymals_feedback, storing locally:", error);
                const saved = JSON.parse(localStorage.getItem('spyMals_local_feedbacks') || '[]');
                saved.push({
                    username: profileData?.username || 'Agent Invité',
                    email: feedbackEmail,
                    message: feedbackMessage,
                    date: new Date().toISOString()
                });
                localStorage.setItem('spyMals_local_feedbacks', JSON.stringify(saved));
            }
            
            setFeedbackSent(true);
            setFeedbackMessage('');
            setTimeout(() => setFeedbackSent(false), 5000);
        } catch (err) {
            console.error("Feedback submission error", err);
        } finally {
            setSendingFeedback(false);
        }
    };

    const selectedBannerClass = PROFILE_BANNERS.find(b => b.id === equippedBanner)?.class || PROFILE_BANNERS[0].class;
    const selectedColorClass = USERNAME_COLORS.find(c => c.id === equippedColor)?.class || USERNAME_COLORS[0].class;

    return (
        <div className="flex flex-col items-center justify-start p-4 bg-transparent max-w-md mx-auto relative overflow-y-auto no-scrollbar pb-24">
            
            {/* Title */}
            <div className="z-10 text-center mb-6 w-full">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter text-clay-white">
                    Dossier Agent
                </h2>
                <p className="text-spy-lime text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                    Données d'identification
                </p>
            </div>

            {/* Profile Card */}
            <div className={`z-10 w-full border-4 border-black rounded-[32px] p-6 shadow-[6px_6px_0px_#000] backdrop-blur-2xl transition-all duration-300 mb-6 bg-black/45`}>
                
                {/* Header (Avatar & Username & Title) - Clickable to edit profile */}
                <div 
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-4 mb-6 cursor-pointer hover:bg-white/5 p-2 rounded-2xl transition-all group"
                    title="Modifier le profil"
                >
                    <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-black flex items-center justify-center text-4xl shadow-inner overflow-hidden select-none flex-none relative group-hover:scale-105 transition-all">
                        {profileData?.avatar_emoji && (profileData.avatar_emoji.startsWith('data:image/') || profileData.avatar_emoji.startsWith('http')) ? (
                            <img src={profileData.avatar_emoji} alt="Avatar" className="w-full h-full object-cover animate-pop-in" />
                        ) : (
                            profileData?.avatar_emoji || '🦁'
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-full">
                            <span className="text-xs">✏️</span>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <h3 className={`text-2xl font-black uppercase tracking-tight break-all leading-tight group-hover:text-spy-lime transition-all flex items-center gap-1.5 ${selectedColorClass}`}>
                            {profileData?.username || 'Agent Invité'}
                            <span className="text-xs opacity-50 group-hover:opacity-100 transition-opacity">✏️</span>
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
                <div className="bg-black/35 rounded-2xl p-4 border border-white/5 mb-5">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Niveau {profileData?.level || 1}</span>
                        <span className="text-xs font-black text-white">{profileData?.xp || 0} / {xpNeeded} XP</span>
                    </div>
                    {/* Bar */}
                    <div className="w-full h-3.5 bg-black/40 rounded-full overflow-hidden p-[2px] border-2 border-black">
                        <div 
                            className="h-full bg-[#aadd00] rounded-full shadow-[0_0_10px_rgba(204,255,0,0.4)] transition-all duration-500" 
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

            {/* Customization: Dynamic Theme Selector */}
            <div className="z-10 w-full bg-white/10 backdrop-blur-xl border-3 border-black rounded-[32px] p-6 shadow-[5px_5px_0_#000] mb-6 space-y-4 text-left">
                <h4 className="text-sm font-black uppercase tracking-widest text-white border-b border-white/10 pb-2">
                    🖼️ Thème d'Ambiance (Cartoon)
                </h4>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'safari', label: 'Safari 🦁', bg: 'bg-[#aadd00] text-black' },
                        { id: 'cyber', label: 'Cyber 🦝', bg: 'bg-[#ff00ff] text-white' },
                        { id: 'polar', label: 'Polar 🐧', bg: 'bg-[#3b82f6] text-white' }
                    ].map(theme => (
                        <button
                            key={theme.id}
                            onClick={() => handleEquipTheme(theme.id)}
                            className={`p-3 rounded-2xl text-xs font-black border-2 border-black flex flex-col items-center justify-center transition-all cursor-pointer ${equippedTheme === theme.id ? `${theme.bg} shadow-[2px_2px_0_#000]` : 'bg-black/35 text-white border-white/10 shadow-none'}`}
                        >
                            <span>{theme.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Audio Settings Panel */}
            <div className="z-10 w-full bg-white/10 backdrop-blur-xl border-3 border-black rounded-[32px] p-6 shadow-[5px_5px_0_#000] mb-6 space-y-4 text-left">
                <h4 className="text-sm font-black uppercase tracking-widest text-white border-b border-white/10 pb-2">
                    🔊 Paramètres Audio
                </h4>
                <div className="space-y-4">
                    {/* Music Volume */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-black uppercase text-white/75">
                            <span>Musique</span>
                            <span>{Math.round(musicVolume * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={musicVolume}
                            onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                            className="w-full h-2 rounded-lg bg-black/40 appearance-none cursor-pointer accent-[#aadd00]"
                        />
                    </div>

                    {/* SFX Volume */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-black uppercase text-white/75">
                            <span>Effets Sonores</span>
                            <span>{Math.round(sfxVolume * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={sfxVolume}
                            onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                            className="w-full h-2 rounded-lg bg-black/40 appearance-none cursor-pointer accent-[#aadd00]"
                        />
                    </div>
                </div>
            </div>

            {/* Shop & Logins Actions */}
            <div className="z-10 w-full space-y-3 mb-6">
                <button
                    onClick={onOpenShop}
                    className="btn-cartoon-primary w-full py-4 text-lg shadow-[4px_4px_0_#000] cursor-pointer"
                >
                    🛒 Visiter la Boutique 🐾
                </button>

                {isGuest ? (
                    <button
                        onClick={onLogout}
                        className="btn-cartoon-secondary w-full py-3.5 text-xs shadow-[3px_3px_0_#000] cursor-pointer"
                    >
                        🔑 Créer un compte / Connexion
                    </button>
                ) : (
                    <button
                        onClick={onLogout}
                        className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase border-3 border-black rounded-2xl text-xs shadow-[3px_3px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                    >
                        🚪 Se déconnecter de la Centrale
                    </button>
                )}
            </div>

            {/* Customization section */}
            {unlockedItems.length > 1 && (
                <div className="z-10 w-full bg-white/10 backdrop-blur-xl border-3 border-black rounded-[32px] p-6 shadow-[5px_5px_0_#000] mb-6 space-y-6 text-left">
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

            {/* Suggestions & Feedback Form */}
            <div className="z-10 w-full bg-white/10 backdrop-blur-xl border-3 border-black rounded-[32px] p-6 shadow-[5px_5px_0_#000] mb-6 text-left">
                <h4 className="text-sm font-black uppercase tracking-widest text-white border-b border-white/10 pb-2 mb-4">
                    📬 Envoyer des suggestions
                </h4>
                
                {feedbackSent ? (
                    <div className="bg-emerald-500/10 border-2 border-emerald-500/40 p-4 rounded-2xl text-emerald-400 text-xs font-black text-center animate-pop-in">
                        🎉 Suggestion transmise avec succès, Agent !
                    </div>
                ) : (
                    <form onSubmit={handleSendFeedback} className="space-y-4">
                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-wider text-white/50 mb-1">Email de réponse</label>
                            <input 
                                type="email"
                                value={feedbackEmail}
                                onChange={(e) => setFeedbackEmail(e.target.value)}
                                className="w-full px-4 py-2.5 bg-black/35 text-white border-2 border-black rounded-xl text-xs font-black focus:outline-none"
                                placeholder="votre-email@exemple.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-wider text-white/50 mb-1">Message / Suggestion</label>
                            <textarea 
                                value={feedbackMessage}
                                onChange={(e) => setFeedbackMessage(e.target.value)}
                                className="w-full px-4 py-3 bg-black/35 text-white border-2 border-black rounded-xl text-xs font-black h-24 focus:outline-none resize-none"
                                placeholder="Comment pouvons-nous améliorer SpyMals ?"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={sendingFeedback}
                            className="btn-cartoon-primary w-full py-3 text-xs shadow-[3px_3px_0_#000] disabled:opacity-50 cursor-pointer"
                        >
                            {sendingFeedback ? "Envoi en cours..." : "ENVOYER LA FICHE 🚀"}
                        </button>
                    </form>
                )}
            </div>

            {/* Accordion FAQ Section */}
            <div className="z-10 w-full bg-white/10 backdrop-blur-xl border-3 border-black rounded-[32px] p-6 shadow-[5px_5px_0_#000] mb-6 text-left">
                <h4 className="text-sm font-black uppercase tracking-widest text-white border-b border-white/10 pb-2 mb-4">
                    ❓ Foire Aux Questions (FAQ)
                </h4>
                <div className="space-y-3">
                    {FAQ_ITEMS.map((item, index) => (
                        <div 
                            key={index} 
                            className="border-2 border-black rounded-2xl bg-black/35 overflow-hidden"
                        >
                            <button
                                onClick={() => setFaqOpenIndex(faqOpenIndex === index ? null : index)}
                                className="w-full px-4 py-3 text-left font-black text-xs text-white flex items-center justify-between cursor-pointer active:bg-white/5"
                            >
                                <span className="pr-4">{item.q}</span>
                                <span className="text-spy-lime text-base flex-none select-none">{faqOpenIndex === index ? '−' : '＋'}</span>
                            </button>
                            {faqOpenIndex === index && (
                                <div className="px-4 pb-4 pt-1 text-[11px] font-bold text-white/70 leading-relaxed border-t border-white/5 animate-slide-down">
                                    {item.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
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
    );
};

export default Profile;
