import React from 'react';
import BouncyButton from './BouncyButton';

const Settings = ({ onBack, volume, setVolume }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-spy-blue relative">

            <div className="w-full max-w-md bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl backdrop-blur-md">

                <h2 className="text-3xl font-black text-center text-white uppercase tracking-tighter mb-10">
                    Paramètres
                </h2>

                {/* Volume Control */}
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-white font-bold uppercase tracking-widest">Musique & Sons</span>
                        <span className="text-spy-lime font-black text-xl">{Math.round(volume * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-full h-4 bg-black/40 rounded-full appearance-none cursor-pointer accent-spy-lime hover:accent-spy-orange transition-colors"
                    />
                </div>

                {/* Credits */}
                <div className="text-center text-white/30 text-xs font-bold uppercase tracking-widest mb-8">
                    SpyMals v1.0.0
                    <br />
                    Développé pour la mission
                </div>

                <BouncyButton onClick={onBack} variant="secondary" className="w-full">
                    RETOUR
                </BouncyButton>

            </div>
        </div>
    );
};

export default Settings;
