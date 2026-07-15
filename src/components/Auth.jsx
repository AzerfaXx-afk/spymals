import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import BouncyButton from './BouncyButton';

const STARTER_AVATARS = ['🦁', '🦊', '🐨', '🐼', '🐯', '🐻', '🦉', '🐱', '🐶', '🐸'];

const Auth = ({ onAuthSuccess, onSkip }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(STARTER_AVATARS[0]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

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

                // Sign up in Supabase Auth
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
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
                            level: 1
                        });

                    if (profileError) {
                        // Profile might already exist or trigger issues
                        console.error("Profile creation error:", profileError);
                    }

                    if (onAuthSuccess) onAuthSuccess(data.user);
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
                                level: 1
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

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-spy-blue relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-spy-lime opacity-10 rounded-full blur-[80px] animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-spy-orange opacity-10 rounded-full blur-[80px] animate-pulse-slow delay-1000"></div>

            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/15 rounded-[32px] p-8 shadow-2xl z-10 animate-slide-up">
                
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-2 filter drop-shadow-md">🕵️‍♂️🐾</div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">SpyMals HQ</h2>
                    <p className="text-white/50 text-xs font-bold uppercase tracking-widest mt-1">
                        Accès au centre d'agents
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex bg-black/30 rounded-xl p-1 mb-6 border border-white/5">
                    <button
                        type="button"
                        onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
                        className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${!isSignUp ? 'bg-spy-lime text-spy-blue shadow-lg' : 'text-white/60 hover:text-white'}`}
                    >
                        Connexion
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
                        className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${isSignUp ? 'bg-spy-lime text-spy-blue shadow-lg' : 'text-white/60 hover:text-white'}`}
                    >
                        Inscription
                    </button>
                </div>

                {/* Errors */}
                {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-3 animate-pop-in">
                        <span className="text-red-500 text-lg">⚠️</span>
                        <p className="text-red-400 text-xs font-bold leading-normal">{errorMsg}</p>
                    </div>
                )}

                {/* Auth Form */}
                <form onSubmit={handleAuth} className="space-y-4">
                    {isSignUp && (
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-2">Pseudo Agent</label>
                            <input
                                type="text"
                                required
                                placeholder="ex: Agent Renard"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm focus:border-spy-lime focus:outline-none transition-colors shadow-inner"
                            />
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-2">Email</label>
                        <input
                            type="email"
                            required
                            placeholder="agent@spymals.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm focus:border-spy-lime focus:outline-none transition-colors shadow-inner"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-2">Mot de passe</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm focus:border-spy-lime focus:outline-none transition-colors shadow-inner"
                        />
                    </div>

                    {isSignUp && (
                        <div className="space-y-2 pt-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-2">Choisissez votre Avatar de départ</label>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 px-1">
                                {STARTER_AVATARS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => setSelectedAvatar(emoji)}
                                        className={`flex-none w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all border ${selectedAvatar === emoji ? 'bg-spy-lime/20 border-spy-lime scale-110 shadow-lg shadow-spy-lime/20' : 'bg-black/20 border-white/10 hover:border-white/20'}`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-4">
                        <BouncyButton type="submit" disabled={loading} className="w-full py-4 text-sm">
                            {loading ? "Accès en cours..." : isSignUp ? "Créer mon Dossier" : "Connexion Sécurisée"}
                        </BouncyButton>
                    </div>
                </form>

                {/* Skip option */}
                <div className="mt-6 pt-6 border-t border-white/10 text-center">
                    <button
                        type="button"
                        onClick={onSkip}
                        className="text-white/40 hover:text-white text-xs font-black uppercase tracking-wider transition-colors"
                    >
                        🔑 Jouer en mode Invité (sans compte)
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Auth;
