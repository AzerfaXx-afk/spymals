import React, { useState } from 'react';
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
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center relative overflow-hidden">
            
            {/* Decors & Mascot */}
            <div className="z-10 flex flex-col items-center mb-8 relative w-full mt-4">
                <div className="relative w-full max-w-[320px] mx-auto flex items-center justify-center">
                    <picture>
                        <source srcSet="/renard.webp" type="image/webp" />
                        <img
                            src="/renard.png"
                            alt="Logo SpyMals avec le Renard Détective"
                            width={500}
                            height={500}
                            fetchpriority="high"
                            decoding="async"
                            className="w-full h-auto object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.4)] animate-bounce-slow"
                            style={{ maxHeight: '38dvh' }}
                        />
                    </picture>
                </div>

                {/* Subtitle Badge */}
                <div className="mt-6 bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-lg">
                    <p className="text-white font-black text-xs tracking-[0.2em] uppercase">
                        Démasquez l'imposteur
                    </p>
                </div>
            </div>

            {/* Giant Play Button */}
            <div className="z-10 w-full max-w-xs space-y-4">
                <button
                    onClick={() => setShowPlayOptions(true)}
                    className="btn-cartoon-primary w-full text-2xl py-5 px-6 font-black uppercase tracking-wider shadow-[0_8px_0_#000] cursor-pointer"
                >
                    🚀 JOUER !
                </button>

                {/* Optional History button */}
                {hasHistory && (
                    <button
                        onClick={onOpenHistory}
                        className="btn-cartoon-secondary w-full py-3.5 text-xs font-black uppercase tracking-wider shadow-[0_5px_0_#000] cursor-pointer"
                    >
                        🕒 Historique des équipes
                    </button>
                )}
            </div>

            {/* Play Options Modal Overlay */}
            {showPlayOptions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-6 animate-fade-in">
                    <div className="card-cartoon w-full max-w-sm p-6 relative flex flex-col items-center">
                        {/* Close button */}
                        <button
                            onClick={() => setShowPlayOptions(false)}
                            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/10 border-2 border-black flex items-center justify-center text-sm font-black hover:bg-black/20 cursor-pointer active:scale-90"
                        >
                            ✕
                        </button>

                        <div className="text-3xl mb-3 emoji-bounce">🕵️‍♂️</div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-center mb-6">
                            Choisissez votre Mission
                        </h2>

                        <div className="w-full space-y-4">
                            {/* Mode Local */}
                            <button
                                onClick={() => {
                                    setShowPlayOptions(false);
                                    onStartGame();
                                }}
                                className="w-full bg-[#ffc300] hover:bg-[#ffb000] text-black border-[3.5px] border-black rounded-2xl p-4 text-left font-black flex items-center gap-4 transition-all shadow-[4px_4px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#000] cursor-pointer"
                            >
                                <span className="text-3xl">📱</span>
                                <div>
                                    <div className="uppercase text-sm tracking-wide">Mode Local</div>
                                    <div className="text-[10px] opacity-75 font-bold uppercase mt-0.5">Sur 1 seul téléphone</div>
                                </div>
                            </button>

                            {/* Mode En Ligne */}
                            <button
                                onClick={() => {
                                    setShowPlayOptions(false);
                                    onOpenMultiplayer();
                                }}
                                className="w-full bg-[#00f5d4] hover:bg-[#00e0c2] text-black border-[3.5px] border-black rounded-2xl p-4 text-left font-black flex items-center gap-4 transition-all shadow-[4px_4px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#000] cursor-pointer"
                            >
                                <span className="text-3xl">🌐</span>
                                <div>
                                    <div className="uppercase text-sm tracking-wide">Mode En Ligne</div>
                                    <div className="text-[10px] opacity-75 font-bold uppercase mt-0.5">Jouez à distance</div>
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