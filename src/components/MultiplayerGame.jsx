import React, { useState, useEffect } from 'react';
import BouncyButton from './BouncyButton';
import { supabase } from '../utils/supabaseClient';
import { useAudio } from '../contexts/AudioContext';

const getLevelTitle = (lvl) => {
    if (lvl <= 2) return 'Recrue de la Savane 🐾';
    if (lvl <= 5) return 'Espion Éclaireur 🕵️‍♂️';
    if (lvl <= 9) return 'Agent Double 🦊';
    if (lvl <= 14) return 'Maître de la Jungle 🦁';
    return 'Légende de l\'Ombre 👑';
};

const getXPNeeded = (lvl) => lvl * 150;

const MultiplayerGame = ({ user, profileData, initialRoom, onUpdateProfile, onLeave }) => {
    const { playSfx } = useAudio();
    const [room, setRoom] = useState(initialRoom);
    const [players, setPlayers] = useState(initialRoom.players || []);
    const [gameState, setGameState] = useState(initialRoom.game_state || {});
    const [myPlayer, setMyPlayer] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedVote, setSelectedVote] = useState(null);
    const [mrWhiteOptions, setMrWhiteOptions] = useState([]);
    const [hasAwardedRewards, setHasAwardedRewards] = useState(false);

    const myId = user?.id || players.find(p => p.username === profileData?.username)?.id;
    const isHost = room.host_id === myId;

    // Find current player profile
    useEffect(() => {
        if (players.length > 0 && myId) {
            const found = players.find(p => p.id === myId);
            setMyPlayer(found);
        }
    }, [players, myId]);

    // Subscriptions
    useEffect(() => {
        const channel = supabase
            .channel(`game_${room.code}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'spymals_rooms',
                filter: `code=eq.${room.code}`
            }, (payload) => {
                const updatedRoom = payload.new;
                setRoom(updatedRoom);
                setPlayers(updatedRoom.players || []);
                setGameState(updatedRoom.game_state || {});
                
                if (updatedRoom.status === 'lobby') {
                    // Host aborted or returned to lobby
                    channel.unsubscribe();
                    onLeave();
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [room.code]);

    // Mr. White options generation
    useEffect(() => {
        if (gameState.phase === 'mr_white_guess' && mrWhiteOptions.length === 0) {
            // Generate 4 options: correct word + 3 random ones from words_pool
            const correct = gameState.civilian_word;
            const pool = (gameState.words_pool || []).filter(w => w !== correct);
            
            // Shuffle pool and select 3
            const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
            const selected = shuffledPool.slice(0, 3);
            
            // Mix correct word in
            const options = [...selected, correct].sort(() => Math.random() - 0.5);
            setMrWhiteOptions(options);
        }
    }, [gameState.phase]);

    // Award Rewards on game end (exactly once)
    useEffect(() => {
        if (gameState.winner && !hasAwardedRewards && profileData) {
            setHasAwardedRewards(true);
            
            const myRole = myPlayer?.role;
            const won = (gameState.winner === 'Civilian' && myRole === 'Civilian') ||
                        (gameState.winner === 'Impostors' && (myRole === 'Undercover' || myRole === 'Mr. White'));

            let earnedXp = won ? 100 : 40;
            let earnedCoins = won ? 40 : 15;

            // Calculate level up
            let newXp = (profileData.xp || 0) + earnedXp;
            let newLevel = profileData.level || 1;
            let newCoins = (profileData.coins || 0) + earnedCoins;
            let xpNeeded = getXPNeeded(newLevel);

            while (newXp >= xpNeeded) {
                newXp -= xpNeeded;
                newLevel += 1;
                newCoins += 100; // Level up bonus!
                xpNeeded = getXPNeeded(newLevel);
            }

            const updatedProfile = {
                ...profileData,
                xp: newXp,
                level: newLevel,
                coins: newCoins,
                games_played: (profileData.games_played || 0) + 1,
                games_won: (profileData.games_won || 0) + (won ? 1 : 0)
            };

            onUpdateProfile(updatedProfile);

            if (user) {
                supabase
                    .from('spymals_profiles')
                    .update({
                        xp: newXp,
                        level: newLevel,
                        coins: newCoins,
                        games_played: updatedProfile.games_played,
                        games_won: updatedProfile.games_won
                    })
                    .eq('id', user.id)
                    .then(({ error }) => {
                        if (error) console.error("Error updating stats:", error.message);
                    });
            }

            if (won) {
                playSfx('/sons/confetti.mp3', { volumeMultiplier: 0.6 });
            } else {
                playSfx('/sons/lose.mp3', { volumeMultiplier: 0.5 });
            }
        }
    }, [gameState.winner, profileData]);

    const activePlayers = players.filter(p => p.is_alive);
    const activePlayerIndex = gameState.turn_index % activePlayers.length;
    const currentTurnPlayer = activePlayers[activePlayerIndex];
    const isMyTurn = currentTurnPlayer?.id === myId;

    // Actions
    const handleConfirmBriefingReady = async () => {
        setLoading(true);
        const updatedPlayers = players.map(p => 
            p.id === myId ? { ...p, is_ready: true } : p
        );

        try {
            // Update players array
            await supabase
                .from('spymals_rooms')
                .update({ players: updatedPlayers })
                .eq('id', room.id);

            // If everyone is ready, transition state to playing
            const allReady = updatedPlayers.every(p => p.is_ready);
            if (allReady && isHost) {
                await supabase
                    .from('spymals_rooms')
                    .update({
                        status: 'playing',
                        game_state: {
                            ...gameState,
                            phase: 'playing',
                            turn_index: 0
                        }
                    })
                    .eq('id', room.id);
            }
        } catch (err) {
            console.error("Failed to update briefing ready status:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleNextTurn = async () => {
        if (!isMyTurn) return;
        setLoading(true);

        const nextTurnIndex = gameState.turn_index + 1;
        const totalAlive = activePlayers.length;

        // Check if one round of descriptions completed
        if (nextTurnIndex >= totalAlive) {
            // Transition to voting phase
            try {
                // Clear previous votes
                const resetPlayers = players.map(p => ({ ...p, vote: null }));
                
                await supabase
                    .from('spymals_rooms')
                    .update({
                        players: resetPlayers,
                        game_state: {
                            ...gameState,
                            phase: 'voting'
                        }
                    })
                    .eq('id', room.id);
                
                playSfx('/sons/click.mp3');
            } catch (err) {
                console.error("Failed to transition to voting phase:", err);
            } finally {
                setLoading(false);
            }
        } else {
            // Simply advance turn index
            try {
                await supabase
                    .from('spymals_rooms')
                    .update({
                        game_state: {
                            ...gameState,
                            turn_index: nextTurnIndex
                        }
                    })
                    .eq('id', room.id);

                playSfx('/sons/click.mp3');
            } catch (err) {
                console.error("Failed to advance turn:", err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCastVote = async (votedPlayerId) => {
        if (selectedVote) return; // Already voted
        setSelectedVote(votedPlayerId);

        const updatedPlayers = players.map(p => 
            p.id === myId ? { ...p, vote: votedPlayerId } : p
        );

        try {
            await supabase
                .from('spymals_rooms')
                .update({ players: updatedPlayers })
                .eq('id', room.id);

            // Host checks if everyone has voted
            const allVoted = updatedPlayers.filter(p => p.is_alive).every(p => p.vote !== null);
            if (allVoted && isHost) {
                // Resolve votes
                const votesCount = {};
                updatedPlayers.filter(p => p.is_alive).forEach(p => {
                    votesCount[p.vote] = (votesCount[p.vote] || 0) + 1;
                });

                // Find max voted player
                let maxVotes = 0;
                let eliminatedId = null;

                Object.keys(votesCount).forEach(pid => {
                    if (votesCount[pid] > maxVotes) {
                        maxVotes = votesCount[pid];
                        eliminatedId = pid;
                    }
                });

                // Update players: set eliminated to dead
                const nextPlayers = updatedPlayers.map(p => 
                    p.id === eliminatedId ? { ...p, is_alive: false } : p
                );

                const eliminatedPlayer = nextPlayers.find(p => p.id === eliminatedId);

                if (eliminatedPlayer?.role === 'Mr. White') {
                    // Mr White guess phase
                    await supabase
                        .from('spymals_rooms')
                        .update({
                            players: nextPlayers,
                            game_state: {
                                ...gameState,
                                phase: 'mr_white_guess',
                                mr_white_id: eliminatedId,
                                last_eliminated_name: eliminatedPlayer.username
                            }
                        })
                        .eq('id', room.id);
                } else {
                    // Check standard win conditions
                    const aliveCivs = nextPlayers.filter(p => p.is_alive && p.role === 'Civilian').length;
                    const aliveSpies = nextPlayers.filter(p => p.is_alive && p.role === 'Undercover').length;
                    const aliveWhites = nextPlayers.filter(p => p.is_alive && p.role === 'Mr. White').length;

                    let winner = null;
                    if (aliveSpies === 0 && aliveWhites === 0) {
                        winner = 'Civilian';
                    } else if (aliveSpies + aliveWhites >= aliveCivs) {
                        winner = 'Impostors';
                    }

                    if (winner) {
                        // End game
                        await supabase
                            .from('spymals_rooms')
                            .update({
                                players: nextPlayers,
                                game_state: {
                                    ...gameState,
                                    phase: 'ended',
                                    winner,
                                    last_eliminated_name: eliminatedPlayer?.username
                                }
                            })
                            .eq('id', room.id);
                    } else {
                        // Reset round for next description phase
                        await supabase
                            .from('spymals_rooms')
                            .update({
                                players: nextPlayers.map(p => ({ ...p, vote: null })),
                                game_state: {
                                    ...gameState,
                                    phase: 'playing',
                                    turn_index: 0,
                                    description_round: (gameState.description_round || 1) + 1,
                                    last_eliminated_name: eliminatedPlayer?.username
                                }
                            })
                            .eq('id', room.id);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to submit vote:", err);
        }
    };

    const handleMrWhiteGuess = async (guessWord) => {
        if (!isHost) return;
        setLoading(true);

        const correct = gameState.civilian_word === guessWord;
        let winner = correct ? 'Impostors' : null;

        // If Mr. White failed, check if any other impostor is still alive
        const nextPlayers = players; // Mr White is already is_alive: false
        const aliveCivs = nextPlayers.filter(p => p.is_alive && p.role === 'Civilian').length;
        const aliveSpies = nextPlayers.filter(p => p.is_alive && p.role === 'Undercover').length;
        const aliveWhites = nextPlayers.filter(p => p.is_alive && p.role === 'Mr. White').length;

        if (!winner) {
            if (aliveSpies === 0 && aliveWhites === 0) {
                winner = 'Civilian';
            } else if (aliveSpies + aliveWhites >= aliveCivs) {
                winner = 'Impostors';
            }
        }

        try {
            await supabase
                .from('spymals_rooms')
                .update({
                    game_state: {
                        ...gameState,
                        phase: 'ended',
                        winner: winner || 'Civilian', // Fallback to Civilian win if game over
                        mr_white_guessed_correct: correct,
                        mr_white_guess: guessWord
                    }
                })
                .eq('id', room.id);
        } catch (err) {
            console.error("Failed to update Mr White guess outcome:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleReturnToLobby = async () => {
        if (!isHost) return;
        setLoading(true);

        // Reset player fields
        const resetPlayers = players.map(p => ({
            ...p,
            role: null,
            word: null,
            is_alive: true,
            is_ready: false,
            description: '',
            vote: null
        }));

        try {
            await supabase
                .from('spymals_rooms')
                .update({
                    status: 'lobby',
                    players: resetPlayers,
                    game_state: {}
                })
                .eq('id', room.id);
        } catch (err) {
            console.error("Failed to reset room to lobby:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-20 bg-spy-blue relative overflow-y-auto no-scrollbar pb-10">
            
            {/* Header */}
            <div className="z-10 text-center mb-6 max-w-md w-full mx-auto">
                <p className="text-spy-lime text-[10px] font-black uppercase tracking-[0.25em] mb-1">
                    Mission Réseau · Salon {room.code}
                </p>
            </div>

            {/* ── PHASE 1 : BRIEFING (RÔLE) ── */}
            {room.status === 'briefing' && (
                <div className="z-10 w-full max-w-md space-y-6 animate-pop-in">
                    <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 shadow-xl backdrop-blur-xl text-center space-y-6">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                            Briefing de Mission
                        </h2>

                        <div className="py-8 bg-black/30 rounded-2xl border border-white/5 shadow-inner">
                            <span className="text-xs font-black text-white/40 uppercase tracking-widest block mb-2">Ton Rôle Secret</span>
                            
                            {myPlayer?.role ? (
                                <>
                                    <h3 className={`text-3xl font-black uppercase tracking-tight mb-4 ${myPlayer.role === 'Civilian' ? 'text-spy-lime' : 'text-spy-orange'}`}>
                                        {myPlayer.role === 'Civilian' ? 'Innocent 🦁' : myPlayer.role === 'Undercover' ? 'Espion 🦊' : 'Mr. Blanc 🦉'}
                                    </h3>
                                    
                                    <span className="text-xs font-black text-white/40 uppercase tracking-widest block mb-1">Mot Secret</span>
                                    {myPlayer.role === 'Mr. White' ? (
                                        <p className="text-xl font-black text-white tracking-widest select-none bg-slate-900 border border-white/5 p-3 rounded-xl max-w-xs mx-auto">
                                            ???
                                        </p>
                                    ) : (
                                        <p className="text-2xl font-black text-white tracking-wider select-none bg-slate-900 border border-white/5 p-3 rounded-xl max-w-xs mx-auto capitalize">
                                            {myPlayer.word}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p className="text-white/50 text-xs">Attribution des rôles en cours...</p>
                            )}
                        </div>

                        <p className="text-xs text-white/55 leading-relaxed">
                            Mémorise bien ton mot secret ou ton statut de Mr. Blanc. Ne le montre à personne !
                        </p>

                        {myPlayer?.is_ready ? (
                            <div className="bg-spy-lime/10 border border-spy-lime/25 rounded-2xl py-4 text-center">
                                <p className="text-spy-lime text-xs font-black uppercase tracking-wider">✓ Prêt à infiltrer</p>
                            </div>
                        ) : (
                            <BouncyButton
                                onClick={handleConfirmBriefingReady}
                                className="w-full py-5 text-lg"
                                disabled={loading}
                            >
                                Infiltrer la Partie
                            </BouncyButton>
                        )}
                    </div>
                </div>
            )}

            {/* ── PHASE 2 : GAMEPLAY (PLAYING / DESCRIPTIONS) ── */}
            {room.status === 'playing' && gameState.phase === 'playing' && (
                <div className="z-10 w-full max-w-md space-y-6 animate-pop-in">
                    
                    {/* Elimination Info Toast */}
                    {gameState.last_eliminated_name && (
                        <div className="bg-spy-orange/15 border border-spy-orange/30 rounded-2xl p-4 text-center">
                            <p className="text-spy-orange font-bold text-xs">
                                🚨 L'Agent **{gameState.last_eliminated_name}** a été éliminé !
                            </p>
                        </div>
                    )}

                    {/* Turn Describer Box */}
                    <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 shadow-xl backdrop-blur-xl text-center space-y-4">
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                                Tour de description
                            </span>
                            <span className="text-[10px] font-black text-spy-lime">
                                ROUND {gameState.description_round || 1}
                            </span>
                        </div>

                        {currentTurnPlayer ? (
                            <div className="py-6">
                                <div className="w-16 h-16 mx-auto rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/15 mb-3">
                                    {currentTurnPlayer.avatar_emoji && (currentTurnPlayer.avatar_emoji.startsWith('data:image/') || currentTurnPlayer.avatar_emoji.startsWith('http')) ? (
                                        <img src={currentTurnPlayer.avatar_emoji} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl leading-none">{currentTurnPlayer.avatar_emoji}</span>
                                    )}
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                                    {currentTurnPlayer.username}
                                </h3>
                                <p className="text-spy-lime text-[10px] font-black uppercase tracking-wider mt-1">
                                    {isMyTurn ? "C'est votre tour !" : "Décrit son mot..."}
                                </p>
                            </div>
                        ) : (
                            <p className="text-white/50 text-xs">Calcul du tour...</p>
                        )}

                        {isMyTurn ? (
                            <div className="space-y-4 pt-2">
                                <p className="text-xs text-white/60 leading-relaxed">
                                    Donne un indice oralement à haute voix pour décrire ton mot : **{myPlayer?.word || '???'}**.
                                </p>
                                <BouncyButton
                                    onClick={handleNextTurn}
                                    className="w-full py-5 text-lg shadow-lg shadow-spy-lime/10"
                                    disabled={loading}
                                >
                                    Valider ma description
                                </BouncyButton>
                            </div>
                        ) : (
                            <div className="bg-black/35 rounded-2xl p-4 border border-white/5 text-center text-xs text-white/50">
                                ⏳ Écoute bien l'indice de l'Agent **{currentTurnPlayer?.username}**...
                            </div>
                        )}
                    </div>

                    {/* Alive Players Grid */}
                    <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 shadow-xl space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/10 pb-2">
                            👥 Agents en jeu ({activePlayers.length})
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            {players.map(p => (
                                <div 
                                    key={p.id} 
                                    className={`rounded-2xl p-3 border flex items-center gap-2.5 transition-all ${!p.is_alive ? 'bg-black/40 border-white/5 opacity-30' : p.id === currentTurnPlayer?.id ? 'bg-spy-lime/10 border-spy-lime' : 'bg-black/20 border-white/5'}`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10 flex-none select-none">
                                        {p.avatar_emoji && (p.avatar_emoji.startsWith('data:image/') || p.avatar_emoji.startsWith('http')) ? (
                                            <img src={p.avatar_emoji} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-lg">{p.avatar_emoji}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <span className={`text-xs font-bold block truncate text-white`}>
                                            {p.username}
                                        </span>
                                        <span className="text-[9px] font-black text-white/40 uppercase block">
                                            {!p.is_alive ? 'Éliminé' : p.id === currentTurnPlayer?.id ? 'Décrit...' : 'En attente'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── PHASE 3 : VOTING (VOTES) ── */}
            {room.status === 'playing' && gameState.phase === 'voting' && (
                <div className="z-10 w-full max-w-md space-y-6 animate-pop-in">
                    <div className="text-center">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                            Vote d'Élimination
                        </h2>
                        <p className="text-spy-orange text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                            Démasquez l'intrus !
                        </p>
                    </div>

                    {/* Voting Prompt */}
                    <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 shadow-xl backdrop-blur-xl space-y-4">
                        {selectedVote ? (
                            <div className="bg-spy-lime/10 border border-spy-lime/25 rounded-2xl p-4 text-center">
                                <p className="text-spy-lime text-xs font-black uppercase tracking-wider">
                                    ✓ Vote enregistré (Agent {players.find(p => p.id === selectedVote)?.username})
                                </p>
                                <span className="text-[9px] text-white/50 block mt-1">Attente des autres agents...</span>
                            </div>
                        ) : (
                            <p className="text-xs text-white/60 text-center leading-relaxed">
                                Clique sur l'un des agents ci-dessous pour voter contre lui et l'éliminer de la mission.
                            </p>
                        )}

                        <div className="space-y-3">
                            {players.filter(p => p.is_alive).map(p => {
                                const isSelf = p.id === myId;
                                return (
                                    <button
                                        key={p.id}
                                        disabled={!!selectedVote || isSelf}
                                        onClick={() => handleCastVote(p.id)}
                                        className={`w-full rounded-2xl p-3 border flex items-center justify-between text-left transition-all ${isSelf ? 'bg-black/35 border-white/5 opacity-55 cursor-not-allowed' : 'bg-black/20 border-white/5 hover:border-spy-lime active:scale-[0.98]'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10 flex-none">
                                                {p.avatar_emoji && (p.avatar_emoji.startsWith('data:image/') || p.avatar_emoji.startsWith('http')) ? (
                                                    <img src={p.avatar_emoji} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-lg">{p.avatar_emoji}</span>
                                                )}
                                            </div>
                                            <span className="text-xs font-bold text-white uppercase">{p.username}</span>
                                        </div>
                                        {isSelf && (
                                            <span className="text-[9px] font-black uppercase tracking-wider text-white/40 mr-2">
                                                (Toi-même)
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ── PHASE 4 : MR WHITE GUESS (DEVINE LE MOT) ── */}
            {room.status === 'playing' && gameState.phase === 'mr_white_guess' && (
                <div className="z-10 w-full max-w-md space-y-6 animate-pop-in">
                    <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 shadow-xl backdrop-blur-xl text-center space-y-6">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                            🦉 Le Secret de Mr. Blanc
                        </h2>
                        
                        <div className="p-4 bg-spy-orange/10 border border-spy-orange/30 rounded-2xl text-center">
                            <p className="text-spy-orange text-xs leading-relaxed">
                                L'Agent **{gameState.last_eliminated_name}** était **Mr. Blanc** ! Il a une chance d'obtenir la victoire en devinant le mot secret des civils.
                            </p>
                        </div>

                        {myPlayer?.role === 'Mr. White' ? (
                            // View for Mr White
                            <div className="space-y-4">
                                <span className="text-xs font-black text-white/40 uppercase tracking-widest block">
                                    Devine le mot des Civils :
                                </span>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    {mrWhiteOptions.map((opt, i) => (
                                        <button
                                            key={i}
                                            disabled={loading}
                                            onClick={async () => {
                                                setLoading(true);
                                                // Send guess to database
                                                await supabase
                                                    .from('spymals_rooms')
                                                    .update({
                                                        game_state: {
                                                            ...gameState,
                                                            mr_white_guess: opt
                                                        }
                                                    })
                                                    .eq('id', room.id);
                                            }}
                                            className="bg-black/35 hover:border-spy-lime border border-white/5 rounded-xl p-3.5 text-xs text-white font-black uppercase tracking-wider transition-all"
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // View for other players
                            <div className="space-y-4">
                                <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">
                                        Statut de la devinette
                                    </span>
                                    <p className="text-xs text-white/70">
                                        {gameState.mr_white_guess ? (
                                            <>Mr. Blanc a choisi : <strong className="text-spy-lime uppercase text-sm block mt-1">{gameState.mr_white_guess}</strong></>
                                        ) : (
                                            <>Mr. Blanc examine les dossiers secrets...</>
                                        )}
                                    </p>
                                </div>

                                {isHost && gameState.mr_white_guess && (
                                    <BouncyButton
                                        onClick={() => handleMrWhiteGuess(gameState.mr_white_guess)}
                                        className="w-full py-5 text-lg"
                                        disabled={loading}
                                    >
                                        Vérifier la Devinette
                                    </BouncyButton>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── PHASE 5 : SCOREBOARD (FIN DE JEU) ── */}
            {gameState.phase === 'ended' && (
                <div className="z-10 w-full max-w-md space-y-6 animate-pop-in">
                    
                    {/* Victory Card */}
                    <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 shadow-xl backdrop-blur-xl text-center space-y-6">
                        <div className="py-2">
                            <span className="text-[10px] font-black text-spy-lime uppercase tracking-[0.25em] block mb-1">Fin de mission</span>
                            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
                                Victoire des {gameState.winner === 'Civilian' ? 'Civils !' : 'Imposteurs !'}
                            </h2>
                        </div>

                        {/* Words summary */}
                        <div className="bg-black/30 rounded-2xl p-4 border border-white/5 grid grid-cols-2 gap-4 text-left">
                            <div>
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Mot Civils :</span>
                                <span className="text-sm font-black text-spy-lime uppercase">{gameState.civilian_word}</span>
                            </div>
                            <div>
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Mot Espions :</span>
                                <span className="text-sm font-black text-spy-orange uppercase">{gameState.undercover_word}</span>
                            </div>
                        </div>

                        {/* Players Roles review */}
                        <div className="space-y-2 text-left">
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Dossiers Révélés :</span>
                            <div className="space-y-2">
                                {players.map(p => {
                                    const wasWinner = (gameState.winner === 'Civilian' && p.role === 'Civilian') ||
                                                      (gameState.winner === 'Impostors' && (p.role === 'Undercover' || p.role === 'Mr. White'));
                                    
                                    return (
                                        <div key={p.id} className="flex justify-between items-center bg-black/15 border border-white/5 rounded-xl p-2.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10 flex-none">
                                                    {p.avatar_emoji && (p.avatar_emoji.startsWith('data:image/') || p.avatar_emoji.startsWith('http')) ? (
                                                        <img src={p.avatar_emoji} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs">{p.avatar_emoji}</span>
                                                    )}
                                                </div>
                                                <span className="text-xs font-bold text-white">{p.username}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black text-white/50 uppercase">
                                                    {p.role === 'Civilian' ? 'Innocent' : p.role === 'Undercover' ? 'Espion' : 'Mr. Blanc'}
                                                </span>
                                                {wasWinner ? (
                                                    <span className="text-[9px] font-black text-spy-lime bg-spy-lime/10 px-2 py-0.5 rounded border border-spy-lime/20">+XP</span>
                                                ) : (
                                                    <span className="text-[9px] font-black text-white/35 bg-white/5 px-2 py-0.5 rounded border border-white/5">Défaite</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Player levels progression preview */}
                        {profileData && (
                            <div className="bg-black/35 rounded-2xl p-4 border border-white/5 text-center">
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-2">Ta Progression d'Agent</span>
                                <div className="flex items-center justify-between text-xs font-black text-white mb-1">
                                    <span>Niveau {profileData.level}</span>
                                    <span className="text-spy-lime">{profileData.xp} / {getXPNeeded(profileData.level)} XP</span>
                                </div>
                                <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-[1px]">
                                    <div 
                                        className="h-full bg-spy-lime rounded-full" 
                                        style={{ width: `${Math.min(100, Math.floor((profileData.xp / getXPNeeded(profileData.level)) * 100))}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Admin button for host to restart */}
                        {isHost ? (
                            <BouncyButton
                                onClick={handleReturnToLobby}
                                className="w-full py-5 text-lg"
                                disabled={loading}
                            >
                                Rejouer (Retour au Salon)
                            </BouncyButton>
                        ) : (
                            <div className="bg-black/20 rounded-xl p-4 text-center text-xs text-white/50">
                                En attente du retour au salon par l'hôte...
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiplayerGame;
