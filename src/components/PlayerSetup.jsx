import React, { useState } from 'react';
import BouncyButton from './BouncyButton';

const PlayerSetup = ({ onNext }) => {
    const [count, setCount] = useState(4); // Default 4 players

    const increment = () => {
        if (count < 20) setCount(count + 1);
    };

    const decrement = () => {
        if (count > 3) setCount(count - 1);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden bg-spy-blue">
            {/* Background Decor */}
            <div className="absolute top-[20%] right-[-10%] w-32 h-32 bg-spy-lime opacity-10 rounded-full blur-2xl animate-pulse-fast"></div>

            <div className="z-10 text-center mb-10">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-md">
                    Combien d'Agents ?
                </h2>
                <p className="text-white/60 font-bold mt-2">
                    Sélectionnez le nombre de joueurs
                </p>
            </div>

            {/* Counter Controls */}
            <div className="z-10 flex items-center justify-center space-x-8 mb-16">
                <BouncyButton
                    onClick={decrement}
                    variant="secondary"
                    className="w-20 h-20 rounded-full text-4xl shadow-lg disabled:opacity-50"
                    disabled={count <= 3}
                >
                    -
                </BouncyButton>

                <div className="flex flex-col items-center">
                    <span className="text-8xl font-black text-white drop-shadow-2xl font-display">
                        {count}
                    </span>
                    <span className="text-spy-lime font-bold uppercase tracking-widest">
                        JOUEURS
                    </span>
                </div>

                <BouncyButton
                    onClick={increment}
                    variant="secondary"
                    className="w-20 h-20 rounded-full text-4xl shadow-lg disabled:opacity-50"
                    disabled={count >= 20}
                >
                    +
                </BouncyButton>
            </div>

            {/* Next Button */}
            <div className="z-10 w-full max-w-sm">
                <BouncyButton
                    onClick={() => onNext(count)}
                    className="w-full text-xl py-5 shadow-spy-orange/50 shadow-xl"
                >
                    SUIVANT : IDENTIFICATION
                </BouncyButton>
            </div>

        </div>
    );
};

export default PlayerSetup;
