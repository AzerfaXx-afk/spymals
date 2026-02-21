import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import BouncyButton from './BouncyButton';
import { wordPacks } from '../data/wordPacks';
import SettingsGear from './SettingsGear';

const GameSession = ({ players, config, onEndGame, onAbort, onOpenSettings }) => {
    const [gameState, setGameState] = useState('distributing'); // distributing, playing, voting, reveal
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [assignedRoles, setAssignedRoles] = useState([]);
    const [targetWord, setTargetWord] = useState(null);
    const [votedPlayer, setVotedPlayer] = useState(null);
    const [eliminatedPlayers, setEliminatedPlayers] = useState([]);


    // Initialize Game
    useEffect(() => {
        if (gameState === 'distributing' && assignedRoles.length === 0) {
            assignRoles();
        }
    }, [gameState, assignedRoles.length]);

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

        // Create roles array
        let roles = [];
        for (let i = 0; i < undercoverCount; i++) roles.push({ role: 'Undercover', word: wordPair.undercover });
        for (let i = 0; i < whiteCount; i++) roles.push({ role: 'Mr. White', word: null });

        const civilianCount = players.length - undercoverCount - whiteCount;
        for (let i = 0; i < civilianCount; i++) roles.push({ role: 'Civilian', word: wordPair.civilian });

        // Shuffle roles
        roles = roles.sort(() => Math.random() - 0.5);

        // Assign to players
        const assignments = players.map((player, index) => ({
            ...player,
            role: roles[index].role,
            word: roles[index].word,
        }));

        setAssignedRoles(assignments);
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

    const handleContinue = () => {
        // If it was a civilian, add to eliminated and continue
        if (votedPlayer?.role === 'Civilian') {
            setEliminatedPlayers([...eliminatedPlayers, votedPlayer.id]);
            setVotedPlayer(null);
            setGameState('playing');
        } else {
            // Should not happen via "Continue" button if logic is correct, but fallback
            onEndGame();
        }
    };

    const currentPlayer = assignedRoles[currentPlayerIndex];

    const triggerGameEnd = (winningTeam) => {
        // winningTeam: 'Civilian' or 'Impostors'
        // Create a map of player roles to pass back
        const playerRoles = {};
        assignedRoles.forEach(p => {
            playerRoles[p.id] = p.role;
        });

        // Victory Confetti!
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: winningTeam === 'Civilian' ? ['#CCFF00', '#ffffff'] : ['#FF6600', '#000000']
        });

        onEndGame(winningTeam, playerRoles);
    };

    // Tap to Reveal Logic
    const handleReveal = () => {
        if (!isRevealed) setIsRevealed(true);
    };

    // --- RENDER STATES ---

    if (gameState === 'playing') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-spy-blue text-center relative overflow-hidden">
                <SettingsGear onClick={onOpenSettings} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-spy-lime opacity-10 rounded-full blur-[100px] animate-pulse-slow pointer-events-none"></div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="z-10 flex flex-col items-center w-full max-w-md"
                >
                    <div className="text-8xl mb-6 filter drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] animate-bounce-slow">
                        🕵️‍♂️
                    </div>
                    <h1 className="text-5xl font-black text-white mb-6 drop-shadow-lg uppercase tracking-tighter">
                        Mission<br /><span className="text-spy-lime">Lancée !</span>
                    </h1>
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl w-full mb-12">
                        <p className="text-lg text-white/90 font-bold leading-relaxed">
                            {eliminatedPlayers.length > 0
                                ? `${eliminatedPlayers.length} agent(s) éliminé(s). Continuez l'enquête !`
                                : "Tous les agents ont leur mot secret. Discutez et trouvez les imposteurs !"}
                        </p>
                    </div>

                    <BouncyButton onClick={handleStartVote} className="w-full py-6 text-xl shadow-spy-orange/30 shadow-2xl">
                        PASSER AU VOTE
                    </BouncyButton>

                    <button
                        onClick={onAbort}
                        className="mt-6 text-white/40 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors"
                    >
                        Annuler la mission
                    </button>
                </motion.div>
            </div>
        );
    }

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
                                        <span className="font-bold text-white uppercase text-sm tracking-wide">
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

    if (gameState === 'reveal' && votedPlayer) {
        const isCivilian = votedPlayer.role === 'Civilian';

        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-spy-blue text-center relative overflow-hidden">
                <SettingsGear onClick={onOpenSettings} />
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0"></div>

                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="z-10 w-full max-w-md"
                >
                    <div className="mb-8 relative">
                        <div className="text-9xl mb-4 animate-bounce-slow filter drop-shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                            {votedPlayer.avatar.value}
                        </div>
                        <h2 className="text-4xl font-black text-white uppercase tracking-wider mb-2">
                            {votedPlayer.name}
                        </h2>
                        <p className="text-white/60 font-bold uppercase tracking-widest text-sm">était...</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-[40px] p-8 border border-white/10 shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-500">
                        <h3 className="text-5xl font-black uppercase drop-shadow-lg mb-2">
                            {votedPlayer.role === 'Civilian' ? (
                                <span className="text-spy-lime">Innocent</span>
                            ) : votedPlayer.role === 'Undercover' ? (
                                <span className="text-spy-orange">Espion</span>
                            ) : (
                                <span className="text-white">Mr. Blanc</span>
                            )}
                        </h3>
                        {!isCivilian ? (
                            <p className="text-white/80 font-bold mt-4">
                                Bien joué agents !<br />L'imposteur est démasqué.
                            </p>
                        ) : (
                            <p className="text-spy-orange font-bold mt-4 animate-pulse">
                                Oups ! Vous avez éliminé un innocent...<br />L'imposteur est toujours là.
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {isCivilian ? (
                            <>
                                <BouncyButton onClick={handleContinue} className="w-full py-4 text-lg">
                                    CONTINUER L'ENQUÊTE
                                </BouncyButton>
                                <button
                                    onClick={() => triggerGameEnd('Impostors')}
                                    className="text-spy-orange/80 hover:text-spy-orange font-bold uppercase text-xs tracking-widest py-2 transition-colors"
                                >
                                    Les Imposteurs ont gagné (Abandon)
                                </button>
                            </>
                        ) : (
                            <BouncyButton onClick={() => triggerGameEnd('Civilian')} className="w-full py-5 text-lg shadow-spy-lime/50 shadow-2xl">
                                MISSION ACCOMPLIE (Menu)
                            </BouncyButton>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    // Distributing State - Loading
    if (!currentPlayer) return <div className="text-white">Initialisation...</div>;

    // Distributing State - Tap to Reveal
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-black">
            <SettingsGear onClick={onOpenSettings} />

            {/* Subtle background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0f172a_0%,_#000_100%)]"></div>
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
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest">
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
                            {/* TOP SECRET badge - subtle, top of card */}
                            <div className="flex items-center justify-center gap-2 py-2 border-b border-white/5">
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-red-500/60">⬛ Top Secret ⬛</span>
                            </div>

                            {/* Main content */}
                            <div className="flex flex-col items-center justify-center py-10 px-6 gap-3">
                                {currentPlayer.role !== 'Mr. White' ? (
                                    <>
                                        <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em]">Ton mot</p>
                                        <p className="text-5xl font-black text-white tracking-tight leading-tight break-words text-center">
                                            {currentPlayer.word ? currentPlayer.word : '???'}
                                        </p>
                                        <div className={`mt-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${currentPlayer.role === 'Undercover'
                                            ? 'bg-spy-orange/20 text-spy-orange border border-spy-orange/30'
                                            : 'bg-spy-lime/20 text-spy-lime border border-spy-lime/30'
                                            }`}>
                                            {currentPlayer.role === 'Undercover' ? '🦊 Espion' : '🕵️ Innocent'}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em]">Ton rôle</p>
                                        <p className="text-4xl font-black text-white uppercase tracking-tight">Mr. Blanc</p>
                                        <p className="text-white/40 text-sm font-bold mt-1">Tu n'as aucun mot.</p>
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
