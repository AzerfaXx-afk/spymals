import React from 'react';
import BouncyButton from './BouncyButton';

const Home = ({ onStartGame, onOpenSettings, onOpenHowToPlay }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center relative overflow-hidden bg-spy-blue touch-none">

            {/* Background Decor - Animated Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-spy-lime opacity-20 rounded-full blur-[100px] animate-pulse-slow mix-blend-screen"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-spy-orange opacity-20 rounded-full blur-[100px] animate-pulse-slow delay-1000 mix-blend-screen"></div>

            {/* Hero Section */}
            <div className="z-10 flex flex-col items-center mb-12 animate-bounce-slow">
                {/* Floating Logo Card */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full transform scale-150"></div>
                    <div className="relative text-9xl filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transform hover:rotate-12 transition-transform cursor-pointer active:scale-90 duration-200">
                        🕵️‍♂️
                    </div>
                </div>

                <h1 className="text-7xl font-black text-white tracking-tighter drop-shadow-lg font-display select-none -rotate-2">
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-spy-lime to-[#8fb300]">Spy</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-spy-orange to-[#cc5200]">Mals</span>
                </h1>
                <p className="text-white/60 font-bold mt-4 text-lg tracking-widest uppercase bg-black/20 px-4 py-1 rounded-full backdrop-blur-sm border border-white/5">
                    Démasquez l'imposteur !
                </p>
            </div>

            {/* Actions */}
            <div className="z-10 w-full max-w-sm space-y-4">
                <BouncyButton onClick={onStartGame} className="text-2xl py-6 shadow-spy-lime/20 shadow-2xl">
                    NOUVELLE MISSION
                </BouncyButton>

                <div className="grid grid-cols-2 gap-4">
                    <BouncyButton variant="secondary" onClick={onOpenHowToPlay} className="text-sm py-4">
                        COMMENT JOUER ?
                    </BouncyButton>
                    <BouncyButton variant="secondary" onClick={onOpenSettings} className="text-sm py-4">
                        PARAMÈTRES
                    </BouncyButton>
                </div>
            </div>

            <div className="absolute bottom-6 text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">
                v1.0.0 • Secret Défense
            </div>
        </div>
    );
};

export default Home;
