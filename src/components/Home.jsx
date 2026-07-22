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
        <div className="flex flex-col items-center justify-center min-h-[70vh] md:min-h-[75vh] px-4 py-6 text-center relative overflow-x-hidden max-w-md mx-auto">
            
            {/* Decors & Mascot */}
            <div className="z-10 flex flex-col items-center mb-5 md:mb-6 relative w-full mt-1">
                <div className="relative w-full max-w-[240px] md:max-w-[280px] mx-auto flex items-center justify-center transition-transform duration-300 hover:scale-105">
                    <picture>
                        <source srcSet="/renard.webp" type="image/webp" />
                        <img
                            src="/renard.png"
                            alt="Logo SpyMals"
                            width={400}
                            height={400}
                            fetchpriority="high"
                            decoding="async"
                            className="w-full h-auto object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.6)]"
                            style={{ maxHeight: '25dvh' }}
                        />
                    </picture>
                </div>

                {/* Subtitle Badge */}
                <div className="mt-3 md:mt-4 bg-black/45 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
                    <p className="text-spy-lime font-black text-[10px] tracking-[0.25em] uppercase">
                        Démasquez l'imposteur
                    </p>
                </div>
            </div>

            {/* Giant Play Button */}
            <div className="z-10 w-full max-w-xs space-y-3.5">
                <button
                    onClick={() => setShowPlayOptions(true)}
                    className="btn-cartoon-primary w-full text-xl md:text-2xl py-3.5 md:py-4.5 px-6 font-black uppercase tracking-wider shadow-[0_6px_0_#000] cursor-pointer flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                    <Play className="w-6 h-6 fill-current" /> JOUER !
                </button>

                {/* Optional History button */}
                {hasHistory && (
                    <button
                        onClick={onOpenHistory}
                        className="btn-cartoon-secondary w-full py-2.5 md:py-3 text-xs font-black uppercase tracking-wider shadow-[0_4px_0_#000] cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                    >
                        <History className="w-4 h-4" /> Historique des équipes
                    </button>
                )}
            </div>

            {/* Play Options Modal Overlay */}
            {showPlayOptions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-6 animate-pop-in">
                    <div className="card-cartoon w-full max-w-xs p-6 relative flex flex-col items-center">
                        {/* Close button */}
                        <button
                            onClick={() => setShowPlayOptions(false)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 border-2 border-black flex items-center justify-center text-sm font-black hover:bg-black/20 cursor-pointer active:scale-90"
                        >
                            <X className="w-4 h-4 text-current" />
                        </button>

                        <div className="w-12 h-12 rounded-2xl bg-spy-lime/20 border-2 border-black flex items-center justify-center text-spy-lime mb-2 mt-2">
                            <HelpCircle className="w-7 h-7" />
                        </div>
                        <h2 className="text-lg font-black uppercase tracking-tight text-center mb-6">
                            Choisissez votre Mission
                        </h2>

                        <div className="w-full space-y-4">
                            {/* Mode Local */}
                            <button
                                onClick={() => {
                                    setShowPlayOptions(false);
                                    onStartGame();
                                }}
                                className="w-full bg-[#ffc300] hover:bg-[#ffb000] text-black border-[3px] border-black rounded-2xl p-4 text-left font-black flex items-center gap-4 transition-all shadow-[4px_4px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#000] cursor-pointer"
                            >
                                <Smartphone className="w-8 h-8 flex-shrink-0" />
                                <div>
                                    <div className="uppercase text-xs tracking-wider">Mode Local</div>
                                    <div className="text-[9px] opacity-75 font-black uppercase mt-0.5">Sur 1 seul appareil</div>
                                </div>
                            </button>

                            {/* Mode En Ligne */}
                            <button
                                onClick={() => {
                                    setShowPlayOptions(false);
                                    onOpenMultiplayer();
                                }}
                                className="w-full bg-[#00f5d4] hover:bg-[#00e0c2] text-black border-[3px] border-black rounded-2xl p-4 text-left font-black flex items-center gap-4 transition-all shadow-[4px_4px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#000] cursor-pointer"
                            >
                                <Globe className="w-8 h-8 flex-shrink-0" />
                                <div>
                                    <div className="uppercase text-xs tracking-wider">Mode En Ligne</div>
                                    <div className="text-[9px] opacity-75 font-black uppercase mt-0.5">Jouez à distance</div>
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