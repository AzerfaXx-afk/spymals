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
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-spy-blue text-center">
                {/* Decor */}
                <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-spy-lime opacity-10 rounded-full blur-3xl animate-pulse-fast pointer-events-none"></div>

                <h1 className="text-5xl font-black text-white mb-8 drop-shadow-lg z-10">Mission Lancée !</h1>
                <p className="text-xl text-white/80 mb-12 max-w-md z-10">
                    Tous les agents ont leur mot secret. Discutez et trouvez les imposteurs !
                </p>

                <BouncyButton onClick={onEndGame} variant="secondary" className="max-w-xs z-10">
                    Terminer la Mission
                </BouncyButton>
            </div>
        );
    }

    // Loading state
    if (!currentPlayer) return <div className="text-white">Initialisation...</div>;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-spy-blue relative overflow-hidden">

            {/* Dynamic Background based on interaction */}
            <div className={`absolute inset-0 transition-colors duration-500 ${isRevealed ? 'bg-black/40' : 'bg-transparent'}`}></div>

            <div className="z-10 flex flex-col items-center w-full max-w-md space-y-8 text-center">

                {/* Header / Avatar */}
                <div className="flex flex-col items-center animate-bounce-slow">
                    <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center text-6xl border-4 border-spy-lime mb-4 shadow-xl">
                        {currentPlayer.avatar.type === 'image' ? (
                            <img src={currentPlayer.avatar.value} alt={currentPlayer.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <span>{currentPlayer.avatar.value}</span>
                        )}
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-wider">
                        {currentPlayer.name}
                    </h2>
                </div>

                {/* Card Content */}
                {!isRevealed ? (
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 w-full shadow-2xl">
                        <p className="text-white/60 font-bold mb-6 uppercase tracking-widest text-sm">
                            Passe le téléphone à {currentPlayer.name}
                        </p>
                        <BouncyButton
                            onClick={() => setIsRevealed(true)}
                            className="w-full py-6 text-xl shadow-spy-orange/50 shadow-lg"
                        >
                            Voir mon Secret
                        </BouncyButton>
                    </div>
                ) : (
                    <div className="bg-spy-lime text-spy-blue rounded-3xl p-8 border-4 border-white w-full shadow-2xl transform scale-105 transition-transform">
                        <p className="text-spy-blue/60 font-black mb-2 uppercase tracking-widest text-sm">
                            Ton Rôle Secret
                        </p>
                        <h3 className="text-4xl font-black mb-6 uppercase">
                            {currentPlayer.role === 'Civilian' ? 'Civil' : currentPlayer.role}
                        </h3>

                        <div className="bg-white/20 rounded-xl p-4 mb-6">
                            <p className="text-sm font-bold uppercase mb-1 opacity-70">Mot Secret</p>
                            <p className="text-3xl font-black">
                                {currentPlayer.word ? currentPlayer.word : "???"}
                            </p>
                        </div>

                        <BouncyButton
                            onClick={nextPlayer}
                            className="w-full bg-spy-blue text-white py-4 shadow-lg"
                            variant="primary" // Actually secondary style visually in this context
                        >
                            Cacher & Passer
                        </BouncyButton>
                    </div>
                )}

            </div>
        </div>
    );
};

export default GameSession;
