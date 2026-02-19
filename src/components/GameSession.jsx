import React, { useState, useEffect, useRef } from 'react';
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
    const [holdProgress, setHoldProgress] = useState(0);

    const holdTimer = useRef(null);

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
        setHoldProgress(0);
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

    // Hold to Reveal Logic
    const startHold = () => {
        if (isRevealed) return;
        let progress = 0;
        const interval = 20; // ms
        const duration = 1500; // 1.5s hold time
        const step = 100 / (duration / interval);

        holdTimer.current = setInterval(() => {
            progress += step;
            if (progress >= 100) {
                progress = 100;
                clearInterval(holdTimer.current);
                setIsRevealed(true);
            }
            setHoldProgress(progress);
        }, interval);
    };

    const endHold = () => {
        if (!isRevealed) {
            clearInterval(holdTimer.current);
            setHoldProgress(0);
        }
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

    // Distributing State - Secure Terminal with Hold to Reveal
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-black">
            <SettingsGear onClick={onOpenSettings} />

            {/* Dynamic Background */}
            <div className={`absolute inset-0 transition-opacity duration-700 ${isRevealed ? 'opacity-30' : 'opacity-100'}`}>
                <div className="absolute inset-0 bg-radial-gradient from-[#1e293b] to-black opacity-80"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoNTYsIDE4OSwgMjQ4LCAwLjIpIi8+PC9zdmc+')] opacity-20"></div>
            </div>

            <div className="z-10 flex flex-col items-center w-full max-w-md perspective-1000 min-h-[60vh] justify-center">

                {/* Header / Avatar - Transitions out on reveal */}
                <motion.div
                    animate={isRevealed ? { scale: 0.75, opacity: 0.5, filter: "blur(4px)", y: -50 } : { scale: 1, opacity: 1, filter: "blur(0px)", y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center mb-8"
                >
                    <div className="w-24 h-24 rounded-full bg-black/50 flex items-center justify-center text-5xl border-2 border-spy-lime/50 mb-4 shadow-[0_0_30px_rgba(56,189,248,0.2)] relative">
                        {currentPlayer.avatar.type === 'image' ? (
                            <img src={currentPlayer.avatar.value} alt={currentPlayer.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <span className="filter drop-shadow-md">{currentPlayer.avatar.value}</span>
                        )}
                        <div className="absolute -bottom-2 -right-2 bg-black/80 text-[10px] text-spy-lime border border-spy-lime px-2 py-0.5 rounded uppercase font-bold tracking-widest">
                            Target
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                        {currentPlayer.name}
                    </h2>
                    <p className="text-spy-blue/60 font-bold uppercase tracking-[0.3em] text-[10px] mt-1">
                        Identity Verification Required
                    </p>
                </motion.div>

                {/* Interaction Area */}
                <div className="w-full relative flex flex-col items-center justify-center h-[300px]">
                    <AnimatePresence mode='wait'>
                        {!isRevealed ? (
                            <motion.div
                                key="scanner"
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex flex-col items-center"
                            >
                                <motion.div
                                    className="relative w-32 h-32 rounded-full border-4 border-white/10 flex items-center justify-center cursor-pointer overflow-hidden group mb-4"
                                    onMouseDown={startHold}
                                    onMouseUp={endHold}
                                    onMouseLeave={endHold}
                                    onTouchStart={startHold}
                                    onTouchEnd={endHold}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {/* Progress Ring */}
                                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            fill="transparent"
                                            stroke="#1e293b"
                                            strokeWidth="8"
                                        />
                                        <motion.circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            fill="transparent"
                                            stroke="#CCFF00"
                                            strokeWidth="8"
                                            strokeDasharray="283"
                                            strokeDashoffset={283 - (283 * holdProgress) / 100}
                                            transition={{ duration: 0.1 }}
                                        />
                                    </svg>

                                    {/* Fingerprint Icon with Scanning Beam */}
                                    <div className="relative z-10 p-6 text-white/50 group-hover:text-white transition-colors">
                                        <svg viewBox="0 0 24 24" className="w-12 h-12" fill="currentColor">
                                            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" />
                                        </svg>

                                        {/* Scanner Beam */}
                                        {holdProgress > 0 && (
                                            <motion.div
                                                className="absolute top-0 left-0 w-full h-1 bg-spy-lime shadow-[0_0_10px_#CCFF00]"
                                                animate={{ top: ["0%", "100%", "0%"] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                            />
                                        )}
                                    </div>

                                    {/* Glow effect when active */}
                                    {holdProgress > 0 && (
                                        <div className="absolute inset-0 bg-spy-lime/20 blur-xl"></div>
                                    )}
                                </motion.div>

                                <p className="text-white/60 text-xs uppercase tracking-widest font-bold animate-pulse">
                                    {holdProgress > 0 ? "Analyzing..." : "Hold to Scan"}
                                </p>
                            </motion.div>
                        ) : (
                            /* Top Secret Folder Reveal */
                            <motion.div
                                key="reveal"
                                initial={{ y: 50, opacity: 0, rotateX: 20 }}
                                animate={{ y: 0, opacity: 1, rotateX: 0 }}
                                className="top-secret-folder w-full max-w-sm p-6 rounded-sm relative transform rotate-1 shadow-2xl"
                            >
                                {/* Folder Tab */}
                                <div className="absolute -top-6 left-0 w-1/3 h-8 bg-[#f59e0b] rounded-t-lg border-t-2 border-l-2 border-r-2 border-[#b45309] z-0"></div>

                                {/* Stamped Text */}
                                <motion.div
                                    initial={{ scale: 2, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 0.8 }}
                                    transition={{ delay: 0.3, type: 'spring' }}
                                    className="absolute top-10 right-4 transform rotate-12 border-4 border-red-700 text-red-700 font-black text-xl px-2 py-1 z-20 mix-blend-multiply"
                                >
                                    TOP SECRET
                                </motion.div>

                                <div className="relative z-10 flex flex-col items-center bg-[#fffbeb] p-4 shadow-inner min-h-[250px] justify-between">
                                    {/* Paper texture background could go here */}

                                    <div className="w-full text-center border-b border-gray-300 pb-2 mb-4">
                                        <h3 className="text-gray-900 font-black uppercase tracking-tighter text-2xl">
                                            Mission Profile
                                        </h3>
                                        <p className="text-gray-500 text-[10px] uppercase tracking-widest">
                                            Eyes Only • Do Not Distribute
                                        </p>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-center items-center w-full">
                                        {currentPlayer.role !== 'Mr. White' ? (
                                            <>
                                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Passcode</p>
                                                <p className="text-4xl font-black text-gray-900 tracking-widest break-all font-mono">
                                                    {currentPlayer.word ? currentPlayer.word.toUpperCase() : "???"}
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Status</p>
                                                <p className="text-3xl font-black text-gray-900 uppercase tracking-tight">
                                                    Mr. Blanc
                                                </p>
                                                <p className="text-red-600 font-bold text-xs mt-2">
                                                    NO DATA AVAILABLE
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    <div className="w-full mt-6 pt-4 border-t border-gray-300">
                                        <BouncyButton
                                            onClick={nextPlayer}
                                            className="w-full bg-gray-800 text-white hover:bg-black py-3 text-sm shadow-lg border-none"
                                            variant="secondary"
                                        >
                                            BURN AFTER READING (NEXT)
                                        </BouncyButton>
                                        <p className="text-gray-400 text-[8px] uppercase tracking-widest text-center mt-2">
                                            Destruction Protocol Initiated
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
};

export default GameSession;
