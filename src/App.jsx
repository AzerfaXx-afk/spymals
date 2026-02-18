import React, { useState } from 'react';
import Home from './components/Home';
import PlayerSetup from './components/PlayerSetup';
import IdentifyAgents from './components/IdentifyAgents';
import MissionBriefing from './components/MissionBriefing';
import GameSession from './components/GameSession';
import HowToPlay from './components/HowToPlay';
import Settings from './components/Settings';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [players, setPlayers] = useState([]);
  const [gameConfig, setGameConfig] = useState(null);
  const [volume, setVolume] = useState(0.8);

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

    // Generate players with unique animals
    const newPlayers = Array.from({ length: count }, (_, i) => {
      const animal = animals[i % animals.length];
      return {
        id: i + 1,
        // If we run out of unique names, append number
        name: `Agent ${animal.name}${i >= animals.length ? ` ${Math.floor(i / animals.length) + 1}` : ''}`,
        avatar: { type: 'emoji', value: animal.emoji },
        isCustom: false,
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

  return (
    <div className="antialiased text-gray-900 bg-spy-blue min-h-screen">
      {currentScreen === 'home' && (
        <Home
          onStartGame={startNewMission}
          onOpenHowToPlay={() => setCurrentScreen('how-to-play')}
          onOpenSettings={() => setCurrentScreen('settings')}
        />
      )}
      {currentScreen === 'how-to-play' && (
        <HowToPlay onBack={() => setCurrentScreen('home')} />
      )}
      {currentScreen === 'settings' && (
        <Settings
          onBack={() => setCurrentScreen('home')}
          volume={volume}
          setVolume={setVolume}
        />
      )}
      {currentScreen === 'setup' && <PlayerSetup onNext={confirmPlayerCount} />}
      {currentScreen === 'identify' && (
        <IdentifyAgents
          players={players}
          onUpdatePlayers={setPlayers}
          onConfirm={confirmTeam}
        />
      )}
      {currentScreen === 'briefing' && (
        <MissionBriefing
          totalPlayers={players.length}
          onStartGame={startGame}
        />
      )}
      {currentScreen === 'game' && (
        <GameSession
          players={players}
          config={gameConfig}
          onEndGame={() => setCurrentScreen('home')}
        />
      )}
    </div>
  );
}

export default App;
