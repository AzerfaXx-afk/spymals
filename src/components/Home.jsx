import React, { useState } from 'react';
import { Play, History, Smartphone, Globe, X, HelpCircle, Gamepad2 } from 'lucide-react';
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
        <div className="fixed inset-0 top-16 bottom-28 px-4 max-w-md mx-auto flex flex-col items-center justify-center text-center overflow-hidden z-10 pointer-events-auto select-none">
            
            {/* Unified Hero Center Block: Mascot + Badge + Play Button */}
            <div className="z-10 flex flex-col items-center justify-center w-full max-w-xs space-y-4">
                
                {/* Mascot with Soft Ambient Glow */}
                <div className="relative w-full max-w-[260px] sm:max-w-[300px] mx-auto flex items-center justify-center transition-transform duration-300 hover:scale-105">
                    <div className="absolute inset-0 bg-spy-lime/10 rounded-full blur-3xl -z-10 scale-95"></div>
                    <img
                        src="/detective_mascot.png"
                        alt="Logo SpyMals"
                        width={420}
                        height={420}
                        fetchPriority="high"
                        decoding="async"
                        className="w-full h-auto object-contain drop-shadow-[0_16px_25px_rgba(0,0,0,0.75)]"
                        style={{ maxHeight: '32dvh' }}
                    />
                </div>

                {/* Subtitle Badge */}
                <div className="bg-slate-950/90 backdrop-blur-md px-5 py-2 rounded-full border-2 border-spy-lime/50 shadow-[0_6px_20px_rgba(0,0,0,0.6)]">
                    <p className="text-spy-lime font-black text-[11px] tracking-[0.2em] uppercase">
                        DÉMASQUEZ L'IMPOSTEUR
                    </p>
                </div>

                {/* Giant Play Button - Positioned DIRECTLY below the badge! */}
                <div className="w-full pt-1 space-y-2">
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

            </div>

            {/* Play Options Modal Overlay */}
            {showPlayOptions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-pop-in">
                    <div className="card-cartoon w-full max-w-sm p-5 sm:p-6 relative flex flex-col items-center shadow-[0_25px_60px_rgba(0,0,0,0.95)] bg-gradient-to-b from-[#14233e]/98 via-[#0d182b]/98 to-[#0a1426]/98 border-[3.5px] border-white/20 rounded-[36px] overflow-hidden">
                        {/* Close button */}
                        <button
                            onClick={() => setShowPlayOptions(false)}
                            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-sm font-black hover:bg-white/20 text-white cursor-pointer active:scale-90 transition-all shadow-[0_2px_0_#000] z-20"
                        >
                            <X className="w-5 h-5 text-current" />
                        </button>

                        {/* Hero 3D Pixar Graphic: Spy Animals Playing */}
                        <div className="relative w-full h-36 flex items-center justify-center mb-2 mt-1 flex-shrink-0">
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-36 h-36 rounded-full bg-spy-lime/15 blur-2xl animate-pulse-slow"></div>
                            </div>
                            <img
                                src="/spy_animals_mission_select_3d.png"
                                alt="Animaux Espions en Mission"
                                className="w-full h-full object-contain filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.85)] z-10 transform hover:scale-105 transition-transform duration-300"
                            />
                        </div>

                        {/* Top Badge */}
                        <div className="bg-black/50 px-4 py-1 rounded-full border border-spy-lime/40 mb-2 shadow-inner">
                            <span className="text-[9.5px] font-black uppercase tracking-[0.2em] text-spy-lime flex items-center gap-1.5">
                                🕵️‍♂️ Briefing Tactique
                            </span>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-center mb-5 text-white text-shadow-md">
                            Choisissez votre Mission
                        </h2>

                        <div className="w-full space-y-3.5">
                            {/* Mode Local */}
                            <button
                                onClick={() => {
                                    setShowPlayOptions(false);
                                    onStartGame();
                                }}
                                className="w-full bg-gradient-to-r from-[#ffc300] to-[#ffaa00] hover:from-[#ffd026] hover:to-[#ffb700] text-black border-[3.5px] border-black rounded-2xl p-3.5 text-left font-black flex items-center gap-3.5 transition-all shadow-[0_6px_0_#000] active:translate-y-1.5 active:shadow-[0_0_0_#000] cursor-pointer group relative overflow-hidden"
                            >
                                <div className="w-11 h-11 rounded-xl bg-black/15 border-2 border-black/20 flex items-center justify-center flex-shrink-0 text-black group-hover:scale-110 transition-transform">
                                    <Smartphone className="w-6 h-6 stroke-[2.5]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="uppercase text-xs sm:text-sm tracking-wider font-black flex items-center gap-1.5 justify-between">
                                        <span>MODE LOCAL</span>
                                        <span className="bg-black/20 px-2 py-0.5 rounded-md text-[8.5px] font-black tracking-widest">1 APPAREIL</span>
                                    </div>
                                    <div className="text-[10px] opacity-85 font-bold uppercase mt-0.5 truncate">
                                        Passez le téléphone entre agents
                                    </div>
                                </div>
                            </button>

                            {/* Mode En Ligne */}
                            <button
                                onClick={() => {
                                    setShowPlayOptions(false);
                                    onOpenMultiplayer();
                                }}
                                className="w-full bg-gradient-to-r from-[#00f5d4] to-[#00d0b5] hover:from-[#33f7dd] hover:to-[#00dfc3] text-black border-[3.5px] border-black rounded-2xl p-3.5 text-left font-black flex items-center gap-3.5 transition-all shadow-[0_6px_0_#000] active:translate-y-1.5 active:shadow-[0_0_0_#000] cursor-pointer group relative overflow-hidden"
                            >
                                <div className="w-11 h-11 rounded-xl bg-black/15 border-2 border-black/20 flex items-center justify-center flex-shrink-0 text-black group-hover:scale-110 transition-transform">
                                    <Globe className="w-6 h-6 stroke-[2.5]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="uppercase text-xs sm:text-sm tracking-wider font-black flex items-center gap-1.5 justify-between">
                                        <span>MODE EN LIGNE</span>
                                        <span className="bg-black/20 px-2 py-0.5 rounded-md text-[8.5px] font-black tracking-widest">MULTIJOUEUR</span>
                                    </div>
                                    <div className="text-[10px] opacity-85 font-bold uppercase mt-0.5 truncate">
                                        Créez ou rejoignez à distance
                                    </div>
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