import React, { useState } from 'react';
import Home from './components/Home';
import PlayerSetup from './components/PlayerSetup';
import IdentifyAgents from './components/IdentifyAgents';
import MissionBriefing from './components/MissionBriefing';
import GameSession from './components/GameSession';
import Scoreboard from './components/Scoreboard';
import HowToPlay from './components/HowToPlay';
import Settings from './components/Settings';
import Leaderboard from './components/Leaderboard';
import PocketPartyHome from './components/PocketPartyHome';
import AffaireClassee from './components/affaire/AffaireClassee';

import { AudioProvider } from './contexts/AudioContext';

function App() {
  const [activeGame, setActiveGame] = useState('hub');
  const [currentScreen, setCurrentScreen] = useState('home');
  const [players, setPlayers] = useState([]);
  const [gameConfig, setGameConfig] = useState(null);
  const [winners, setWinners] = useState(null); // 'Civilian' or 'Impostors'

  const [showSettings, setShowSettings] = useState(false);

  const handleLaunchGame = (gameId) => {
    setActiveGame(gameId);
    setCurrentScreen('home');
  };

  const goBackToHub = () => {
    setActiveGame('hub');
  };

  const startNewMission = () => {
    setCurrentScreen('setup');
  };

  const confirmPlayerCount = (count) => {
    const animals = [
      { emoji: '🦁', name: 'Lion' },
      { emoji: '🦊', name: 'Renard' },
      { emoji: '🐼', name: 'Panda' },
      { emoji: '🐨', name: 'Koala' },
      { emoji: '🐯', name: 'Tigre' },
      { emoji: '🐵', name: 'Singe' },
      { emoji: '🐸', name: 'Grenouille' },
      { emoji: '🦉', name: 'Hibou' },
      { emoji: '🦄', name: 'Licorne' },
      { emoji: '🐙', name: 'Poulpe' },
      { emoji: '🐮', name: 'Vache' },
      { emoji: '🐷', name: 'Cochon' },
      { emoji: '🐭', name: 'Souris' },
      { emoji: '🐰', name: 'Lapin' },
      { emoji: '🐻', name: 'Ours' },
      { emoji: '🐲', name: 'Dragon' },
      { emoji: '🦖', name: 'T-Rex' },
      { emoji: '🦈', name: 'Requin' },
      { emoji: '🦀', name: 'Crabe' },
      { emoji: '🦋', name: 'Papillon' },
    ];

    // Shuffle animals for random assignment
    const shuffledAnimals = [...animals].sort(() => Math.random() - 0.5);

    // Generate players with unique animals
    const newPlayers = Array.from({ length: count }, (_, i) => {
      const animal = shuffledAnimals[i % shuffledAnimals.length];
      return {
        id: i + 1,
        // If we run out of unique names, append number (unlikely with 20 animals and max 20 players)
        name: `Agent ${animal.name}${i >= shuffledAnimals.length ? ` ${Math.floor(i / shuffledAnimals.length) + 1}` : ''}`,
        avatar: { type: 'emoji', value: animal.emoji },
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

  // Revised handleGameEnd to accept winners info properly
  const handleScoreUpdate = (winningTeam, playerRoles) => {
    setWinners(winningTeam === 'Civilian' ? ['Civilian'] : ['Impostors']);

    setPlayers(prevPlayers => prevPlayers.map(p => {
      const role = playerRoles[p.id];
      const isWinner = (winningTeam === 'Civilian' && role === 'Civilian') ||
        (winningTeam === 'Impostors' && (role === 'Undercover' || role === 'Mr. White'));

      return {
        ...p,
        score: (p.score || 0) + (isWinner ? 1 : 0)
      };
    }));

    setCurrentScreen('scoreboard');

    // Update Persistent Leaderboard
    try {
      const stored = localStorage.getItem('spyMals_leaderboard');
      let leaderboard = stored ? JSON.parse(stored) : {};

      const currentPlayers = [...players]; // Use the players state from before this update for names/avatars
      // actually we need to combine the update calculation with the persistence

      currentPlayers.forEach(p => {
        const role = playerRoles[p.id];
        const isWinner = (winningTeam === 'Civilian' && role === 'Civilian') ||
          (winningTeam === 'Impostors' && (role === 'Undercover' || role === 'Mr. White'));

        const key = p.name.toLowerCase().trim();

        if (!leaderboard[key]) {
          leaderboard[key] = {
            name: p.name,
            avatar: p.avatar.value,
            score: 0,
            games: 0,
            wins: 0
          };
        }

        // Update stats
        leaderboard[key].games += 1;
        if (isWinner) {
          leaderboard[key].score += 1; // 1 point per win
          leaderboard[key].wins += 1;
        }
        // Update avatar to latest used
        leaderboard[key].avatar = p.avatar.value;
      });

      localStorage.setItem('spyMals_leaderboard', JSON.stringify(leaderboard));

    } catch (e) {
      console.error("Failed to save leaderboard", e);
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

  return (
    <AudioProvider>
      {/* ── Hub Screen ── */}
      {activeGame === 'hub' && (
        <PocketPartyHome onSelectGame={handleLaunchGame} />
      )}

      {/* ── SpyMals Game ── */}
      {activeGame === 'spymals' && (
        <div className="antialiased text-gray-900 bg-spy-blue min-h-screen relative">
          {currentScreen === 'home' && (
            <Home
              onStartGame={startNewMission}
              onOpenHowToPlay={() => setCurrentScreen('how-to-play')}
              onOpenSettings={() => setShowSettings(true)}
              onOpenLeaderboard={() => setCurrentScreen('leaderboard')}
              onBackToHub={goBackToHub}
            />
          )}
          {currentScreen === 'how-to-play' && (
            <HowToPlay
              onBack={() => setCurrentScreen('home')}
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
              onBack={() => setCurrentScreen('home')}
              onOpenSettings={() => setShowSettings(true)}
            />
          )}

          {/* Settings Overlay */}
          {showSettings && (
            <div className="fixed inset-0 z-[100]">
              <Settings
                onBack={() => setShowSettings(false)}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Affaire Classée Game ── */}
      {activeGame === 'affaire' && (
        <AffaireClassee onBackToHub={goBackToHub} />
      )}
    </AudioProvider>
  );
}

export default App;
