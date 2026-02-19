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
    const isCustomValid = wordPack !== 'custom' || (
        customWords.innocent.trim() !== '' &&
        customWords.spy.trim() !== '' &&
        customWords.innocent.trim().toLowerCase() !== customWords.spy.trim().toLowerCase()
    );
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
        <div className="min-h-screen h-[100dvh] flex flex-col items-center p-4 pt-20 relative overflow-hidden bg-gray-900">
            <BackArrow onClick={onBack} />
            <SettingsGear onClick={onOpenSettings} />

            {/* Background Decor - Command Center Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            <div className="absolute inset-0 bg-radial-gradient(circle_at_center,transparent,rgba(0,0,0,0.8))"></div>

            {/* Rotating Gears Decor */}
            <div className="absolute top-20 right-[-50px] opacity-10 pointer-events-none">
                <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor" className="text-white gear-spin">
                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 011.5 0z" />
                    {/* Simplified gear representation for brevity, effectively using the gear icon logic or similar shape */}
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                </svg>
            </div>
            <div className="absolute bottom-20 left-[-30px] opacity-10 pointer-events-none">
                <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor" className="text-white gear-spin-reverse">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                </svg>
            </div>


            <div className="z-10 mb-6 text-center flex-none animate-slide-up bg-black/50 px-8 py-2 rounded-full border border-white/20 shadow-lg backdrop-blur-md">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter drop-shadow-md font-display">
                    ACCESS GRANTED
                </h2>
                <p className="text-spy-lime text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">
                    System Ready
                </p>
            </div>

            <div className="w-full max-w-sm flex-1 flex flex-col min-h-0 z-10 animate-slide-up space-y-4" style={{ animationDelay: '0.1s' }}>

                {/* Main Stats Card - Command Panel */}
                <div className="command-panel rounded-lg p-4 flex-none relative">
                    {/* Decorative Screws */}
                    <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-gray-400 shadow-inner flex items-center justify-center"><div className="w-full h-[1px] bg-gray-600 rotate-45"></div></div>
                    <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-gray-400 shadow-inner flex items-center justify-center"><div className="w-full h-[1px] bg-gray-600 rotate-45"></div></div>
                    <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-gray-400 shadow-inner flex items-center justify-center"><div className="w-full h-[1px] bg-gray-600 rotate-45"></div></div>
                    <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-gray-400 shadow-inner flex items-center justify-center"><div className="w-full h-[1px] bg-gray-600 rotate-45"></div></div>

                    {/* Civilians Display - Digital Readout */}
                    <div className="bg-black/60 rounded-lg p-3 flex items-center justify-between border-2 border-gray-700 mb-4 relative overflow-hidden shadow-inner">
                        <div className="absolute left-0 top-0 w-1 h-full bg-spy-lime opacity-50"></div>
                        <div className="relative z-10 flex items-center gap-3 w-full justify-between px-2">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">PERSONNEL</span>
                                <span className="text-sm font-bold uppercase tracking-widest text-white">Innocents</span>
                            </div>
                            <div className="digital-counter px-4 py-1 rounded">
                                <span className="text-2xl font-bold leading-none">{civilianCount.toString().padStart(2, '0')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-stretch">
                        <RoleStepper
                            label="Espions"
                            count={undercoverCount}
                            onIncrement={() => handleIncrement('undercover')}
                            onDecrement={() => handleDecrement('undercover')}
                            color="text-spy-orange"
                            subLabel="Mot différent"
                            soundOptions={{ pitch: Math.min(2.0, 0.8 + ((undercoverCount) * 0.1)) }}
                        />

                        <RoleStepper
                            label="Mr. Blanc"
                            count={whiteCount}
                            onIncrement={() => handleIncrement('white')}
                            onDecrement={() => handleDecrement('white')}
                            color="text-white"
                            subLabel="Aucun mot"
                            soundOptions={{ pitch: Math.min(2.0, 0.8 + ((whiteCount) * 0.1)) }}
                        />
                    </div>
                </div>

                {/* Word Pack Selection - Module */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-600 shadow-lg flex-none relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-700 px-3 py-1 rounded text-[10px] uppercase font-bold text-white border border-gray-500">
                        Mission Data
                    </div>

                    <div className="relative mt-1">
                        <select
                            value={wordPack}
                            onChange={(e) => setWordPack(e.target.value)}
                            className="w-full bg-black/40 border-2 border-gray-600 rounded-lg px-4 py-3 text-white font-mono font-bold text-center appearance-none focus:border-spy-lime focus:outline-none transition-all shadow-inner text-sm uppercase tracking-wider"
                        >
                            <option value="standard" className="bg-gray-900 text-white">Standard Pack</option>
                            <option value="pop-culture" className="bg-gray-900 text-white">Pop Culture</option>
                            <option value="abstract" className="bg-gray-900 text-white">Abstract Concepts</option>
                            <option value="animals" className="bg-gray-900 text-white">Animal Kingdom</option>
                            <option value="custom" className="bg-gray-900 text-spy-orange font-bold">{`>>> CUSTOM INPUT <<<`}</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">▼</div>
                    </div>

                    {/* Custom Word Inputs */}
                    {wordPack === 'custom' && (
                        <div className="mt-4 space-y-2 animate-pop-in">
                            <div className="space-y-1">
                                <label className="text-[9px] uppercase font-bold text-gray-400 pl-1">Target 1 (Innocent)</label>
                                <input
                                    type="text"
                                    placeholder="Enter Keyword..."
                                    value={customWords.innocent}
                                    onChange={(e) => setCustomWords({ ...customWords, innocent: e.target.value })}
                                    className="w-full bg-black/60 border border-spy-lime/50 rounded px-3 py-2 text-spy-lime font-mono text-sm focus:border-spy-lime focus:outline-none transition-colors placeholder:text-gray-600"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] uppercase font-bold text-gray-400 pl-1">Target 2 (Spy)</label>
                                <input
                                    type="text"
                                    placeholder="Enter Keyword..."
                                    value={customWords.spy}
                                    onChange={(e) => setCustomWords({ ...customWords, spy: e.target.value })}
                                    className="w-full bg-black/60 border border-spy-orange/50 rounded px-3 py-2 text-spy-orange font-mono text-sm focus:border-spy-orange focus:outline-none transition-colors placeholder:text-gray-600"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Validation Warning */}
                <div className="mt-2 flex-none">
                    {!isRoleCountValid && (
                        <div className="bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold p-2 rounded text-center animate-shake font-mono">
                            [ERROR] INSUFFICIENT INNOCENTS (MIN 2)
                        </div>
                    )}

                    {wordPack === 'custom' && !isCustomValid && (
                        <div className="bg-spy-orange/20 border border-spy-orange/30 text-spy-orange text-[10px] font-bold p-2 rounded text-center animate-shake font-mono">
                            [WARNING] DATA INCOMPLETE
                        </div>
                    )}
                </div>

            </div>

            {/* Wire Decor */}
            <div className="absolute bottom-24 left-10 w-px h-20 bg-gray-600 z-0 opacity-50"></div>
            <div className="absolute bottom-24 right-10 w-px h-20 bg-gray-600 z-0 opacity-50"></div>

            {/* Start Button Area */}
            <div className="w-full max-w-sm mt-auto z-20 pt-4 pb-8 relative" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
                {/* Safety Cover Visual */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-yellow-500/20 rounded-full blur-sm"></div>

                <BouncyButton
                    variant="custom"
                    onClick={() => onStartGame({ undercoverCount, whiteCount, wordPack, customWords })}
                    className="launch-button w-full text-xl py-6 rounded-lg tracking-widest relative overflow-hidden group"
                    disabled={!isValid}
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        <span className="text-2xl animate-pulse">☢</span>
                        START MISSION
                        <span className="text-2xl animate-pulse">☢</span>
                    </span>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-30"></div>
                </BouncyButton>
            </div>

        </div>
    );
};

export default MissionBriefing;
