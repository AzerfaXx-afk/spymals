import React from 'react';
import BouncyButton from './BouncyButton';

const Home = ({ onStartGame, onOpenSettings, onOpenHowToPlay }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center relative overflow-hidden bg-spy-blue">

      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-spy-lime opacity-20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-spy-orange opacity-20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>

      {/* Hero Section */}
      <div className="z-10 flex flex-col items-center mb-12 animate-bounce-slow">
        <div className="text-8xl mb-4 filter drop-shadow-xl transform hover:rotate-12 transition-transform cursor-pointer">
          🕵️‍♂️
        </div>
        <h1 className="text-6xl font-black text-white tracking-tighter drop-shadow-lg font-display">
          <span className="text-spy-lime">Spy</span>
          <span className="text-spy-orange">Mals</span>
        </h1>
        <p className="text-white/80 font-bold mt-2 text-lg tracking-wide uppercase">
          Démasquez l'imposteur !
        </p>
      </div>

      {/* Actions */}
      <div className="z-10 w-full max-w-sm space-y-4">
        <BouncyButton onClick={onStartGame} className="text-2xl py-6 shadow-spy-lime/50 shadow-lg">
          NOUVELLE MISSION
        </BouncyButton>

        <div className="grid grid-cols-2 gap-4">
          <BouncyButton variant="secondary" onClick={onOpenHowToPlay} className="text-sm">
            COMMENT JOUER ?
          </BouncyButton>
          <BouncyButton variant="secondary" onClick={onOpenSettings} className="text-sm">
            PARAMÈTRES
          </BouncyButton>
        </div>
      </div>

      <div className="absolute bottom-4 text-white/30 text-xs font-bold uppercase tracking-widest">
        v1.0.0 • Secret Défense
      </div>
    </div>
  );
};

export default Home;
