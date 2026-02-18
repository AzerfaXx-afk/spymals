import React, { useState } from 'react';
import BouncyButton from './BouncyButton';
import RoleStepper from './RoleStepper';

const MissionBriefing = ({ totalPlayers, onStartGame }) => {
    const [undercoverCount, setUndercoverCount] = useState(1);
    const [whiteCount, setWhiteCount] = useState(0);
    const [wordPack, setWordPack] = useState('standard');

    const civilianCount = totalPlayers - undercoverCount - whiteCount;
    const isValid = civilianCount >= 2;

    const handleIncrement = (type) => {
        if (type === 'undercover') {
            if (totalPlayers - (undercoverCount + 1) - whiteCount >= 2) {
                setUndercoverCount(undercoverCount + 1);
            }
        } else {
            if (totalPlayers - undercoverCount - (whiteCount + 1) >= 2) {
                setWhiteCount(whiteCount + 1);
            }
        }
    };

    const handleDecrement = (type) => {
        if (type === 'undercover') {
            if (undercoverCount > 1) setUndercoverCount(undercoverCount - 1);
        } else {
            if (whiteCount > 0) setWhiteCount(whiteCount - 1);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center p-6 relative overflow-hidden bg-spy-blue">
            {/* Background Decor */}
            <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-spy-lime opacity-10 rounded-full blur-3xl animate-pulse-fast pointer-events-none"></div>

            <div className="z-10 mt-6 mb-8 text-center">
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-spy-orange to-white drop-shadow-sm uppercase tracking-tighter">
                    Briefing Mission
                </h2>
                <p className="text-white/60 text-sm font-bold mt-2">
                    Configuration de la partie
                </p>
            </div>

            <div className="w-full max-w-md space-y-2 flex-1 overflow-y-auto pb-20">

                {/* Civilians Display */}
                <div className="bg-white/10 rounded-2xl p-4 flex items-center justify-between border-l-4 border-spy-lime mb-6">
                    <span className="text-xl font-bold text-white">Civils</span>
                    <span className="text-3xl font-black text-spy-lime">{civilianCount}</span>
                </div>

                {/* Role Steppers */}
                <RoleStepper
                    label="Undercovers"
                    count={undercoverCount}
                    onIncrement={() => handleIncrement('undercover')}
                    onDecrement={() => handleDecrement('undercover')}
                    subLabel="Espions avec un mot différent"
                />

                <RoleStepper
                    label="Mr. White"
                    count={whiteCount}
                    color="white"
                    onIncrement={() => handleIncrement('white')}
                    onDecrement={() => handleDecrement('white')}
                    subLabel="Espions SANS mot"
                />

                {/* Validation Warning */}
                {!isValid && (
                    <div className="bg-red-500/20 text-red-200 text-sm font-bold p-3 rounded-lg text-center animate-pulse">
                        Attention : Trop d'espions ! Il faut au moins 2 Civils.
                    </div>
                )}

                {/* Word Pack Selection */}
                <div className="mt-8">
                    <label className="block text-white/60 text-sm font-bold mb-2 uppercase ml-2">Pack de Mots</label>
                    <select
                        value={wordPack}
                        onChange={(e) => setWordPack(e.target.value)}
                        className="w-full bg-white/10 border-2 border-white/20 rounded-full px-6 py-3 text-white font-bold text-lg focus:border-spy-lime focus:outline-none appearance-none cursor-pointer hover:bg-white/20 transition-colors"
                    >
                        <option value="standard" className="bg-spy-blue text-white">Standard</option>
                        <option value="pop-culture" className="bg-spy-blue text-white">Pop Culture</option>
                        <option value="abstract" className="bg-spy-blue text-white">Abstrait</option>
                        <option value="animals" className="bg-spy-blue text-white">Animaux</option>
                    </select>
                </div>

            </div>

            {/* Start Button */}
            <div className="fixed bottom-6 left-0 w-full px-6 flex justify-center z-20">
                <BouncyButton
                    onClick={() => onStartGame({ undercoverCount, whiteCount, wordPack })}
                    className="w-full max-w-sm shadow-spy-lime/50 shadow-xl text-2xl py-5"
                    disabled={!isValid}
                >
                    LANCER LA PARTIE
                </BouncyButton>
            </div>

        </div>
    );
};

export default MissionBriefing;
