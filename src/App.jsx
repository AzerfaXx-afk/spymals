import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import PlayerSetup from './components/PlayerSetup';
import IdentifyAgents from './components/IdentifyAgents';
import MissionBriefing from './components/MissionBriefing';
import GameSession from './components/GameSession';
import Scoreboard from './components/Scoreboard';
import HowToPlay from './components/HowToPlay';
import Settings from './components/Settings';
import Leaderboard from './components/Leaderboard';
import History from './components/History';
import Auth from './components/Auth';
import Profile from './components/Profile';
import Shop from './components/Shop';
import MultiplayerLobby from './components/MultiplayerLobby';
import MultiplayerGame from './components/MultiplayerGame';
import EditProfileModal from './components/EditProfileModal';
import PWAManager from './components/PWAManager';

import { AudioProvider } from './contexts/AudioContext';
import { supabase } from './utils/supabaseClient';
import { CartoonAvatar } from './components/CartoonAvatars';
import { ShoppingCart, Trophy, Gamepad2, BookOpen, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [players, setPlayers] = useState([]);
  const [gameConfig, setGameConfig] = useState(null);
  const [winners, setWinners] = useState(null); // 'Civilian' or 'Impostors'
  const [showSettings, setShowSettings] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);

  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [authSkipped, setAuthSkipped] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);

  // Touch swipe gesture for main tabs navigation (Clash Royale style)
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const [slideDirection, setSlideDirection] = useState(0);

  const navigateToScreen = (newScreen) => {
    const mainTabs = ['leaderboard', 'home', 'how-to-play'];
    const prevIdx = mainTabs.indexOf(currentScreen);
    const nextIdx = mainTabs.indexOf(newScreen);

    if (prevIdx !== -1 && nextIdx !== -1) {
      setSlideDirection(nextIdx - prevIdx);
    } else {
      setSlideDirection(0);
    }
    setCurrentScreen(newScreen);
  };

  const handleTouchStart = (e) => {
    if (['leaderboard', 'home', 'how-to-play'].includes(currentScreen)) {
      setTouchStartX(e.targetTouches[0].clientX);
      setTouchEndX(e.targetTouches[0].clientX);
    }
  };

  const handleTouchMove = (e) => {
    if (touchStartX !== null) {
      setTouchEndX(e.targetTouches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const isSwipeLeft = distance > 50;
    const isSwipeRight = distance < -50;

    const mainTabs = ['leaderboard', 'home', 'how-to-play'];
    const currentIndex = mainTabs.indexOf(currentScreen);

    if (currentIndex !== -1) {
      if (isSwipeLeft && currentIndex < mainTabs.length - 1) {
        navigateToScreen(mainTabs[currentIndex + 1]);
      } else if (isSwipeRight && currentIndex > 0) {
        navigateToScreen(mainTabs[currentIndex - 1]);
      }
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Trigger profile setup modal for new Google OAuth logins
  useEffect(() => {
    if (user && profileData) {
      const isGoogleLogin = user.app_metadata?.provider === 'google' || user.identities?.some(id => id.provider === 'google');
      const hasCustomized = profileData.unlocked_items?.includes('profile_customized') || localStorage.getItem('spyMals_profile_customized') === 'true';
      
      if (isGoogleLogin && !hasCustomized && currentScreen === 'home') {
        setShowSetupModal(true);
      }
    }
  }, [user, profileData, currentScreen]);

  // Check auth session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user.user_metadata);
      } else {
        loadLocalProfile();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user.user_metadata);
      } else {
        setUser(null);
        setProfileData(null);
        loadLocalProfile();
      }
    });

  }, []);

  // Update dynamic body theme
  useEffect(() => {
    const activeTheme = profileData?.equipped_theme || 'safari';
    document.body.className = `theme-${activeTheme}`;
  }, [profileData?.equipped_theme]);

  const fetchProfile = async (userId, userMetadata = null) => {
    try {
      const { data, error } = await supabase
        .from('spymals_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data && !error) {
        setProfileData(data);
      } else {
        // Create default profile for OAuth/Google login if not exists
        const defaultProfile = {
          id: userId,
          username: userMetadata?.full_name || userMetadata?.name || "Agent Mystère",
          avatar_emoji: userMetadata?.avatar_url || 'fox-detective',
          coins: 150,
          xp: 0,
          level: 1,
          unlocked_items: ['default'],
          equipped_color: 'default',
          equipped_banner: 'default',
          equipped_theme: 'safari'
        };

        const { data: inserted, error: insertError } = await supabase
          .from('spymals_profiles')
          .insert(defaultProfile)
          .select()
          .single();

        if (inserted && !insertError) {
          setProfileData(inserted);
        } else {
          setProfileData(defaultProfile);
        }
      }
    } catch (e) {
      console.error("Failed to fetch/create profile", e);
    }
  };

  const handleSaveSetupProfile = async (updatedData) => {
    const currentUnlocked = updatedData.unlocked_items || [];
    const newUnlocked = currentUnlocked.includes('profile_customized') 
      ? currentUnlocked 
      : [...currentUnlocked, 'profile_customized'];

    const finalData = { ...updatedData, unlocked_items: newUnlocked };
    setProfileData(finalData);
    setShowSetupModal(false);
    
    // Save to local storage as fallback/redundancy
    localStorage.setItem('spyMals_profile_customized', 'true');

    if (user) {
      await supabase
        .from('spymals_profiles')
        .update({
          username: finalData.username,
          avatar_emoji: finalData.avatar_emoji,
          unlocked_items: finalData.unlocked_items
        })
        .eq('id', user.id);
    }
  };

  const loadLocalProfile = () => {
    try {
      const stored = localStorage.getItem('spyMals_guest_profile');
      if (stored) {
        setProfileData(JSON.parse(stored));
      } else {
        const defaultGuest = {
          username: "Agent Invité",
          avatar_emoji: 'fox-detective',
          coins: 100,
          xp: 0,
          level: 1,
          games_played: 0,
          games_won: 0,
          unlocked_items: ['default'],
          equipped_color: 'default',
          equipped_banner: 'default',
          equipped_theme: 'safari'
        };
        setProfileData(defaultGuest);
        localStorage.setItem('spyMals_guest_profile', JSON.stringify(defaultGuest));
      }
    } catch (e) {
      console.error("Failed to load local guest profile", e);
    }
  };

  const handleUpdateProfile = (updatedProfile) => {
    setProfileData(updatedProfile);
    if (!user) {
      localStorage.setItem('spyMals_guest_profile', JSON.stringify(updatedProfile));
    }
  };

  const handleLogout = async () => {
    if (user) {
      await supabase.auth.signOut();
    } else {
      // Guest clicking "Connect" -> show Auth screen again
      setAuthSkipped(false);
    }
  };

  const handleUpdateHistory = (newHistory) => {
    setGameHistory(newHistory);
    localStorage.setItem('spyMals_history', JSON.stringify(newHistory));
  };

  // Load history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('spyMals_history');
      if (stored) {
        setGameHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  const startNewMission = () => {
    setCurrentScreen('setup');
  };

  const confirmPlayerCount = (count) => {
    const animals = [
      { id: 'fox-detective', name: 'Renard' },
      { id: 'spy-cat', name: 'Chat' },
      { id: 'ninja-frog', name: 'Grenouille' },
      { id: 'panda-monocle', name: 'Panda' },
      { id: 'koala-agent', name: 'Koala' },
      { id: 'detective-lion', name: 'Lion' },
      { id: 'tiger-covert', name: 'Tigre' },
      { id: 'hacker-owl', name: 'Chouette' },
      { id: 'agent-dog', name: 'Chien' },
      { id: 'penguin-secret', name: 'Pingouin' }
    ];

    // Shuffle animals for random assignment
    const shuffledAnimals = [...animals].sort(() => Math.random() - 0.5);

    // Generate players with unique animals
    const newPlayers = Array.from({ length: count }, (_, i) => {
      const animal = shuffledAnimals[i % shuffledAnimals.length];
      
      // Inject device profile owner as Player 1
      if (i === 0 && profileData) {
        const isImage = profileData.avatar_emoji?.startsWith('data:image/');
        return {
          id: i + 1,
          name: profileData.username || 'Agent Secret',
          avatar: { 
            type: isImage ? 'image' : 'emoji', 
            value: profileData.avatar_emoji || 'fox-detective' 
          },
          isCustom: true,
          score: 0,
          pseudoColor: profileData.equipped_color && profileData.equipped_color !== 'default'
            ? `text-${profileData.equipped_color === 'lime' ? 'spy-lime' : profileData.equipped_color === 'orange' ? 'spy-orange' : profileData.equipped_color === 'pink' ? 'pink-400' : profileData.equipped_color === 'cyan' ? 'cyan-400' : 'yellow-400 font-extrabold shadow-glow'}`
            : 'text-white'
        };
      }

      return {
        id: i + 1,
        name: `Agent ${animal.name}${i >= shuffledAnimals.length ? ` ${Math.floor(i / shuffledAnimals.length) + 1}` : ''}`,
        avatar: { type: 'emoji', value: animal.id },
        isCustom: false,
        score: 0,
      };
    });

    setPlayers(newPlayers);
    setCurrentScreen('identify');
  };

  const confirmTeam = () => {
    setCurrentScreen('briefing');
  };

  const startGame = (config) => {
    setGameConfig(config);
    setCurrentScreen('game');
  };

  const handleGameEnd = (winningRoles) => {
    // winningRoles is array: ['Civilian'] or ['Undercover', 'Mr. White']
    const winningTeamName = winningRoles.includes('Civilian') ? ['Civilian'] : ['Impostors'];
    setWinners(winningTeamName);

    // Update scores
    setPlayers(currentPlayers => currentPlayers.map(player => {
      // Determine player's team based on role assignment which is in GameSession, 
      // BUT we don't have roles in 'players' state here properly persisted for scoring usually.
      // Wait, 'players' state doesn't have roles. GameSession assigns them.
      // We need GameSession to pass back the updated players with roles OR pass back which IDs won.
      return player;
    }));

    // Actually, GameSession should calculate who won and tell App.
    // Let's adjust: GameSession will pass the IDs of winners or we simplify.
    // Simplifying: We will trust that game session knows who is who.
    // However, App needs to know roles to award points. 
    // Let's pass the roles back from GameSession or better yet, have GameSession allow us to update scores.

    // BETTER APPROACH: GameSession calls onGameEnd with (winningTeam, rolesMap)
    // winningTeam: 'Civilian' or 'Impostors'
    // rolesMap: { playerId: 'Civilian' | 'Undercover' | 'Mr. White' }
  };

  // Official Undercover scoring barème
  const getPoints = (winningTeam, role) => {
    if (winningTeam === 'Civilian' && role === 'Civilian') return 2;
    if (winningTeam === 'Impostors' && role === 'Undercover') return 10;
    if (winningTeam === 'Impostors' && role === 'Mr. White') return 6;
    return 0;
  };

  // Revised handleGameEnd to accept winners info properly
  const handleScoreUpdate = (winningTeam, playerRoles) => {
    setWinners(winningTeam === 'Civilian' ? ['Civilian'] : ['Impostors']);

    setPlayers(prevPlayers => prevPlayers.map(p => {
      const role = playerRoles[p.id];
      const pts = getPoints(winningTeam, role);

      return {
        ...p,
        score: (p.score || 0) + pts
      };
    }));

    setCurrentScreen('scoreboard');

    // Update Persistent Leaderboard
    try {
      const stored = localStorage.getItem('spyMals_leaderboard');
      let leaderboard = stored ? JSON.parse(stored) : {};

      const currentPlayers = [...players];

      currentPlayers.forEach(p => {
        const role = playerRoles[p.id];
        const pts = getPoints(winningTeam, role);

        const key = p.name.toLowerCase().trim();

        if (!leaderboard[key]) {
          leaderboard[key] = {
            name: p.name,
            avatar: p.avatar,
            score: 0,
            games: 0,
            wins: 0
          };
        }

        // Update stats
        leaderboard[key].games += 1;
        leaderboard[key].score += pts;
        if (pts > 0) {
          leaderboard[key].wins += 1;
        }
        // Update avatar to latest used
        leaderboard[key].avatar = p.avatar;
      });

      localStorage.setItem('spyMals_leaderboard', JSON.stringify(leaderboard));

      // ── UPDATE HISTORY ──
      try {
        const historyEntry = {
          id: Date.now(),
          date: new Date().toISOString(),
          players: [...players]
        };
        const updatedHistory = [historyEntry, ...gameHistory].slice(0, 20); // Keep last 20
        setGameHistory(updatedHistory);
        localStorage.setItem('spyMals_history', JSON.stringify(updatedHistory));
      } catch (historyErr) {
        console.error("Failed to save history", historyErr);
      }

    } catch (e) {
      console.error("Failed to save leaderboard", e);
    }

    // ── GAMIFICATION REWARDS ──
    if (profileData) {
      let earnedXp = 50;
      let earnedCoins = 20;
      let won = false;

      // Check if user's profile username is one of the players
      const userPlayer = players.find(p => p.name.toLowerCase().trim() === profileData.username.toLowerCase().trim());
      if (userPlayer) {
        const role = playerRoles[userPlayer.id];
        const pts = getPoints(winningTeam, role);
        if (pts > 0) {
          won = true;
          earnedXp = 100;
          earnedCoins = 40;
        } else {
          won = false;
          earnedXp = 50;
          earnedCoins = 20;
        }
      } else {
        // Default rewards if not directly in the list
        won = winningTeam === 'Civilian';
        earnedXp = won ? 80 : 40;
        earnedCoins = won ? 30 : 15;
      }

      // Calculate level up
      let newXp = (profileData.xp || 0) + earnedXp;
      let newLevel = profileData.level || 1;
      let newCoins = (profileData.coins || 0) + earnedCoins;
      
      let xpNeeded = newLevel * 150;

      while (newXp >= xpNeeded) {
        newXp -= xpNeeded;
        newLevel += 1;
        newCoins += 100; // Level up bonus!
        xpNeeded = newLevel * 150;
      }

      const updatedProfile = {
        ...profileData,
        xp: newXp,
        level: newLevel,
        coins: newCoins,
        games_played: (profileData.games_played || 0) + 1,
        games_won: (profileData.games_won || 0) + (won ? 1 : 0)
      };

      handleUpdateProfile(updatedProfile);

      // Save to Supabase if logged in
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
            if (error) console.error("Error updating profile stats on Supabase:", error.message);
          });
      }
    }
  };

  const replayGame = () => {
    // Shuffle animals again? No, user asked "same team" (probably means same players)
    // We keep players but resetting roles is handled by GameSession on mount.
    // We just go back to briefing to verify roles settings or start?
    // "Rejouer avec la même équipe" -> usually means skip setup/identify.
    // Let's go to Briefing so they can adjust spies count if they want.
    setCurrentScreen('briefing');
  };

  if (!user && !authSkipped) {
    return (
      <AudioProvider>
        <Auth 
          onAuthSuccess={(userData) => { 
            setUser(userData); 
            setAuthSkipped(true);
            fetchProfile(userData.id); 
          }} 
          onSkip={() => setAuthSkipped(true)} 
        />
      </AudioProvider>
    );
  }

  const isMenuScreen = ['home', 'leaderboard', 'how-to-play', 'profile', 'shop', 'history'].includes(currentScreen);

  return (
    <AudioProvider>
      <div className="antialiased text-gray-900 bg-spy-blue min-h-screen relative overflow-x-hidden">
        <PWAManager />
        
        {/* Top Header for Menu Screens */}
        {isMenuScreen && (
          <div className="fixed top-2 left-0 right-0 z-40 px-3 pointer-events-none">
            <div className="max-w-md mx-auto pointer-events-auto">
              <div className="bg-slate-950/95 backdrop-blur-2xl border-2 border-white/15 rounded-2xl h-14 px-3 flex items-center justify-between shadow-[0_12px_35px_rgba(0,0,0,0.85)]">
                {/* Top Left: Boutique (Caddie 3D) */}
                <button
                  onClick={() => setCurrentScreen('shop')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all duration-200 transform active:scale-95 cursor-pointer shadow-md group ${
                    currentScreen === 'shop'
                      ? 'bg-spy-lime text-spy-blue border-white shadow-spy-lime/40 font-black scale-105'
                      : 'bg-white/5 border-white/15 text-white/90 hover:bg-white/10 hover:border-spy-lime/50'
                  }`}
                  title="Boutique"
                >
                  <img src="/shop_icon_3d.svg" alt="Boutique" className="w-6 h-6 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Boutique</span>
                </button>

                {/* Center: 3D Croquette Coin Counter (No blinking animation) */}
                <div className="bg-slate-900/95 border border-spy-lime/50 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-black text-white shadow-inner select-none transition-transform duration-200 hover:scale-105">
                  <img src="/croquette_coin_3d.png" alt="Croquettes" className="w-5 h-5 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                  <span className="text-spy-lime font-black text-xs tracking-tight">{profileData?.coins || 0}</span>
                </div>

                {/* Top Right: Agent Profile Button (Enlarged Avatar) */}
                <button
                  onClick={() => setCurrentScreen('profile')}
                  className={`flex items-center gap-1.5 p-0.5 pr-2.5 rounded-full border transition-all duration-200 transform active:scale-95 cursor-pointer shadow-md group ${
                    currentScreen === 'profile'
                      ? 'bg-spy-lime/20 border-spy-lime text-spy-lime shadow-spy-lime/30 scale-105'
                      : 'bg-white/5 border-white/15 text-white/90 hover:bg-white/10 hover:border-spy-lime/50'
                  }`}
                  title="Profil Agent"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-spy-lime overflow-hidden flex-shrink-0 shadow-md transform group-hover:scale-105 transition-transform duration-300">
                    <CartoonAvatar id={profileData?.avatar_emoji} className="w-full h-full border-none shadow-none" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider">Profil</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div 
          className={isMenuScreen ? "h-screen h-[100dvh] overflow-hidden relative" : ""}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="popLayout" custom={slideDirection}>
            <motion.div
              key={currentScreen}
              custom={slideDirection}
              initial={{ x: slideDirection > 0 ? 300 : slideDirection < 0 ? -300 : 0, opacity: 0.7 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: slideDirection < 0 ? 300 : slideDirection > 0 ? -300 : 0, opacity: 0.7 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full h-full"
            >
              {currentScreen === 'home' && (
                <Home
                  profileData={profileData}
                  hasHistory={gameHistory.length > 0}
                  onStartGame={startNewMission}
                  onOpenHowToPlay={() => navigateToScreen('how-to-play')}
                  onOpenSettings={() => setShowSettings(true)}
                  onOpenLeaderboard={() => navigateToScreen('leaderboard')}
                  onOpenHistory={() => setCurrentScreen('history')}
                  onOpenProfile={() => setCurrentScreen('profile')}
                  onOpenMultiplayer={() => setCurrentScreen('multiplayer-lobby')}
                />
              )}
              {currentScreen === 'how-to-play' && (
                <HowToPlay
                  onBack={() => navigateToScreen('home')}
                  onOpenSettings={() => setShowSettings(true)}
                />
              )}
              {currentScreen === 'setup' && (
                <PlayerSetup
                  onNext={confirmPlayerCount}
                  onBack={() => setCurrentScreen('home')}
                  onOpenSettings={() => setShowSettings(true)}
                />
              )}
              {currentScreen === 'identify' && (
                <IdentifyAgents
                  players={players}
                  onUpdatePlayers={setPlayers}
                  onConfirm={confirmTeam}
                  onBack={() => setCurrentScreen('setup')}
                  onOpenSettings={() => setShowSettings(true)}
                />
              )}
              {currentScreen === 'briefing' && (
                <MissionBriefing
                  totalPlayers={players.length}
                  onStartGame={startGame}
                  onBack={() => setCurrentScreen('identify')}
                  onOpenSettings={() => setShowSettings(true)}
                />
              )}
              {currentScreen === 'game' && (
                <GameSession
                  players={players}
                  config={gameConfig}
                  onEndGame={handleScoreUpdate}
                  onAbort={() => setCurrentScreen('home')}
                  onOpenSettings={() => setShowSettings(true)}
                />
              )}
              {currentScreen === 'scoreboard' && (
                <Scoreboard
                  players={players}
                  winners={winners}
                  onReplay={replayGame}
                  onHome={() => setCurrentScreen('home')}
                  onOpenSettings={() => setShowSettings(true)}
                />
              )}
              {currentScreen === 'leaderboard' && (
                <Leaderboard
                  onBack={() => navigateToScreen('home')}
                  onOpenSettings={() => setShowSettings(true)}
                />
              )}
              {currentScreen === 'history' && (
                <History
                  history={gameHistory}
                  onUpdateHistory={handleUpdateHistory}
                  onReplayTeam={(teamPlayers) => {
                    setPlayers(teamPlayers);
                    setCurrentScreen('identify');
                  }}
                  onBack={() => setCurrentScreen('home')}
                  onOpenSettings={() => setShowSettings(true)}
                />
              )}
              {currentScreen === 'profile' && (
                <Profile
                  user={user}
                  profileData={profileData}
                  onUpdateProfile={handleUpdateProfile}
                  onLogout={handleLogout}
                  onBack={() => setCurrentScreen('home')}
                  onOpenShop={() => setCurrentScreen('shop')}
                />
              )}
              {currentScreen === 'shop' && (
                <Shop
                  user={user}
                  profileData={profileData}
                  onUpdateProfile={handleUpdateProfile}
                  onBack={() => setCurrentScreen('home')}
                />
              )}
              {currentScreen === 'multiplayer-lobby' && (
                <MultiplayerLobby
                  user={user}
                  profileData={profileData}
                  onStartMultiplayerGame={(roomData) => {
                    setMultiplayerRoom(roomData);
                    setCurrentScreen('multiplayer-game');
                  }}
                  onBack={() => setCurrentScreen('home')}
                />
              )}
              {currentScreen === 'multiplayer-game' && (
                <MultiplayerGame
                  user={user}
                  profileData={profileData}
                  initialRoom={multiplayerRoom}
                  onUpdateProfile={handleUpdateProfile}
                  onLeave={() => {
                    setMultiplayerRoom(null);
                    setCurrentScreen('multiplayer-lobby');
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Floating Navigation Bar (3D Cartoon Graphiste Style with Clash Royale Swiping) */}
        {isMenuScreen && (
          <div className="fixed bottom-3 left-0 right-0 z-40 px-3.5 pointer-events-none select-none">
            <div className="max-w-md mx-auto pointer-events-auto">
              <div className="bg-slate-950/95 backdrop-blur-2xl border-2 border-white/20 rounded-3xl p-2 shadow-[0_16px_45px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.12)] flex items-center justify-between relative">
                
                {/* Tab 1: Classement */}
                <button
                  onClick={() => navigateToScreen('leaderboard')}
                  className={`flex-1 flex flex-col items-center justify-center py-1 relative z-10 transition-all duration-300 transform cursor-pointer active:scale-90 group ${
                    currentScreen === 'leaderboard' ? 'text-spy-lime font-black' : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 transform group-hover:-translate-y-1 ${
                    currentScreen === 'leaderboard'
                      ? 'bg-gradient-to-b from-spy-lime/30 via-spy-lime/10 to-slate-900 border-2 border-spy-lime shadow-[0_0_22px_rgba(204,255,0,0.6)] scale-110 -translate-y-0.5'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}>
                    <img src="/trophy_icon_3d.svg" alt="Classement" className="w-7 h-7 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {currentScreen === 'leaderboard' && <div className="w-1.5 h-1.5 rounded-full bg-spy-lime shadow-[0_0_8px_#ccff00]"></div>}
                    <span className={`text-[9px] font-black uppercase tracking-wider transition-colors duration-300 ${
                      currentScreen === 'leaderboard' ? 'text-spy-lime drop-shadow-[0_1px_4px_rgba(204,255,0,0.3)]' : 'text-white/40'
                    }`}>
                      Classement
                    </span>
                  </div>
                </button>

                {/* Tab 2: Center Hero Play Button */}
                <div className="flex-1 flex justify-center relative -translate-y-5 z-20">
                  <button
                    onClick={() => navigateToScreen('home')}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-b from-[#d9ff33] via-spy-lime to-[#77aa00] border-3 border-white flex flex-col items-center justify-center shadow-[0_12px_28px_rgba(204,255,0,0.55),0_4px_0_#446600,inset_0_1px_0_rgba(255,255,255,0.5)] active:translate-y-1 active:shadow-[0_2px_0_#446600] transition-all duration-300 cursor-pointer group ${
                      currentScreen === 'home' ? 'shadow-[0_0_25px_rgba(204,255,0,0.85),0_4px_0_#446600] scale-105 ring-2 ring-spy-lime/60' : 'hover:scale-105'
                    }`}
                    title="Jouer"
                  >
                    <img src="/gamepad_icon_3d.svg" alt="Jouer" className="w-9 h-9 object-contain transform group-hover:scale-115 group-hover:rotate-3 transition-transform duration-300 filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.4)]" />
                    <span className="text-[8px] font-black uppercase tracking-tighter text-slate-950 -mt-0.5">JOUER</span>
                  </button>
                </div>

                {/* Tab 3: Guide */}
                <button
                  onClick={() => navigateToScreen('how-to-play')}
                  className={`flex-1 flex flex-col items-center justify-center py-1 relative z-10 transition-all duration-300 transform cursor-pointer active:scale-90 group ${
                    currentScreen === 'how-to-play' ? 'text-spy-lime font-black' : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 transform group-hover:-translate-y-1 ${
                    currentScreen === 'how-to-play'
                      ? 'bg-gradient-to-b from-spy-lime/30 via-spy-lime/10 to-slate-900 border-2 border-spy-lime shadow-[0_0_22px_rgba(204,255,0,0.6)] scale-110 -translate-y-0.5'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}>
                    <img src="/guide_icon_3d.svg" alt="Guide" className="w-7 h-7 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transform group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300" />
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {currentScreen === 'how-to-play' && <div className="w-1.5 h-1.5 rounded-full bg-spy-lime shadow-[0_0_8px_#ccff00]"></div>}
                    <span className={`text-[9px] font-black uppercase tracking-wider transition-colors duration-300 ${
                      currentScreen === 'how-to-play' ? 'text-spy-lime drop-shadow-[0_1px_4px_rgba(204,255,0,0.3)]' : 'text-white/40'
                    }`}>
                      Guide
                    </span>
                  </div>
                </button>

              </div>
            </div>
          </div>
        )}

        {/* Settings Overlay */}
        {showSettings && (
          <div className="fixed inset-0 z-[100]">
            <Settings
              onBack={() => setShowSettings(false)}
            />
          </div>
        )}
        
        {/* Force profile setup for new Google logins */}
        {showSetupModal && (
          <EditProfileModal
            profileData={profileData}
            onSave={handleSaveSetupProfile}
            onClose={() => setShowSetupModal(false)}
            isForce={true}
          />
        )}
      </div>
    </AudioProvider>
  );
}

export default App;
