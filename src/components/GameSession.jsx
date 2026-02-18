import React, { useState, useEffect } from 'react';
import BouncyButton from './BouncyButton';
import { wordPacks } from '../data/wordPacks';

const GameSession = ({ players, config, onEndGame }) => {
    const [gameState, setGameState] = useState('distributing'); // distributing, playing
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [assignedRoles, setAssignedRoles] = useState([]);
    const [targetWord, setTargetWord] = useState(null);

    // Initialize Game
    useEffect(() => {
        if (gameState === 'distributing' && assignedRoles.length === 0) {
            assignRoles();
        }
    }, []);

    const assignRoles = () => {
        const { undercoverCount, whiteCount, wordPack } = config;
        const pack = wordPacks[wordPack] || wordPacks.standard;
        const wordPair = pack[Math.floor(Math.random() * pack.length)];

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

    const currentPlayer = assignedRoles[currentPlayerIndex];

    if (gameState === 'playing') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-spy-blue text-center relative overflow-hidden">
                {/* Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-spy-lime opacity-10 rounded-full blur-[100px] animate-pulse-slow pointer-events-none"></div>

                <div className="z-10 animate-pop-in">
                    <div className="text-8xl mb-6 filter drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] animate-bounce-slow">
                        🕵️‍♂️
                    </div>
                    <h1 className="text-5xl font-black text-white mb-6 drop-shadow-lg uppercase tracking-tighter">
                        Mission<br /><span className="text-spy-lime">Lancée !</span>
                    </h1>
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl max-w-sm mx-auto mb-12">
                        <p className="text-lg text-white/90 font-bold leading-relaxed">
                            Tous les agents ont leur mot secret. Discutez et trouvez les imposteurs !
                        </p>
                    </div>

                    <BouncyButton onClick={onEndGame} variant="secondary" className="max-w-xs mx-auto py-4 text-sm w-full">
                        TERMINER LA MISSION
                    </BouncyButton>
                </div>
            </div>
        );
    }

    // Loading state
    if (!currentPlayer) return <div className="text-white">Initialisation...</div>;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-spy-blue relative overflow-hidden">

            {/* Dynamic Background based on interaction */}
            <div className={`absolute inset-0 transition-colors duration-500 ${isRevealed ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'}`}></div>

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="z-10 flex flex-col items-center w-full max-w-md space-y-8 text-center perspective-1000">

                {/* Header / Avatar */}
                <div className={`flex flex-col items-center transition-all duration-500 ${isRevealed ? 'transform scale-75 opacity-50 blur-sm' : 'animate-bounce-slow'}`}>
                    <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center text-7xl border-4 border-spy-lime mb-4 shadow-[0_0_40px_rgba(204,255,0,0.3)] relative">
                        {currentPlayer.avatar.type === 'image' ? (
                            <img src={currentPlayer.avatar.value} alt={currentPlayer.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <span className="filter drop-shadow-md">{currentPlayer.avatar.value}</span>
                        )}
                        {/* Status Indicator */}
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-spy-lime rounded-full border-4 border-spy-blue"></div>
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-wider drop-shadow-lg">
                        {currentPlayer.name}
                    </h2>
                </div>

                {/* Card Content Flip Container */}
                <div className="w-full relative min-h-[300px] flex items-center justify-center">

                    {!isRevealed ? (
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-[40px] p-8 border border-white/10 shadow-2xl flex flex-col items-center justify-center animate-pop-in">
                            <p className="text-white/60 font-bold mb-8 uppercase tracking-widest text-xs">
                                Passe le téléphone à
                                <br />
                                <span className="text-white text-lg block mt-1">{currentPlayer.name}</span>
                            </p>
                            <span className="text-5xl mb-8 opacity-50 animate-pulse">🔒</span>
                            <BouncyButton
                                onClick={() => setIsRevealed(true)}
                                className="w-full py-6 text-xl shadow-spy-orange/30 shadow-2xl"
                            >
                                VOIR MON SECRET
                            </BouncyButton>
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-[#1a2c4e] rounded-[40px] p-8 border-4 border-spy-lime shadow-[0_0_50px_rgba(204,255,0,0.2)] flex flex-col items-center justify-center animate-slide-up transform scale-105 z-20">
                            <p className="text-spy-lime/80 font-black mb-2 uppercase tracking-widest text-[10px]">
                                Ton Rôle Secret
                            </p>
                            <h3 className="text-4xl font-black mb-8 uppercase text-white drop-shadow-lg leading-tight">
                                {currentPlayer.role === 'Civilian' ? <span className="text-spy-lime">Civil</span> :
                                    currentPlayer.role === 'Undercover' ? <span className="text-spy-orange">Espion</span> :
                                        <span className="text-white">Mr. White</span>}
                            </h3>

                            {currentPlayer.role !== 'Mr. White' ? (
                                <div className="bg-black/30 rounded-2xl p-6 mb-8 w-full border border-white/10">
                                    <p className="text-[10px] font-bold uppercase mb-2 text-white/40">Mot Secret</p>
                                    <p className="text-4xl font-black text-white tracking-wide">
                                        {currentPlayer.word ? currentPlayer.word : "???"}
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-white/10 rounded-2xl p-6 mb-8 w-full border border-white/10">
                                    <p className="text-sm font-bold text-white/80 leading-snug">
                                        Tu n'as pas de mot.<br />Découvre celui des autres !
                                    </p>
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
