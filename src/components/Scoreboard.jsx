import React from 'react';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import BouncyButton from './BouncyButton';
import SettingsGear from './SettingsGear';
import { CartoonAvatar } from './CartoonAvatars';

const Scoreboard = ({ players, winners, onReplay, onHome, onOpenSettings }) => {
    // Sort players by score (descending)
    const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

    const renderRankBadge = (index) => {
        if (index === 0) return <Trophy className="w-5 h-5 text-yellow-400 fill-yellow-400 drop-shadow-[0_2px_4px_rgba(250,204,21,0.4)]" />;
        if (index === 1) return <Trophy className="w-5 h-5 text-slate-300 fill-slate-300" />;
        if (index === 2) return <Trophy className="w-5 h-5 text-amber-600 fill-amber-600" />;
        return <span className="text-white/35 text-xs font-bold font-display">#{index + 1}</span>;
    };

    const isCivilianWin = winners.includes('Civilian');
    const winningTeamText = isCivilianWin ? 'Les Innocents' : 'Les Imposteurs';
    const winningColor = isCivilianWin ? 'text-spy-lime' : 'text-spy-orange';

    return (
        <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-between p-4 md:p-6 pt-16 md:pt-20 bg-transparent relative overflow-x-hidden max-w-md mx-auto">
            <SettingsGear onClick={onOpenSettings} />

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="z-10 w-full animate-pop-in flex flex-col flex-1 pb-4 overflow-hidden">

                {/* 3D Victory / Defeat Hero Banner */}
                <div className="relative w-full h-44 rounded-3xl overflow-hidden border-[3.5px] border-white/20 shadow-[0_12px_30px_rgba(0,0,0,0.8)] bg-gradient-to-b from-[#182947] to-[#0a1426] mb-4 flex-shrink-0">
                    <img 
                        src={isCivilianWin ? '/victory_civilians_3d.png' : '/victory_impostors_3d.png'} 
                        alt={winningTeamText} 
                        className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1426] via-transparent to-transparent opacity-80 pointer-events-none" />
                </div>

                {/* Header Title */}
                <div className="text-center mb-4 flex-shrink-0">
                    <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter drop-shadow-lg mb-1">
                        Victoire pour <span className={`${winningColor} text-2xl md:text-3xl font-black`}>{winningTeamText} !</span>
                    </h1>
                    <div className="w-16 h-1 bg-spy-lime mx-auto rounded-full border border-black shadow-[1px_1px_0_#000]"></div>
                </div>

                {/* Scoreboard Scrollable List */}
                <div className="card-cartoon p-3.5 flex-1 overflow-y-auto mb-4 bg-black/45 text-white border-3 border-black max-h-[340px] shadow-2xl">
                    <h2 className="text-white/40 font-black uppercase tracking-widest text-[9.5px] text-center mb-3 sticky top-0 bg-black/80 backdrop-blur-md p-1.5 rounded-xl z-10 border border-white/10">
                        Classement de la Mission
                    </h2>

                    <div className="space-y-2.5">
                        {sortedPlayers.map((player, index) => {
                            const rawAvatar = typeof player.avatar === 'object' ? player.avatar?.value : player.avatar;
                            return (
                                <div
                                    key={player.id}
                                    className={`flex items-center justify-between rounded-2xl p-2.5 border-2 transition-all ${
                                        index === 0 ? 'bg-gradient-to-r from-yellow-500/20 via-yellow-500/10 to-transparent border-yellow-500/60 shadow-[0_4px_12px_rgba(234,179,8,0.25)]' :
                                        index === 1 ? 'bg-slate-300/10 border-slate-300/40' :
                                        index === 2 ? 'bg-amber-600/10 border-amber-600/40' :
                                        'bg-black/30 border-white/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 font-black text-xs">
                                            {renderRankBadge(index)}
                                        </div>
                                        <div className="w-9 h-9 flex-shrink-0">
                                            <CartoonAvatar id={rawAvatar} className="w-full h-full border-none shadow-none" />
                                        </div>
                                        <div className="flex flex-col text-left min-w-0 truncate">
                                            <span className={`font-black text-xs uppercase tracking-wide truncate ${player.pseudoColor || (index === 0 ? 'text-yellow-400' : 'text-white')}`}>
                                                {player.name}
                                            </span>
                                            {player.role && (
                                                <span className={`text-[8.5px] font-black uppercase tracking-wider ${
                                                    player.role === 'Civilian' ? 'text-spy-lime' :
                                                    player.role === 'Undercover' ? 'text-spy-orange' : 'text-cyan-400'
                                                }`}>
                                                    {player.role === 'Civilian' ? 'Civil' : player.role === 'Undercover' ? 'Espion' : 'Mr. Blanc'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 flex-shrink-0 pl-2">
                                        <span className={`text-lg font-black font-display leading-none ${index === 0 ? 'text-yellow-400' : 'text-white'}`}>
                                            {player.score || 0}
                                        </span>
                                        <span className="text-[9px] text-white/50 font-black uppercase">pts</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 gap-2.5 mt-auto w-full flex-shrink-0">
                    <button
                        onClick={onReplay}
                        className="btn-cartoon-primary w-full py-3.5 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_6px_0_#000] active:translate-y-1.5 active:shadow-[0_0_0_#000] transition-all"
                    >
                        <RotateCcw className="w-5 h-5 stroke-[3]" /> REJOUER (MÊMES ÉQUIPES)
                    </button>
                    <button
                        onClick={onHome}
                        className="btn-cartoon-secondary w-full py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_0_#000] active:translate-y-1 active:shadow-[0_0_0_#000] transition-all"
                    >
                        <Home className="w-4 h-4 stroke-[3]" /> RETOUR À L'ACCUEIL
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Scoreboard;
