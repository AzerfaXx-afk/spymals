import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, Building2, Globe, Lock, LogIn, PlusCircle, Users, Share2, Copy, Check, 
    Play, CheckCircle2, MessageSquare, ShieldAlert, Sparkles, Crown, X, Radio, RefreshCw, 
    ChevronDown, Send, Edit2, Info, Plus, Minus, SlidersHorizontal, FolderKanban, Mail, MessageCircle
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

const PACK_OPTIONS = [
    { id: 'standard', name: 'Standard', icon: '🎯' },
    { id: 'pop_culture', name: 'Culture Pop', icon: '🎬' },
    { id: 'abstract', name: 'Concepts Abstraits', icon: '💡' },
    { id: 'animals', name: 'Animaux', icon: '🦁' },
    { id: 'spicy', name: 'Pack Soirée (+18)', icon: '🌶️' },
    { id: 'geek', name: 'Jeux Vidéo & Geek', icon: '🕹️' },
    { id: 'travel', name: 'Voyage & Pays', icon: '✈️' },
    { id: 'food', name: 'Gourmand / Nourriture', icon: '🍕' },
    { id: 'fun', name: 'Absurde & Fun', icon: '🤪' },
    { id: 'random', name: 'Aléatoire', icon: '🎲' }
];

const ROLE_INFOS = {
    white: {
        title: "Mr. Blanc ⚪",
        subtitle: "Camp : Imposteurs",
        badgeColor: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
        description: "Mr. Blanc n'a aucun mot sur son écran. Son but est d'écouter les indices des Civils pour deviner leur mot. S'il est éliminé au vote, il a une ultime chance : s'il devine le mot des Civils à voix haute, les Imposteurs gagnent la partie !"
    },
    bouffon: {
        title: "Le Bouffon 🃏",
        subtitle: "Camp : Solo (Anarchiste)",
        badgeColor: "text-purple-400 bg-purple-400/10 border-purple-400/30",
        description: "Le Bouffon joue seul ! Son objectif unique est de faire croire qu'il est un Espion pour se faire voter dehors par le groupe. S'il se fait éliminer au vote, IL GAGNE LA PARTIE SEUL !"
    },
    cameleon: {
        title: "Le Caméléon 🦎",
        subtitle: "Camp : Civils (Infiltré)",
        badgeColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
        description: "Le Caméléon fait partie de l'équipe des Civils mais n'a pas de mot au début. Il doit écouter attentivement les autres pour donner un indice crédible, ne pas se faire repérer par les Espions et faire gagner les Civils."
    }
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

    // Custom Room Name State
    const [isEditingRoomName, setIsEditingRoomName] = useState(false);
    const [editedRoomName, setEditedRoomName] = useState('');

    // Share Modal state
    const [showShareModal, setShowShareModal] = useState(false);

    // Custom Pack Dropdown & Special Roles Modal States
    const [isPackDropdownOpen, setIsPackDropdownOpen] = useState(false);
    const [isSpecialRolesModalOpen, setIsSpecialRolesModalOpen] = useState(false);
    const [activeRoleTooltip, setActiveRoleTooltip] = useState(null);

    // Public room browser states
    const [publicRooms, setPublicRooms] = useState([]);
    const [fetchingRooms, setFetchingRooms] = useState(false);

    // Chat states
    const [chatText, setChatText] = useState('');
    const chatEndRef = useRef(null);

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

    // Auto scroll chat to bottom
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [room?.game_state?.chat_messages]);

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

    const handleCreateRoom = async (isPublic = false) => {
        setErrorMsg('');
        setLoading(true);
        const code = generateRoomCode();
        const defaultName = `Salon de ${currentUsername}`;

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
                    name: defaultName,
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
            setEditedRoomName(defaultName);
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

    const handleSaveRoomName = async () => {
        if (!isHost || !room || !editedRoomName.trim()) return;
        try {
            const cleanName = editedRoomName.trim();
            await supabase
                .from('spymals_rooms')
                .update({ name: cleanName })
                .eq('id', room.id);

            setRoom(prev => ({ ...prev, name: cleanName }));
            setIsEditingRoomName(false);
            playSfx('/sons/click.mp3');
        } catch (err) {
            console.error("Failed to save room name:", err);
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
            setErrorMsg("Aucun salon ouvert. Création d'un nouveau salon...");
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
                title: 'Rejoins mon salon Spymals !',
                text: `Rejoins mon salon secret sur Spymals avec le code : ${roomCode}`,
                url: shareUrl
            }).catch(() => {});
        } else {
            setShowShareModal(true);
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

    const selectedPackObj = PACK_OPTIONS.find(p => p.id === (settings.pack || 'standard')) || PACK_OPTIONS[0];
    const totalPlayers = players.length;
    const undercoverCount = settings.spies || 1;
    const whiteCount = settings.whites || 1;
    const cameleonCount = settings.cameleon || 0;
    const bouffonCount = settings.bouffon || 0;
    const civilianCount = Math.max(0, totalPlayers - undercoverCount - whiteCount - cameleonCount - bouffonCount);
    const specialRolesActiveCount = whiteCount + bouffonCount + cameleonCount;

    return (
        <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-16 bg-gradient-to-b from-[#091325] via-[#0d1b36] to-[#070e1c] relative overflow-y-auto no-scrollbar pb-10 max-w-md mx-auto w-full">
            {/* Always Render Back Button */}
            <BackArrow onClick={view === 'lobby' ? () => handleLeaveRoom(true) : view === 'browser' ? () => setView('select') : onBack} />
            <SettingsGear onClick={() => {}} />

            {/* Background Ambient Glowing Orbs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-20%] w-[600px] h-[600px] bg-spy-lime opacity-[0.12] rounded-full blur-[130px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-20%] w-[500px] h-[500px] bg-spy-orange opacity-[0.12] rounded-full blur-[130px] animate-pulse-slow delay-700"></div>
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
                    
                    {/* Header Banner - 100% French */}
                    <div className="text-center mb-5">
                        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-black/40 border border-spy-lime/40 text-spy-lime text-[9.5px] font-black uppercase tracking-[0.2em] shadow-lg backdrop-blur-md mb-1">
                            <Radio className="w-3.5 h-3.5 animate-pulse" /> ESPIONS EN LIGNE
                        </div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight text-shadow-md">
                            MULTIJOUEUR EN TEMPS RÉEL
                        </h1>
                    </div>

                    {/* Main Cartoon Glass Card */}
                    <div className="card-cartoon bg-gradient-to-b from-[#14233e]/95 via-[#0d182b]/95 to-[#0a1426]/95 border-[3.5px] border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-xl rounded-[32px] p-5 w-full space-y-5">
                        
                        {/* Box 1: Join with Code */}
                        <div className="bg-black/40 border-2 border-white/10 rounded-2xl p-4 shadow-inner space-y-2.5">
                            <label className="text-[10px] font-black text-white/70 uppercase tracking-widest flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-spy-lime" /> Rejoindre un Salon avec Code
                            </label>
                            
                            <div className="flex items-center gap-2">
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
                                    className="btn-cartoon-primary w-12 h-12 rounded-xl text-white flex items-center justify-center cursor-pointer disabled:opacity-50 flex-shrink-0 shadow-[0_4px_0_#000] active:translate-y-1"
                                    title="Rejoindre le salon"
                                >
                                    <LogIn className="w-6 h-6 stroke-[3]" />
                                </button>
                            </div>
                        </div>

                        {/* Box 2: Quick Play Browser */}
                        <div className="space-y-2">
                            <button
                                onClick={handleOpenBrowser}
                                disabled={loading}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-lime-400 to-emerald-500 hover:from-lime-300 hover:to-emerald-400 text-black font-black uppercase text-sm tracking-wider border-[3px] border-black shadow-[0_5px_0_#000] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Zap className="w-5 h-5 fill-black stroke-black" />
                                <span>RECHERCHE RAPIDE DE SALON</span>
                            </button>

                            <p className="text-[9.5px] text-white/40 font-bold uppercase tracking-wider text-center">
                                Parcours les salons ouverts et rejoins une partie en 1-clic !
                            </p>
                        </div>

                        {/* Box 3: Host Room (Single Button -> Defaults to Private) */}
                        <div className="pt-1">
                            <button
                                onClick={() => handleCreateRoom(false)}
                                disabled={loading}
                                className="w-full py-4 rounded-2xl bg-slate-800/95 hover:bg-slate-700/95 text-white font-black uppercase text-sm tracking-wider border-[3px] border-white/20 shadow-[0_5px_0_#000] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Building2 className="w-5 h-5 text-spy-lime stroke-[2.5]" />
                                <span>HÉBERGER UN SALON</span>
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* ─────────────────────────────────────────────
                VIEW 2: PUBLIC ROOM BROWSER
               ───────────────────────────────────────────── */}
            {view === 'browser' && (
                <div className="z-10 w-full animate-slide-up flex flex-col items-center">
                    
                    <div className="text-center mb-4">
                        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-black/40 border border-spy-lime/40 text-spy-lime text-[9.5px] font-black uppercase tracking-[0.2em] shadow-lg backdrop-blur-md mb-1">
                            <Zap className="w-3.5 h-3.5 fill-spy-lime" /> SALONS OUVERTS
                        </div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                            RECHERCHE DE SALONS
                        </h1>
                    </div>

                    <div className="card-cartoon bg-gradient-to-b from-[#14233e]/95 via-[#0d182b]/95 to-[#0a1426]/95 border-[3.5px] border-white/20 shadow-2xl rounded-[32px] p-4 w-full flex flex-col max-h-[70vh]">
                        
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
                                    const packObj = PACK_OPTIONS.find(p => p.id === publicRoom.settings?.pack) || PACK_OPTIONS[0];

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
                                                    <div className="flex items-center gap-2 text-[9.5px] text-white/60 font-bold uppercase tracking-wider">
                                                        <span className="text-spy-lime">{packObj.icon} {packObj.name}</span>
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
                VIEW 3: ROOM LOBBY (WAITING, PLAYERS, CHAT)
               ───────────────────────────────────────────── */}
            {view === 'lobby' && room && (
                <div className="z-10 w-full animate-slide-up flex flex-col items-center">
                    
                    {/* Top Room Banner: Host Profile Avatar + Editable Room Name + Code */}
                    <div className="card-cartoon bg-gradient-to-b from-[#14233e]/95 via-[#0d182b]/95 to-[#0a1426]/95 border-[3.5px] border-white/20 shadow-2xl rounded-[32px] p-4 w-full mb-3">
                        
                        {/* Host Header Card */}
                        {(() => {
                            const hostPlayer = players.find(p => p.is_host) || players[0];
                            return (
                                <div className="flex items-center gap-3 bg-black/40 border-2 border-white/10 rounded-2xl p-3 mb-3 relative">
                                    <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-spy-lime/60 shadow-[0_0_12px_rgba(204,255,0,0.3)] flex-shrink-0">
                                        <CartoonAvatar id={hostPlayer?.avatar_emoji || 'fox-detective'} className="w-full h-full" />
                                    </div>

                                    <div className="flex flex-col text-left min-w-0 flex-1">
                                        <span className="text-[9.5px] font-black text-spy-lime uppercase tracking-[0.2em] flex items-center gap-1">
                                            <Crown className="w-3 h-3 fill-spy-lime" /> Hôte du Salon : {hostPlayer?.username}
                                        </span>

                                        {isEditingRoomName && isHost ? (
                                            <div className="flex gap-1.5 mt-1">
                                                <input
                                                    type="text"
                                                    value={editedRoomName}
                                                    onChange={(e) => setEditedRoomName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveRoomName()}
                                                    className="bg-slate-900 border border-spy-lime text-white font-black text-xs px-2 py-1 rounded-lg w-full"
                                                />
                                                <button
                                                    onClick={handleSaveRoomName}
                                                    className="bg-spy-lime text-black px-2 py-1 rounded-lg font-black text-xs"
                                                >
                                                    OK
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between gap-1 mt-0.5">
                                                <h2 className="text-base font-black text-white uppercase tracking-wide truncate">
                                                    {room.name || `Salon de ${hostPlayer?.username}`}
                                                </h2>
                                                {isHost && (
                                                    <button
                                                        onClick={() => setIsEditingRoomName(true)}
                                                        className="text-white/40 hover:text-spy-lime p-1 transition-colors"
                                                        title="Modifier le nom du salon"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="flex items-center justify-between mb-3">
                            <button
                                onClick={handleTogglePublic}
                                disabled={!isHost}
                                className={`px-3.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                                    room.is_public 
                                        ? 'bg-spy-lime/20 border-spy-lime/50 text-spy-lime' 
                                        : 'bg-spy-orange/20 border-spy-orange/50 text-spy-orange'
                                }`}
                            >
                                {room.is_public ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                <span>{room.is_public ? 'Salon Public 🌐' : 'Salon Privé 🔒'}</span>
                            </button>
                        </div>

                        {/* Room Code Card */}
                        <div className="bg-black/50 border-2 border-spy-lime/40 rounded-2xl p-3 flex items-center justify-between">
                            <div className="text-left">
                                <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em] block">
                                    CODE DU SALON
                                </span>
                                <span className="text-3xl font-black text-white tracking-[0.3em] font-display text-shadow-md">
                                    {roomCode}
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleCopyCode}
                                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-black uppercase flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                                >
                                    {copiedCode ? <Check className="w-4 h-4 text-spy-lime" /> : <Copy className="w-4 h-4" />}
                                    <span>{copiedCode ? 'Copie !' : 'Code'}</span>
                                </button>

                                <button
                                    onClick={handleShareLink}
                                    className="p-2.5 rounded-xl bg-spy-lime/20 hover:bg-spy-lime/30 border border-spy-lime/40 text-spy-lime text-xs font-black uppercase flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                                >
                                    {copiedLink ? <Check className="w-4 h-4 text-spy-lime" /> : <Share2 className="w-4 h-4" />}
                                    <span>Partager</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Spacious Players Card */}
                    <div className="card-cartoon bg-gradient-to-b from-[#14233e]/95 via-[#0d182b]/95 to-[#0a1426]/95 border-[3.5px] border-white/20 shadow-2xl rounded-[32px] p-4 w-full mb-3">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-spy-lime" /> Agents Connectés ({players.length}/8)
                            </span>
                            <span className="text-[9.5px] text-white/50 font-black uppercase">
                                3 agents minimum
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            {players.map((p) => {
                                const isMe = p.id === currentUserId;
                                return (
                                    <div
                                        key={p.id}
                                        className={`bg-black/40 border-2 rounded-2xl p-2.5 flex items-center gap-3 relative ${
                                            p.is_ready ? 'border-spy-lime/60 shadow-[0_0_14px_rgba(204,255,0,0.18)]' : 'border-white/10'
                                        }`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/20 flex-shrink-0">
                                            <CartoonAvatar id={p.avatar_emoji || 'fox-detective'} className="w-full h-full" />
                                        </div>

                                        <div className="flex flex-col min-w-0 text-left truncate">
                                            <span className={`text-xs font-black uppercase tracking-wide truncate ${p.pseudoColor || 'text-white'}`}>
                                                {p.username} {isMe && '(Moi)'}
                                            </span>
                                            <span className={`text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 ${
                                                p.is_ready ? 'text-spy-lime' : 'text-amber-400/80'
                                            }`}>
                                                {p.is_host ? (
                                                    <span className="text-yellow-400 font-extrabold flex items-center gap-0.5"><Crown className="w-3.5 h-3.5 fill-yellow-400" /> Hôte</span>
                                                ) : p.is_ready ? (
                                                    <span className="flex items-center gap-0.5"><CheckCircle2 className="w-3.5 h-3" /> Prêt</span>
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

                    {/* Host Game Settings Aligned with Offline Game Briefing Card */}
                    {isHost && (
                        <div className="card-cartoon bg-gradient-to-b from-[#14233e] to-[#0a1426] p-5 border-[3.5px] border-white/20 shadow-2xl w-full rounded-[32px] mb-3 text-left space-y-4">
                            <span className="text-xs font-black text-white uppercase tracking-wider block border-b border-white/10 pb-2">
                                ⚙️ Configuration de la Mission
                            </span>

                            {/* Civilians Display - Digital Readout */}
                            <div className="bg-black/40 rounded-2xl p-3.5 flex items-center justify-between border-2 border-white/10 relative overflow-hidden shadow-inner">
                                <div className="absolute left-0 top-0 w-1.5 h-full bg-spy-lime shadow-[0_0_10px_#ccff00]"></div>
                                <div className="relative z-10 flex items-center gap-3 w-full justify-between pl-2">
                                    <div className="flex flex-col">
                                        <span className="text-[9.5px] font-black uppercase tracking-widest text-white/40">PERSONNEL ACCRÉDITÉ</span>
                                        <span className="text-sm font-black uppercase tracking-wider text-white">Innocents (Civils)</span>
                                    </div>
                                    <div className="bg-black/60 border-2 border-spy-lime/40 rounded-xl px-3.5 py-1.5 flex items-center justify-center shadow-inner">
                                        <span className="text-2xl font-display font-black leading-none text-spy-lime text-shadow-md">
                                            {civilianCount.toString().padStart(2, '0')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Espions Stepper */}
                            <div className="bg-black/40 rounded-2xl p-3 border-2 border-white/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col text-left">
                                        <span className="text-xs font-black uppercase tracking-wider text-spy-orange">Espions (Undercover)</span>
                                        <span className="text-[9px] text-white/40 font-bold">Mots proches des Civils</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleUpdateSettings('spies', Math.max(1, undercoverCount - 1))}
                                            className="w-8 h-8 rounded-lg bg-slate-800 border border-white/20 text-white font-black flex items-center justify-center active:scale-90"
                                        >
                                            -
                                        </button>
                                        <span className="text-lg font-black text-white w-6 text-center">{undercoverCount}</span>
                                        <button
                                            onClick={() => handleUpdateSettings('spies', Math.min(3, undercoverCount + 1))}
                                            className="w-8 h-8 rounded-lg bg-spy-lime text-black font-black flex items-center justify-center active:scale-90"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Special Roles Button (Opens Modal) */}
                            <button
                                onClick={() => setIsSpecialRolesModalOpen(true)}
                                className="w-full bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900/40 hover:from-purple-900/60 hover:to-slate-900/60 border-2 border-purple-400/40 rounded-2xl p-3.5 flex items-center justify-between text-left transition-all cursor-pointer shadow-lg group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-300">
                                        <SlidersHorizontal className="w-4 h-4 stroke-[2.5]" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black uppercase tracking-wider text-white group-hover:text-purple-300 transition-colors">
                                            Autres Rôles Spéciaux...
                                        </span>
                                        <span className="text-[9px] font-bold text-purple-300/70 uppercase tracking-widest">
                                            Mr. Blanc, Le Bouffon, Le Caméléon ({specialRolesActiveCount} actif{specialRolesActiveCount > 1 ? 's' : ''})
                                        </span>
                                    </div>
                                </div>
                                <ChevronDown className="w-4 h-4 text-purple-300 -rotate-90 group-hover:translate-x-1 transition-transform" />
                            </button>

                            {/* Pack de Mots Dropdown */}
                            <div className="relative">
                                <label className="text-[9.5px] font-black text-white/50 uppercase tracking-widest block mb-1">
                                    PACK DE MOTS
                                </label>

                                <button
                                    onClick={() => setIsPackDropdownOpen(!isPackDropdownOpen)}
                                    className="w-full bg-slate-900/90 border-2 border-white/20 hover:border-spy-lime/50 rounded-xl px-3.5 py-2.5 text-left text-xs font-black text-white uppercase tracking-wider flex items-center justify-between transition-all"
                                >
                                    <span className="flex items-center gap-2">
                                        <span>{selectedPackObj.icon}</span>
                                        <span>{selectedPackObj.name}</span>
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-spy-lime transition-transform ${isPackDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isPackDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-full left-0 w-full mt-1.5 bg-slate-900 border-2 border-spy-lime/40 rounded-2xl shadow-2xl z-40 overflow-hidden max-h-48 overflow-y-auto custom-scrollbar"
                                        >
                                            {PACK_OPTIONS.map(pack => (
                                                <button
                                                    key={pack.id}
                                                    onClick={() => {
                                                        handleUpdateSettings('pack', pack.id);
                                                        setIsPackDropdownOpen(false);
                                                    }}
                                                    className={`w-full px-3.5 py-2 text-left text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-spy-lime/20 transition-colors border-b border-white/5 last:border-none ${
                                                        settings.pack === pack.id ? 'bg-spy-lime/30 text-spy-lime' : 'text-white'
                                                    }`}
                                                >
                                                    <span>{pack.icon}</span>
                                                    <span>{pack.name}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {/* Live Lobby Chat Component */}
                    <div className="card-cartoon bg-gradient-to-b from-[#14233e]/95 via-[#0d182b]/95 to-[#0a1426]/95 border-[3.5px] border-white/20 shadow-2xl rounded-[32px] p-4 w-full mb-3 text-left">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                                <MessageSquare className="w-4 h-4 text-spy-lime" /> Tchat du Salon
                            </span>
                            <span className="text-[9px] text-spy-lime font-black uppercase">
                                En Direct
                            </span>
                        </div>

                        <div className="bg-black/50 border-2 border-white/10 rounded-2xl p-3 h-28 overflow-y-auto custom-scrollbar space-y-2 mb-2">
                            {(room.game_state?.chat_messages || []).length === 0 ? (
                                <p className="text-white/30 text-[10px] font-black uppercase text-center py-6">
                                    Aucun message. Envoie une réaction à l'équipe !
                                </p>
                            ) : (
                                (room.game_state?.chat_messages || []).map((msg) => (
                                    <div key={msg.id} className="flex items-start gap-2 text-xs">
                                        <div className="w-6 h-6 rounded-full bg-slate-900 border border-white/20 flex-shrink-0">
                                            <CartoonAvatar id={msg.sender_avatar} className="w-full h-full" />
                                        </div>
                                        <div className="flex flex-col text-left min-w-0">
                                            <span className="text-[9px] font-black text-spy-lime uppercase tracking-wider">
                                                {msg.sender_name}
                                            </span>
                                            <span className="text-white font-bold leading-tight break-words">
                                                {msg.text}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Quick Reactions */}
                        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 mb-2">
                            {['🦊', '🕵️‍♂️', '🔥', '👀', '🎉', '👑', '🤫', '💥'].map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => handleSendChatMessage(emoji)}
                                    className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-sm flex-shrink-0 active:scale-95 transition-transform cursor-pointer"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={chatText}
                                onChange={(e) => setChatText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                                placeholder="Écris un message..."
                                className="flex-1 bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-xs font-bold text-white placeholder-white/30 focus:outline-none focus:border-spy-lime"
                            />
                            <button
                                onClick={() => handleSendChatMessage()}
                                className="btn-cartoon-primary px-3 py-2 text-xs font-black uppercase flex items-center justify-center cursor-pointer"
                            >
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Action Button & Quitter Button at Bottom */}
                    <div className="w-full space-y-3">
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

                        <button
                            onClick={() => handleLeaveRoom(true)}
                            className="w-full py-3 rounded-2xl border-2 border-dashed border-rose-600/50 text-rose-400 font-black uppercase text-xs tracking-wider hover:bg-rose-600/10 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                            <X className="w-4 h-4" /> QUITTER LE SALON
                        </button>
                    </div>

                </div>
            )}

            {/* ─────────────────────────────────────────────
                SPECIAL ROLES MODAL (OFFLINE MATCHING)
               ───────────────────────────────────────────── */}
            <AnimatePresence>
                {isSpecialRolesModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="card-cartoon bg-gradient-to-b from-[#14233e] to-[#0a1426] border-[3.5px] border-white/20 p-5 rounded-[32px] w-full max-w-md space-y-4 shadow-2xl relative"
                        >
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <SlidersHorizontal className="w-5 h-5 text-purple-400" /> Rôles Spéciaux
                                </h3>
                                <button
                                    onClick={() => setIsSpecialRolesModalOpen(false)}
                                    className="p-1 rounded-lg text-white/50 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {/* Mr. Blanc */}
                                <div className="bg-black/40 border border-white/10 rounded-2xl p-3 flex items-center justify-between">
                                    <div className="flex flex-col text-left">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-black text-cyan-300 uppercase tracking-wider">Mr. Blanc</span>
                                            <button onClick={() => setActiveRoleTooltip(ROLE_INFOS.white)} className="text-cyan-400 hover:text-white">
                                                <Info className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <span className="text-[9px] text-white/40 font-bold">Aucun mot • Devine les Civils</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleUpdateSettings('whites', Math.max(0, whiteCount - 1))} className="w-8 h-8 rounded-lg bg-slate-800 border border-white/20 text-white font-black">-</button>
                                        <span className="text-lg font-black text-white w-6 text-center">{whiteCount}</span>
                                        <button onClick={() => handleUpdateSettings('whites', Math.min(2, whiteCount + 1))} className="w-8 h-8 rounded-lg bg-spy-lime text-black font-black">+</button>
                                    </div>
                                </div>

                                {/* Le Bouffon */}
                                <div className="bg-black/40 border border-white/10 rounded-2xl p-3 flex items-center justify-between">
                                    <div className="flex flex-col text-left">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-black text-purple-300 uppercase tracking-wider">Le Bouffon 🃏</span>
                                            <button onClick={() => setActiveRoleTooltip(ROLE_INFOS.bouffon)} className="text-purple-400 hover:text-white">
                                                <Info className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <span className="text-[9px] text-white/40 font-bold">Veut se faire éliminer</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleUpdateSettings('bouffon', Math.max(0, bouffonCount - 1))} className="w-8 h-8 rounded-lg bg-slate-800 border border-white/20 text-white font-black">-</button>
                                        <span className="text-lg font-black text-white w-6 text-center">{bouffonCount}</span>
                                        <button onClick={() => handleUpdateSettings('bouffon', Math.min(1, bouffonCount + 1))} className="w-8 h-8 rounded-lg bg-spy-lime text-black font-black">+</button>
                                    </div>
                                </div>

                                {/* Le Caméléon */}
                                <div className="bg-black/40 border border-white/10 rounded-2xl p-3 flex items-center justify-between">
                                    <div className="flex flex-col text-left">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">Le Caméléon 🦎</span>
                                            <button onClick={() => setActiveRoleTooltip(ROLE_INFOS.cameleon)} className="text-emerald-400 hover:text-white">
                                                <Info className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <span className="text-[9px] text-white/40 font-bold">Infiltré chez les Civils</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleUpdateSettings('cameleon', Math.max(0, cameleonCount - 1))} className="w-8 h-8 rounded-lg bg-slate-800 border border-white/20 text-white font-black">-</button>
                                        <span className="text-lg font-black text-white w-6 text-center">{cameleonCount}</span>
                                        <button onClick={() => handleUpdateSettings('cameleon', Math.min(1, cameleonCount + 1))} className="w-8 h-8 rounded-lg bg-spy-lime text-black font-black">+</button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsSpecialRolesModalOpen(false)}
                                className="btn-cartoon-primary w-full py-3.5 text-xs font-black uppercase tracking-wider"
                            >
                                CONFIRMER LES RÔLES
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ─────────────────────────────────────────────
                SHARE MODAL (DESKTOP / FALLBACK)
               ───────────────────────────────────────────── */}
            <AnimatePresence>
                {showShareModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="card-cartoon bg-gradient-to-b from-[#14233e] to-[#0a1426] border-[3.5px] border-white/20 p-5 rounded-[32px] w-full max-w-sm space-y-4 shadow-2xl text-center relative"
                        >
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <Share2 className="w-4 h-4 text-spy-lime" /> Partager le Salon
                                </h3>
                                <button onClick={() => setShowShareModal(false)} className="p-1 rounded-lg text-white/50 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5 pt-1">
                                <a
                                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Rejoins mon salon secret sur Spymals avec le code ${roomCode} : ${window.location.origin}/?room=${roomCode}`)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-3 bg-emerald-600/20 border border-emerald-500/40 rounded-xl text-emerald-300 font-black text-xs uppercase flex items-center justify-center gap-1.5"
                                >
                                    <MessageCircle className="w-4 h-4" /> WhatsApp
                                </a>

                                <a
                                    href={`mailto:?subject=${encodeURIComponent('Invitation Salon Spymals')}&body=${encodeURIComponent(`Rejoins mon salon secret avec le code ${roomCode} : ${window.location.origin}/?room=${roomCode}`)}`}
                                    className="p-3 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-300 font-black text-xs uppercase flex items-center justify-center gap-1.5"
                                >
                                    <Mail className="w-4 h-4" /> E-Mail
                                </a>
                            </div>

                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/?room=${roomCode}`);
                                    setCopiedLink(true);
                                    setTimeout(() => setCopiedLink(false), 2000);
                                }}
                                className="w-full py-3 bg-spy-lime/20 border border-spy-lime/40 text-spy-lime font-black text-xs uppercase rounded-xl flex items-center justify-center gap-1.5"
                            >
                                <Copy className="w-4 h-4" /> {copiedLink ? 'Lien copié dans le presse-papier !' : 'Copier le lien direct'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ─────────────────────────────────────────────
                ROLE EXPLANATION TOOLTIP POPUP
               ───────────────────────────────────────────── */}
            <AnimatePresence>
                {activeRoleTooltip && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="card-cartoon bg-gradient-to-b from-[#14233e] to-[#0a1426] border-[3.5px] border-white/20 p-5 rounded-[32px] w-full max-w-sm space-y-3 shadow-2xl relative text-left"
                        >
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${activeRoleTooltip.badgeColor}`}>
                                    {activeRoleTooltip.subtitle}
                                </span>
                                <button onClick={() => setActiveRoleTooltip(null)} className="text-white/50 hover:text-white p-1">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                {activeRoleTooltip.title}
                            </h3>

                            <p className="text-white/80 text-xs font-bold leading-relaxed">
                                {activeRoleTooltip.description}
                            </p>

                            <button
                                onClick={() => setActiveRoleTooltip(null)}
                                className="btn-cartoon-primary w-full py-3 text-xs font-black uppercase tracking-wider mt-2"
                            >
                                J'AI COMPRIS
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default MultiplayerLobby;
