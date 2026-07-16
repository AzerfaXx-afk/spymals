import React, { useEffect, useState } from 'react';
import { Trophy, Trash2, AlertTriangle, ArrowLeft, Settings, X } from 'lucide-react';
import BouncyButton from './BouncyButton';
import BackArrow from './BackArrow';
import SettingsGear from './SettingsGear';
import { CartoonAvatar } from './CartoonAvatars';

const Leaderboard = ({ onBack, onOpenSettings }) => {
    const [stats, setStats] = useState([]);
    const [confirmReset, setConfirmReset] = useState(false);

    useEffect(() => {
        const loadStats = () => {
            try {
                const stored = localStorage.getItem('spyMals_leaderboard');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    const statsArray = Object.values(parsed).sort((a, b) => b.score - a.score);
                    setStats(statsArray);
                }
            } catch (e) {
                console.error("Failed to load leaderboard", e);
            }
        };
        loadStats();
    }, []);

    const handleReset = () => {
        localStorage.removeItem('spyMals_leaderboard');
        setStats([]);
        setConfirmReset(false);
    };

    const renderRankBadge = (index) => {
        if (index === 0) return <Trophy className="w-5 h-5 text-yellow-400 fill-yellow-400 drop-shadow-[0_2px_4px_rgba(250,204,21,0.4)]" />;
        if (index === 1) return <Trophy className="w-5 h-5 text-slate-300 fill-slate-300" />;
        if (index === 2) return <Trophy className="w-5 h-5 text-amber-600 fill-amber-600" />;
        return <span className="text-white/35 text-xs font-bold font-display">#{index + 1}</span>;
    };

    return (
        <div className="min-h-screen flex flex-col items-center p-6 pt-20 bg-transparent relative overflow-hidden max-w-md mx-auto">
            <BackArrow onClick={onBack} />
            <SettingsGear onClick={onOpenSettings} />

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-spy-yellow opacity-[0.05] rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] left-[-20%] w-[500px] h-[500px] bg-spy-lime opacity-[0.05] rounded-full blur-[100px] animate-pulse-slow delay-700"></div>
            </div>

            <div className="z-10 w-full animate-slide-up flex flex-col h-full">

                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-lg mb-2">
                        Classement
                    </h1>
                    <div className="w-16 h-1.5 bg-spy-lime mx-auto rounded-full border border-black shadow-[1px_1px_0_#000]"></div>
                </div>

                {/* Leaderboard List */}
                <div className="card-cartoon p-4 flex-grow overflow-y-auto mb-6 no-scrollbar bg-black/45 text-white border-3 border-black min-h-[50dvh]">

                    {stats.length === 0 ? (
                        <div className="text-center text-white/30 py-20 font-black uppercase tracking-widest text-xs">
                            Aucune partie enregistrée
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {stats.map((player, index) => {
                                const rawAvatar = typeof player.avatar === 'object' ? player.avatar?.value : player.avatar;
                                return (
                                    <div
                                        key={player.name}
                                        className={`flex items-center justify-between rounded-2xl p-3 border-2 border-black ${
                                            index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/50 shadow-[2px_2px_0_rgba(234,179,8,0.3)]' :
                                            index === 1 ? 'bg-slate-300/5 border-slate-300/30' :
                                            index === 2 ? 'bg-amber-600/5 border-amber-600/30' :
                                            'bg-black/25 border-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 flex items-center justify-center">
                                                {renderRankBadge(index)}
                                            </div>
                                            <CartoonAvatar id={rawAvatar} className="w-9 h-9 border-none shadow-none" />
                                            <div className="flex flex-col text-left">
                                                <span className={`font-black text-sm uppercase tracking-wide ${index === 0 ? 'text-yellow-400' : 'text-white'}`}>
                                                    {player.name}
                                                </span>
                                                <span className="text-[9px] text-white/45 font-black uppercase tracking-wider">
                                                    {player.wins} vict. / {player.games} missions
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`text-xl font-black font-display leading-none ${index === 0 ? 'text-yellow-400' : 'text-white'}`}>
                                                {player.score}
                                            </span>
                                            <span className="text-[9px] text-white/40 font-black uppercase">pts</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-auto flex flex-col gap-3">
                    <BouncyButton onClick={onBack} variant="secondary" className="w-full py-4 text-xs font-black shadow-[3px_3px_0_#000]">
                        RETOUR ACCUEIL
                    </BouncyButton>

                    {stats.length > 0 && (
                        confirmReset ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmReset(false)}
                                    className="flex-1 py-3 rounded-2xl border-2 border-black bg-white/5 text-white/50 font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center gap-1"
                                >
                                    <X className="w-3.5 h-3.5" /> Annuler
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="flex-1 py-3 rounded-2xl bg-rose-600 border-2 border-black text-white font-black uppercase text-[10px] tracking-widest hover:bg-rose-700 active:scale-95 transition-all shadow-[2px_2px_0_#000] flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <AlertTriangle className="w-3.5 h-3.5" /> Confirmer
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setConfirmReset(true)}
                                className="w-full py-3 rounded-2xl border-2 border-dashed border-rose-600/40 text-rose-500/70 font-black uppercase text-[9px] tracking-widest hover:border-rose-500/60 hover:text-rose-400 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Réinitialiser le classement
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
