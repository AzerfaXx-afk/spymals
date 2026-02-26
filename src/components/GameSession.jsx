import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import BouncyButton from './BouncyButton';
import { wordPacks } from '../data/wordPacks';
import SettingsGear from './SettingsGear';
import { useAudio } from '../contexts/AudioContext';

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

    const assignRoles = () => {
        const { undercoverCount, whiteCount, wordPack, customWords } = config;

        let wordPair;
        if (wordPack === 'custom' && customWords) {
            wordPair = {
                civilian: customWords.innocent,
                undercover: customWords.spy
            };
        } else {
            const pack = wordPacks[wordPack] || wordPacks.standard;
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
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-spy-blue text-center relative overflow-hidden">
                <SettingsGear onClick={onOpenSettings} />
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-0" />

                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    className="z-10 w-full max-w-md flex flex-col items-center"
                >
                    {/* Header Celebration */}
                    <div className="mb-6 relative w-full">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="text-7xl mb-2 drop-shadow-[0_0_50px_rgba(255,255,255,0.3)] animate-bounce-slow"
                        >
                            {isCivilianWin ? '🎉' : '🎭'}
                        </motion.div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-1">
                            Mission Terminée
                        </h2>
                        <h3 className={`text-4xl font-black uppercase tracking-widest ${isCivilianWin ? 'text-spy-lime' : 'text-spy-orange'} filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]`}>
                            {isCivilianWin ? 'Innocents' : 'Imposteurs'}
                        </h3>
                    </div>

                    {/* Words Reveal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                        className="w-full bg-white/10 backdrop-blur-2xl rounded-[40px] p-8 border border-white/20 shadow-2xl mb-8 relative"
                    >
                        <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                            Déclassification des mots
                        </p>

                        <div className="flex flex-col gap-5">
                            {/* Civilian Word */}
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="bg-spy-lime/10 border border-spy-lime/30 rounded-3xl p-5 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-spy-lime/20 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-spy-lime/30 transition-colors" />
                                <div className="flex flex-col items-center">
                                    <span className="text-spy-lime/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
                                        Mot des Innocents
                                    </span>
                                    <span className="text-4xl font-black text-white break-words">
                                        {targetWord?.civilian || '???'}
                                    </span>
                                </div>
                            </motion.div>

                            {/* Undercover Word */}
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 1.5 }}
                                className="bg-spy-orange/10 border border-spy-orange/30 rounded-3xl p-5 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 left-0 w-24 h-24 bg-spy-orange/20 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2 group-hover:bg-spy-orange/30 transition-colors" />
                                <div className="flex flex-col items-center">
                                    <span className="text-spy-orange/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
                                        Mot de l'Espion
                                    </span>
                                    <span className="text-4xl font-black text-white break-words">
                                        {targetWord?.undercover || '???'}
                                    </span>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.2 }}
                        className="w-full"
                    >
                        <BouncyButton
                            onClick={proceedToScoreboard}
                            className="w-full py-5 text-xl tracking-widest"
                        >
                            VOIR LES SCORES →
                        </BouncyButton>
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
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-spy-blue text-center relative overflow-hidden">
                <SettingsGear onClick={onOpenSettings} />
                <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-0" />

                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                    className="z-10 w-full max-w-md"
                >
                    {/* Icon + Title */}
                    <div className="mb-6">
                        <div className="text-8xl mb-4 animate-bounce-slow filter drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                            🤫
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-tight mb-1">
                            La Dernière Chance de
                        </h2>
                        <h2 className="text-4xl font-black text-spy-lime uppercase tracking-tight">
                            Mr. Blanc
                        </h2>
                    </div>

                    {/* Info card */}
                    <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-6 border border-white/15 shadow-2xl mb-8">
                        <p className="text-white/90 font-bold text-base leading-relaxed">
                            <span className="text-spy-lime font-black">{votedPlayer?.name}</span> a été éliminé·e.
                            <br />
                            Donne-lui une chance : s'il/elle devine le <span className="text-white font-black">mot secret des Civils</span>,
                            les imposteurs <span className="text-spy-orange font-black">remportent la victoire !</span>
                        </p>
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-white/50 text-xs font-bold uppercase tracking-widest">
                                Le groupe vote s'il a trouvé le bon mot
                            </p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-4">
                        {/* SUCCESS – Impostors win */}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleMrWhiteSuccess}
                            className="w-full py-5 rounded-2xl border border-green-400/40 bg-green-400/10 text-green-400 font-black uppercase tracking-widest text-lg backdrop-blur-md shadow-lg shadow-green-900/20 active:bg-green-400/20 transition-all"
                        >
                            ✅ Il a trouvé le mot !
                        </motion.button>

                        {/* FAIL – Mr. White definitively out */}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleMrWhiteFail}
                            className="w-full py-5 rounded-2xl border border-red-400/40 bg-red-400/10 text-red-400 font-black uppercase tracking-widest text-lg backdrop-blur-md shadow-lg shadow-red-900/20 active:bg-red-400/20 transition-all"
                        >
                            ❌ Mauvais mot...
                        </motion.button>
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
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-spy-blue text-center relative overflow-hidden">
                <SettingsGear onClick={onOpenSettings} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-spy-lime opacity-5 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />

                <div className="z-10 flex flex-col items-center w-full max-w-md gap-5">

                    {/* Round label */}
                    <div className="text-white/30 font-black uppercase tracking-[0.3em] text-[10px]">
                        Manche {roundNumber} · Discussion
                    </div>

                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            /* Loading — speakingOrder not ready yet */
                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                                <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-8 border border-white/15 shadow-2xl flex items-center justify-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-spy-lime animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 rounded-full bg-spy-lime animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 rounded-full bg-spy-lime animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </motion.div>
                        ) : !allSpoken && currentSpeaker ? (
                            /* ── CURRENT SPEAKER CARD ── */
                            <motion.div
                                key={`speaker-${currentSpeakerIndex}`}
                                initial={{ y: 40, opacity: 0, scale: 0.95 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ y: -40, opacity: 0, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                                className="w-full"
                            >
                                {/* Big speaker highlight */}
                                <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-8 border border-white/15 shadow-2xl mb-5 flex flex-col items-center gap-4">
                                    <p className="text-white/40 font-black uppercase tracking-[0.25em] text-[10px]">
                                        À qui de parler
                                    </p>
                                    <div className="w-24 h-24 rounded-full bg-spy-lime/10 border-2 border-spy-lime/50 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(204,255,0,0.15)]">
                                        {currentSpeaker.avatar.type === 'image'
                                            ? <img src={currentSpeaker.avatar.value} alt={currentSpeaker.name} className="w-full h-full object-cover rounded-full" />
                                            : <span>{currentSpeaker.avatar.value}</span>
                                        }
                                    </div>
                                    <div>
                                        <h2 className={`text-3xl font-black uppercase tracking-tight ${currentSpeaker.pseudoColor || 'text-white'}`}>
                                            {currentSpeaker.name}
                                        </h2>
                                        <p className="text-white/40 text-sm font-bold mt-1">
                                            Donne un indice sur ton mot sans le dire
                                        </p>
                                    </div>
                                </div>

                                {/* Progress dots */}
                                <div className="flex items-center justify-center gap-2 mb-5">
                                    {speakingOrder.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`rounded-full transition-all duration-300 ${i < currentSpeakerIndex
                                                ? 'w-2 h-2 bg-spy-lime'
                                                : i === currentSpeakerIndex
                                                    ? 'w-4 h-3 bg-spy-lime'
                                                    : 'w-2 h-2 bg-white/20'
                                                }`}
                                        />
                                    ))}
                                </div>

                                {/* Who's spoken already (mini list) */}
                                {currentSpeakerIndex > 0 && (
                                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                                        {speakingOrder.slice(0, currentSpeakerIndex).map(p => (
                                            <div key={p.id} className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1 border border-white/10">
                                                <span className="text-sm">{p.avatar.value}</span>
                                                <span className={`${p.pseudoColor ? p.pseudoColor.replace('text-', 'text-').concat('/40') : 'text-white/40'} font-bold text-xs uppercase`}>{p.name}</span>
                                                <span className="text-spy-lime text-xs">✓</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <BouncyButton
                                    onClick={() => setCurrentSpeakerIndex(i => i + 1)}
                                    className="w-full py-5 text-lg"
                                >
                                    {currentSpeakerIndex < speakingOrder.length - 1
                                        ? `SUIVANT →`
                                        : `DERNIER JOUEUR ✓`}
                                </BouncyButton>
                            </motion.div>
                        ) : (
                            /* ── ALL SPOKEN — VOTE UNLOCKED ── */
                            <motion.div
                                key="vote-ready"
                                initial={{ y: 40, opacity: 0, scale: 0.95 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                                className="w-full flex flex-col items-center gap-5"
                            >
                                <div className="text-6xl animate-bounce-slow">🗳️</div>
                                <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-6 border border-white/15 shadow-2xl w-full">
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                                        Tout le monde a parlé !
                                    </h2>
                                    <p className="text-white/60 font-bold text-sm">
                                        Qui est l'imposteur parmi vous ?
                                    </p>
                                </div>

                                {/* All speakers recap */}
                                <div className="flex flex-wrap justify-center gap-2">
                                    {speakingOrder.map(p => (
                                        <div key={p.id} className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1.5 border border-spy-lime/20">
                                            <span className="text-sm">{p.avatar.value}</span>
                                            <span className={`${p.pseudoColor ? p.pseudoColor.replace('text-', 'text-').concat('/60') : 'text-white/60'} font-bold text-xs uppercase`}>{p.name}</span>
                                            <span className="text-spy-lime text-xs">✓</span>
                                        </div>
                                    ))}
                                </div>

                                <BouncyButton onClick={handleStartVote} className="w-full py-6 text-xl shadow-spy-orange/30 shadow-2xl">
                                    🗳️ PASSER AU VOTE
                                </BouncyButton>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={onAbort}
                        className="text-white/30 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
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
            <div className="min-h-screen flex flex-col items-center p-6 bg-spy-blue relative overflow-hidden">
                <SettingsGear onClick={onOpenSettings} />
                <div className="w-full max-w-md z-10 animate-pop-in">
                    <h2 className="text-3xl font-black text-white text-center mb-8 uppercase tracking-tighter">
                        Qui est <span className="text-spy-orange">l'imposteur ?</span>
                    </h2>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <AnimatePresence>
                            {assignedRoles.map((player) => {
                                const isEliminated = eliminatedPlayers.includes(player.id);
                                return (
                                    <motion.button
                                        key={player.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: isEliminated ? 0.5 : 1, scale: 1, filter: isEliminated ? 'grayscale(100%)' : 'grayscale(0%)' }}
                                        exit={{
                                            y: 300,
                                            opacity: 0,
                                            scale: 0.5,
                                            rotateX: -45,
                                            transition: { duration: 0.6, ease: "anticipate" }
                                        }}
                                        onClick={() => !isEliminated && handleVote(player)}
                                        disabled={isEliminated}
                                        style={{ transformOrigin: "top center" }}
                                        className={`
                                            btn-glass-secondary rounded-2xl p-4 flex flex-col items-center transition-all relative overflow-hidden
                                            ${isEliminated
                                                ? 'bg-red-900/20 cursor-not-allowed'
                                                : 'active:scale-95 hover:bg-white/20'}
                                        `}
                                    >
                                        <div className="text-4xl mb-2 filter drop-shadow-md">{player.avatar.value}</div>
                                        <span className={`font-bold uppercase text-sm tracking-wide ${player.pseudoColor || 'text-white'}`}>
                                            {player.name}
                                            {isEliminated && <span className="block text-xs text-red-400 mt-1 drop-shadow-sm font-black">(Éliminé)</span>}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    <BouncyButton onClick={() => setGameState('playing')} variant="secondary" className="w-full">
                        RETOUR DISCUSSION
                    </BouncyButton>
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
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-spy-blue text-center relative overflow-hidden">
                <SettingsGear onClick={onOpenSettings} />
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0" />

                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="z-10 w-full max-w-md"
                >
                    <div className="mb-8 relative">
                        <div className="text-9xl mb-4 animate-bounce-slow filter drop-shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                            {votedPlayer.avatar.value}
                        </div>
                        <h2 className={`text-4xl font-black uppercase tracking-wider mb-2 ${votedPlayer.pseudoColor || 'text-white'}`}>
                            {votedPlayer.name}
                        </h2>
                        <p className="text-white/60 font-bold uppercase tracking-widest text-sm">était...</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-[40px] p-8 border border-white/10 shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-500">
                        <h3 className="text-5xl font-black uppercase drop-shadow-lg mb-2">
                            {isCivilian ? (
                                <span className="text-spy-lime">Innocent</span>
                            ) : isUndercover ? (
                                <span className="text-spy-orange">Espion</span>
                            ) : (
                                <span className="text-white">Mr. Blanc</span>
                            )}
                        </h3>

                        {isCivilian && (
                            <p className="text-spy-orange font-bold mt-4 animate-pulse">
                                Oups ! Vous avez éliminé un innocent...<br />L'imposteur est toujours là.
                            </p>
                        )}
                        {isUndercover && (
                            <p className="text-white/80 font-bold mt-4">
                                Bien joué agents !<br />L'espion est démasqué.
                            </p>
                        )}
                        {isMrWhite && (
                            <p className="text-spy-lime font-bold mt-4">
                                Mr. Blanc est éliminé...<br />
                                <span className="text-white/70 text-sm">Mais il a une dernière chance !</span>
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {/* For ALL roles: elimination triggers the central handler */}
                        <BouncyButton
                            onClick={handleEliminatePlayer}
                            className={`w-full py-5 text-lg ${isCivilian
                                ? 'shadow-spy-orange/30 shadow-2xl'
                                : isImpostor
                                    ? 'shadow-spy-lime/30 shadow-2xl'
                                    : ''
                                }`}
                        >
                            {isCivilian && 'CONTINUER L\'ENQUÊTE'}
                            {isUndercover && 'VÉRIFIER LA VICTOIRE'}
                            {isMrWhite && 'DERNIÈRE CHANCE →'}
                        </BouncyButton>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ─────────────────────────────────────────────
    // DISTRIBUTING STATE (tap to reveal word)
    // ─────────────────────────────────────────────
    if (!currentPlayer) return <div className="text-white">Initialisation...</div>;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-black">
            <SettingsGear onClick={onOpenSettings} />

            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0f172a_0%,_#000_100%)]" />
            </div>

            <div className="z-10 flex flex-col items-center w-full max-w-sm gap-6">

                {/* Player identity */}
                <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-5xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.6)]">
                        {currentPlayer.avatar.type === 'image' ? (
                            <img src={currentPlayer.avatar.value} alt={currentPlayer.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <span>{currentPlayer.avatar.value}</span>
                        )}
                    </div>
                    <h2 className={`text-2xl font-black uppercase tracking-widest ${currentPlayer.pseudoColor || 'text-white'}`}>
                        {currentPlayer.name}
                    </h2>
                    <p className="text-white/30 font-bold uppercase tracking-[0.3em] text-[10px]">
                        Passe le téléphone à cet agent
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
                            className="w-full py-5 rounded-2xl border border-spy-lime/40 bg-spy-lime/10 text-spy-lime font-black uppercase tracking-widest text-lg shadow-[0_0_30px_rgba(204,255,0,0.1)] active:bg-spy-lime/20 transition-all"
                        >
                            👁 Voir mon mot
                        </motion.button>
                    ) : (
                        /* WORD REVEAL CARD */
                        <motion.div
                            key="reveal"
                            initial={{ y: 30, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="w-full bg-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                        >
                            {/* TOP SECRET badge */}
                            <div className="flex items-center justify-center gap-2 py-2 border-b border-white/5">
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-red-500/60">⬛ Top Secret ⬛</span>
                            </div>

                            {/* Main content */}
                            <div className="flex flex-col items-center justify-center py-10 px-6 gap-3">
                                {currentPlayer.role !== 'Mr. White' ? (
                                    <>
                                        <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em]">Ton mot secret</p>
                                        <p className="text-5xl font-black text-white tracking-tight leading-tight break-words text-center">
                                            {currentPlayer.word ? currentPlayer.word : '???'}
                                        </p>
                                        <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest mt-1">
                                            Ne dis pas ton mot à voix haute
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em]">Ton rôle</p>
                                        <p className="text-4xl font-black text-white uppercase tracking-tight">Mr. Blanc</p>
                                        <p className="text-white/40 text-sm font-bold mt-1">Tu n'as aucun mot. Bluff !</p>
                                        <div className="mt-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/10 text-white/60 border border-white/10">
                                            🐻‍❄️ Bluffeur
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* SUITE button */}
                            <div className="px-6 pb-6">
                                <BouncyButton
                                    onClick={nextPlayer}
                                    variant="primary"
                                    className="w-full py-4 text-base"
                                >
                                    {currentPlayerIndex < players.length - 1 ? 'SUITE →' : 'LANCER LA MISSION'}
                                </BouncyButton>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};

export default GameSession;
