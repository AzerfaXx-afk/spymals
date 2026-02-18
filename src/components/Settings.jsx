import React from 'react';
import BouncyButton from './BouncyButton';
import BackArrow from './BackArrow';

const Settings = ({ onBack, volume, setVolume }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 pt-24 bg-spy-blue relative overflow-hidden">
            <BackArrow onClick={onBack} />

            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-[40px] p-8 border border-white/10 shadow-2xl animate-pop-in z-10">

                <h2 className="text-3xl font-black text-center text-white uppercase tracking-tighter mb-2">
                    Paramètres
                </h2>
                <div className="w-12 h-1 bg-spy-lime mx-auto rounded-full mb-10"></div>

                {/* Volume Control */}
                <div className="mb-12 bg-black/20 rounded-3xl p-6 border border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">🔊</span>
                            <span className="text-white font-bold uppercase tracking-widest text-sm">Volume Global</span>
                        </div>
                        <span className="text-spy-lime font-black text-xl bg-spy-lime/10 px-3 py-1 rounded-lg min-w-[3ch] text-center">
                            {Math.round(volume * 100)}%
                        </span>
                    </div>

                    <div className="relative h-6 flex items-center">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-full h-2 bg-black/40 rounded-full appearance-none cursor-pointer z-10 
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-spy-lime 
                            [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(204,255,0,0.5)] 
                            [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125
                            "
                        />
                        {/* Custom Track Fill visualization could go here if needed, but range input styling is limited in standard CSS without more complex structure */}
                    </div>
                </div>



                <BouncyButton onClick={onBack} variant="secondary" className="w-full py-5 shadow-xl">
                    RETOUR
                </BouncyButton>

            </div>
        </div>
    );
};

export default Settings;
