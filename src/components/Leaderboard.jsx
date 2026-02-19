import React, { useEffect, useState } from 'react';
import BouncyButton from './BouncyButton';
import BackArrow from './BackArrow';
import SettingsGear from './SettingsGear';

const Leaderboard = ({ onBack, onOpenSettings }) => {
    const [stats, setStats] = useState([]);

    useEffect(() => {
        const loadStats = () => {
            try {
                const stored = localStorage.getItem('spyMals_leaderboard');
                if (stored) {
                    const parsed = JSON.parse(stored); // Expecting object { lowercaseName: { name, score, games, wins, avatar } }
                    // Convert to array and sort
                    const statsArray = Object.values(parsed).sort((a, b) => b.score - a.score);
                    setStats(statsArray);
                }
            } catch (e) {
                console.error("Failed to load leaderboard", e);
            }
        };
        loadStats();
    }, []);

    const getMedal = (index) => {
        if (index === 0) return '🏆';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return null;
    };

    return (
        <div className="min-h-screen flex flex-col items-center p-6 pt-20 bg-spy-blue relative overflow-hidden">
            <BackArrow onClick={onBack} />
            <SettingsGear onClick={onOpenSettings} />

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-spy-yellow opacity-[0.05] rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] left-[-20%] w-[500px] h-[500px] bg-spy-lime opacity-[0.05] rounded-full blur-[100px] animate-pulse-slow delay-700"></div>
            </div>

            <div className="z-10 w-full max-w-md animate-slide-up flex flex-col h-full">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-lg mb-2">
                        Classement
                    </h1>
                    <div className="w-16 h-1 bg-spy-yellow mx-auto rounded-full"></div>
                </div>

                {/* Leaderboard List */}
                <div className="bg-white/5 backdrop-blur-md rounded-3xl p-4 border border-white/10 shadow-xl flex-grow overflow-y-auto mb-6 custom-scrollbar">

                    {stats.length === 0 ? (
                        <div className="text-center text-white/40 py-10 font-bold uppercase tracking-widest text-sm">
                            Aucune partie enregistrée
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {stats.map((player, index) => (
                                <div
                                    key={player.name}
                                    className={`flex items-center justify-between rounded-xl p-3 border border-white/5 ${index === 0 ? 'bg-gradient-to-r from-spy-yellow/20 to-transparent border-spy-yellow/30' :
                                            index === 1 ? 'bg-white/10' :
                                                index === 2 ? 'bg-white/5' :
                                                    'bg-black/20'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center font-bold text-xl">
                                            {getMedal(index) || <span className="text-white/30 text-sm">#{index + 1}</span>}
                                        </div>
                                        <div className="text-2xl">{player.avatar || '🕵️‍♂️'}</div>
                                        <div className="flex flex-col">
                                            <span className={`font-bold text-sm ${index === 0 ? 'text-spy-yellow' : 'text-white'}`}>
                                                {player.name}
                                            </span>
                                            <span className="text-[10px] text-white/40 uppercase tracking-widest">
                                                {player.wins} vict. / {player.games} parties
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-2xl font-black font-display ${index === 0 ? 'text-spy-yellow' : 'text-white'}`}>
                                            {player.score}
                                        </span>
                                        <span className="text-[10px] text-white/40 font-bold uppercase">pts</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-auto">
                    <BouncyButton onClick={onBack} variant="secondary" className="w-full py-4 text-sm">
                        RETOUR ACCUEIL
                    </BouncyButton>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
