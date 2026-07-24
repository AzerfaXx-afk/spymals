import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, Building2, Globe, Lock, LogIn, PlusCircle, Users, Share2, Copy, Check, 
    Play, CheckCircle2, MessageSquare, ShieldAlert, Sparkles, Crown, X, Radio, ArrowLeft, RefreshCw
} from 'lucide-react';
import BouncyButton from './BouncyButton';
import BackArrow from './BackArrow';
import SettingsGear from './SettingsGear';
import { CartoonAvatar } from './CartoonAvatars';
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

const PACK_NAMES = {
    standard: 'Standard',
    pop_culture: 'Culture Pop',
    abstract: 'Concepts Abstraits',
    animals: 'Animaux',
    spicy: 'Pack Soirée (+18) 🌶️',
    geek: 'Jeux Vidéo & Geek',
    travel: 'Voyage & Pays',
    food: 'Gourmand / Nourriture',
    fun: 'Absurde & Fun',
    random: 'Aléatoire'
};

const MultiplayerLobby = ({ user, profileData, onBack, onStartMultiplayerGame, onLoginRedirect }) => {
    const { playSfx } = useAudio();
    const [view, setView] = useState('select'); // 'select' | 'browser' | 'lobby'
    const [roomCode, setRoomCode] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [room, setRoom] = useState(null);
    const [players, setPlayers] = useState([]);
    const [isHost, setIsHost] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    // Public room browser states
    const [publicRooms, setPublicRooms] = useState([]);
    const [fetchingRooms, setFetchingRooms] = useState(false);

    // Chat states
    const [chatText, setChatText] = useState('');
    const [showChat, setShowChat] = useState(false);

    // Game Settings state (for host)
    const [settings, setSettings] = useState({
        pack: 'standard',
        spies: 1,
        whites: 1,
        cameleon: 0,
        bouffon: 0
    });

    const currentUserId = user?.id || localStorage.getItem('spyMals_guest_id') || (() => {
        const gid = `guest_${Date.now()}_${Math.floor(Math.random()*1000)}`;
        localStorage.setItem('spyMals_guest_id', gid);
        return gid;
    })();

    const currentUsername = profileData?.username || 'Agent Secret';
    const currentAvatar = profileData?.avatar_emoji || 'fox-detective';

    // Check for room code in URL query params on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const codeParam = params.get('room');
        if (codeParam) {
            setInputCode(codeParam.toUpperCase());
            handleJoinRoom(codeParam.toUpperCase());
        }
    }, []);

    // Realtime room subscription
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
                setSettings(updatedRoom.settings || { pack: 'standard', spies: 1, whites: 1, cameleon: 0, bouffon: 0 });
                
                if (updatedRoom.status === 'briefing' || updatedRoom.status === 'playing') {
                    channel.unsubscribe();
                    onStartMultiplayerGame(updatedRoom);
                }
            })
            .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'spymals_rooms',
                filter: `code=eq.${room.code}`
            }, () => {
                setErrorMsg("Le salon a été fermé par l'hôte.");
                handleLeaveRoom(false);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [room?.code]);

    // Fetch public rooms list for matchmaker
    const fetchPublicRooms = async () => {
        setFetchingRooms(true);
        setErrorMsg('');
        try {
            const { data, error } = await supabase
                .from('spymals_rooms')
                .select('*')
                .eq('status', 'lobby')
                .eq('is_public', true)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            setPublicRooms(data || []);
        } catch (err) {
            console.error("Failed to fetch public rooms:", err);
            setErrorMsg("Impossible de charger les salons publics.");
        } finally {
            setFetchingRooms(false);
        }
    };

    const handleCreateRoom = async (isPublic = true) => {
        setErrorMsg('');
        setLoading(true);
        const code = generateRoomCode();

        const hostPlayer = {
            id: currentUserId,
            username: currentUsername,
            avatar_emoji: currentAvatar,
            is_host: true,
            is_ready: true,
            role: null,
            is_alive: true,
            word: null,
            pseudoColor: profileData?.equipped_color && profileData?.equipped_color !== 'default'
                ? `text-${profileData.equipped_color === 'lime' ? 'spy-lime' : profileData.equipped_color === 'orange' ? 'spy-orange' : profileData.equipped_color === 'pink' ? 'pink-400' : profileData.equipped_color === 'cyan' ? 'cyan-400' : 'yellow-400 font-extrabold'}`
                : 'text-white'
        };

        const initialSettings = { pack: 'standard', spies: 1, whites: 1, cameleon: 0, bouffon: 0 };

        try {
            const { data, error } = await supabase
                .from('spymals_rooms')
                .insert([{
                    code,
                    host_id: currentUserId,
                    name: `Salon de ${currentUsername}`,
                    status: 'lobby',
                    is_public: isPublic,
                    players: [hostPlayer],
                    settings: initialSettings,
                    game_state: { chat_messages: [] }
                }])
                .select()
                .single();

            if (error) throw error;

            setRoom(data);
            setRoomCode(code);
            setPlayers([hostPlayer]);
            setSettings(initialSettings);
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
            id: currentUserId,
            username: currentUsername,
            avatar_emoji: currentAvatar,
            is_host: false,
            is_ready: false,
            role: null,
            is_alive: true,
            word: null,
            pseudoColor: profileData?.equipped_color && profileData?.equipped_color !== 'default'
                ? `text-${profileData.equipped_color === 'lime' ? 'spy-lime' : profileData.equipped_color === 'orange' ? 'spy-orange' : profileData.equipped_color === 'pink' ? 'pink-400' : profileData.equipped_color === 'cyan' ? 'cyan-400' : 'yellow-400 font-extrabold'}`
                : 'text-white'
        };

        try {
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
            const exists = currentPlayers.some(p => p.id === newPlayer.id);
            let updatedPlayers = [...currentPlayers];
            
            if (!exists) {
                updatedPlayers.push(newPlayer);
                const { error: updateError } = await supabase
                    .from('spymals_rooms')
                    .update({ players: updatedPlayers })
                    .eq('id', roomData.id);

                if (updateError) throw updateError;
            }

            setRoom(roomData);
            setRoomCode(cleanCode);
            setPlayers(updatedPlayers);
            setSettings(roomData.settings || { pack: 'standard', spies: 1, whites: 1, cameleon: 0, bouffon: 0 });
            setIsHost(roomData.host_id === currentUserId);
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

    const handleOpenBrowser = async () => {
        setView('browser');
        await fetchPublicRooms();
    };

    const handleAutoMatchmake = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const { data, error } = await supabase
                .from('spymals_rooms')
                .select('*')
                .eq('status', 'lobby')
                .eq('is_public', true)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            const available = data?.find(r => (r.players || []).length < 8);
            if (available) {
                await handleJoinRoom(available.code);
            } else {
                await handleCreateRoom(true);
            }
        } catch (err) {
            console.error("Auto matchmake error:", err);
            setErrorMsg("Aucun salon trouvé. Création d'un nouveau salon...");
            await handleCreateRoom(true);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePublic = async () => {
        if (!isHost || !room) return;
        const newPublicState = !room.is_public;
        
        try {
            await supabase
                .from('spymals_rooms')
                .update({ is_public: newPublicState })
                .eq('id', room.id);

            setRoom(prev => ({ ...prev, is_public: newPublicState }));
            playSfx('/sons/click.mp3');
        } catch (err) {
            console.error("Failed to update room privacy:", err);
        }
    };

    const handleToggleReady = async () => {
        const nextReadyState = !isReady;
        setIsReady(nextReadyState);

        const updatedPlayers = players.map(p => 
            p.id === currentUserId ? { ...p, is_ready: nextReadyState } : p
        );

        setPlayers(updatedPlayers);

        try {
            await supabase
                .from('spymals_rooms')
                .update({ players: updatedPlayers })
                .eq('id', room.id);
            playSfx('/sons/click.mp3');
        } catch (err) {
            console.error("Failed to update ready state:", err);
        }
    };

    const handleUpdateSettings = async (key, val) => {
        if (!isHost || !room) return;

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

    const handleCopyCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopiedCode(true);
        playSfx('/sons/click.mp3');
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const handleShareLink = () => {
        const shareUrl = `${window.location.origin}/?room=${roomCode}`;
        if (navigator.share) {
            navigator.share({
                title: 'Rejoins ma partie Spymals !',
                text: `Rejoins mon salon Spymals avec le code : ${roomCode}`,
                url: shareUrl
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(shareUrl);
            setCopiedLink(true);
            playSfx('/sons/click.mp3');
            setTimeout(() => setCopiedLink(false), 2000);
        }
    };

    const handleSendChatMessage = async (textToSend = null) => {
        const messageStr = textToSend || chatText;
        if (!messageStr || !messageStr.trim() || !room) return;

        const currentMessages = room.game_state?.chat_messages || [];
        const newMsg = {
            id: Math.random().toString(),
            sender_id: currentUserId,
            sender_name: currentUsername,
            sender_avatar: currentAvatar,
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

    const handleLeaveRoom = async (notifyDb = true) => {
        if (notifyDb && room) {
            let updatedPlayers = players.filter(p => p.id !== currentUserId);

            try {
                if (isHost || updatedPlayers.length === 0) {
                    await supabase.from('spymals_rooms').delete().eq('id', room.id);
                } else {
                    await supabase.from('spymals_rooms').update({ players: updatedPlayers }).eq('id', room.id);
                }
            } catch (err) {
                console.error("Error leaving room:", err);
            }
        }

        setView('select');
        setRoom(null);
        setRoomCode('');
        setPlayers([]);
        setIsHost(false);
        setIsReady(false);
    };

    const handleStartGame = async () => {
        if (!isHost || !room) return;
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
            const { data: wordPairs, error } = await supabase
                .from('spymals_words')
                .select('word_civilian, word_undercover')
                .eq('pack', settings.pack || 'standard');

            let selectedPairs = wordPairs;
            if (error || !wordPairs || wordPairs.length === 0) {
                // Fallback words if pack query fails
                selectedPairs = [
                    { word_civilian: 'Pizza', word_undercover: 'Burger' },
                    { word_civilian: 'Chien', word_undercover: 'Loup' },
                    { word_civilian: 'Plage', word_undercover: 'Piscine' }
                ];
            }

            const randomPair = selectedPairs[Math.floor(Math.random() * selectedPairs.length)];
            const civilianWord = randomPair.word_civilian;
            const undercoverWord = randomPair.word_undercover;

            const total = players.length;
            const spiesCount = settings.spies || 1;
            const whitesCount = settings.whites || 1;
            const cameleonCount = settings.cameleon || 0;
            const bouffonCount = settings.bouffon || 0;

            let rolePool = [];
            for (let i = 0; i < spiesCount; i++) rolePool.push('Undercover');
            for (let i = 0; i < whitesCount; i++) rolePool.push('Mr. White');
            for (let i = 0; i < cameleonCount; i++) rolePool.push('Cameleon');
            for (let i = 0; i < bouffonCount; i++) rolePool.push('Bouffon');
            while (rolePool.length < total) rolePool.push('Civilian');

            rolePool.sort(() => Math.random() - 0.5);

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
                    is_ready: false,
                    description: '',
                    vote: null
                };
            });

            const initialGameState = {
                phase: 'briefing',
                civilian_word: civilianWord,
                undercover_word: undercoverWord,
                turn_index: 0,
                description_round: 1,
                eliminated_ids: [],
                winner: null,
                words_pool: selectedPairs.map(w => w.word_civilian),
                chat_messages: room.game_state?.chat_messages || []
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
            setErrorMsg("Erreur lors du lancement de la mission.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-16 bg-transparent relative overflow-y-auto no-scrollbar pb-10 max-w-md mx-auto">
            {view === 'select' && <BackArrow onClick={onBack} />}
            {view === 'browser' && <BackArrow onClick={() => setView('select')} />}
            <SettingsGear onClick={() => {}} />

            {/* Background Ambient Lights */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-20%] w-[600px] h-[600px] bg-spy-lime opacity-[0.1] rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-20%] w-[500px] h-[500px] bg-spy-orange opacity-[0.1] rounded-full blur-[120px] animate-pulse-slow delay-700"></div>
            </div>

            {/* Error Notification Alert */}
            {errorMsg && (
                <div className="z-30 fixed top-4 left-4 right-4 max-w-md mx-auto bg-rose-600/90 border-2 border-black text-white rounded-2xl p-3.5 text-center shadow-xl animate-pop-in flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                        <ShieldAlert className="w-4 h-4 text-yellow-300 flex-shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                    <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-white/20 rounded-lg">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* ─────────────────────────────────────────────
                VIEW 1: MODE SELECTION (JOIN / CREATE / MATCH)
               ───────────────────────────────────────────── */}
            {view === 'select' && (
                <div className="z-10 w-full animate-slide-up flex flex-col items-center">
                    
                    {/* Header Banner */}
                    <div className="text-center mb-5">
                        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-black/40 border border-spy-lime/40 text-spy-lime text-[9.5px] font-black uppercase tracking-[0.2em] shadow-lg backdrop-blur-md mb-1">
                            <Radio className="w-3.5 h-3.5 animate-pulse" /> ESPIONS EN LIGNE
                        </div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight text-shadow-md">
                            MULTIJOUEUR REALTIME
                        </h1>
                    </div>

                    {/* Main Glass Card */}
                    <div className="card-cartoon bg-gradient-to-b from-[#14233e]/95 via-[#0d182b]/95 to-[#0a1426]/95 border-[3.5px] border-white/20 shadow-2xl rounded-[32px] p-5 w-full space-y-5">
                        
                        {/* Box 1: Join with Code */}
                        <div className="bg-black/40 border-2 border-white/10 rounded-2xl p-4 shadow-inner space-y-2.5">
                            <label className="text-[10px] font-black text-white/70 uppercase tracking-widest flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-spy-lime" /> Rejoindre un Salon avec Code
                            </label>
                            
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    maxLength={4}
                                    value={inputCode}
                                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                                    placeholder="A7K9"
                                    className="flex-1 bg-slate-900/90 border-2 border-white/20 rounded-xl px-3 py-3 text-center text-xl font-black uppercase tracking-[0.3em] text-white placeholder-white/20 focus:outline-none focus:border-spy-lime transition-all"
                                />
                                <button
                                    onClick={() => handleJoinRoom()}
                                    disabled={loading || !inputCode.trim()}
                                    className="btn-cartoon-primary px-5 py-3 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <LogIn className="w-4 h-4 stroke-[3]" /> ENTRER
                                </button>
                            </div>
                        </div>

                        {/* Box 2: Quick Play Matchmaking */}
                        <div className="space-y-2">
                            <button
                                onClick={handleOpenBrowser}
                                disabled={loading}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-lime-400 to-emerald-500 hover:from-lime-300 hover:to-emerald-400 text-black font-black uppercase text-sm tracking-wider border-[3px] border-black shadow-[0_5px_0_#000] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Zap className="w-5 h-5 fill-black stroke-black" />
                                <span>PARTIE RAPIDE MATCHMAKING</span>
                            </button>

                            <p className="text-[9.5px] text-white/40 font-bold uppercase tracking-wider text-center">
                                Parcours les salons ouverts et rejoins une partie en 1-clic !
                            </p>
                        </div>

                        {/* Box 3: Host Options */}
                        <div className="grid grid-cols-2 gap-2.5 pt-1">
                            <button
                                onClick={() => handleCreateRoom(true)}
                                disabled={loading}
                                className="py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-black uppercase text-[11px] tracking-wider border-2 border-white/20 shadow-[0_4px_0_#000] active:translate-y-1 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <Globe className="w-4 h-4 text-spy-lime stroke-[2.5]" /> HÉBERGER PUBLIC
                            </button>

                            <button
                                onClick={() => handleCreateRoom(false)}
                                disabled={loading}
                                className="py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-black uppercase text-[11px] tracking-wider border-2 border-white/20 shadow-[0_4px_0_#000] active:translate-y-1 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <Lock className="w-4 h-4 text-spy-orange stroke-[2.5]" /> HÉBERGER PRIVÉ
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* ─────────────────────────────────────────────
                VIEW 2: PUBLIC ROOM BROWSER (MATCHMAKING)
               ───────────────────────────────────────────── */}
            {view === 'browser' && (
                <div className="z-10 w-full animate-slide-up flex flex-col items-center">
                    
                    <div className="text-center mb-4">
                        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-black/40 border border-spy-lime/40 text-spy-lime text-[9.5px] font-black uppercase tracking-[0.2em] shadow-lg backdrop-blur-md mb-1">
                            <Zap className="w-3.5 h-3.5 fill-spy-lime" /> RECHERCHE DE SALON
                        </div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                            SALONS EN LIGNE
                        </h1>
                    </div>

                    <div className="card-cartoon bg-gradient-to-b from-[#14233e]/95 via-[#0d182b]/95 to-[#0a1426]/95 border-[3.5px] border-white/20 shadow-2xl rounded-[32px] p-4 w-full flex flex-col max-h-[70vh]">
                        
                        {/* Top Bar: Auto Match + Refresh */}
                        <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                            <button
                                onClick={handleAutoMatchmake}
                                disabled={loading}
                                className="flex-1 py-3 rounded-xl bg-spy-lime text-black font-black uppercase text-xs tracking-wider border-2 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <Zap className="w-4 h-4 fill-black stroke-black" /> REJOINDRE AUTOMATIQUEMENT
                            </button>

                            <button
                                onClick={fetchPublicRooms}
                                disabled={fetchingRooms}
                                className="p-3 rounded-xl bg-slate-800 border-2 border-white/20 text-white hover:bg-slate-700 cursor-pointer"
                                title="Actualiser"
                            >
                                <RefreshCw className={`w-4 h-4 ${fetchingRooms ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        {/* Room List Container */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
                            {fetchingRooms ? (
                                <div className="py-12 text-center text-white/50 font-black uppercase tracking-widest text-xs animate-pulse">
                                    Recherche des salons ouverts...
                                </div>
                            ) : publicRooms.length === 0 ? (
                                <div className="py-10 text-center space-y-3">
                                    <p className="text-white/60 text-xs font-black uppercase tracking-wider">
                                        Aucun salon public ouvert actuellement.
                                    </p>
                                    <button
                                        onClick={() => handleCreateRoom(true)}
                                        className="btn-cartoon-primary px-5 py-3 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5"
                                    >
                                        <PlusCircle className="w-4 h-4 stroke-[3]" /> Créer le premier salon public
                                    </button>
                                </div>
                            ) : (
                                publicRooms.map(publicRoom => {
                                    const count = (publicRoom.players || []).length;
                                    const hostPlayer = publicRoom.players?.[0];
                                    const packName = PACK_NAMES[publicRoom.settings?.pack] || 'Standard';

                                    return (
                                        <div
                                            key={publicRoom.id}
                                            className="bg-black/40 border-2 border-white/10 hover:border-spy-lime/50 rounded-2xl p-3.5 flex items-center justify-between transition-all group"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center flex-shrink-0">
                                                    <CartoonAvatar id={hostPlayer?.avatar_emoji || 'fox-detective'} className="w-full h-full" />
                                                </div>
                                                <div className="flex flex-col min-w-0 text-left">
                                                    <span className="font-black text-xs text-white uppercase tracking-wide truncate">
                                                        {publicRoom.name || `Salon de ${hostPlayer?.username}`}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-[9px] text-white/50 font-bold uppercase tracking-wider">
                                                        <span className="text-spy-lime">{packName}</span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-0.5">
                                                            <Users className="w-3 h-3 text-white/60" /> {count}/8
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleJoinRoom(publicRoom.code)}
                                                disabled={loading || count >= 8}
                                                className="btn-cartoon-primary px-3.5 py-2 text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                                            >
                                                <LogIn className="w-3.5 h-3.5 stroke-[2.5]" /> Rejoindre
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                    </div>
                </div>
            )}

            {/* ─────────────────────────────────────────────
                VIEW 3: ROOM LOBBY (WAITING & HOST CONTROLS)
               ───────────────────────────────────────────── */}
            {view === 'lobby' && room && (
                <div className="z-10 w-full animate-slide-up flex flex-col items-center">
                    
                    {/* Top Room Banner: Code + Privacy Toggle */}
                    <div className="card-cartoon bg-gradient-to-b from-[#14233e]/95 via-[#0d182b]/95 to-[#0a1426]/95 border-[3.5px] border-white/20 shadow-2xl rounded-[32px] p-4 w-full mb-4">
                        <div className="flex items-center justify-between mb-3">
                            {/* Privacy Toggle */}
                            <button
                                onClick={handleTogglePublic}
                                disabled={!isHost}
                                className={`px-3 py-1 rounded-full border text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                                    room.is_public 
                                        ? 'bg-spy-lime/20 border-spy-lime/50 text-spy-lime' 
                                        : 'bg-spy-orange/20 border-spy-orange/50 text-spy-orange'
                                }`}
                            >
                                {room.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                <span>{room.is_public ? 'Salon Public 🌐' : 'Salon Privé 🔒'}</span>
                            </button>

                            {/* Leave Room button */}
                            <button
                                onClick={() => handleLeaveRoom(true)}
                                className="text-white/40 hover:text-rose-400 p-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                            >
                                <X className="w-4 h-4" /> Quitter
                            </button>
                        </div>

                        {/* Big Room Code Box */}
                        <div className="bg-black/50 border-2 border-spy-lime/40 rounded-2xl p-3 flex items-center justify-between">
                            <div className="text-left">
                                <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em] block">
                                    CODE DE REJOINTE
                                </span>
                                <span className="text-3xl font-black text-white tracking-[0.3em] font-display text-shadow-md">
                                    {roomCode}
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleCopyCode}
                                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-black uppercase flex items-center gap-1 cursor-pointer active:scale-95"
                                    title="Copier le code"
                                >
                                    {copiedCode ? <Check className="w-4 h-4 text-spy-lime" /> : <Copy className="w-4 h-4" />}
                                    <span className="hidden sm:inline">{copiedCode ? 'Copie !' : 'Code'}</span>
                                </button>

                                <button
                                    onClick={handleShareLink}
                                    className="p-2.5 rounded-xl bg-spy-lime/20 hover:bg-spy-lime/30 border border-spy-lime/40 text-spy-lime text-xs font-black uppercase flex items-center gap-1 cursor-pointer active:scale-95"
                                    title="Partager le lien"
                                >
                                    {copiedLink ? <Check className="w-4 h-4 text-spy-lime" /> : <Share2 className="w-4 h-4" />}
                                    <span className="hidden sm:inline">{copiedLink ? 'Lien !' : 'Partager'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Joined Players Ribbon */}
                    <div className="card-cartoon bg-gradient-to-b from-[#14233e]/95 via-[#0d182b]/95 to-[#0a1426]/95 border-[3.5px] border-white/20 shadow-2xl rounded-[32px] p-4 w-full mb-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-spy-lime" /> Agents Connectés ({players.length}/8)
                            </span>
                            <span className="text-[10px] text-white/40 font-bold uppercase">
                                Attente : 3 joueurs min.
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {players.map((p) => {
                                const isMe = p.id === currentUserId;
                                return (
                                    <div
                                        key={p.id}
                                        className={`bg-black/40 border-2 rounded-2xl p-2.5 flex items-center gap-2.5 relative ${
                                            p.is_ready ? 'border-spy-lime/60 shadow-[0_0_12px_rgba(204,255,0,0.15)]' : 'border-white/10'
                                        }`}
                                    >
                                        <div className="w-9 h-9 rounded-full bg-slate-900 border border-white/20 flex-shrink-0">
                                            <CartoonAvatar id={p.avatar_emoji || 'fox-detective'} className="w-full h-full" />
                                        </div>

                                        <div className="flex flex-col min-w-0 text-left">
                                            <span className={`text-xs font-black uppercase tracking-wide truncate ${p.pseudoColor || 'text-white'}`}>
                                                {p.username} {isMe && '(Moi)'}
                                            </span>
                                            <span className={`text-[8.5px] font-black uppercase tracking-wider flex items-center gap-0.5 ${
                                                p.is_ready ? 'text-spy-lime' : 'text-amber-400/80'
                                            }`}>
                                                {p.is_host ? (
                                                    <span className="text-yellow-400 font-extrabold flex items-center gap-0.5"><Crown className="w-3 h-3 fill-yellow-400" /> Hôte</span>
                                                ) : p.is_ready ? (
                                                    <span className="flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Prêt</span>
                                                ) : (
                                                    'En attente...'
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Host Settings (If Host) */}
                    {isHost && (
                        <div className="card-cartoon bg-gradient-to-b from-[#14233e]/95 via-[#0d182b]/95 to-[#0a1426]/95 border-[3.5px] border-white/20 shadow-2xl rounded-[32px] p-4 w-full mb-4 text-left space-y-3">
                            <span className="text-xs font-black text-white uppercase tracking-wider block">
                                ⚙️ Configuration de la Mission
                            </span>

                            {/* Pack Selection */}
                            <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/10">
                                <span className="text-xs font-bold text-white/80">Pack de Mots</span>
                                <select
                                    value={settings.pack || 'standard'}
                                    onChange={(e) => handleUpdateSettings('pack', e.target.value)}
                                    className="bg-slate-900 border border-white/20 text-spy-lime font-black text-xs px-3 py-1.5 rounded-lg uppercase focus:outline-none"
                                >
                                    {Object.entries(PACK_NAMES).map(([key, name]) => (
                                        <option key={key} value={key}>{name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Steppers: Spies & Whites */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-black/40 p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                                    <span className="text-xs font-bold text-spy-orange">Espions</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={3}
                                        value={settings.spies || 1}
                                        onChange={(e) => handleUpdateSettings('spies', parseInt(e.target.value) || 1)}
                                        className="w-12 bg-slate-900 border border-white/20 text-white font-black text-xs py-1 rounded text-center"
                                    />
                                </div>

                                <div className="bg-black/40 p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                                    <span className="text-xs font-bold text-cyan-300">Mr. Blanc</span>
                                    <input
                                        type="number"
                                        min={0}
                                        max={2}
                                        value={settings.whites || 0}
                                        onChange={(e) => handleUpdateSettings('whites', parseInt(e.target.value) || 0)}
                                        className="w-12 bg-slate-900 border border-white/20 text-white font-black text-xs py-1 rounded text-center"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Button: Ready / Start Game */}
                    <div className="w-full space-y-2">
                        {isHost ? (
                            <button
                                onClick={handleStartGame}
                                disabled={loading || players.length < 3}
                                className="btn-cartoon-primary w-full py-4 text-base font-black uppercase tracking-wider shadow-[0_6px_0_#000] active:translate-y-1.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                <Play className="w-5 h-5 fill-black stroke-black" /> LANCER LA MISSION (3+ AGENTS)
                            </button>
                        ) : (
                            <button
                                onClick={handleToggleReady}
                                className={`w-full py-4 rounded-2xl font-black uppercase text-base tracking-wider border-[3.5px] border-black shadow-[0_5px_0_#000] active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                    isReady ? 'bg-spy-lime text-black' : 'bg-slate-800 text-white border-white/20'
                                }`}
                            >
                                <CheckCircle2 className="w-5 h-5 stroke-[3]" /> {isReady ? 'JE SUIS PRÊT !' : 'CLIQUER QUAND TU ES PRÊT'}
                            </button>
                        )}
                    </div>

                </div>
            )}

        </div>
    );
};

export default MultiplayerLobby;
