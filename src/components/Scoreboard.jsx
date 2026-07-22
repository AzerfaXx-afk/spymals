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

    const winningTeamText = winners.includes('Civilian') ? 'Les Innocents' : 'Les Imposteurs';
    const winningColor = winners.includes('Civilian') ? 'text-spy-lime' : 'text-spy-orange';

    return (
        <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-between p-4 md:p-6 pt-16 md:pt-20 bg-transparent relative overflow-x-hidden max-w-md mx-auto">
            <SettingsGear onClick={onOpenSettings} />

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="z-10 w-full animate-pop-in flex flex-col flex-1 max-h-[88dvh] overflow-y-auto custom-scrollbar pb-4">

                {/* Header */}
                <div className="text-center mb-5">
                    <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter drop-shadow-lg mb-2">
                        Victoire pour<br />
                        <span className={`${winningColor} text-3xl md:text-4xl`}>{winningTeamText} !</span>
                    </h1>
                    <div className="w-16 h-1.5 bg-spy-lime mx-auto rounded-full border border-black shadow-[1px_1px_0_#000]"></div>
                </div>

                {/* Scoreboard List */}
                <div className="card-cartoon p-4 flex-grow overflow-y-auto mb-5 no-scrollbar bg-black/45 text-white border-3 border-black max-h-[350px]">
                    <h2 className="text-white/40 font-black uppercase tracking-widest text-[10px] text-center mb-4 sticky top-0 bg-black/60 backdrop-blur-sm p-2 rounded-xl z-10 border border-white/5">
                        Classement de la Mission
                    </h2>

                    <div className="space-y-3">
                        {sortedPlayers.map((player, index) => {
                            const rawAvatar = typeof player.avatar === 'object' ? player.avatar?.value : player.avatar;
                            return (
                                <div
                                    key={player.id}
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
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`text-xl font-black font-display leading-none ${index === 0 ? 'text-yellow-400' : 'text-white'}`}>
                                            {player.score || 0}
                                        </span>
                                        <span className="text-[9px] text-white/40 font-black uppercase">pts</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 gap-3 mt-auto">
                    <BouncyButton onClick={onReplay} className="w-full py-4 text-sm font-black shadow-[4px_4px_0_#000] flex items-center justify-center gap-2">
                        <RotateCcw className="w-4 h-4" /> REJOUER (MEMES EQUIPES)
                    </BouncyButton>
                    <BouncyButton onClick={onHome} variant="secondary" className="w-full py-4 text-xs font-black shadow-[3px_3px_0_#000] flex items-center justify-center gap-2">
                        <Home className="w-4 h-4" /> RETOUR ACCUEIL
                    </BouncyButton>
                </div>
            </div>
        </div>
    );
};

export default Scoreboard;
