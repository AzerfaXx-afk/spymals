import React, { useState, useEffect } from 'react';
import BouncyButton from './BouncyButton';
import { wordPacks } from '../data/wordPacks';

const GameSession = ({ players, config, onEndGame }) => {
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

    if (gameState === 'playing') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-spy-blue text-center relative overflow-hidden">
                {/* Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-spy-lime opacity-10 rounded-full blur-[100px] animate-pulse-slow pointer-events-none"></div>

                <div className="z-10 animate-pop-in flex flex-col items-center w-full max-w-md">
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
                        onClick={onEndGame}
                        className="mt-6 text-white/40 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors"
                    >
                        Annuler la mission
                    </button>
                </div>
            </div>
        );
    }

    if (gameState === 'voting') {
        return (
            <div className="min-h-screen flex flex-col items-center p-6 bg-spy-blue relative overflow-hidden">
                <div className="w-full max-w-md z-10 animate-pop-in">
                    <h2 className="text-3xl font-black text-white text-center mb-8 uppercase tracking-tighter">
                        Qui est <span className="text-spy-orange">l'imposteur ?</span>
                    </h2>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {assignedRoles.map((player) => {
                            const isEliminated = eliminatedPlayers.includes(player.id);
                            return (
                                <button
                                    key={player.id}
                                    onClick={() => !isEliminated && handleVote(player)}
                                    disabled={isEliminated}
                                    className={`
                                        border rounded-2xl p-4 flex flex-col items-center transition-all
                                        ${isEliminated
                                            ? 'bg-red-900/20 border-red-900/30 opacity-50 grayscale cursor-not-allowed'
                                            : 'bg-white/5 hover:bg-white/10 border-white/10 active:scale-95'}
                                    `}
                                >
                                    <div className="text-4xl mb-2">{player.avatar.value}</div>
                                    <span className="font-bold text-white uppercase text-sm">
                                        {player.name}
                                        {isEliminated && <span className="block text-xs text-red-500 mt-1">(Éliminé)</span>}
                                    </span>
                                </button>
                            );
                        })}
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
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0"></div>

                <div className="z-10 animate-pop-in w-full max-w-md">
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
                            <BouncyButton onClick={handleContinue} className="w-full py-5 text-lg">
                                CONTINUER L'ENQUÊTE
                            </BouncyButton>
                        ) : (
                            <BouncyButton onClick={onEndGame} className="w-full py-5 text-lg shadow-spy-lime/50 shadow-2xl">
                                MISSION ACCOMPLIE (Menu)
                            </BouncyButton>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Distributing State - Loading
    if (!currentPlayer) return <div className="text-white">Initialisation...</div>;

    // Distributing State - Card View
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-spy-blue relative overflow-hidden">

            {/* Dynamic Background based on interaction */}
            <div className={`absolute inset-0 transition-colors duration-500 ${isRevealed ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'}`}></div>

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="z-10 flex flex-col items-center w-full max-w-md space-y-4 text-center perspective-1000">

                {/* Header / Avatar */}
                <div className={`flex flex-col items-center transition-all duration-500 ${isRevealed ? 'transform scale-75 opacity-50 blur-sm' : 'animate-bounce-slow'}`}>
                    <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-5xl border-4 border-spy-lime mb-2 shadow-[0_0_40px_rgba(204,255,0,0.3)] relative">
                        {currentPlayer.avatar.type === 'image' ? (
                            <img src={currentPlayer.avatar.value} alt={currentPlayer.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <span className="filter drop-shadow-md">{currentPlayer.avatar.value}</span>
                        )}
                        {/* Status Indicator */}
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-spy-lime rounded-full border-4 border-spy-blue"></div>
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-wider drop-shadow-lg">
                        {currentPlayer.name}
                    </h2>
                </div>

                {/* Card Content Flip Container */}
                <div className="w-full relative min-h-[300px] flex items-center justify-center">

                    {!isRevealed ? (
                        <div className="w-full bg-white/5 backdrop-blur-xl rounded-[32px] p-6 border border-white/10 shadow-2xl flex flex-col items-center justify-center animate-pop-in min-h-[300px]">
                            <p className="text-white/60 font-bold mb-6 uppercase tracking-widest text-xs">
                                Passe le téléphone à
                                <br />
                                <span className="text-white text-lg block mt-1">{currentPlayer.name}</span>
                            </p>
                            <span className="text-5xl mb-6 opacity-50 animate-pulse">🔒</span>
                            <BouncyButton
                                onClick={() => setIsRevealed(true)}
                                className="w-full py-5 text-lg shadow-spy-orange/30 shadow-2xl"
                            >
                                VOIR MON SECRET
                            </BouncyButton>
                        </div>
                    ) : (
                        <div className="w-full bg-[#1a2c4e] rounded-[32px] p-6 border-4 border-spy-lime shadow-[0_0_50px_rgba(204,255,0,0.2)] flex flex-col items-center justify-center animate-slide-up transform scale-100 z-20 min-h-[300px]">

                            {/* Role title HIDDEN for players. Only show Word or Mr White msg */}

                            {currentPlayer.role !== 'Mr. White' ? (
                                <div className="w-full flex flex-col items-center flex-1 justify-center">
                                    <p className="text-[10px] font-bold uppercase mb-4 text-white/40 tracking-widest">
                                        Mémorise ton mot
                                    </p>
                                    <div className="bg-black/30 rounded-2xl p-6 mb-8 w-full border border-white/10">
                                        <p className="text-4xl font-black text-white tracking-wide break-words">
                                            {currentPlayer.word ? currentPlayer.word : "???"}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full flex flex-col items-center flex-1 justify-center">
                                    <h3 className="text-3xl font-black mb-6 uppercase text-white drop-shadow-lg leading-tight">
                                        Tu es <span className="text-white">Mr. Blanc</span>
                                    </h3>
                                    <div className="bg-white/10 rounded-2xl p-6 mb-8 w-full border border-white/10">
                                        <p className="text-sm font-bold text-white/80 leading-snug">
                                            Tu n'as pas de mot.<br />Découvre celui des autres !
                                        </p>
                                    </div>
                                </div>
                            )}

                            <BouncyButton
                                onClick={nextPlayer}
                                className="w-full bg-white/10 hover:bg-white/20 text-white py-4 shadow-none border-b-4 border-white/5 active:border-b-0"
                                variant="secondary"
                            >
                                <span className="opacity-80 text-sm">CACHER & PASSER</span>
                            </BouncyButton>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default GameSession;
