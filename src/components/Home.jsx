import React from 'react';
import BouncyButton from './BouncyButton';

const Home = ({ onStartGame, onOpenSettings, onOpenHowToPlay, onOpenLeaderboard }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center relative overflow-hidden bg-spy-blue touch-none">

            {/* Background Decor - Animated Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-spy-lime opacity-20 rounded-full blur-[100px] animate-pulse-slow mix-blend-screen"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-spy-orange opacity-20 rounded-full blur-[100px] animate-pulse-slow delay-1000 mix-blend-screen"></div>

            {/* Hero Section */}
            <div className="z-10 flex flex-col items-center mb-12">
                {/* Floating Logo Card */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full transform scale-150"></div>
                    <div className="relative text-9xl filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                        🕵️‍♂️
                    </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-lg font-display select-none px-4 pb-2">
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-spy-lime to-[#8fb300]">Spy</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-spy-orange to-[#cc5200] pr-2">Mals</span>
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

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <BouncyButton variant="secondary" onClick={onOpenHowToPlay} className="text-sm py-4 flex flex-row items-center justify-center gap-3 active:scale-95 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 opacity-80">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                        <span className="font-bold tracking-wider">GUIDE</span>
                    </BouncyButton>
                    <BouncyButton variant="secondary" onClick={onOpenSettings} className="text-sm py-4 flex flex-row items-center justify-center gap-3 active:scale-95 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 opacity-80">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-bold tracking-wider">RÉGLAGES</span>
                    </BouncyButton>
                </div>

                <BouncyButton variant="secondary" onClick={onOpenLeaderboard} className="w-full text-sm py-4 flex flex-row items-center justify-center gap-3 active:scale-95 transition-transform">
                    <span className="text-xl">🏆</span>
                    <span className="font-bold tracking-wider">CLASSEMENT</span>
                </BouncyButton>
            </div>


        </div>
    );
};

export default Home;
