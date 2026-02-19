import React, { useState } from 'react';
import BouncyButton from './BouncyButton';
import BackArrow from './BackArrow';
import SettingsGear from './SettingsGear';

const PlayerSetup = ({ onNext, onBack, onOpenSettings }) => {
    const [count, setCount] = useState(3);

    const increment = () => {
        if (count < 20) setCount(count + 1);
    };

    const decrement = () => {
        if (count > 3) setCount(count - 1);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 pt-24 bg-spy-blue relative overflow-hidden">
            <BackArrow onClick={onBack} />
            <SettingsGear onClick={onOpenSettings} />

            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Glass Card Container */}
            <div className="w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl flex flex-col items-center animate-slide-up z-10">

                <h2 className="text-3xl font-black text-white text-center mb-2 uppercase tracking-tight">
                    Joueurs
                </h2>
                <p className="text-white/50 text-sm font-bold mb-10 text-center uppercase tracking-widest">
                    Combien d'agents ?
                </p>

                {/* Counter Control */}
                <div className="flex items-center justify-between w-full mb-12 bg-black/20 rounded-2xl p-2 border border-white/5">
                    <BouncyButton
                        onClick={decrement}
                        variant="secondary"
                        className="w-16 h-16 text-3xl !rounded-xl"
                        disabled={count <= 3}
                        soundOptions={{ pitch: Math.max(0.5, 0.8 + ((count - 1 - 3) * 0.1)) }}
                    >
                        -
                    </BouncyButton>

                    <span className="text-6xl font-black text-white px-4 min-w-[3ch] text-center font-display drop-shadow-md">
                        {count}
                    </span>

                    <BouncyButton
                        onClick={increment}
                        variant="secondary"
                        className="w-16 h-16 text-3xl !rounded-xl"
                        disabled={count >= 20}
                        soundOptions={{ pitch: Math.min(3.0, 0.8 + ((count + 1 - 3) * 0.1)) }}
                    >
                        +
                    </BouncyButton>
                </div>

                {/* Navigation Actions */}
                <div className="w-full space-y-3">
                    <BouncyButton onClick={() => onNext(count)} className="text-xl py-5 w-full">
                        CONTINUER
                    </BouncyButton>

                    <BouncyButton onClick={onBack} variant="secondary" className="text-sm py-4 w-full">
                        RETOUR
                    </BouncyButton>
                </div>
            </div>
        </div>
    );
};

export default PlayerSetup;
