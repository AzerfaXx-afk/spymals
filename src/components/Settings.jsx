import React from 'react';
import { useAudio } from '../contexts/AudioContext';
import { Music, Volume2, X, Sliders } from 'lucide-react';

const Settings = ({ onBack }) => {
    const { musicVolume, setMusicVolume, sfxVolume, setSfxVolume } = useAudio();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-pop-in">
            <div className="card-cartoon w-full max-w-sm p-6 relative flex flex-col items-center shadow-[0_25px_60px_rgba(0,0,0,0.95)] bg-gradient-to-b from-[#14233e]/98 via-[#0d182b]/98 to-[#0a1426]/98 border-[3.5px] border-spy-lime rounded-[36px] overflow-hidden space-y-5">
                
                {/* Close Button [X] */}
                <button
                    onClick={onBack}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-white hover:bg-white/20 cursor-pointer active:scale-90 transition-all shadow-[0_2px_0_#000] z-20"
                    title="Fermer"
                >
                    <X className="w-5 h-5 text-current stroke-[2.5]" />
                </button>

                {/* Header Icon & Title */}
                <div className="flex flex-col items-center text-center space-y-1">
                    <div className="w-12 h-12 rounded-full bg-spy-lime/20 border-2 border-spy-lime flex items-center justify-center text-spy-lime shadow-[0_0_20px_rgba(204,255,0,0.4)] animate-pulse-slow">
                        <Sliders className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight text-shadow-md">
                        PARAMÈTRES
                    </h2>
                    <div className="w-10 h-1 bg-spy-lime rounded-full"></div>
                </div>

                {/* Music Volume Control */}
                <div className="w-full bg-black/40 border-2 border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Music className="w-4 h-4 text-spy-lime" />
                            <span className="text-white font-black uppercase text-xs tracking-wider">Musique</span>
                        </div>
                        <span className="text-spy-lime font-black text-sm bg-spy-lime/10 px-2.5 py-0.5 rounded-lg border border-spy-lime/30">
                            {Math.round(musicVolume * 100)}%
                        </span>
                    </div>

                    <div className="relative h-6 flex items-center">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={musicVolume}
                            onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                            className="w-full h-2.5 bg-slate-900 border border-white/20 rounded-full appearance-none cursor-pointer z-10 
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-spy-lime 
                            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black
                            [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(204,255,0,0.6)] 
                            [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-110
                            "
                        />
                    </div>
                </div>

                {/* SFX Volume Control */}
                <div className="w-full bg-black/40 border-2 border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Volume2 className="w-4 h-4 text-spy-lime" />
                            <span className="text-white font-black uppercase text-xs tracking-wider">Effets Sonores</span>
                        </div>
                        <span className="text-spy-lime font-black text-sm bg-spy-lime/10 px-2.5 py-0.5 rounded-lg border border-spy-lime/30">
                            {Math.round(sfxVolume * 100)}%
                        </span>
                    </div>

                    <div className="relative h-6 flex items-center">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={sfxVolume}
                            onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                            className="w-full h-2.5 bg-slate-900 border border-white/20 rounded-full appearance-none cursor-pointer z-10 
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-spy-lime 
                            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black
                            [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(204,255,0,0.6)] 
                            [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-110
                            "
                        />
                    </div>
                </div>

                {/* Confirm Button */}
                <button
                    onClick={onBack}
                    className="btn-cartoon-primary w-full py-3.5 text-xs font-black uppercase tracking-wider shadow-[0_4px_0_#000] cursor-pointer active:translate-y-1 transition-all"
                >
                  OK
                </button>

            </div>
        </div>
    );
};

export default Settings;
