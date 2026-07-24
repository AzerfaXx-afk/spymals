import React, { useState, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Rocket, ShieldAlert, FolderKanban, Check, ChevronDown, 
    Folder, Film, Brain, Dog, Gamepad2, Plane, Utensils, Smile, Dices, Edit3, Flame, Info, X, Sliders, Sparkles
} from 'lucide-react';
import RoleStepper from './RoleStepper';
import BackArrow from './BackArrow';
import SettingsGear from './SettingsGear';
import { useAudio } from '../contexts/AudioContext';

const MissionBriefing = ({ totalPlayers, onStartGame, onBack, onOpenSettings }) => {
    const { playSfx } = useAudio();
    const [undercoverCount, setUndercoverCount] = useState(1);
    const [whiteCount, setWhiteCount] = useState(0);
    const [bouffonCount, setBouffonCount] = useState(0);
    const [cameleonCount, setCameleonCount] = useState(0);
    const [wordPack, setWordPack] = useState('standard');
    const [isPackDropdownOpen, setIsPackDropdownOpen] = useState(false);
    const [isSpecialRolesModalOpen, setIsSpecialRolesModalOpen] = useState(false);
    const [activeRoleInfo, setActiveRoleInfo] = useState(null); // 'white' | 'bouffon' | 'cameleon' | null
    const [customWords, setCustomWords] = useState({ innocent: '', spy: '' });

    // Pack options order requested:
    // 1. Standard, 2. Culture Pop, 3. Concepts Abstraits, 4. Animaux, 5. Pack Soirée (+18), 6. Geek, 7. Voyage, 8. Nourriture, 9. Fun, 10. Random, 11. Custom
    const packOptions = [
        { id: 'standard', label: 'Pack Standard', icon: <Folder className="w-5 h-5 text-spy-lime" /> },
        { id: 'pop-culture', label: 'Culture Pop', icon: <Film className="w-5 h-5 text-pink-400" /> },
        { id: 'abstract', label: 'Concepts Abstraits', icon: <Brain className="w-5 h-5 text-purple-400" /> },
        { id: 'animals', label: 'Animaux', icon: <Dog className="w-5 h-5 text-amber-400" /> },
        { id: 'spicy', label: 'Pack Soirée (+18)', icon: <Flame className="w-5 h-5 text-red-500" />, special: true },
        { id: 'geek', label: 'Jeux Vidéo & Geek', icon: <Gamepad2 className="w-5 h-5 text-cyan-400" /> },
        { id: 'travel', label: 'Voyage & Pays', icon: <Plane className="w-5 h-5 text-emerald-400" /> },
        { id: 'food', label: 'Gourmand / Nourriture', icon: <Utensils className="w-5 h-5 text-orange-400" /> },
        { id: 'fun', label: 'Absurde & Fun', icon: <Smile className="w-5 h-5 text-yellow-400" /> },
        { id: 'random', label: 'Aléatoire', icon: <Dices className="w-5 h-5 text-spy-lime" /> },
        { id: 'custom', label: 'Mots Personnalisés', icon: <Edit3 className="w-5 h-5 text-spy-orange" />, special: true },
    ];

    // Role definitions for the info modals
    const ROLE_INFOS = {
        white: {
            title: 'Mr. Blanc',
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/20 border-cyan-400/50',
            description: "Mr. Blanc n'a AUCUN mot secret. Son but est d'écouter les indices des autres pour bluffer et deviner le mot des Innocents.",
            perk: "S'il est éliminé au vote, il a 1 DERNIÈRE CHANCE : s'il devine le mot exact des Civils, il fait gagner les Imposteurs !"
        },
        bouffon: {
            title: 'Le Bouffon (Jester)',
            color: 'text-purple-400',
            bg: 'bg-purple-500/20 border-purple-400/50',
            description: "Le Bouffon n'a aucun mot secret. Son rôle est d'agir de façon suspecte pour pousser le groupe à le voter dehors !",
            perk: "S'il est éliminé au vote par les joueurs, la partie s'arrête net et LE BOUFFON GAGNE SEUL LA PARTIE !"
        },
        cameleon: {
            title: 'Le Caméléon',
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/20 border-emerald-400/50',
            description: "Le Caméléon connaît le rôle des autres joueurs mais n'a pas le mot. Il doit s'adapter et s'infiltrer sans se faire repérer.",
            perk: "S'il survit jusqu'à la fin de la mission avec les Civils sans se faire démasquer, il gagne avec l'équipe !"
        }
    };

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

    const civilianCount = totalPlayers - undercoverCount - whiteCount - bouffonCount - cameleonCount;

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
            if (totalPlayers - (undercoverCount + 1) - whiteCount - bouffonCount - cameleonCount >= 2) {
                setUndercoverCount(undercoverCount + 1);
            }
        } else if (type === 'white') {
            if (totalPlayers - undercoverCount - (whiteCount + 1) - bouffonCount - cameleonCount >= 2) {
                setWhiteCount(whiteCount + 1);
            }
        } else if (type === 'bouffon') {
            if (totalPlayers - undercoverCount - whiteCount - (bouffonCount + 1) - cameleonCount >= 2) {
                setBouffonCount(bouffonCount + 1);
            }
        } else if (type === 'cameleon') {
            if (totalPlayers - undercoverCount - whiteCount - bouffonCount - (cameleonCount + 1) >= 2) {
                setCameleonCount(cameleonCount + 1);
            }
        }
    };

    const handleDecrement = (type) => {
        if (type === 'undercover') {
            if (undercoverCount > 1) setUndercoverCount(undercoverCount - 1);
        } else if (type === 'white') {
            if (whiteCount > 0) setWhiteCount(whiteCount - 1);
        } else if (type === 'bouffon') {
            if (bouffonCount > 0) setBouffonCount(bouffonCount - 1);
        } else if (type === 'cameleon') {
            if (cameleonCount > 0) setCameleonCount(cameleonCount - 1);
        }
    };

    const specialRolesActiveCount = whiteCount + bouffonCount + cameleonCount;

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
            <div className="z-10 mb-3 text-center flex-none animate-slide-up bg-black/40 px-6 py-2 rounded-full border-2 border-spy-lime/40 shadow-xl backdrop-blur-md">
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <FolderKanban className="w-5 h-5 text-spy-lime" /> Briefing de Mission
                </h2>
                <p className="text-spy-lime text-[9.5px] font-black uppercase tracking-[0.2em] animate-pulse mt-0.5">
                    Paramètres & Rôles Secret Défense
                </p>
            </div>

            <div className="w-full max-w-md flex-1 overflow-y-auto custom-scrollbar z-10 animate-slide-up space-y-4 px-2 pb-6" style={{ animationDelay: '0.1s' }}>

                {/* MAIN ROLES CARD */}
                <div className="card-cartoon bg-gradient-to-b from-[#14233e] to-[#0a1426] p-5 border-[3.5px] border-white/20 shadow-2xl flex-none relative w-full rounded-[32px]">
                    {/* Decorative Screws */}
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
                    <div className="bg-black/40 rounded-2xl p-3.5 flex items-center justify-between border-2 border-white/10 mb-4 relative overflow-hidden shadow-inner">
                        <div className="absolute left-0 top-0 w-1.5 h-full bg-spy-lime shadow-[0_0_10px_#ccff00]"></div>
                        <div className="relative z-10 flex items-center gap-3 w-full justify-between pl-2">
                            <div className="flex flex-col">
                                <span className="text-[9.5px] font-black uppercase tracking-widest text-white/40">PERSONNEL ACCRÉDITÉ</span>
                                <span className="text-sm font-black uppercase tracking-wider text-white">Innocents (Civils)</span>
                            </div>
                            <div className="bg-black/60 border-2 border-spy-lime/40 rounded-xl px-3.5 py-1.5 flex items-center justify-center shadow-inner">
                                <span className="text-2xl font-display font-black leading-none text-spy-lime text-shadow-md">
                                    {civilianCount.toString().padStart(2, '0')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Espions Stepper - Spacious full-width block */}
                    <div className="mb-4">
                        <RoleStepper
                            label="Espions (Undercover)"
                            count={undercoverCount}
                            onIncrement={() => handleIncrement('undercover')}
                            onDecrement={() => handleDecrement('undercover')}
                            color="text-spy-orange"
                            subLabel="Ont un mot proche des innocents"
                            soundOptions={{ pitch: Math.min(2.0, 0.8 + ((undercoverCount) * 0.1)) }}
                        />
                    </div>

                    {/* Long Sleek Button: OTHER ROLES */}
                    <button
                        type="button"
                        onClick={() => setIsSpecialRolesModalOpen(true)}
                        className="w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-white/20 rounded-2xl p-3.5 flex items-center justify-between text-white font-black hover:border-purple-400/60 transition-all shadow-lg cursor-pointer group active:scale-[0.99]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                <Sliders className="w-4 h-4 stroke-[2.5]" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-xs uppercase font-black tracking-wider text-white">
                                    Autres Rôles Spéciaux...
                                </span>
                                <span className="text-[9px] font-black text-white/50 tracking-widest uppercase">
                                    Mr. Blanc, Le Bouffon, Le Caméléon
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {specialRolesActiveCount > 0 && (
                                <span className="bg-purple-500 text-black px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase shadow">
                                    {specialRolesActiveCount} Actif{specialRolesActiveCount > 1 ? 's' : ''}
                                </span>
                            )}
                            <ChevronDown className="w-5 h-5 text-white/40 group-hover:text-purple-400 transition-colors -rotate-90" />
                        </div>
                    </button>

                </div>

                {/* WORD PACK SELECTION */}
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
                                <span className={`text-sm uppercase tracking-wider font-black ${wordPack === 'custom' ? 'text-spy-orange' : wordPack === 'spicy' ? 'text-red-400' : 'text-white'}`}>
                                    {packOptions.find(p => p.id === wordPack)?.label}
                                </span>
                            </div>
                            <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isPackDropdownOpen ? 'rotate-180 text-spy-lime' : 'text-white/40'}`} />
                        </button>

                        {/* Custom Dropdown Menu */}
                        {isPackDropdownOpen && (
                            <div className="w-full mt-2 bg-[#121c32]/98 backdrop-blur-2xl border-2 border-white/20 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] overflow-hidden animate-slide-up origin-top z-30">
                                <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
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
                                                pack.id === 'spicy' ? 'text-red-400 font-bold' : pack.special ? 'text-spy-orange' : wordPack === pack.id ? 'text-spy-lime' : 'text-white/90'
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

            {/* SPECIAL ROLES MODAL / DRAWER */}
            <AnimatePresence>
                {isSpecialRolesModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSpecialRolesModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="z-10 w-full max-w-md card-cartoon bg-gradient-to-b from-[#14233e] via-[#0d182b] to-[#0a1426] border-[3.5px] border-white/20 p-6 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col gap-4 relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                <div className="flex items-center gap-2">
                                    <Sliders className="w-5 h-5 text-purple-400" />
                                    <h3 className="text-lg font-black uppercase text-white tracking-wider">
                                        Rôles Spéciaux
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setIsSpecialRolesModalOpen(false)}
                                    className="p-1 rounded-full bg-white/10 text-white/70 hover:text-white cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-white/60 text-xs font-black uppercase tracking-wider">
                                Ajoutez des rôles uniques pour pimenter vos parties !
                            </p>

                            {/* Steppers for Special Roles with Info (i) button */}
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">

                                {/* Mr. Blanc */}
                                <div className="bg-black/30 border border-white/10 rounded-2xl p-3 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-sm uppercase text-cyan-400">Mr. Blanc</span>
                                            <button
                                                type="button"
                                                onClick={() => setActiveRoleInfo('white')}
                                                className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 flex items-center justify-center cursor-pointer hover:bg-cyan-400 hover:text-black transition-colors"
                                                title="Information sur le rôle"
                                            >
                                                <Info className="w-3 h-3 stroke-[3]" />
                                            </button>
                                        </div>
                                        <span className="text-[10px] font-black text-white/50 uppercase">Aucun mot · Devine</span>
                                    </div>
                                    <RoleStepper
                                        label="Effectif Mr. Blanc"
                                        count={whiteCount}
                                        onIncrement={() => handleIncrement('white')}
                                        onDecrement={() => handleDecrement('white')}
                                        color="text-cyan-400"
                                    />
                                </div>

                                {/* Le Bouffon */}
                                <div className="bg-black/30 border border-white/10 rounded-2xl p-3 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-sm uppercase text-purple-400">Le Bouffon 🃏</span>
                                            <button
                                                type="button"
                                                onClick={() => setActiveRoleInfo('bouffon')}
                                                className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-400 flex items-center justify-center cursor-pointer hover:bg-purple-400 hover:text-black transition-colors"
                                                title="Information sur le rôle"
                                            >
                                                <Info className="w-3 h-3 stroke-[3]" />
                                            </button>
                                        </div>
                                        <span className="text-[10px] font-black text-white/50 uppercase">Veut être voté</span>
                                    </div>
                                    <RoleStepper
                                        label="Effectif Bouffon"
                                        count={bouffonCount}
                                        onIncrement={() => handleIncrement('bouffon')}
                                        onDecrement={() => handleDecrement('bouffon')}
                                        color="text-purple-400"
                                    />
                                </div>

                                {/* Le Caméléon */}
                                <div className="bg-black/30 border border-white/10 rounded-2xl p-3 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-sm uppercase text-emerald-400">Le Caméléon 🦎</span>
                                            <button
                                                type="button"
                                                onClick={() => setActiveRoleInfo('cameleon')}
                                                className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center cursor-pointer hover:bg-emerald-400 hover:text-black transition-colors"
                                                title="Information sur le rôle"
                                            >
                                                <Info className="w-3 h-3 stroke-[3]" />
                                            </button>
                                        </div>
                                        <span className="text-[10px] font-black text-white/50 uppercase">Adaptation · Infiltration</span>
                                    </div>
                                    <RoleStepper
                                        label="Effectif Caméléon"
                                        count={cameleonCount}
                                        onIncrement={() => handleIncrement('cameleon')}
                                        onDecrement={() => handleDecrement('cameleon')}
                                        color="text-emerald-400"
                                    />
                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={() => setIsSpecialRolesModalOpen(false)}
                                className="btn-cartoon-primary w-full py-3.5 text-sm font-black uppercase tracking-wider cursor-pointer shadow-[0_4px_0_#000] active:translate-y-1 transition-all mt-2"
                            >
                                CONFIRMER LES RÔLES
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ROLE EXPLANATION POPUP (i) */}
            <AnimatePresence>
                {activeRoleInfo && ROLE_INFOS[activeRoleInfo] && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveRoleInfo(null)}
                            className="absolute inset-0 bg-black/85 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            className="z-10 w-full max-w-sm card-cartoon bg-[#0d182b] border-[3.5px] border-white/20 p-6 rounded-[32px] shadow-2xl flex flex-col items-center text-center relative"
                        >
                            <button
                                onClick={() => setActiveRoleInfo(null)}
                                className="absolute top-4 right-4 p-1 rounded-full bg-white/10 text-white/70 hover:text-white cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className={`p-3 rounded-full border-2 mb-3 ${ROLE_INFOS[activeRoleInfo].bg}`}>
                                <Info className={`w-8 h-8 ${ROLE_INFOS[activeRoleInfo].color}`} />
                            </div>

                            <h3 className={`text-xl font-black uppercase tracking-wide mb-2 ${ROLE_INFOS[activeRoleInfo].color}`}>
                                {ROLE_INFOS[activeRoleInfo].title}
                            </h3>

                            <p className="text-white/80 font-bold text-xs leading-relaxed mb-4">
                                {ROLE_INFOS[activeRoleInfo].description}
                            </p>

                            <div className="bg-black/40 border border-white/10 rounded-2xl p-3.5 text-left w-full shadow-inner">
                                <span className="text-[10px] font-black uppercase tracking-widest text-spy-lime block mb-1">
                                    ★ Pouvoir Spécial :
                                </span>
                                <p className="text-white/90 font-black text-xs leading-tight">
                                    {ROLE_INFOS[activeRoleInfo].perk}
                                </p>
                            </div>

                            <button
                                onClick={() => setActiveRoleInfo(null)}
                                className="btn-cartoon-primary w-full py-3 text-xs font-black uppercase tracking-wider cursor-pointer shadow-[0_4px_0_#000] active:translate-y-1 transition-all mt-4"
                            >
                                COMPRIS !
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Launch Button Area */}
            <div className="w-full max-w-md mt-auto z-20 pt-2 pb-6 px-4 flex justify-center" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
                <button
                    onClick={() => onStartGame({ undercoverCount, whiteCount, bouffonCount, cameleonCount, wordPack, customWords })}
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
