import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, ShieldAlert, Check, X, Eye, Vote, Volume2, Lightbulb, Skull, PartyPopper, UserCheck } from 'lucide-react';
import BouncyButton from './BouncyButton';
import { wordPacks } from '../data/wordPacks';
import SettingsGear from './SettingsGear';
import { useAudio } from '../contexts/AudioContext';
import { supabase } from '../utils/supabaseClient';
import { CartoonAvatar } from './CartoonAvatars';

const GameSession = ({ players, config, onEndGame, onAbort, onOpenSettings }) => {
    // States: distributing | playing | voting | reveal | mrwhite_guess
    const [gameState, setGameState] = useState('distributing');
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [assignedRoles, setAssignedRoles] = useState([]);
    const [targetWord, setTargetWord] = useState(null);
    const [votedPlayer, setVotedPlayer] = useState(null);
    const [eliminatedPlayers, setEliminatedPlayers] = useState([]);
    const [finalWinningTeam, setFinalWinningTeam] = useState(null);
    // Speaking order for discussion phase
    const [speakingOrder, setSpeakingOrder] = useState([]);
    const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(0);

    const { switchMusic, playSfx } = useAudio();

    // 3D Cartoon Tombstone drop animation state
    const [showTombstone, setShowTombstone] = useState(false);

    // Auto trigger tombstone animation when entering reveal screen
    useEffect(() => {
        if (gameState === 'reveal') {
            setShowTombstone(false); // reset first
            const timer = setTimeout(() => {
                setShowTombstone(true);
                playSfx('/sons/mort.mp3', { volumeMultiplier: 1.0 }); // Death sound
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [gameState, playSfx]);

    // Initialize Game & Manage Music
    useEffect(() => {
        if (gameState === 'distributing') {
            switchMusic('game.mp3');
            if (assignedRoles.length === 0) {
                assignRoles();
            }
        } else if (gameState === 'game_over_reveal') {
            switchMusic('music.mp3'); // Keep original music playing in background
            playSfx(finalWinningTeam === 'Civilian' ? '/sons/win.mp3' : '/sons/lose.mp3', { volumeMultiplier: 1.5 });
        } else {
            // Once we start playing or finish, revert to standard music
            switchMusic('music.mp3');
        }
    }, [gameState, assignedRoles.length, switchMusic, finalWinningTeam, playSfx]);

    // Generate a fresh random speaking order every time we enter the playing state
    useEffect(() => {
        if (gameState === 'playing' && assignedRoles.length > 0) {
            const alivePlayers = shuffle(
                assignedRoles.filter(p => !eliminatedPlayers.includes(p.id))
            );
            setSpeakingOrder(alivePlayers);
            setCurrentSpeakerIndex(0);
        }
    }, [gameState]);

    // ── True uniform shuffle (Fisher-Yates) ──────────────────────────────────
    const shuffle = (arr) => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    const assignRoles = async () => {
        const { undercoverCount, whiteCount, wordPack, customWords } = config;

        let wordPair;
        if (wordPack === 'custom' && customWords) {
            wordPair = {
                civilian: customWords.innocent,
                undercover: customWords.spy
            };
        } else {
            let pack = null;
            try {
                // Fetch words for this pack from Supabase
                const { data, error } = await supabase
                    .from('spymals_words')
                    .select('civilian, undercover')
                    .eq('pack_name', wordPack);

                if (data && data.length > 0 && !error) {
                    pack = data;
                    console.log(`Fetched ${data.length} words from Supabase for pack: ${wordPack}`);
                } else if (error) {
                    console.error("Supabase query error:", error.message);
                }
            } catch (err) {
                console.error("Failed to query Supabase:", err);
            }

            // Fallback to local
            if (!pack || pack.length === 0) {
                console.log("Using local word packs fallback");
                pack = wordPacks[wordPack] || wordPacks.standard;
            }

            wordPair = pack[Math.floor(Math.random() * pack.length)];
        }

        let roles = [];
        for (let i = 0; i < undercoverCount; i++) roles.push({ role: 'Undercover', word: wordPair.undercover });
        for (let i = 0; i < whiteCount; i++) roles.push({ role: 'Mr. White', word: null });

        const civilianCount = players.length - undercoverCount - whiteCount;
        for (let i = 0; i < civilianCount; i++) roles.push({ role: 'Civilian', word: wordPair.civilian });

        // Shuffle roles uniformly (Fisher-Yates via shuffle helper)
        const shuffledRoles = shuffle(roles);

        // Assign roles to players
        const assignments = players.map((player, index) => ({
            ...player,
            role: shuffledRoles[index].role,
            word: shuffledRoles[index].word,
        }));

        // Shuffle the REVEAL ORDER independently — fully random
        const shuffled = shuffle(assignments);

        // Only constraint: Mr. White must NOT be first (no word = instant exposure)
        const firstMrWhiteIdx = shuffled.findIndex(p => p.role === 'Mr. White');
        if (firstMrWhiteIdx === 0) {
            // Swap with a random non-first, non-Mr.-White position
            const candidates = shuffled
                .map((p, i) => i)
                .filter(i => i > 0 && shuffled[i].role !== 'Mr. White');
            if (candidates.length > 0) {
                const pick = candidates[Math.floor(Math.random() * candidates.length)];
                [shuffled[0], shuffled[pick]] = [shuffled[pick], shuffled[0]];
            }
        }

        setAssignedRoles(shuffled);
        setTargetWord(wordPair);
    };

    const nextPlayer = () => {
        setIsRevealed(false);
        if (currentPlayerIndex < players.length - 1) {
            setCurrentPlayerIndex(currentPlayerIndex + 1);
        } else {
            setGameState('playing');
        }
    };

    const handleStartVote = () => {
        setGameState('voting');
    };

    const handleVote = (player) => {
        setVotedPlayer(player);
        setGameState('reveal');
    };

    // ─────────────────────────────────────────────
    // WIN CONDITION CHECK
    // Returns 'Civilian', 'Impostors', or null
    // ─────────────────────────────────────────────
    const checkWinConditions = (eliminatedIds) => {
        const alive = assignedRoles.filter(p => !eliminatedIds.includes(p.id));

        const aliveImpostors = alive.filter(p => p.role === 'Undercover' || p.role === 'Mr. White').length;
        const aliveCivilians = alive.filter(p => p.role === 'Civilian').length;

        // Civilians win: no impostors left alive
        if (aliveImpostors === 0) return 'Civilian';

        // Impostors win by survival: only 1 (or 0) civilian left alive
        if (aliveCivilians <= 1) return 'Impostors';

        return null;
    };

    // ─────────────────────────────────────────────
    // ELIMINATE A PLAYER (called from reveal screen)
    // ─────────────────────────────────────────────
    const handleEliminatePlayer = () => {
        if (!votedPlayer) return;

        const newEliminated = [...eliminatedPlayers, votedPlayer.id];
        setEliminatedPlayers(newEliminated);

        // Mr. White gets a last-chance guess before the standard win check
        if (votedPlayer.role === 'Mr. White') {
            setGameState('mrwhite_guess');
            return;
        }

        // Standard win check for everyone else
        const winner = checkWinConditions(newEliminated);
        if (winner) {
            triggerGameEnd(winner);
        } else {
            setVotedPlayer(null);
            setGameState('playing');
        }
    };

    // ─────────────────────────────────────────────
    // MR. WHITE LAST CHANCE OUTCOMES
    // ─────────────────────────────────────────────
    const handleMrWhiteSuccess = () => {
        // Mr. White guessed correctly → Impostors win immediately
        triggerGameEnd('Impostors');
    };

    const handleMrWhiteFail = () => {
        // Mr. White definitively eliminated – run standard win check
        // eliminatedPlayers already includes Mr. White (set in handleEliminatePlayer)
        const winner = checkWinConditions(eliminatedPlayers);
        if (winner) {
            triggerGameEnd(winner);
        } else {
            setVotedPlayer(null);
            setGameState('playing');
        }
    };

    // ─────────────────────────────────────────────
    // TRIGGER GAME END
    // ─────────────────────────────────────────────
    const triggerGameEnd = (winningTeam) => {
        setFinalWinningTeam(winningTeam);
        setGameState('game_over_reveal');

        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: winningTeam === 'Civilian' ? ['#CCFF00', '#ffffff'] : ['#FF6600', '#000000']
        });

        // Play 🎉 sound
        playSfx('/sons/confetti.mp3', { volumeMultiplier: 0.8 });
    };

    const proceedToScoreboard = () => {
        const playerRoles = {};
        assignedRoles.forEach(p => {
            playerRoles[p.id] = p.role;
        });
        onEndGame(finalWinningTeam, playerRoles);
    };

    const handleReveal = () => {
        if (!isRevealed) setIsRevealed(true);
    };

    const currentPlayer = assignedRoles[currentPlayerIndex];

    // ─────────────────────────────────────────────
    // GAME OVER REVEAL MODAL
    // ─────────────────────────────────────────────
    if (gameState === 'game_over_reveal') {
        const isCivilianWin = finalWinningTeam === 'Civilian';

        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-transparent text-center relative overflow-hidden">
                <SettingsGear onClick={onOpenSettings} />
                <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-0" />

                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    className="z-10 w-full max-w-md flex flex-col items-center"
                >
                    {/* 3D Cutout Victory / Defeat Hero Character */}
                    <motion.div
                        initial={{ scale: 0.7, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
                        className="relative w-56 h-52 flex items-center justify-center mb-1 flex-shrink-0"
                    >
                        {/* Radial neon glow aura */}
                        <div className={`absolute inset-4 rounded-full blur-2xl opacity-40 pointer-events-none ${
                            isCivilianWin ? 'bg-spy-lime' : 'bg-spy-orange'
                        }`} />

                        <img 
                            src={isCivilianWin ? '/victory_civilians_cutout_3d.png' : '/victory_impostors_cutout_3d.png'} 
                            alt={isCivilianWin ? 'Victoire des Innocents' : 'Victoire des Imposteurs'} 
                            className="w-full h-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)] z-10 transform hover:scale-105 transition-transform duration-300" 
                        />
                    </motion.div>

                    <div className="text-center mb-5">
                        <div className="bg-white/10 px-4 py-1 rounded-full border border-white/20 mb-2 inline-block">
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/70">
                                Fin de la Partie
                            </span>
                        </div>

                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-1 text-shadow-md">
                            Mission Terminée
                        </h2>
                        <h3 className={`text-3xl md:text-4xl font-black uppercase tracking-tight ${isCivilianWin ? 'text-spy-lime' : 'text-spy-orange'} text-shadow-lg`}>
                            {isCivilianWin ? 'Victoire des Innocents !' : 'Victoire des Imposteurs !'}
                        </h3>
                    </div>

                    {/* Words Reveal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        className="w-full card-cartoon bg-gradient-to-b from-[#14233e] to-[#0a1426] p-6 border-[3.5px] border-white/20 shadow-2xl mb-6 relative rounded-[32px]"
                    >
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                            Déclassification des Mots Secrets
                        </p>

                        <div className="flex flex-col gap-4">
                            {/* Civilian Word */}
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="bg-spy-lime/15 border-2 border-spy-lime/40 rounded-2xl p-4 relative overflow-hidden group shadow-inner"
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-spy-lime text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                                        Mot des Innocents
                                    </span>
                                    <span className="text-3xl font-black text-white break-words text-shadow-md">
                                        {targetWord?.civilian || '???'}
                                    </span>
                                </div>
                            </motion.div>

                            {/* Undercover Word */}
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.9 }}
                                className="bg-spy-orange/15 border-2 border-spy-orange/40 rounded-2xl p-4 relative overflow-hidden group shadow-inner"
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-spy-orange text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                                        Mot des Espions
                                    </span>
                                    <span className="text-3xl font-black text-white break-words text-shadow-md">
                                        {targetWord?.undercover || '???'}
                                    </span>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                        className="w-full"
                    >
                        <button
                            onClick={proceedToScoreboard}
                            className="btn-cartoon-primary w-full py-4 text-xl font-black uppercase tracking-wider cursor-pointer shadow-[0_6px_0_#000] active:translate-y-1.5 active:shadow-[0_0_0_#000] transition-all"
                        >
                            VOIR LES SCORES →
                        </button>
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    // ─────────────────────────────────────────────
    // MR. WHITE LAST CHANCE MODAL
    // ─────────────────────────────────────────────
    if (gameState === 'mrwhite_guess') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-transparent text-center relative overflow-hidden">
                <SettingsGear onClick={onOpenSettings} />
                <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-0" />

                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                    className="z-10 w-full max-w-md flex flex-col items-center"
                >
                    {/* Icon + Title */}
                    <div className="mb-6 flex flex-col items-center">
                        <div className="p-4 rounded-full bg-cyan-500/20 border-2 border-cyan-400/40 mb-3 animate-bounce-slow filter drop-shadow-[0_0_40px_rgba(6,182,212,0.3)]">
                            <ShieldAlert className="w-12 h-12 text-cyan-400 stroke-[2.5]" />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-tight mb-1 text-shadow-md">
                            Dernière Chance
                        </h2>
                        <h2 className="text-3xl font-black text-cyan-400 uppercase tracking-tight text-shadow-lg">
                            Mr. Blanc
                        </h2>
                    </div>

                    {/* Info card */}
                    <div className="card-cartoon bg-gradient-to-b from-[#14233e] to-[#0a1426] p-6 border-[3.5px] border-white/20 shadow-2xl mb-6 rounded-[32px] w-full">
                        <p className="text-white/90 font-bold text-base leading-relaxed">
                            <span className="text-spy-lime font-black">{votedPlayer?.name}</span> a été éliminé·e.
                            <br /><br />
                            S'il/elle devine le <span className="text-white font-black underline">mot secret des Civils</span> à voix haute,
                            les imposteurs <span className="text-spy-orange font-black">gagnent la partie !</span>
                        </p>
                        <div className="mt-4 pt-3 border-t border-white/10">
                            <p className="text-white/50 text-xs font-black uppercase tracking-widest">
                                Le groupe valide le résultat ci-dessous
                            </p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={handleMrWhiteSuccess}
                            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black border-[3.5px] border-black rounded-2xl py-4 text-base uppercase tracking-wider shadow-[0_5px_0_#000] active:translate-y-1 active:shadow-[0_0_0_#000] cursor-pointer transition-all flex items-center justify-center gap-2"
                        >
                            <Check className="w-5 h-5 stroke-[3]" /> Il a trouvé le mot secret !
                        </button>

                        <button
                            onClick={handleMrWhiteFail}
                            className="bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black border-[3.5px] border-black rounded-2xl py-4 text-base uppercase tracking-wider shadow-[0_5px_0_#000] active:translate-y-1 active:shadow-[0_0_0_#000] cursor-pointer transition-all flex items-center justify-center gap-2"
                        >
                            <X className="w-5 h-5 stroke-[3]" /> Mauvais mot... Éliminé !
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ─────────────────────────────────────────────
    // PLAYING STATE — Discussion / Speaking Order
    // ─────────────────────────────────────────────
    if (gameState === 'playing') {
        const currentSpeaker = speakingOrder[currentSpeakerIndex];
        const allSpoken = speakingOrder.length > 0 && currentSpeakerIndex >= speakingOrder.length;
        const isLoading = speakingOrder.length === 0;
        const roundNumber = Math.floor(eliminatedPlayers.length) + 1;

        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-transparent text-center relative overflow-hidden">
                <SettingsGear onClick={onOpenSettings} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-spy-lime/10 opacity-30 rounded-full blur-[140px] pointer-events-none" />

                <div className="z-10 flex flex-col items-center w-full max-w-md gap-4">

                    {/* Round label */}
                    <div className="bg-black/40 border border-white/15 px-4 py-1.5 rounded-full mb-1">
                        <span className="text-spy-lime font-black uppercase tracking-[0.2em] text-[10.5px]">
                            Manche {roundNumber} · Tour d'Indice
                        </span>
                    </div>

                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                                <div className="card-cartoon bg-[#14233e] p-8 border-[3.5px] border-white/20 shadow-2xl flex items-center justify-center gap-3 rounded-[32px]">
                                    <div className="w-3 h-3 rounded-full bg-spy-lime animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-3 h-3 rounded-full bg-spy-lime animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-3 h-3 rounded-full bg-spy-lime animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </motion.div>
                        ) : !allSpoken && currentSpeaker ? (
                            /* CURRENT SPEAKER CARD */
                            <motion.div
                                key={`speaker-${currentSpeakerIndex}`}
                                initial={{ y: 30, opacity: 0, scale: 0.95 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ y: -30, opacity: 0, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                className="w-full flex flex-col items-center"
                            >
                                {/* Speaker highlight card */}
                                <div className="card-cartoon bg-gradient-to-b from-[#14233e] to-[#0a1426] p-7 border-[3.5px] border-white/20 shadow-2xl mb-5 flex flex-col items-center gap-4 w-full rounded-[36px]">
                                    <div className="bg-spy-lime/20 border border-spy-lime/40 px-3 py-1 rounded-full flex items-center gap-1.5">
                                        <Volume2 className="w-3.5 h-3.5 text-spy-lime stroke-[2.5]" />
                                        <span className="text-spy-lime font-black uppercase tracking-[0.2em] text-[10px]">
                                            À qui de parler
                                        </span>
                                    </div>

                                    <div className="w-24 h-24 rounded-full bg-black/40 border-4 border-spy-lime flex items-center justify-center shadow-[0_0_30px_rgba(204,255,0,0.3)] overflow-hidden">
                                        {currentSpeaker.avatar.type === 'image'
                                            ? <img src={currentSpeaker.avatar.value} alt={currentSpeaker.name} className="w-full h-full object-cover rounded-full" />
                                            : <CartoonAvatar id={currentSpeaker.avatar.value} className="w-full h-full border-none shadow-none" />
                                        }
                                    </div>
                                    <div>
                                        <h2 className={`text-3xl font-black uppercase tracking-tight text-shadow-md ${currentSpeaker.pseudoColor || 'text-white'}`}>
                                            {currentSpeaker.name}
                                        </h2>
                                        <p className="text-white/70 text-xs font-black mt-2 bg-black/30 px-4 py-2 rounded-xl border border-white/10 flex items-center justify-center gap-1.5">
                                            <Lightbulb className="w-4 h-4 text-spy-lime flex-shrink-0 stroke-[2.5]" />
                                            <span>Donne un indice sur ton mot sans le révéler</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Progress dots */}
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    {speakingOrder.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`rounded-full transition-all duration-300 ${i < currentSpeakerIndex
                                                ? 'w-2.5 h-2.5 bg-spy-lime'
                                                : i === currentSpeakerIndex
                                                    ? 'w-6 h-2.5 bg-spy-lime shadow-[0_0_10px_#ccff00]'
                                                    : 'w-2.5 h-2.5 bg-white/20'
                                                }`}
                                        />
                                    ))}
                                </div>

                                {/* Who's spoken list - 3D Avatars with Checkmark Badges */}
                                {currentSpeakerIndex > 0 && (
                                    <div className="flex flex-wrap items-center justify-center gap-2.5 mb-4">
                                        {speakingOrder.slice(0, currentSpeakerIndex).map(p => (
                                            <div key={p.id} className="relative group cursor-pointer" title={`${p.name} (a parlé)`}>
                                                <div className="w-10 h-10 rounded-full border-2 border-spy-lime/80 overflow-hidden shadow-[0_0_12px_rgba(204,255,0,0.3)] bg-slate-900 flex items-center justify-center">
                                                    {p.avatar.type === 'image' ? (
                                                        <img src={p.avatar.value} alt={p.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <CartoonAvatar id={p.avatar.value} className="w-full h-full border-none shadow-none" />
                                                    )}
                                                </div>
                                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-spy-lime text-black flex items-center justify-center font-black text-[9px] border border-black shadow">
                                                    ✓
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={() => setCurrentSpeakerIndex(i => i + 1)}
                                    className="btn-cartoon-primary w-full py-4 text-xl font-black uppercase tracking-wider cursor-pointer shadow-[0_6px_0_#000] active:translate-y-1.5 active:shadow-[0_0_0_#000] transition-all"
                                >
                                    {currentSpeakerIndex < speakingOrder.length - 1
                                        ? `SUIVANT →`
                                        : `DERNIER JOUEUR ✓`}
                                </button>
                            </motion.div>
                        ) : (
                            /* ALL SPOKEN — VOTE UNLOCKED */
                            <motion.div
                                key="vote-ready"
                                initial={{ y: 30, opacity: 0, scale: 0.95 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                className="w-full flex flex-col items-center gap-4"
                            >
                                {/* 3D Spy Animals Voting Hero Illustration */}
                                <div className="relative w-full max-w-sm h-48 rounded-3xl overflow-hidden border-[3.5px] border-spy-orange/70 shadow-[0_12px_30px_rgba(255,107,0,0.25)] bg-gradient-to-b from-[#182947] to-[#0a1426] group">
                                    <img 
                                        src="/spy_animals_voting_3d.png" 
                                        alt="Agents Espions Vote" 
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1426] via-transparent to-transparent opacity-80 pointer-events-none" />
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-spy-orange to-amber-500 text-black px-4 py-1 rounded-full border-2 border-black text-[10px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center gap-1.5 whitespace-nowrap z-10">
                                        <Vote className="w-3.5 h-3.5 text-black stroke-[3]" /> CONSEIL SECRET D'ACCUSATION
                                    </div>
                                </div>

                                <div className="card-cartoon bg-gradient-to-b from-[#14233e] to-[#0a1426] p-6 border-[3.5px] border-white/20 shadow-2xl w-full rounded-[32px] text-center">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2 text-shadow-md">
                                        Tout le monde a parlé !
                                    </h2>
                                    <p className="text-white/70 font-black text-xs uppercase tracking-wider">
                                        Débattez ensemble et désignez l'imposteur
                                    </p>
                                </div>

                                <button
                                    onClick={handleStartVote}
                                    className="btn-cartoon-primary w-full py-4 text-xl font-black uppercase tracking-wider cursor-pointer shadow-[0_6px_0_#000] active:translate-y-1.5 active:shadow-[0_0_0_#000] transition-all bg-gradient-to-r from-spy-orange to-amber-500 text-black border-black flex items-center justify-center gap-2"
                                >
                                    <Vote className="w-6 h-6 stroke-[3]" /> PASSER AU VOTE
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={onAbort}
                        className="text-white/40 text-xs font-black uppercase tracking-widest hover:text-white transition-colors cursor-pointer pt-2"
                    >
                        Annuler la mission
                    </button>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────
    // VOTING STATE
    // ─────────────────────────────────────────────
    if (gameState === 'voting') {
        return (
            <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center p-4 bg-transparent relative overflow-x-hidden">
                <SettingsGear onClick={onOpenSettings} />
                <div className="w-full max-w-md z-10 animate-pop-in max-h-[88dvh] overflow-y-auto custom-scrollbar px-2 py-4 flex flex-col items-center">
                    
                    <div className="bg-spy-orange/20 border-2 border-spy-orange/50 px-4 py-1.5 rounded-full mb-3 shadow-[0_0_15px_rgba(255,102,0,0.3)]">
                        <span className="text-spy-orange font-black uppercase tracking-[0.2em] text-[10.5px]">
                            Vote & Accusation
                        </span>
                    </div>

                    <h2 className="text-2xl font-black text-white text-center mb-6 uppercase tracking-tight text-shadow-md">
                        Qui est <span className="text-spy-orange">l'imposteur ?</span>
                    </h2>

                    <div className="grid grid-cols-2 gap-3 w-full mb-6">
                        <AnimatePresence>
                            {assignedRoles.map((player) => {
                                const isEliminated = eliminatedPlayers.includes(player.id);
                                return (
                                    <motion.button
                                        key={player.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: isEliminated ? 0.4 : 1, scale: 1 }}
                                        onClick={() => !isEliminated && handleVote(player)}
                                        disabled={isEliminated}
                                        className={`
                                            card-cartoon p-4 flex flex-col items-center transition-all relative overflow-hidden border-[3px] cursor-pointer
                                            ${isEliminated
                                                ? 'bg-red-950/30 border-red-900/40 cursor-not-allowed filter grayscale'
                                                : 'bg-[#14233e] border-white/20 hover:border-spy-orange hover:scale-105 active:scale-95 shadow-[0_6px_0_#000]'}
                                        `}
                                    >
                                        <div className="w-16 h-16 mb-2 flex items-center justify-center">
                                            {player.avatar.type === 'image' ? (
                                                <img src={player.avatar.value} alt={player.name} className="w-full h-full object-cover rounded-full shadow-lg border-2 border-white/20" />
                                            ) : (
                                                <CartoonAvatar id={player.avatar.value} className="w-full h-full border-none shadow-none" />
                                            )}
                                        </div>
                                        <span className={`font-black uppercase text-xs tracking-wider text-center ${player.pseudoColor || 'text-white'}`}>
                                            {player.name}
                                            {isEliminated && <span className="block text-[10px] text-red-400 mt-0.5 font-black">(Éliminé)</span>}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={() => setGameState('playing')}
                        className="btn-cartoon-secondary w-full py-3.5 text-xs font-black uppercase tracking-wider cursor-pointer shadow-[0_4px_0_#000] active:translate-y-1 transition-all"
                    >
                        RETOUR DISCUSSION
                    </button>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────
    // REVEAL STATE
    // ─────────────────────────────────────────────
    if (gameState === 'reveal' && votedPlayer) {
        const isCivilian = votedPlayer.role === 'Civilian';
        const isMrWhite = votedPlayer.role === 'Mr. White';
        const isUndercover = votedPlayer.role === 'Undercover';
        const isImpostor = isMrWhite || isUndercover;

        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-transparent text-center relative overflow-hidden">
                <SettingsGear onClick={onOpenSettings} />
                <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-0" />

                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="z-10 w-full max-w-md flex flex-col items-center"
                >
                    <div className="mb-6 relative h-48 flex flex-col items-center justify-center w-full max-w-xs">

                        {/* Avatar Frame - Squishes and disappears when crushed by tombstone */}
                        <motion.div 
                            animate={showTombstone ? { scaleY: 0, scaleX: 1.4, opacity: 0, y: 40 } : { scaleY: 1, scaleX: 1, opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                            className="w-32 h-32 relative z-10 flex items-center justify-center rounded-full border-4 border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)] bg-slate-900 overflow-hidden origin-bottom"
                        >
                            {votedPlayer.avatar.type === 'image' ? (
                                <img src={votedPlayer.avatar.value} alt={votedPlayer.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <CartoonAvatar id={votedPlayer.avatar.value} className="w-full h-full border-none shadow-none" />
                            )}
                        </motion.div>

                        {/* 3D Cutout Cartoon Tombstone with engraved R.I.P - Replaces crushed avatar */}
                        <AnimatePresence>
                            {showTombstone && (
                                <motion.div
                                    initial={{ y: -180, opacity: 0, scale: 1.3 }}
                                    animate={{ y: 0, opacity: 1, scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 550, damping: 18, mass: 1.1 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
                                >
                                    {/* 3D Tombstone Image - 100% Transparent Cutout with engraved R.I.P */}
                                    <div className="relative w-44 h-44 flex items-center justify-center">
                                        <img 
                                            src="/cartoon_tombstone_3d.png" 
                                            alt="Sépulture Cartoon 3D R.I.P" 
                                            className="w-full h-full object-contain filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.95)]" 
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>
                    
                    <div className="mb-6">
                        <h2 className={`text-3xl font-black uppercase tracking-wider mb-1 text-shadow-md ${votedPlayer.pseudoColor || 'text-white'}`}>
                            {votedPlayer.name}
                        </h2>
                        <p className="text-white/60 font-black uppercase tracking-widest text-xs">était dans l'équipe...</p>
                    </div>

                    <div className="card-cartoon bg-gradient-to-b from-[#14233e] to-[#0a1426] p-6 border-[3.5px] border-white/20 shadow-2xl mb-6 w-full rounded-[32px] text-center">
                        <h3 className="text-4xl font-black uppercase drop-shadow-lg mb-2">
                            {isCivilian ? (
                                <span className="text-spy-lime">Innocent (Civil)</span>
                            ) : isUndercover ? (
                                <span className="text-spy-orange">Espion</span>
                            ) : (
                                <span className="text-cyan-400">Mr. Blanc</span>
                            )}
                        </h3>

                        {isCivilian && (
                            <p className="text-spy-orange font-black text-xs mt-3 uppercase tracking-wider flex items-center justify-center gap-1.5">
                                <ShieldAlert className="w-4 h-4 text-spy-orange flex-shrink-0 stroke-[2.5]" />
                                <span>Erreur ! Vous avez éliminé un innocent...</span>
                            </p>
                        )}
                        {isUndercover && (
                            <p className="text-spy-lime font-black text-xs mt-3 uppercase tracking-wider flex items-center justify-center gap-1.5">
                                <PartyPopper className="w-4 h-4 text-spy-lime flex-shrink-0 stroke-[2.5]" />
                                <span>Bien joué agents ! L'espion est démasqué.</span>
                            </p>
                        )}
                        {isMrWhite && (
                            <p className="text-cyan-400 font-black text-xs mt-3 uppercase tracking-wider flex items-center justify-center gap-1.5">
                                <Skull className="w-4 h-4 text-cyan-400 flex-shrink-0 stroke-[2.5]" />
                                <span>Mr. Blanc est éliminé ! Mais il a 1 dernière chance...</span>
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handleEliminatePlayer}
                        className="btn-cartoon-primary w-full py-4 text-xl font-black uppercase tracking-wider cursor-pointer shadow-[0_6px_0_#000] active:translate-y-1.5 active:shadow-[0_0_0_#000] transition-all"
                    >
                        {isCivilian && 'CONTINUER L\'ENQUÊTE'}
                        {isUndercover && 'VÉRIFIER VICTOIRE'}
                        {isMrWhite && 'DERNIÈRE CHANCE →'}
                    </button>
                </motion.div>
            </div>
        );
    }

    // ─────────────────────────────────────────────
    // DISTRIBUTING STATE (tap to reveal word)
    // ─────────────────────────────────────────────
    if (!currentPlayer) return <div className="text-white text-center p-8 font-black uppercase">Initialisation...</div>;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center relative overflow-hidden bg-transparent">
            <SettingsGear onClick={onOpenSettings} />

            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-spy-lime/10 opacity-20 rounded-full blur-[140px]" />
            </div>

            <div className="z-10 flex flex-col items-center w-full max-w-sm gap-5">

                {/* Player identity */}
                <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 rounded-full bg-black/40 flex items-center justify-center border-4 border-spy-lime shadow-[0_0_30px_rgba(204,255,0,0.35)] overflow-hidden">
                        {currentPlayer.avatar.type === 'image' ? (
                            <img src={currentPlayer.avatar.value} alt={currentPlayer.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <CartoonAvatar id={currentPlayer.avatar.value} className="w-full h-full border-none shadow-none" />
                        )}
                    </div>
                    <h2 className={`text-2xl font-black uppercase tracking-wider text-shadow-md ${currentPlayer.pseudoColor || 'text-white'}`}>
                        {currentPlayer.name}
                    </h2>
                    <p className="text-white/60 font-black uppercase tracking-[0.25em] text-[10px] bg-black/30 px-3 py-1 rounded-full border border-white/10">
                        Passez le téléphone à cet agent
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {!isRevealed ? (
                        /* TAP TO REVEAL BUTTON */
                        <motion.button
                            key="tap"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={handleReveal}
                            whileTap={{ scale: 0.95 }}
                            className="btn-cartoon-primary w-full py-5 text-xl font-black uppercase tracking-wider cursor-pointer shadow-[0_6px_0_#000] active:translate-y-1.5 active:shadow-[0_0_0_#000] transition-all flex items-center justify-center gap-2"
                        >
                            <Eye className="w-6 h-6 stroke-[3]" /> VOIR MON MOT SECRET
                        </motion.button>
                    ) : (
                        /* WORD REVEAL CARD */
                        <motion.div
                            key="reveal"
                            initial={{ y: 30, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="w-full card-cartoon bg-gradient-to-b from-[#14233e] to-[#0a1426] border-[3.5px] border-white/20 rounded-[32px] overflow-hidden shadow-2xl p-6"
                        >
                            {/* TOP SECRET badge */}
                            <div className="inline-block px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50 mb-4">
                                <span className="text-[9.5px] font-black uppercase tracking-[0.3em] text-red-400">⬛ Secret Défense ⬛</span>
                            </div>

                            {/* Main content */}
                            <div className="flex flex-col items-center justify-center py-4 px-2 gap-2">
                                {currentPlayer.role !== 'Mr. White' ? (
                                    <>
                                        <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em]">Ton mot secret</p>
                                        <p className="text-4xl sm:text-5xl font-black text-spy-lime tracking-tight leading-tight break-words text-center text-shadow-md">
                                            {currentPlayer.word ? currentPlayer.word : '???'}
                                        </p>
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-2">
                                            Ne dis pas ton mot à voix haute !
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em]">Ton rôle</p>
                                        <p className="text-4xl font-black text-cyan-400 uppercase tracking-tight text-shadow-md">Mr. Blanc</p>
                                        <p className="text-white/80 text-xs font-black mt-2">Tu n'as aucun mot. Bluff les innocents !</p>
                                    </>
                                )}
                            </div>

                            {/* SUITE button */}
                            <div className="pt-4">
                                <button
                                    onClick={nextPlayer}
                                    className="btn-cartoon-primary w-full py-4 text-lg font-black uppercase tracking-wider cursor-pointer shadow-[0_5px_0_#000] active:translate-y-1 transition-all"
                                >
                                    {currentPlayerIndex < players.length - 1 ? 'SUIVANT →' : 'LANCER LA MISSION'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};

export default GameSession;
