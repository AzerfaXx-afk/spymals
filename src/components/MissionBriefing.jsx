import React, { useState, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import BouncyButton from './BouncyButton';
import RoleStepper from './RoleStepper';
import BackArrow from './BackArrow';
import SettingsGear from './SettingsGear';
import { useAudio } from '../contexts/AudioContext';

const MissionBriefing = ({ totalPlayers, onStartGame, onBack, onOpenSettings }) => {
    const { playSfx } = useAudio();
    const [undercoverCount, setUndercoverCount] = useState(1);
    const [whiteCount, setWhiteCount] = useState(0);
    const [wordPack, setWordPack] = useState('standard');
    const [isPackDropdownOpen, setIsPackDropdownOpen] = useState(false);
    const [customWords, setCustomWords] = useState({ innocent: '', spy: '' });

    const packOptions = [
        { id: 'standard', label: 'Pack Standard', icon: '📁' },
        { id: 'pop-culture', label: 'Culture Pop', icon: '🍿' },
        { id: 'abstract', label: 'Concepts Abstraits', icon: '🧠' },
        { id: 'animals', label: 'Animaux', icon: '🦁' },
        { id: 'random', label: 'Aléatoire', icon: '🎲' },
        { id: 'custom', label: '>>> Mots Perso <<<', icon: '✏️', special: true },
    ];

    // Easter egg: screw animation
    const [unscrewedScrews, setUnscrewedScrews] = useState({});
    const allFourTriggered = useRef(false);
    const handleScrewClick = useCallback((id) => {
        if (unscrewedScrews[id]) return; // already animating
        const next = { ...unscrewedScrews, [id]: true };
        setUnscrewedScrews(next);

        // Check if all 4 screws are unscrewed at the same time
        const allPositions = ['tl', 'tr', 'bl', 'br'];
        if (allPositions.every(p => next[p] === true) && !allFourTriggered.current) {
            allFourTriggered.current = true;
            confetti({
                particleCount: 60,
                spread: 50,
                startVelocity: 20,
                scalar: 0.8,
                gravity: 0.8,
                origin: { y: 0.5 },
                colors: ['#CCFF00', '#FF6600', '#38bdf8', '#ffffff'],
            });
            playSfx('/sons/confetti.mp3', { volumeMultiplier: 0.7 });
        }

        setTimeout(() => {
            setUnscrewedScrews(prev => {
                const updated = { ...prev, [id]: false };
                // Reset the confetti trigger when any screw rescrews
                allFourTriggered.current = false;
                return updated;
            });
        }, 2000);
    }, [unscrewedScrews]);

    const civilianCount = totalPlayers - undercoverCount - whiteCount;

    // Validation Logic
    const isRoleCountValid = civilianCount >= 2;
    const isCustomValid = wordPack !== 'custom' || (
        customWords.innocent.trim() !== '' &&
        customWords.spy.trim() !== '' &&
        customWords.innocent.trim().toLowerCase() !== customWords.spy.trim().toLowerCase()
    );
    const isValid = isRoleCountValid && isCustomValid;

    const handleIncrement = (type) => {
        if (type === 'undercover') {
            if (totalPlayers - (undercoverCount + 1) - whiteCount >= 2) {
                setUndercoverCount(undercoverCount + 1);
            }
        } else {
            if (totalPlayers - undercoverCount - (whiteCount + 1) >= 2) {
                setWhiteCount(whiteCount + 1);
            }
        }
    };

    const handleDecrement = (type) => {
        if (type === 'undercover') {
            if (undercoverCount > 1) setUndercoverCount(undercoverCount - 1);
        } else {
            if (whiteCount > 0) setWhiteCount(whiteCount - 1);
        }
    };

    return (
        <div className="min-h-screen h-[100dvh] flex flex-col items-center p-4 pt-20 relative overflow-hidden bg-spy-blue">
            <BackArrow onClick={onBack} />
            <SettingsGear onClick={onOpenSettings} />

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-20%] w-[600px] h-[600px] bg-spy-lime opacity-[0.05] rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-20%] w-[500px] h-[500px] bg-spy-orange opacity-[0.05] rounded-full blur-[100px] animate-pulse-slow delay-700"></div>
            </div>

            <div className="z-10 mb-6 text-center flex-none animate-slide-up bg-white/10 px-8 py-3 rounded-full border border-white/15 shadow-2xl backdrop-blur-xl">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter drop-shadow-md">
                    ACCÈS AUTORISÉ
                </h2>
                <p className="text-spy-lime text-[10px] font-black uppercase tracking-[0.2em] animate-pulse mt-0.5">
                    Système Prêt
                </p>
            </div>

            <div className="w-full max-w-md flex-1 flex flex-col min-h-0 z-10 animate-slide-up space-y-4 px-4" style={{ animationDelay: '0.1s' }}>

                <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-6 border border-white/15 shadow-2xl flex-none relative w-full">
                    {/* Decorative Screws — Easter Egg! */}
                    {['tl', 'tr', 'bl', 'br'].map((pos) => {
                        const posClass = pos === 'tl' ? 'top-4 left-4'
                            : pos === 'tr' ? 'top-4 right-4'
                                : pos === 'bl' ? 'bottom-4 left-4'
                                    : 'bottom-4 right-4';
                        const isUnscrewed = unscrewedScrews[pos];
                        return (
                            <button
                                key={pos}
                                type="button"
                                onClick={() => handleScrewClick(pos)}
                                className={`absolute ${posClass} w-5 h-5 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 border border-gray-600 shadow-[inset_0_-1px_2px_rgba(255,255,255,0.5),inset_0_2px_4px_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-pointer z-20 hover:from-gray-200 hover:to-gray-400 active:scale-90 transition-colors pointer-events-auto`}
                                style={{
                                    animation: isUnscrewed === true
                                        ? 'unscrew 0.6s ease-out forwards'
                                        : isUnscrewed === false
                                            ? 'rescrew 0.5s ease-in-out forwards'
                                            : 'none',
                                    transformOrigin: 'center center',
                                }}
                                aria-label="Vis décorative"
                            >
                                {/* Screw head indent curve */}
                                <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-gray-500 to-gray-300 shadow-inner"></div>
                                {/* Philips Cross */}
                                <div className="w-2.5 h-[1.5px] bg-gray-700/80 rotate-45 absolute shadow-[0_1px_0_rgba(255,255,255,0.3)]"></div>
                                <div className="w-2.5 h-[1.5px] bg-gray-700/80 rotate-135 absolute shadow-[0_1px_0_rgba(255,255,255,0.3)]"></div>
                            </button>
                        );
                    })}

                    {/* Civilians Display - Digital Readout */}
                    <div className="bg-black/20 rounded-2xl p-4 flex items-center justify-between border border-white/10 mb-5 relative overflow-hidden shadow-inner">
                        <div className="absolute left-0 top-0 w-1 h-full bg-spy-lime opacity-50"></div>
                        <div className="relative z-10 flex items-center gap-3 w-full justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">PERSONNEL</span>
                                <span className="text-sm font-black uppercase tracking-widest text-white">Innocents</span>
                            </div>
                            <div className="bg-black/40 border border-white/5 rounded-xl px-4 py-2 flex items-center justify-center shadow-inner">
                                <span className="text-3xl font-display font-black leading-none text-spy-lime">{civilianCount.toString().padStart(2, '0')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-stretch">
                        <RoleStepper
                            label="Espions"
                            count={undercoverCount}
                            onIncrement={() => handleIncrement('undercover')}
                            onDecrement={() => handleDecrement('undercover')}
                            color="text-spy-orange"
                            subLabel="Mot différent"
                            soundOptions={{ pitch: Math.min(2.0, 0.8 + ((undercoverCount) * 0.1)) }}
                        />

                        <RoleStepper
                            label="Mr. Blanc"
                            count={whiteCount}
                            onIncrement={() => handleIncrement('white')}
                            onDecrement={() => handleDecrement('white')}
                            color="text-white"
                            subLabel="Aucun mot"
                            soundOptions={{ pitch: Math.min(2.0, 0.8 + ((whiteCount) * 0.1)) }}
                        />
                    </div>
                </div>

                {/* Word Pack Selection - Module */}
                <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-6 border border-white/15 shadow-2xl flex-none relative w-full mb-2 mt-4">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-spy-blue px-4 py-1 rounded-full text-[10px] uppercase font-black text-white/50 border border-white/15 tracking-widest shadow-lg">
                        Données Mission
                    </div>

                    <div className="relative mt-2">
                        {/* Custom Dropdown Toggle */}
                        <button
                            type="button"
                            onClick={() => setIsPackDropdownOpen(!isPackDropdownOpen)}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between text-white font-black focus:outline-none transition-all shadow-inner hover:bg-black/50"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">{packOptions.find(p => p.id === wordPack)?.icon}</span>
                                <span className={`text-sm uppercase tracking-wider ${wordPack === 'custom' ? 'text-spy-orange' : 'text-white'}`}>
                                    {packOptions.find(p => p.id === wordPack)?.label}
                                </span>
                            </div>
                            <div className={`transition-transform duration-300 ${isPackDropdownOpen ? 'rotate-180 text-spy-lime' : 'text-white/30'}`}>
                                ▼
                            </div>
                        </button>

                        {/* Custom Dropdown Menu */}
                        {isPackDropdownOpen && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-[#1a213A]/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-slide-up origin-top">
                                <div className="max-h-[220px] overflow-y-auto no-scrollbar scroll-smooth">
                                    {packOptions.map((pack, index) => (
                                        <button
                                            key={pack.id}
                                            onClick={() => {
                                                setWordPack(pack.id);
                                                setIsPackDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-5 py-4 flex items-center gap-3 transition-colors border-b border-white/5 last:border-0 hover:bg-white/10 ${wordPack === pack.id ? 'bg-spy-lime/10' : ''
                                                }`}
                                        >
                                            <span className="text-xl flex-none">{pack.icon}</span>
                                            <span className={`text-sm font-black uppercase tracking-wider flex-1 ${pack.special ? 'text-spy-orange' : wordPack === pack.id ? 'text-spy-lime' : 'text-white/80'
                                                }`}>
                                                {pack.label}
                                            </span>
                                            {wordPack === pack.id && (
                                                <span className="text-spy-lime text-lg">✓</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Custom Word Inputs */}
                    {wordPack === 'custom' && (
                        <div className="mt-4 space-y-3 animate-pop-in">
                            <div className="space-y-1">
                                <label className="text-[9px] uppercase font-black tracking-widest text-white/40 pl-2">Cible 1 (Innocent)</label>
                                <input
                                    type="text"
                                    placeholder="Entrez un mot..."
                                    value={customWords.innocent}
                                    onChange={(e) => setCustomWords({ ...customWords, innocent: e.target.value })}
                                    className="w-full bg-black/30 border border-spy-lime/30 rounded-xl px-4 py-3 text-spy-lime font-black text-sm focus:border-spy-lime focus:outline-none transition-colors placeholder:text-white/20 shadow-inner"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] uppercase font-black tracking-widest text-white/40 pl-2">Cible 2 (Espion)</label>
                                <input
                                    type="text"
                                    placeholder="Entrez un mot..."
                                    value={customWords.spy}
                                    onChange={(e) => setCustomWords({ ...customWords, spy: e.target.value })}
                                    className="w-full bg-black/30 border border-spy-orange/30 rounded-xl px-4 py-3 text-spy-orange font-black text-sm focus:border-spy-orange focus:outline-none transition-colors placeholder:text-white/20 shadow-inner"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Validation Warning */}
                <div className="mt-2 flex-none px-2 mb-4">
                    {!isRoleCountValid && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black p-3 rounded-xl text-center animate-shake uppercase tracking-widest shadow-inner">
                            ⚠️ Pas assez d'innocents (Min 2)
                        </div>
                    )}

                    {wordPack === 'custom' && !isCustomValid && (
                        <div className="bg-spy-orange/10 border border-spy-orange/20 text-spy-orange text-[10px] font-black p-3 rounded-xl text-center animate-shake uppercase tracking-widest shadow-inner mt-2">
                            ⚠️ Données incomplètes
                        </div>
                    )}
                </div>

            </div>

            {/* Start Button Area */}
            <div className="w-full max-w-md mt-auto z-20 pt-4 pb-8 px-4 relative flex justify-center" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
                <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-spy-lime/30 to-transparent" />

                <BouncyButton
                    variant="primary"
                    onClick={() => onStartGame({ undercoverCount, whiteCount, wordPack, customWords })}
                    className="w-full text-xl py-6 rounded-2xl tracking-widest relative overflow-hidden group shadow-spy-lime/30 shadow-2xl"
                    disabled={!isValid}
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        LANCER LA MISSION
                    </span>
                </BouncyButton>
            </div>

        </div>
    );
};

export default MissionBriefing;
