import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import BouncyButton from './BouncyButton';
import { CartoonAvatar } from './CartoonAvatars';
import { Camera, AlertTriangle, ExternalLink, Mail, CheckCircle } from 'lucide-react';

const getWebmailUrl = (emailStr) => {
    const domain = (emailStr || '').split('@')[1]?.toLowerCase() || '';
    if (domain.includes('gmail')) return 'https://mail.google.com/';
    if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live') || domain.includes('msn')) return 'https://outlook.live.com/';
    if (domain.includes('yahoo')) return 'https://mail.yahoo.com/';
    if (domain.includes('icloud') || domain.includes('me.com')) return 'https://www.icloud.com/mail';
    if (domain.includes('proton')) return 'https://mail.proton.me/';
    return 'https://mail.google.com/';
};

const STARTER_AVATARS = [
  'fox-detective',
  'spy-cat',
  'koala-agent',
  'panda-monocle',
  'hacker-owl',
  'ninja-frog',
  'agent-dog',
  'detective-lion',
  'tiger-covert',
  'penguin-secret'
];

const Auth = ({ onAuthSuccess, onSkip }) => {
    // Inscription (Sign Up) in first position by default
    const [isSignUp, setIsSignUp] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(STARTER_AVATARS[0]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    
    // Email verification state
    const [verificationSent, setVerificationSent] = useState(false);
    const [showAnimalModal, setShowAnimalModal] = useState(false);

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
                ctx.drawImage(img, xOffset, yOffset, size, size, 0, 0, MAX_WIDTH, MAX_HEIGHT);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.85); // high quality compressed jpeg
                setSelectedAvatar(dataUrl);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            if (isSignUp) {
                const trimmedUsername = username.trim();
                if (trimmedUsername.length < 3) {
                    throw new Error("Le pseudo doit contenir au moins 3 caractères.");
                }

                // Sign up in Supabase Auth with dynamic redirect
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: window.location.origin, // Dynamic redirect back to localhost or Vercel
                        data: {
                            username: trimmedUsername,
                            avatar_emoji: selectedAvatar
                        }
                    }
                });

                if (error) throw error;

                if (data.user) {
                    // Create profile in spymals_profiles
                    const { error: profileError } = await supabase
                        .from('spymals_profiles')
                        .insert({
                            id: data.user.id,
                            username: trimmedUsername,
                            avatar_emoji: selectedAvatar,
                            coins: 150, // Starter coins
                            xp: 0,
                            level: 1,
                            unlocked_items: ['default'],
                            equipped_color: 'default',
                            equipped_banner: 'default'
                        });

                    if (profileError) {
                        console.error("Profile creation error:", profileError);
                    }

                    // Check if confirmation is required (session is null)
                    if (!data.session) {
                        setVerificationSent(true);
                    } else {
                        if (onAuthSuccess) onAuthSuccess(data.user);
                    }
                }
            } else {
                // Sign In
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) throw error;

                if (data.user) {
                    // Fetch existing profile or create one if missing
                    const { data: profile, error: fetchError } = await supabase
                        .from('spymals_profiles')
                        .select('*')
                        .eq('id', data.user.id)
                        .single();

                    if (fetchError || !profile) {
                        // Create profile if not found
                        await supabase
                            .from('spymals_profiles')
                            .insert({
                                id: data.user.id,
                                username: data.user.user_metadata?.username || email.split('@')[0],
                                avatar_emoji: data.user.user_metadata?.avatar_emoji || '🦁',
                                coins: 150,
                                xp: 0,
                                level: 1,
                                unlocked_items: ['default'],
                                equipped_color: 'default',
                                equipped_banner: 'default'
                            });
                    }

                    if (onAuthSuccess) onAuthSuccess(data.user);
                }
            }
        } catch (err) {
            console.error(err);
            setErrorMsg(err.message || "Une erreur est survenue lors de l'authentification.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (err) {
            console.error(err);
            setErrorMsg(err.message || "Impossible de se connecter avec Google.");
            setLoading(false);
        }
    };

    const handleCheckVerification = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            
            if (session) {
                if (onAuthSuccess) onAuthSuccess(session.user);
            } else {
                setErrorMsg("Aucune session trouvée. Avez-vous validé le lien dans l'email ?");
            }
        } catch (err) {
            setErrorMsg("Erreur lors de la vérification de l'activation.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center p-4 md:p-6 bg-spy-blue relative overflow-x-hidden">
            {/* Ambient background glows */}
            <div className="absolute top-[10%] left-[5%] w-[350px] h-[350px] bg-spy-lime opacity-[0.12] rounded-full blur-[120px] pointer-events-none select-none animate-pulse-slow"></div>
            <div className="absolute bottom-[15%] right-[5%] w-[350px] h-[350px] bg-spy-orange opacity-[0.1] rounded-full blur-[120px] pointer-events-none select-none animate-pulse-slow delay-1000"></div>
            <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-indigo-500 opacity-[0.05] rounded-full blur-[150px] pointer-events-none select-none"></div>

            {verificationSent ? (
                // ✉️ VERIFICATION CARD
                <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-[32px] md:rounded-[36px] p-6 md:p-8 shadow-2xl z-10 text-center space-y-5 animate-pop-in max-h-[92dvh] overflow-y-auto custom-scrollbar">
                    <div className="w-20 h-20 mx-auto relative flex items-center justify-center">
                        <div className="absolute inset-1 bg-spy-lime/20 rounded-full blur-xl animate-pulse-slow pointer-events-none" />
                        <img 
                            src="/top_secret_mail_badge.png" 
                            alt="Dossier E-mail" 
                            className="w-full h-full object-contain filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-300 relative z-10" 
                        />
                    </div>

                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Vérification Requise</h2>
                        <p className="text-spy-lime text-[10px] font-black uppercase tracking-[0.2em] mt-1">Dossier en attente d'activation</p>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4 md:p-5 text-left space-y-2.5 shadow-inner">
                        <p className="text-xs text-white/80 leading-relaxed">
                            Un e-mail de confirmation sécurisé a été envoyé à l'adresse :
                        </p>
                        <p className="text-sm font-black text-spy-lime text-center break-all bg-black/40 py-2 px-3 rounded-xl border border-spy-lime/20">{email}</p>
                        <p className="text-[10px] text-white/40 leading-relaxed text-center italic">
                            (Cliquez sur le bouton ci-dessous pour ouvrir votre messagerie et valider votre dossier)
                        </p>
                    </div>

                    <div className="space-y-3 pt-1">
                        {/* Button 1: Open Webmail */}
                        <BouncyButton 
                            type="button"
                            onClick={() => window.open(getWebmailUrl(email), '_blank')} 
                            className="w-full py-4 text-sm font-black shadow-lg shadow-spy-lime/20 flex items-center justify-center gap-2"
                        >
                            <Mail className="w-5 h-5" /> OUVRIR MA BOÎTE MAIL <ExternalLink className="w-4 h-4 opacity-75" />
                        </BouncyButton>

                        {/* Button 2: Recheck Session */}
                        <BouncyButton 
                            type="button"
                            onClick={handleCheckVerification} 
                            variant="secondary"
                            className="w-full py-3.5 text-xs font-black flex items-center justify-center gap-2" 
                            disabled={loading}
                        >
                            <CheckCircle className="w-4 h-4 text-spy-lime" /> {loading ? "Vérification..." : "J'AI VALIDÉ MON E-MAIL"}
                        </BouncyButton>

                        <button
                            type="button"
                            onClick={() => setVerificationSent(false)}
                            className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-wider transition-all block mx-auto pt-1"
                        >
                            ← Retour au formulaire
                        </button>
                    </div>
                </div>
            ) : (
                // 🛡️ AUTH CARD
                <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-[30px] md:rounded-[36px] p-5 md:p-7 pr-3 md:pr-5 shadow-2xl z-10 animate-slide-up relative max-h-[92dvh] overflow-y-auto custom-scrollbar">
                    
                    {/* Close Button */}
                    <button
                        type="button"
                        onClick={onSkip}
                        className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 active:scale-95 transition-all z-20 cursor-pointer shadow-md"
                        title="Continuer sans compte"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-20 h-20 mx-auto mb-2 relative flex items-center justify-center">
                            <img 
                                src="/detective_mascot.png" 
                                alt="Détective SpyMals" 
                                className="w-full h-full object-contain filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform" 
                            />
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-md">SPYMALS</h2>
                        <p className="text-spy-lime text-[10px] font-black uppercase tracking-[0.25em] mt-0.5">
                            Accès au centre d'agents
                        </p>
                    </div>

                    {/* Tabs (Inscription default left, Connexion right) */}
                    <div className="flex bg-black/35 rounded-2xl p-1.5 mb-6 border border-white/5 shadow-inner">
                        <button
                            type="button"
                            onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
                            className={`flex-1 py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${isSignUp ? 'bg-spy-lime text-spy-blue shadow-lg shadow-spy-lime/10' : 'text-white/55 hover:text-white'}`}
                        >
                            Inscription
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
                            className={`flex-1 py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${!isSignUp ? 'bg-spy-lime text-spy-blue shadow-lg shadow-spy-lime/10' : 'text-white/55 hover:text-white'}`}
                        >
                            Connexion
                        </button>
                    </div>

                    {/* Error Alerts */}
                    {errorMsg && (
                        <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 mb-6 flex items-start gap-3 animate-pop-in">
                            <span className="text-red-500 text-lg flex-none select-none">⚠️</span>
                            <p className="text-red-400 text-xs font-black uppercase tracking-wide leading-relaxed">{errorMsg}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleAuth} className="space-y-4">
                        {isSignUp && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-2">Pseudo Agent</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="ex: Agent Renard"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-black/25 border border-white/10 rounded-2xl px-4 py-3.5 text-white font-bold text-sm focus:border-spy-lime focus:outline-none transition-colors shadow-inner"
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-2">Email</label>
                            <input
                                type="email"
                                required
                                placeholder="agent@spymals.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/25 border border-white/10 rounded-2xl px-4 py-3.5 text-white font-bold text-sm focus:border-spy-lime focus:outline-none transition-colors shadow-inner"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-2">Mot de passe</label>
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/25 border border-white/10 rounded-2xl px-4 py-3.5 text-white font-bold text-sm focus:border-spy-lime focus:outline-none transition-colors shadow-inner"
                            />
                        </div>

                        {/* Avatar Picker (Emoji OR Gallery Import) */}
                        {isSignUp && (
                            <div className="space-y-2 pt-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-2 block">
                                    Avatar de l'agent
                                </label>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Card 1: Animaux Agents */}
                                    <button
                                        type="button"
                                        onClick={() => setShowAnimalModal(true)}
                                        className={`rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer border transition-all duration-300 min-h-[96px] ${
                                            !selectedAvatar.startsWith('data:image/')
                                                ? 'bg-spy-lime/10 border-spy-lime shadow-lg shadow-spy-lime/5'
                                                : 'bg-black/25 border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <CartoonAvatar id={selectedAvatar} className="w-12 h-12 border-none shadow-none" />
                                        <div className="text-center">
                                            <span className={`text-[10px] font-black uppercase tracking-wider block ${!selectedAvatar.startsWith('data:image/') ? 'text-spy-lime' : 'text-white/60'}`}>
                                                Mascottes Cartoon
                                            </span>
                                            <span className="text-[8px] text-white/30 block mt-0.5">Modifier la mascotte</span>
                                        </div>
                                    </button>

                                    {/* Card 2: Photo Galerie */}
                                    <label
                                        className={`rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer border transition-all duration-300 min-h-[96px] relative overflow-hidden ${
                                            selectedAvatar.startsWith('data:image/')
                                                ? 'bg-spy-lime/10 border-spy-lime shadow-lg shadow-spy-lime/5'
                                                : 'bg-black/25 border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        {selectedAvatar.startsWith('data:image/') ? (
                                            <>
                                                <img src={selectedAvatar} alt="Photo" className="w-10 h-10 rounded-full object-cover border border-white/15" />
                                                <div className="text-center">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-spy-lime block">
                                                        Photo Galerie
                                                    </span>
                                                    <span className="text-[8px] text-white/30 block mt-0.5">Changer l'image</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Camera className="w-6 h-6 text-white/60" />
                                                <div className="text-center">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-white/60 block">
                                                        Photo Galerie
                                                    </span>
                                                    <span className="text-[8px] text-white/30 block mt-0.5">Importer une photo</span>
                                                </div>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            <BouncyButton type="submit" disabled={loading} className="w-full py-4.5 text-sm uppercase tracking-wider font-black">
                                {loading ? "Accès en cours..." : isSignUp ? "Créer mon dossier" : "Connexion sécurisée"}
                            </BouncyButton>
                        </div>
                    </form>

                    {/* Google Login Option */}
                    <div className="relative flex items-center justify-center my-4">
                        <div className="flex-grow border-t border-white/5"></div>
                        <span className="flex-none px-3 text-[9px] font-black text-white/30 uppercase tracking-widest">OU</span>
                        <div className="flex-grow border-t border-white/5"></div>
                    </div>

                    <BouncyButton
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        variant="secondary"
                        className="w-full py-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border border-white/5 bg-black/15 hover:bg-black/25 text-white"
                    >
                        <svg className="w-4 h-4 flex-none" viewBox="0 0 24 24">
                            <path fill="#ea4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#4285f4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        Continuer avec Google
                    </BouncyButton>

                    {/* Sans compte (Skip) Link Redesigned */}
                    <div className="mt-6 pt-6 border-t border-white/10 text-center space-y-3">
                        <p className="text-[10px] text-white/40 leading-relaxed max-w-xs mx-auto">
                            Vous pouvez jouer immédiatement sans compte d'agent, mais la création de dossier est recommandée pour sauvegarder vos statistiques, vos cosmétiques et jouer en ligne.
                        </p>
                        <button
                            type="button"
                            onClick={onSkip}
                            className="w-full py-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-spy-lime/10 hover:border-spy-lime hover:text-spy-lime text-white text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer"
                        >
                            Continuer sans compte
                        </button>
                    </div>

                </div>
            )}

            {/* Animal Selection Modal */}
            {showAnimalModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-pop-in">
                    <div className="bg-spy-blue/90 border border-white/15 rounded-[32px] p-6 max-w-sm w-full shadow-2xl relative">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Sélectionner un Animal</h3>
                            <p className="text-[9px] font-black text-spy-lime uppercase tracking-widest mt-0.5">
                                Choisis ton avatar d'agent
                            </p>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-5 gap-3.5 mb-6">
                            {STARTER_AVATARS.map((avatarId) => (
                                <button
                                    key={avatarId}
                                    type="button"
                                    onClick={() => {
                                        setSelectedAvatar(avatarId);
                                        setShowAnimalModal(false);
                                    }}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all border cursor-pointer ${
                                        selectedAvatar === avatarId
                                            ? 'bg-spy-lime/20 border-spy-lime scale-110 shadow-lg shadow-spy-lime/20'
                                            : 'bg-black/35 border-white/10 hover:border-white/20 active:scale-95'
                                    }`}
                                >
                                    <CartoonAvatar id={avatarId} className="w-10 h-10 border-none shadow-none" />
                                </button>
                            ))}
                        </div>

                        {/* Close button */}
                        <BouncyButton
                            type="button"
                            onClick={() => setShowAnimalModal(false)}
                            variant="secondary"
                            className="w-full py-4 text-xs font-black uppercase tracking-wider"
                        >
                            Fermer
                        </BouncyButton>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Auth;
