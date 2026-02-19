import React from 'react';
import BouncyButton from './BouncyButton';

const Home = ({ onStartGame, onOpenSettings, onOpenHowToPlay, onOpenLeaderboard }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 text-center relative overflow-hidden bg-spy-blue touch-none" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>

            {/* Background Decor - Subtle Patterns */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.05) 0%, transparent 5%), 
                                  radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 5%)`,
                backgroundSize: '100px 100px'
            }}></div>

            {/* Soft Glowing Light Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow delay-700"></div>

            {/* Logo Section */}
            <div className="z-10 flex flex-col items-center mb-10 relative w-full">
                {/* Dynamic SpyMals Logo with Fox Agent */}
                <div className="relative mb-6 w-full max-w-lg mx-auto h-[350px] md:h-[450px] flex items-center justify-center">
                    {/* Character Layer - Behind Text - Aligned to lean on the 'M' */}
                    <div className="absolute inset-0 flex items-center justify-center z-0">
                        <img
                            src="/renard.png"
                            alt="Secret Agent Fox"
                            className="h-full object-contain translate-y-[0px] translate-x-[15px] md:translate-x-[20px] drop-shadow-2xl scale-[1.5] md:scale-[1.6]"
                            style={{
                                maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                                WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)'
                            }}
                        />
                    </div>

                    {/* Text Layer - In Front - Rounded, Bubble 3D Look */}
                    <h1 className="relative z-10 text-[18vw] md:text-[11rem] font-black tracking-tighter font-display w-full px-1 whitespace-nowrap leading-tight flex items-center justify-center mt-32 md:mt-48 transform translate-y-[-20px]">
                        {/* 3D Clay Style - Uses new CSS classes with specular highlights */}
                        <span className="text-clay-white relative z-20">Spy</span>
                        <span className="text-clay-orange relative z-10 -ml-2 md:-ml-4">Mals</span>
                    </h1>
                </div>

                <div className="bg-black/40 backdrop-blur-md px-8 py-3 rounded-full border border-white/10 shadow-lg">
                    <p className="text-white/90 font-bold text-xs md:text-lg tracking-[0.2em] uppercase whitespace-nowrap">
                        Démasquez l'imposteur
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="z-10 w-full max-w-sm space-y-6">
                <BouncyButton
                    variant="custom"
                    onClick={onStartGame}
                    className="btn-glass-primary w-full text-2xl md:text-3xl py-6 md:py-8 tracking-wide shadow-2xl"
                >
                    NOUVELLE MISSION
                </BouncyButton>

                <div className="grid grid-cols-3 gap-4">
                    <BouncyButton
                        variant="custom"
                        onClick={onOpenHowToPlay}
                        className="btn-glass-secondary flex flex-col items-center justify-center p-3 gap-1 aspect-square active:scale-95"
                    >
                        <div className="text-3xl drop-shadow-md">📖</div>
                        <span className="text-[10px] md:text-xs font-bold tracking-wide">GUIDE</span>
                    </BouncyButton>

                    <BouncyButton
                        variant="custom"
                        onClick={onOpenLeaderboard}
                        className="btn-glass-secondary flex flex-col items-center justify-center p-3 gap-1 aspect-square active:scale-95"
                    >
                        <div className="text-3xl drop-shadow-md">🏆</div>
                        <span className="text-[10px] md:text-xs font-bold tracking-wide">TOP</span>
                    </BouncyButton>

                    <BouncyButton
                        variant="custom"
                        onClick={onOpenSettings}
                        className="btn-glass-secondary flex flex-col items-center justify-center p-3 gap-1 aspect-square active:scale-95"
                    >
                        <div className="text-3xl drop-shadow-md">⚙️</div>
                        <span className="text-[10px] md:text-xs font-bold tracking-wide">OPTS</span>
                    </BouncyButton>
                </div>
            </div>
        </div>
    );
};

export default Home;
