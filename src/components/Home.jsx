import React, { useState } from 'react';
import { Play, History, Smartphone, Globe, X, HelpCircle } from 'lucide-react';
import BouncyButton from './BouncyButton';

const Home = ({ 
    profileData, 
    hasHistory, 
    onStartGame, 
    onOpenSettings, 
    onOpenHowToPlay, 
    onOpenLeaderboard, 
    onOpenHistory, 
    onOpenProfile, 
    onOpenMultiplayer 
}) => {
    const [showPlayOptions, setShowPlayOptions] = useState(false);

    return (
        <div className="fixed inset-0 top-16 bottom-26 px-4 max-w-md mx-auto flex flex-col items-center justify-between py-1 text-center overflow-hidden z-10 pointer-events-auto select-none">
            
            {/* Decors & Larger Mascot */}
            <div className="z-10 flex flex-col items-center relative w-full my-auto">
                <div className="relative w-full max-w-[280px] sm:max-w-[320px] mx-auto flex items-center justify-center transition-transform duration-300 hover:scale-105">
                    {/* Soft Radial Ambient Mascot Glow - Smooth Blend */}
                    <div className="absolute inset-0 bg-gradient-to-t from-spy-lime/10 via-spy-lime/5 to-transparent rounded-full blur-2xl -z-10 scale-100"></div>
                    <img
                        src="/detective_mascot.png"
                        alt="Logo SpyMals"
                        width={420}
                        height={420}
                        fetchpriority="high"
                        decoding="async"
                        className="w-full h-auto object-contain drop-shadow-[0_16px_25px_rgba(0,0,0,0.75)]"
                        style={{ maxHeight: '32dvh' }}
                    />
                </div>

                {/* Subtitle Badge - Clean Cartoon Style (No AI ping animation) */}
                <div className="mt-2.5 bg-slate-950/90 backdrop-blur-md px-5 py-2 rounded-full border-2 border-spy-lime/50 shadow-[0_6px_20px_rgba(0,0,0,0.6)]">
                    <p className="text-spy-lime font-black text-[11px] tracking-[0.2em] uppercase">
                        DÉMASQUEZ L'IMPOSTEUR
                    </p>
                </div>
            </div>

            {/* Giant Play Button - Completely Visible Above Nav Bar */}
            <div className="z-10 w-full max-w-xs space-y-2 pb-1 flex-shrink-0">
                <button
                    onClick={() => setShowPlayOptions(true)}
                    className="btn-cartoon-primary w-full text-xl sm:text-2xl py-3.5 px-6 font-black uppercase tracking-wider shadow-[0_6px_0_#000] cursor-pointer flex items-center justify-center gap-2.5 active:scale-95 transition-all duration-150"
                >
                    <Play className="w-6 h-6 fill-current" /> JOUER !
                </button>

                {/* Optional History button */}
                {hasHistory && (
                    <button
                        onClick={onOpenHistory}
                        className="btn-cartoon-secondary w-full py-2.5 text-xs font-black uppercase tracking-wider shadow-[0_4px_0_#000] cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                    >
                        <History className="w-4 h-4" /> Historique des équipes
                    </button>
                )}
            </div>

            {/* Play Options Modal Overlay */}
            {showPlayOptions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-pop-in">
                    <div className="card-cartoon w-full max-w-xs p-6 relative flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
                        {/* Close button */}
                        <button
                            onClick={() => setShowPlayOptions(false)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-sm font-black hover:bg-white/20 text-white cursor-pointer active:scale-90"
                        >
                            <X className="w-4 h-4 text-current" />
                        </button>

                        <div className="w-13 h-13 rounded-2xl bg-spy-lime/20 border-2 border-spy-lime flex items-center justify-center text-spy-lime mb-2 mt-1">
                            <HelpCircle className="w-7 h-7" />
                        </div>
                        <h2 className="text-lg font-black uppercase tracking-tight text-center mb-5 text-white">
                            Choisissez votre Mission
                        </h2>

                        <div className="w-full space-y-3.5">
                            {/* Mode Local */}
                            <button
                                onClick={() => {
                                    setShowPlayOptions(false);
                                    onStartGame();
                                }}
                                className="w-full bg-[#ffc300] hover:bg-[#ffb000] text-black border-[3.5px] border-black rounded-2xl p-3.5 text-left font-black flex items-center gap-3.5 transition-all shadow-[4px_4px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#000] cursor-pointer"
                            >
                                <Smartphone className="w-7 h-7 flex-shrink-0" />
                                <div>
                                    <div className="uppercase text-xs tracking-wider font-extrabold">Mode Local</div>
                                    <div className="text-[9.5px] opacity-80 font-black uppercase mt-0.5">Sur 1 seul appareil</div>
                                </div>
                            </button>

                            {/* Mode En Ligne */}
                            <button
                                onClick={() => {
                                    setShowPlayOptions(false);
                                    onOpenMultiplayer();
                                }}
                                className="w-full bg-[#00f5d4] hover:bg-[#00e0c2] text-black border-[3.5px] border-black rounded-2xl p-3.5 text-left font-black flex items-center gap-3.5 transition-all shadow-[4px_4px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#000] cursor-pointer"
                            >
                                <Globe className="w-7 h-7 flex-shrink-0" />
                                <div>
                                    <div className="uppercase text-xs tracking-wider font-extrabold">Mode En Ligne</div>
                                    <div className="text-[9.5px] opacity-80 font-black uppercase mt-0.5">Jouez à distance</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;