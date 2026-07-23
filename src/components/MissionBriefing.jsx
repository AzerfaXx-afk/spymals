import React, { useState, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
    Rocket, ShieldAlert, FolderKanban, Check, ChevronDown, 
    Folder, Film, Brain, Dog, Gamepad2, Plane, Utensils, Smile, Dices, Edit3 
} from 'lucide-react';
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
        { id: 'standard', label: 'Pack Standard', icon: <Folder className="w-5 h-5 text-spy-lime" /> },
        { id: 'pop-culture', label: 'Culture Pop', icon: <Film className="w-5 h-5 text-pink-400" /> },
        { id: 'abstract', label: 'Concepts Abstraits', icon: <Brain className="w-5 h-5 text-purple-400" /> },
        { id: 'animals', label: 'Animaux', icon: <Dog className="w-5 h-5 text-amber-400" /> },
        { id: 'geek', label: 'Jeux Vidéo & Geek', icon: <Gamepad2 className="w-5 h-5 text-cyan-400" /> },
        { id: 'travel', label: 'Voyage & Pays', icon: <Plane className="w-5 h-5 text-emerald-400" /> },
        { id: 'food', label: 'Gourmand / Nourriture', icon: <Utensils className="w-5 h-5 text-orange-400" /> },
        { id: 'fun', label: 'Absurde & Fun', icon: <Smile className="w-5 h-5 text-yellow-400" /> },
        { id: 'random', label: 'Aléatoire', icon: <Dices className="w-5 h-5 text-spy-lime" /> },
        { id: 'custom', label: 'Mots Personnalisés', icon: <Edit3 className="w-5 h-5 text-spy-orange" />, special: true },
    ];

    // Easter egg: screw animation
    const [unscrewedScrews, setUnscrewedScrews] = useState({});
    const allFourTriggered = useRef(false);
    const handleScrewClick = useCallback((id) => {
        if (unscrewedScrews[id]) return;
        const next = { ...unscrewedScrews, [id]: true };
        setUnscrewedScrews(next);

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
                allFourTriggered.current = false;
                return updated;
            });
        }, 2000);
    }, [unscrewedScrews, playSfx]);

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
        <div className="min-h-screen h-[100dvh] flex flex-col items-center p-4 pt-16 relative overflow-hidden bg-transparent">
            <BackArrow onClick={onBack} />
            <SettingsGear onClick={onOpenSettings} />

            {/* Background Ambient Lights */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-20%] w-[600px] h-[600px] bg-spy-lime opacity-[0.14] rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-20%] w-[500px] h-[500px] bg-spy-orange opacity-[0.14] rounded-full blur-[120px] animate-pulse-slow delay-700"></div>
            </div>

            {/* Top Status Badge */}
            <div className="z-10 mb-4 text-center flex-none animate-slide-up bg-black/40 px-6 py-2 rounded-full border-2 border-spy-lime/40 shadow-xl backdrop-blur-md">
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <FolderKanban className="w-5 h-5 text-spy-lime" /> Briefing de Mission
                </h2>
                <p className="text-spy-lime text-[9.5px] font-black uppercase tracking-[0.2em] animate-pulse mt-0.5">
                    Paramètres & Rôles Secret Défense
                </p>
            </div>

            <div className="w-full max-w-md flex-1 overflow-y-auto custom-scrollbar z-10 animate-slide-up space-y-4 px-2 pb-6" style={{ animationDelay: '0.1s' }}>

                <div className="card-cartoon bg-gradient-to-b from-[#14233e] to-[#0a1426] p-6 border-[3.5px] border-white/20 shadow-2xl flex-none relative w-full rounded-[32px]">
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
                                <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-gray-500 to-gray-300 shadow-inner"></div>
                                <div className="w-2.5 h-[1.5px] bg-gray-700/80 rotate-45 absolute shadow-[0_1px_0_rgba(255,255,255,0.3)]"></div>
                                <div className="w-2.5 h-[1.5px] bg-gray-700/80 rotate-135 absolute shadow-[0_1px_0_rgba(255,255,255,0.3)]"></div>
                            </button>
                        );
                    })}

                    {/* Civilians Display - Digital Readout */}
                    <div className="bg-black/40 rounded-2xl p-4 flex items-center justify-between border-2 border-white/10 mb-5 relative overflow-hidden shadow-inner">
                        <div className="absolute left-0 top-0 w-1.5 h-full bg-spy-lime shadow-[0_0_10px_#ccff00]"></div>
                        <div className="relative z-10 flex items-center gap-3 w-full justify-between pl-2">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">PERSONNEL ACCRÉDITÉ</span>
                                <span className="text-base font-black uppercase tracking-wider text-white">Innocents (Civils)</span>
                            </div>
                            <div className="bg-black/60 border-2 border-spy-lime/40 rounded-xl px-4 py-2 flex items-center justify-center shadow-inner">
                                <span className="text-3xl font-display font-black leading-none text-spy-lime text-shadow-md">
                                    {civilianCount.toString().padStart(2, '0')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 md:gap-3 items-stretch w-full overflow-hidden">
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
                            color="text-cyan-400"
                            subLabel="Aucun mot"
                            soundOptions={{ pitch: Math.min(2.0, 0.8 + ((whiteCount) * 0.1)) }}
                        />
                    </div>
                </div>

                {/* Word Pack Selection */}
                <div className="card-cartoon bg-gradient-to-b from-[#14233e] to-[#0a1426] p-5 border-[3.5px] border-white/20 shadow-2xl flex-none relative w-full rounded-[32px]">
                    <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-[#0a1628] px-4 py-1 rounded-full text-[10px] uppercase font-black text-spy-lime border-2 border-spy-lime/40 tracking-widest shadow-md">
                        Pack de Mots
                    </div>

                    <div className="relative mt-2">
                        {/* Custom Dropdown Toggle */}
                        <button
                            type="button"
                            onClick={() => setIsPackDropdownOpen(!isPackDropdownOpen)}
                            className="w-full bg-black/40 border-2 border-white/15 rounded-2xl px-4 py-3.5 flex items-center justify-between text-white font-black focus:outline-none transition-all shadow-inner hover:bg-black/60 cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">{packOptions.find(p => p.id === wordPack)?.icon}</span>
                                <span className={`text-sm uppercase tracking-wider font-black ${wordPack === 'custom' ? 'text-spy-orange' : 'text-white'}`}>
                                    {packOptions.find(p => p.id === wordPack)?.label}
                                </span>
                            </div>
                            <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isPackDropdownOpen ? 'rotate-180 text-spy-lime' : 'text-white/40'}`} />
                        </button>

                        {/* Custom Dropdown Menu */}
                        {isPackDropdownOpen && (
                            <div className="w-full mt-2 bg-[#121c32]/98 backdrop-blur-2xl border-2 border-white/20 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] overflow-hidden animate-slide-up origin-top z-30">
                                <div className="max-h-[210px] overflow-y-auto custom-scrollbar">
                                    {packOptions.map((pack) => (
                                        <button
                                            key={pack.id}
                                            type="button"
                                            onClick={() => {
                                                setWordPack(pack.id);
                                                setIsPackDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-white/5 last:border-0 hover:bg-white/10 cursor-pointer ${
                                                wordPack === pack.id ? 'bg-spy-lime/15' : ''
                                            }`}
                                        >
                                            <span className="text-xl flex-none">{pack.icon}</span>
                                            <span className={`text-xs font-black uppercase tracking-wider flex-1 ${
                                                pack.special ? 'text-spy-orange' : wordPack === pack.id ? 'text-spy-lime' : 'text-white/90'
                                            }`}>
                                                {pack.label}
                                            </span>
                                            {wordPack === pack.id && (
                                                <Check className="w-4 h-4 text-spy-lime flex-none stroke-[3]" />
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
                                <label className="text-[9.5px] uppercase font-black tracking-widest text-spy-lime pl-1">Cible 1 (Mot des Innocents)</label>
                                <input
                                    type="text"
                                    placeholder="Entrez un mot (ex: Pizza)..."
                                    value={customWords.innocent}
                                    onChange={(e) => setCustomWords({ ...customWords, innocent: e.target.value })}
                                    className="w-full bg-black/40 border-2 border-spy-lime/50 rounded-xl px-4 py-3 text-spy-lime font-black text-sm focus:border-spy-lime focus:outline-none transition-colors placeholder:text-white/20 shadow-inner"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9.5px] uppercase font-black tracking-widest text-spy-orange pl-1">Cible 2 (Mot des Espions)</label>
                                <input
                                    type="text"
                                    placeholder="Entrez un mot (ex: Burger)..."
                                    value={customWords.spy}
                                    onChange={(e) => setCustomWords({ ...customWords, spy: e.target.value })}
                                    className="w-full bg-black/40 border-2 border-spy-orange/50 rounded-xl px-4 py-3 text-spy-orange font-black text-sm focus:border-spy-orange focus:outline-none transition-colors placeholder:text-white/20 shadow-inner"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Validation Warnings */}
                <div className="mt-2 flex-none px-1">
                    {!isRoleCountValid && (
                        <div className="bg-red-500/20 border-2 border-red-500/50 text-red-300 text-[10.5px] font-black p-3 rounded-2xl text-center animate-shake uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-red-400" /> Pas assez d'innocents (Min. 2 requises)
                        </div>
                    )}

                    {wordPack === 'custom' && !isCustomValid && (
                        <div className="bg-spy-orange/20 border-2 border-spy-orange/50 text-spy-orange text-[10.5px] font-black p-3 rounded-2xl text-center animate-shake uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 mt-2">
                            <ShieldAlert className="w-4 h-4 text-spy-orange" /> Données des mots perso incomplètes
                        </div>
                    )}
                </div>

            </div>

            {/* Launch Button Area */}
            <div className="w-full max-w-md mt-auto z-20 pt-2 pb-6 px-4 flex justify-center" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
                <button
                    onClick={() => onStartGame({ undercoverCount, whiteCount, wordPack, customWords })}
                    disabled={!isValid}
                    className={`btn-cartoon-primary w-full py-4 text-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_6px_0_#000] active:translate-y-1.5 active:shadow-[0_0_0_#000] transition-all ${
                        !isValid ? 'opacity-50 cursor-not-allowed filter grayscale' : 'hover:scale-[1.01]'
                    }`}
                >
                    <Rocket className="w-6 h-6 stroke-[3]" /> LANCER LA MISSION
                </button>
            </div>

        </div>
    );
};

export default MissionBriefing;

