import React from 'react';
import BouncyButton from './BouncyButton';
// Assure-toi que le chemin vers ton composant BouncyButton est correct

const Home = ({ onStartGame, onOpenSettings, onOpenHowToPlay, onOpenLeaderboard, onBackToHub }) => {
    return (
        // Conteneur principal avec le fond bleu et les effets
        <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 text-center relative overflow-hidden bg-spy-blue touch-none" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>

            {/* ── Back to Hub button ── */}
            {onBackToHub && (
                <button
                    onClick={onBackToHub}
                    className="absolute top-4 left-4 z-20 w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200 active:scale-90 hover:scale-110"
                    style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    }}
                    aria-label="Retour au hub"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
            )}

            {/* --- Décors d'arrière-plan (Motifs subtils) --- */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.05) 0%, transparent 5%), 
                                  radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 5%)`,
                backgroundSize: '100px 100px'
            }}></div>

            {/* --- Effets de lumière douce et pulsante --- */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow delay-700"></div>

            {/* --- Section Centrale : LOGO et SOUS-TITRE --- */}
            <div className="z-10 flex flex-col items-center mb-10 relative w-full mt-8 md:mt-12">

                {/* Conteneur de l'image unique combinée */}
                <div className="relative w-full max-w-[500px] mx-auto flex items-center justify-center">
                    {/* IMPORTANT : C'est ici que tu mets ton image combinée.
                       Nomme ton fichier 'logo-spymals-fox.png' et mets-le dans le dossier public.
                    */}
                    <img
                        src="/renard.png"
                        alt="Logo SpyMals avec le Renard Détective"
                        // Classes pour le responsive : prend toute la largeur dispo jusqu'à 500px, 
                        // et ajoute une belle ombre portée 3D.
                        className="w-full h-auto object-contain drop-shadow-2xl scale-125 md:scale-110 translate-y-2"
                    />
                </div>

                {/* Badge Sous-titre "Démasquez l'imposteur" */}
                <div className="bg-black/30 backdrop-blur-md px-6 py-2 md:px-8 md:py-3 rounded-full border border-white/10 shadow-lg mt-6">
                    <p className="text-white/90 font-bold text-[10px] md:text-sm tracking-[0.2em] uppercase whitespace-nowrap">
                        Démasquez l'imposteur
                    </p>
                </div>
            </div>

            {/* --- Section des Boutons d'Action --- */}
            <div className="z-10 w-full max-w-sm space-y-5 md:space-y-6">

                {/* Gros Bouton Principal */}
                <BouncyButton
                    variant="custom"
                    onClick={onStartGame}
                    // btn-glass-primary doit être défini dans ton CSS personnalisé pour la couleur verte
                    className="btn-glass-primary w-full text-xl md:text-3xl py-5 md:py-7 tracking-wide shadow-[0_10px_20px_-5px_rgba(164,246,0,0.4)]"
                >
                    NOUVELLE MISSION
                </BouncyButton>

                {/* Grille des 3 petits boutons secondaires */}
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                    <BouncyButton
                        variant="custom"
                        onClick={onOpenHowToPlay}
                        // btn-glass-secondary pour le style bleu foncé translucide
                        className="btn-glass-secondary flex flex-col items-center justify-center p-2 md:p-3 gap-1 aspect-square"
                    >
                        <div className="text-2xl md:text-3xl drop-shadow-md">📖</div>
                        <span className="text-[9px] md:text-xs font-bold tracking-wide opacity-80">GUIDE</span>
                    </BouncyButton>

                    <BouncyButton
                        variant="custom"
                        onClick={onOpenLeaderboard}
                        className="btn-glass-secondary flex flex-col items-center justify-center p-2 md:p-3 gap-1 aspect-square"
                    >
                        <div className="text-2xl md:text-3xl drop-shadow-md">🏆</div>
                        <span className="text-[9px] md:text-xs font-bold tracking-wide opacity-80">TOP</span>
                    </BouncyButton>

                    <BouncyButton
                        variant="custom"
                        onClick={onOpenSettings}
                        className="btn-glass-secondary flex flex-col items-center justify-center p-2 md:p-3 gap-1 aspect-square"
                    >
                        <div className="text-2xl md:text-3xl drop-shadow-md">⚙️</div>
                        <span className="text-[9px] md:text-xs font-bold tracking-wide opacity-80">OPTS</span>
                    </BouncyButton>
                </div>
            </div>
        </div>
    );
};

export default Home;