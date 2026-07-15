import React, { useState, useEffect } from 'react';
import BouncyButton from './BouncyButton';
import BackArrow from './BackArrow';
import { supabase } from '../utils/supabaseClient';
import { useAudio } from '../contexts/AudioContext';

const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

const MultiplayerLobby = ({ user, profileData, onBack, onStartMultiplayerGame, onLoginRedirect }) => {
    const { playSfx } = useAudio();
    const [view, setView] = useState('select'); // 'select', 'lobby'
    const [roomCode, setRoomCode] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [room, setRoom] = useState(null);
    const [players, setPlayers] = useState([]);
    const [isHost, setIsHost] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatText, setChatText] = useState('');

    const QUICK_EMOTES = ['🦊', '🕵️‍♂️', '🚨', '🤫', '💥', '👀', '🏆', '👑', '🎉', '🔥'];

    const handleSendChatMessage = async (textToSend = null) => {
        const messageStr = textToSend || chatText;
        if (!messageStr || !messageStr.trim() || !room) return;

        const currentMessages = room.game_state?.chat_messages || [];
        const newMsg = {
            id: Math.random().toString(),
            sender_id: user?.id || `guest_${Date.now()}`,
            sender_name: profileData?.username || 'Agent',
            sender_avatar: profileData?.avatar_emoji || '🦁',
            text: messageStr.trim(),
            timestamp: new Date().toISOString()
        };

        const newMessages = [...currentMessages, newMsg].slice(-50);

        try {
            await supabase
                .from('spymals_rooms')
                .update({
                    game_state: {
                        ...room.game_state,
                        chat_messages: newMessages
                    }
                })
                .eq('id', room.id);
            
            if (!textToSend) setChatText('');
            playSfx('/sons/click.mp3');
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };
    
    // Game Settings state (for host)
    const [settings, setSettings] = useState({
        pack: 'animals',
        spies: 1,
        whites: 1
    });

    // Check for room code in URL query params on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const codeParam = params.get('room');
        if (codeParam) {
            setInputCode(codeParam.toUpperCase());
            handleJoinRoom(codeParam.toUpperCase());
        }
    }, []);

    // Subscribe to realtime room updates
    useEffect(() => {
        if (!room) return;

        const channel = supabase
            .channel(`room_${room.code}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'spymals_rooms',
                filter: `code=eq.${room.code}`
            }, (payload) => {
                const updatedRoom = payload.new;
                setRoom(updatedRoom);
                setPlayers(updatedRoom.players || []);
                setSettings(updatedRoom.settings || { pack: 'animals', spies: 1, whites: 1 });
                
                // If game status changed to briefing or playing, transition to game
                if (updatedRoom.status === 'briefing' || updatedRoom.status === 'playing') {
                    channel.unsubscribe();
                    onStartMultiplayerGame(updatedRoom);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [room]);

    const handleCreateRoom = async () => {
        setErrorMsg('');
        setLoading(true);
        const code = generateRoomCode();
        const hostPlayer = {
            id: user?.id || `guest_${Date.now()}`,
            username: profileData?.username || 'Agent Hôte',
            avatar_emoji: profileData?.avatar_emoji || '🦁',
            is_host: true,
            is_ready: true,
            role: null,
            is_alive: true,
            word: null
        };

        try {
            const { data, error } = await supabase
                .from('spymals_rooms')
                .insert([{
                    code,
                    host_id: hostPlayer.id,
                    status: 'lobby',
                    players: [hostPlayer],
                    settings: { pack: 'animals', spies: 1, whites: 1 },
                    game_state: {}
                }])
                .select()
                .single();

            if (error) throw error;

            setRoom(data);
            setRoomCode(code);
            setPlayers([hostPlayer]);
            setIsHost(true);
            setIsReady(true);
            setView('lobby');
            playSfx('/sons/click.mp3');
        } catch (err) {
            console.error("Failed to create room:", err);
            setErrorMsg("Erreur lors de la création du salon. Réessaie.");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRoom = async (codeToJoin = inputCode) => {
        const cleanCode = codeToJoin.trim().toUpperCase();
        if (!cleanCode) {
            setErrorMsg("Veuillez entrer un code de salon.");
            return;
        }

        setErrorMsg('');
        setLoading(true);

        const newPlayer = {
            id: user?.id || `guest_${Date.now()}`,
            username: profileData?.username || 'Agent Invité',
            avatar_emoji: profileData?.avatar_emoji || '🦊',
            is_host: false,
            is_ready: false,
            role: null,
            is_alive: true,
            word: null
        };

        try {
            // Fetch room
            const { data: roomData, error: fetchError } = await supabase
                .from('spymals_rooms')
                .select('*')
                .eq('code', cleanCode)
                .single();

            if (fetchError || !roomData) {
                setErrorMsg("Salon introuvable. Vérifie le code.");
                setLoading(false);
                return;
            }

            if (roomData.status !== 'lobby') {
                setErrorMsg("La partie a déjà commencé dans ce salon.");
                setLoading(false);
                return;
            }

            const currentPlayers = roomData.players || [];
            
            // Check if player already in room to avoid duplicates
            const exists = currentPlayers.some(p => p.id === newPlayer.id);
            let updatedPlayers = [...currentPlayers];
            
            if (!exists) {
                updatedPlayers.push(newPlayer);
                
                // Save to database
                const { error: updateError } = await supabase
                    .from('spymals_rooms')
                    .update({ players: updatedPlayers })
                    .eq('id', roomData.id);

                if (updateError) throw updateError;
            }

            setRoom(roomData);
            setRoomCode(cleanCode);
            setPlayers(updatedPlayers);
            setIsHost(false);
            setIsReady(exists ? currentPlayers.find(p => p.id === newPlayer.id)?.is_ready : false);
            setView('lobby');
            playSfx('/sons/click.mp3');
        } catch (err) {
            console.error("Failed to join room:", err);
            setErrorMsg("Erreur de connexion au salon.");
        } finally {
            setLoading(false);
        }
    };

    const handleMatchmaking = async () => {
        setErrorMsg('');
        setLoading(true);

        try {
            // Find open room
            const { data, error } = await supabase
                .from('spymals_rooms')
                .select('*')
                .eq('status', 'lobby')
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;

            // Find a room with space (e.g. < 8 players)
            const availableRoom = data?.find(r => (r.players || []).length < 8);

            if (availableRoom) {
                handleJoinRoom(availableRoom.code);
            } else {
                // If no room open, create one
                handleCreateRoom();
            }
        } catch (err) {
            console.error("Matchmaking error:", err);
            setErrorMsg("Erreur lors de la recherche rapide.");
            setLoading(false);
        }
    };

    const handleToggleReady = async () => {
        const nextReadyState = !isReady;
        setIsReady(nextReadyState);

        const updatedPlayers = players.map(p => 
            p.id === (user?.id || players.find(x => !x.is_host && x.username === profileData?.username)?.id)
                ? { ...p, is_ready: nextReadyState }
                : p
        );

        setPlayers(updatedPlayers);

        try {
            await supabase
                .from('spymals_rooms')
                .update({ players: updatedPlayers })
                .eq('id', room.id);
        } catch (err) {
            console.error("Failed to update ready state:", err);
        }
    };

    const handleUpdateSettings = async (key, val) => {
        if (!isHost) return;

        const nextSettings = { ...settings, [key]: val };
        setSettings(nextSettings);

        try {
            await supabase
                .from('spymals_rooms')
                .update({ settings: nextSettings })
                .eq('id', room.id);
        } catch (err) {
            console.error("Failed to update settings:", err);
        }
    };

    const handleLeaveRoom = async () => {
        const playerId = user?.id || players.find(x => x.username === profileData?.username)?.id;
        
        let updatedPlayers = players.filter(p => p.id !== playerId);

        try {
            if (isHost || updatedPlayers.length === 0) {
                // If host leaves, close the room
                await supabase
                    .from('spymals_rooms')
                    .delete()
                    .eq('id', room.id);
            } else {
                // Client leaves
                await supabase
                    .from('spymals_rooms')
                    .update({ players: updatedPlayers })
                    .eq('id', room.id);
            }
        } catch (err) {
            console.error("Error leaving room:", err);
        }

        setView('select');
        setRoom(null);
        setRoomCode('');
        setPlayers([]);
        setIsHost(false);
        setIsReady(false);
    };

    const handleStartGame = async () => {
        if (!isHost) return;
        if (players.length < 3) {
            setErrorMsg("Il faut au moins 3 agents pour démarrer !");
            return;
        }

        const notReady = players.filter(p => !p.is_ready);
        if (notReady.length > 0) {
            setErrorMsg(`Attente des agents prêts : ${notReady.map(p => p.username).join(', ')}`);
            return;
        }

        setLoading(true);

        try {
            // 1. Fetch words from Supabase based on selected pack
            const { data: wordPairs, error } = await supabase
                .from('spymals_words')
                .select('word_civilian, word_undercover')
                .eq('pack', settings.pack);

            if (error || !wordPairs || wordPairs.length === 0) {
                throw new Error("Impossible de charger les mots.");
            }

            // Select random pair
            const randomPair = wordPairs[Math.floor(Math.random() * wordPairs.length)];
            const civilianWord = randomPair.word_civilian;
            const undercoverWord = randomPair.word_undercover;

            // 2. Assign roles
            const total = players.length;
            const spiesCount = settings.spies;
            const whitesCount = settings.whites;

            // Create array of roles
            let rolePool = [];
            for (let i = 0; i < spiesCount; i++) rolePool.push('Undercover');
            for (let i = 0; i < whitesCount; i++) rolePool.push('Mr. White');
            while (rolePool.length < total) rolePool.push('Civilian');

            // Shuffle roles
            rolePool.sort(() => Math.random() - 0.5);

            // Update player profiles with roles & words
            const assignedPlayers = players.map((p, idx) => {
                const role = rolePool[idx];
                let word = civilianWord;
                if (role === 'Undercover') word = undercoverWord;
                if (role === 'Mr. White') word = null;

                return {
                    ...p,
                    role,
                    word,
                    is_alive: true,
                    is_ready: false, // Reset for briefing ready confirmation
                    description: '',
                    vote: null
                };
            });

            // 3. Update room status to briefing and save game config
            const initialGameState = {
                phase: 'briefing',
                civilian_word: civilianWord,
                undercover_word: undercoverWord,
                turn_index: 0,
                description_round: 1,
                eliminated_ids: [],
                winner: null,
                words_pool: wordPairs.map(w => w.word_civilian) // Saved for Mr. White guess options
            };

            await supabase
                .from('spymals_rooms')
                .update({
                    status: 'briefing',
                    players: assignedPlayers,
                    game_state: initialGameState
                })
                .eq('id', room.id);

        } catch (err) {
            console.error("Error starting multiplayer game:", err);
            setErrorMsg("Erreur lors de l'attribution des rôles.");
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-spy-blue relative overflow-hidden">
                {/* Background effects */}
                <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-spy-lime opacity-10 rounded-full blur-[80px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-spy-orange opacity-10 rounded-full blur-[80px] animate-pulse-slow delay-1000"></div>

                <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/15 rounded-[32px] p-8 shadow-2xl z-10 text-center space-y-6 animate-slide-up">
                    <div className="text-5xl filter drop-shadow-md">🔒</div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Mode En Ligne Verrouillé</h2>
                    <p className="text-white/60 text-xs font-bold leading-relaxed">
                        Créez un compte gratuitement en 10 secondes pour héberger des salons privés, générer des QR Codes et jouer avec vos amis sur vos propres téléphones !
                    </p>
                    
                    <div className="space-y-3 pt-4">
                        <BouncyButton onClick={onLoginRedirect} className="w-full py-4 text-sm">
                            🔑 Créer un compte / Se connecter
                        </BouncyButton>
                        <BouncyButton onClick={onBack} variant="secondary" className="w-full py-3.5 text-xs">
                            Retour à l'accueil
                        </BouncyButton>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-20 bg-spy-blue relative overflow-y-auto no-scrollbar pb-10">
            {view === 'select' && <BackArrow onClick={onBack} />}

            {/* ERROR ALERTS */}
            {errorMsg && (
                <div className="z-20 fixed top-4 left-4 right-4 max-w-md mx-auto bg-red-500/10 border border-red-500/25 rounded-2xl p-4 text-center animate-pop-in">
                    <p className="text-red-400 text-xs font-black uppercase tracking-wider">{errorMsg}</p>
                </div>
            )}

            {view === 'select' ? (
                // MODE SELECTION SCREEN
                <div className="z-10 w-full max-w-md space-y-6 mt-6 animate-pop-in">
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
                            Espions en Ligne
                        </h2>
                        <p className="text-spy-lime text-[10px] font-black uppercase tracking-[0.25em] mt-1">
                            Multijoueur Realtime
                        </p>
                    </div>

                    {/* Join Lobby Box */}
                    <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 shadow-xl backdrop-blur-xl space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-wider text-white">
                            Rejoindre un salon
                        </h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                maxLength={6}
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                                placeholder="CODE SALON"
                                className="flex-1 bg-black/45 border border-white/10 rounded-2xl text-center text-xl font-bold uppercase tracking-widest text-white placeholder-white/20 focus:outline-none focus:border-spy-lime"
                            />
                            <BouncyButton
                                onClick={() => handleJoinRoom()}
                                className="px-6 py-4"
                                disabled={loading}
                            >
                                {loading ? '...' : 'Entrer'}
                            </BouncyButton>
                        </div>
                    </div>

                    {/* Quick Play & Create Buttons */}
                    <div className="space-y-4 pt-2">
                        <BouncyButton
                            onClick={handleMatchmaking}
                            className="w-full py-5 text-lg"
                            disabled={loading}
                        >
                            ⚡ Partie Rapide Matchmaking
                        </BouncyButton>

                        <BouncyButton
                            onClick={handleCreateRoom}
                            variant="secondary"
                            className="w-full py-5 text-lg"
                            disabled={loading}
                        >
                            🏢 Héberger un Salon Privé
                        </BouncyButton>
                    </div>
                </div>
            ) : (
                // ROOM LOBBY SCREEN
                <div className="z-10 w-full max-w-md space-y-6 animate-pop-in">
                    <div className="text-center">
                        <p className="text-spy-lime text-[10px] font-black uppercase tracking-[0.25em] mb-1">
                            Salon de Réunion
                        </p>
                        <h2 className="text-5xl font-black text-white tracking-widest select-all leading-tight">
                            {roomCode}
                        </h2>
                    </div>

                    {/* QR Code and Sharing */}
                    <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 flex flex-col items-center justify-center shadow-xl backdrop-blur-xl space-y-4">
                        <div className="p-3 bg-slate-900/60 rounded-2xl border border-white/5 shadow-inner">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=204-255-0&bgcolor=15-23-42&data=https://spymals.vercel.app/?room=${roomCode}`}
                                alt="QR Code Salon"
                                className="w-36 h-36 border border-spy-lime/20 rounded-xl"
                            />
                        </div>
                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider text-center leading-relaxed max-w-xs">
                            Scanne le QR Code pour rejoindre directement ce salon depuis un autre téléphone !
                        </p>
                    </div>

                    {/* Settings Panel (Host controls, read-only for clients) */}
                    <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 shadow-xl space-y-5">
                        <h3 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/10 pb-2">
                            ⚙️ Configuration de la Mission
                        </h3>

                        {/* Pack choice */}
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-white/60">Pack Mots :</span>
                            {isHost ? (
                                <select
                                    value={settings.pack}
                                    onChange={(e) => handleUpdateSettings('pack', e.target.value)}
                                    className="bg-black/45 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-bold outline-none focus:border-spy-lime"
                                >
                                    <option value="animals">Animaux 🦁</option>
                                    <option value="geek">Geek & Tech 🎮</option>
                                    <option value="travel">Voyage ✈️</option>
                                    <option value="food">Nourriture 🍔</option>
                                    <option value="fun">Absurde & Fun 🤪</option>
                                </select>
                            ) : (
                                <span className="text-xs font-black text-spy-lime uppercase">
                                    {settings.pack}
                                </span>
                            )}
                        </div>

                        {/* Spies count */}
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-white/60">Espions (Undercover) :</span>
                            {isHost ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleUpdateSettings('spies', Math.max(1, settings.spies - 1))}
                                        className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-white font-bold"
                                    >
                                        -
                                    </button>
                                    <span className="text-sm font-black text-white w-4 text-center">{settings.spies}</span>
                                    <button
                                        onClick={() => handleUpdateSettings('spies', Math.min(3, settings.spies + 1))}
                                        className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-white font-bold"
                                    >
                                        +
                                    </button>
                                </div>
                            ) : (
                                <span className="text-sm font-black text-white">{settings.spies}</span>
                            )}
                        </div>

                        {/* Mr Whites count */}
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-white/60">Mr. Blanc :</span>
                            {isHost ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleUpdateSettings('whites', Math.max(0, settings.whites - 1))}
                                        className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-white font-bold"
                                    >
                                        -
                                    </button>
                                    <span className="text-sm font-black text-white w-4 text-center">{settings.whites}</span>
                                    <button
                                        onClick={() => handleUpdateSettings('whites', Math.min(2, settings.whites + 1))}
                                        className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-white font-bold"
                                    >
                                        +
                                    </button>
                                </div>
                            ) : (
                                <span className="text-sm font-black text-white">{settings.whites}</span>
                            )}
                        </div>
                    </div>

                    {/* Players connected */}
                    <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 shadow-xl space-y-4">
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <h3 className="text-xs font-black uppercase tracking-widest text-white">
                                👥 Agents en attente
                            </h3>
                            <span className="text-[10px] font-black text-spy-lime">{players.length} connectés</span>
                        </div>

                        <div className="space-y-3">
                            {players.map((p) => (
                                <div key={p.id} className="flex items-center justify-between bg-black/20 rounded-xl p-3 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10 flex-none">
                                            {p.avatar_emoji && (p.avatar_emoji.startsWith('data:image/') || p.avatar_emoji.startsWith('http')) ? (
                                                <img src={p.avatar_emoji} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-lg">{p.avatar_emoji}</span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-white block">
                                                {p.username}
                                                {p.is_host && <span className="text-[9px] text-spy-lime ml-1.5 border border-spy-lime/25 px-1.5 py-0.5 rounded uppercase font-black tracking-wide">HÔTE</span>}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        {p.is_ready ? (
                                            <span className="text-[9px] font-black uppercase tracking-widest text-spy-lime bg-spy-lime/10 border border-spy-lime/20 px-2 py-1 rounded-lg">Prêt</span>
                                        ) : (
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30 bg-white/5 px-2 py-1 rounded-lg">Attente</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat & Émotes en Direct */}
                    <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 shadow-xl space-y-4 text-left">
                        <h3 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/10 pb-2">
                            💬 Chat & Émotes du Salon
                        </h3>

                        {/* Message Box */}
                        <div className="h-44 bg-black/40 border border-white/5 rounded-2xl p-3 overflow-y-auto space-y-2.5 flex flex-col scrollbar-thin">
                            {(room?.game_state?.chat_messages || []).length === 0 ? (
                                <p className="text-[10px] text-white/30 uppercase tracking-wider text-center my-auto font-black select-none">
                                    Aucun message. Lancez la discussion !
                                </p>
                            ) : (
                                (room?.game_state?.chat_messages || []).map((msg) => {
                                    const isMe = msg.sender_id === (user?.id || players.find(x => x.username === profileData?.username)?.id);
                                    return (
                                        <div 
                                            key={msg.id} 
                                            className={`flex items-start gap-2.5 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}
                                        >
                                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10 flex-none select-none">
                                                {msg.sender_avatar && (msg.sender_avatar.startsWith('data:image/') || msg.sender_avatar.startsWith('http')) ? (
                                                    <img src={msg.sender_avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-sm">{msg.sender_avatar || '🦊'}</span>
                                                )}
                                            </div>
                                            <div className={`p-2.5 rounded-2xl text-xs font-bold leading-relaxed ${isMe ? 'bg-spy-lime text-black rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                                                {!isMe && <span className="block text-[9px] font-black text-spy-lime/80 uppercase mb-0.5">{msg.sender_name}</span>}
                                                <span className="break-all">{msg.text}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Quick Emotes Panel */}
                        <div className="flex flex-wrap gap-1.5 justify-between bg-black/25 p-2 rounded-xl border border-white/5">
                            {QUICK_EMOTES.map(emote => (
                                <button
                                    key={emote}
                                    onClick={() => handleSendChatMessage(emote)}
                                    className="w-8 h-8 rounded-lg hover:bg-white/10 active:scale-95 transition-all text-lg flex items-center justify-center cursor-pointer select-none"
                                >
                                    {emote}
                                </button>
                            ))}
                        </div>

                        {/* Message Send Form */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={chatText}
                                onChange={(e) => setChatText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                                placeholder="Écrire un message..."
                                className="flex-1 bg-black/45 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-spy-lime"
                            />
                            <button
                                onClick={() => handleSendChatMessage()}
                                className="px-4 py-2 bg-spy-lime border-2 border-black text-black font-black uppercase text-xs rounded-xl hover:bg-spy-lime/90 active:translate-y-0.5 active:shadow-none transition-all shadow-[2px_2px_0_#000] cursor-pointer"
                            >
                                Envoi
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 pt-2">
                        {isHost ? (
                            <BouncyButton
                                onClick={handleStartGame}
                                className="w-full py-5 text-lg"
                                disabled={players.length < 3}
                            >
                                🚀 Lancer la Mission ({players.length} Agents)
                            </BouncyButton>
                        ) : (
                            <BouncyButton
                                onClick={handleToggleReady}
                                className={`w-full py-5 text-lg ${isReady ? 'bg-spy-orange border-spy-orange text-white' : ''}`}
                            >
                                {isReady ? '✖ Annuler Prêt' : '✓ Confirmer Prêt'}
                            </BouncyButton>
                        )}

                        <BouncyButton
                            onClick={handleLeaveRoom}
                            variant="danger"
                            className="w-full py-4 text-xs"
                        >
                            Quitter le Salon
                        </BouncyButton>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiplayerLobby;
