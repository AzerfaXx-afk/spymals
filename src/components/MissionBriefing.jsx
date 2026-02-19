import React, { useState } from 'react';
import BouncyButton from './BouncyButton';
import RoleStepper from './RoleStepper';
import BackArrow from './BackArrow';
import SettingsGear from './SettingsGear';

const MissionBriefing = ({ totalPlayers, onStartGame, onBack, onOpenSettings }) => {
    const [undercoverCount, setUndercoverCount] = useState(1);
    const [whiteCount, setWhiteCount] = useState(0);
    const [wordPack, setWordPack] = useState('standard');
    const [customWords, setCustomWords] = useState({ innocent: '', spy: '' });

    const civilianCount = totalPlayers - undercoverCount - whiteCount;

    // Validation Logic
    const isRoleCountValid = civilianCount >= 2;
    const isCustomValid = wordPack !== 'custom' || (customWords.innocent.trim() !== '' && customWords.spy.trim() !== '');
    const isValid = isRoleCountValid && isCustomValid;

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
        <div className="h-screen flex flex-col items-center p-4 pt-20 relative overflow-hidden bg-spy-blue">
            <BackArrow onClick={onBack} />
            <SettingsGear onClick={onOpenSettings} />
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-20%] w-[600px] h-[600px] bg-spy-orange opacity-[0.05] rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-20%] w-[500px] h-[500px] bg-spy-lime opacity-[0.05] rounded-full blur-[100px] animate-pulse-slow delay-700"></div>
            </div>

            <div className="z-10 mb-2 text-center flex-none animate-slide-up">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter drop-shadow-lg">
                    Briefing
                </h2>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                    Préparez la mission
                </p>
            </div>

            <div className="w-full max-w-sm flex-1 flex flex-col min-h-0 z-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>

                {/* Main Stats Card - Compact */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-xl mb-3 flex-none">

                    {/* Civilians Display - Horizontal Compact */}
                    <div className="bg-spy-lime/10 rounded-xl p-3 flex items-center justify-between border border-spy-lime/20 mb-3 relative overflow-hidden">
                        <div className="absolute inset-0 bg-spy-lime/5 animate-pulse-slow"></div>
                        <div className="relative z-10 flex items-center gap-3">
                            <span className="text-2xl">🕵️‍♂️</span>
                            <div className="flex flex-col text-left">
                                <span className="text-xl font-black text-white leading-none">{civilianCount}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-spy-lime">Innocents</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <RoleStepper
                            label="Espions"
                            count={undercoverCount}
                            onIncrement={() => handleIncrement('undercover')}
                            onDecrement={() => handleDecrement('undercover')}
                            color="text-spy-orange"
                            subLabel="Mot différent"
                        />

                        <RoleStepper
                            label="Mr. Blanc"
                            count={whiteCount}
                            onIncrement={() => handleIncrement('white')}
                            onDecrement={() => handleDecrement('white')}
                            color="text-white"
                            subLabel="Aucun mot"
                        />
                    </div>
                </div>

                {/* Word Pack Selection - Compact */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-xl flex-none">
                    <label className="block text-white/60 text-[10px] font-bold mb-2 uppercase tracking-widest text-center">Pack de Mots</label>
                    <div className="relative mb-2">
                        <select
                            value={wordPack}
                            onChange={(e) => setWordPack(e.target.value)}
                            className="w-full bg-black/20 border-2 border-white/10 rounded-xl px-4 py-2 text-white font-bold text-center appearance-none focus:border-spy-lime focus:outline-none transition-all shadow-inner text-sm"
                        >
                            <option value="standard" className="bg-spy-blue text-white">Standard</option>
                            <option value="pop-culture" className="bg-spy-blue text-white">Pop Culture</option>
                            <option value="abstract" className="bg-spy-blue text-white">Abstrait</option>
                            <option value="animals" className="bg-spy-blue text-white">Animaux</option>
                            <option value="custom" className="bg-spy-orange text-white font-black">✨ Personnalisé</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">▼</div>
                    </div>

                    {/* Custom Word Inputs */}
                    {wordPack === 'custom' && (
                        <div className="space-y-2 animate-pop-in">
                            <div className="space-y-1">
                                <input
                                    type="text"
                                    placeholder="Mot Innocents"
                                    value={customWords.innocent}
                                    onChange={(e) => setCustomWords({ ...customWords, innocent: e.target.value })}
                                    className="w-full bg-black/40 border border-spy-lime/30 rounded-lg px-3 py-2 text-white font-bold text-sm focus:border-spy-lime focus:outline-none transition-colors placeholder:text-white/20"
                                />
                            </div>
                            <div className="space-y-1">
                                <input
                                    type="text"
                                    placeholder="Mot Espions"
                                    value={customWords.spy}
                                    onChange={(e) => setCustomWords({ ...customWords, spy: e.target.value })}
                                    className="w-full bg-black/40 border border-spy-orange/30 rounded-lg px-3 py-2 text-white font-bold text-sm focus:border-spy-orange focus:outline-none transition-colors placeholder:text-white/20"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Validation Warning */}
                <div className="mt-2 flex-none">
                    {!isRoleCountValid && (
                        <div className="bg-red-500/20 border border-red-500/30 text-red-200 text-[10px] font-bold p-2 rounded-xl text-center animate-shake">
                            ⚠️ Trop d'espions ! Min 2 Civils.
                        </div>
                    )}

                    {wordPack === 'custom' && !isCustomValid && (
                        <div className="bg-spy-orange/20 border border-spy-orange/30 text-spy-orange text-[10px] font-bold p-2 rounded-xl text-center animate-shake">
                            ⚠️ Mots manquants !
                        </div>
                    )}
                </div>

            </div>

            {/* Start Button */}
            <div className="w-full max-w-sm mt-auto z-20 pt-2 pb-6">
                <BouncyButton
                    onClick={() => onStartGame({ undercoverCount, whiteCount, wordPack, customWords })}
                    className="w-full shadow-spy-lime/20 shadow-2xl text-lg py-4"
                    disabled={!isValid}
                >
                    LANCER LA PARTIE
                </BouncyButton>
            </div>

        </div>
    );
};

export default MissionBriefing;
