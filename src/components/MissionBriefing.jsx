import React, { useState } from 'react';
import BouncyButton from './BouncyButton';
import RoleStepper from './RoleStepper';
import BackArrow from './BackArrow';

const MissionBriefing = ({ totalPlayers, onStartGame, onBack }) => {
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
            <BackArrow onClick={onBack} />
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-20%] w-[600px] h-[600px] bg-spy-orange opacity-[0.05] rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-20%] w-[500px] h-[500px] bg-spy-lime opacity-[0.05] rounded-full blur-[100px] animate-pulse-slow delay-700"></div>
            </div>

            <div className="z-10 mt-6 mb-4 text-center animate-slide-up">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-lg">
                    Briefing
                </h2>
                <p className="text-white/60 text-xs font-bold mt-1 uppercase tracking-widest">
                    Préparez la mission
                </p>
            </div>

            <div className="w-full max-w-sm space-y-4 flex-1 overflow-y-auto pb-24 z-10 no-scrollbar animate-slide-up" style={{ animationDelay: '0.1s' }}>

                {/* Main Stats Card */}
                <div className="bg-white/5 backdrop-blur-md rounded-[32px] p-6 border border-white/10 shadow-xl">

                    {/* Civilians Display */}
                    <div className="bg-spy-lime/10 rounded-2xl p-4 flex items-center justify-between border border-spy-lime/20 mb-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-spy-lime/5 animate-pulse-slow"></div>
                        <div className="relative z-10 flex flex-col">
                            <span className="text-2xl font-black text-white">{civilianCount}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-spy-lime">Civils (Innocents)</span>
                        </div>
                        <span className="text-4xl">🕵️‍♂️</span>
                    </div>

                    <div className="space-y-2">
                        <RoleStepper
                            label="Undercovers"
                            count={undercoverCount}
                            onIncrement={() => handleIncrement('undercover')}
                            onDecrement={() => handleDecrement('undercover')}
                            color="text-spy-orange"
                            subLabel="Ont un mot différent"
                        />

                        <RoleStepper
                            label="Mr. White"
                            count={whiteCount}
                            onIncrement={() => handleIncrement('white')}
                            onDecrement={() => handleDecrement('white')}
                            color="text-white"
                            subLabel="N'ont AUCUN mot"
                        />
                    </div>
                </div>

                {/* Word Pack Selection */}
                <div className="bg-white/5 backdrop-blur-md rounded-[32px] p-6 border border-white/10 shadow-xl">
                    <label className="block text-white/60 text-[10px] font-bold mb-3 uppercase tracking-widest text-center">Pack de Mots</label>
                    <div className="relative">
                        <select
                            value={wordPack}
                            onChange={(e) => setWordPack(e.target.value)}
                            className="w-full bg-black/20 border-2 border-white/10 rounded-2xl px-6 py-4 text-white font-bold text-center appearance-none focus:border-spy-lime focus:outline-none transition-all shadow-inner"
                        >
                            <option value="standard" className="bg-spy-blue text-white">Standard</option>
                            <option value="pop-culture" className="bg-spy-blue text-white">Pop Culture</option>
                            <option value="abstract" className="bg-spy-blue text-white">Abstrait</option>
                            <option value="animals" className="bg-spy-blue text-white">Animaux</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">▼</div>
                    </div>
                </div>

                {/* Validation Warning */}
                {!isValid && (
                    <div className="bg-red-500/20 border border-red-500/30 text-red-200 text-xs font-bold p-4 rounded-2xl text-center animate-shake">
                        ⚠️ Trop d'espions ! Il faut au moins 2 Civils.
                    </div>
                )}

            </div>

            {/* Start Button */}
            <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-spy-blue via-spy-blue/95 to-transparent z-20 backdrop-blur-[2px]">
                <BouncyButton
                    onClick={() => onStartGame({ undercoverCount, whiteCount, wordPack })}
                    className="w-full shadow-spy-lime/20 shadow-2xl text-xl py-5"
                    disabled={!isValid}
                >
                    LANCER LA PARTIE
                </BouncyButton>
            </div>

        </div>
    );
};

export default MissionBriefing;
