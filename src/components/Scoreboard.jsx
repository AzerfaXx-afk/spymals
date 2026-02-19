import React from 'react';
import BouncyButton from './BouncyButton';
import SettingsGear from './SettingsGear';

const Scoreboard = ({ players, winners, onReplay, onHome, onOpenSettings }) => {
    // Sort players by score (descending)
    const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

    const getMedal = (index) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return null;
    };

    const isWinner = (role) => {
        if (!winners) return false;
        // Map roles to teams
        const team = role === 'Civilian' ? 'Civilian' : 'Impostors';
        const winningTeam = winners.includes('Civilian') ? 'Civilian' : 'Impostors';
        return team === winningTeam;
    };

    const winningTeamText = winners.includes('Civilian') ? 'Les Innocents' : 'Les Imposteurs';
    const winningColor = winners.includes('Civilian') ? 'text-spy-lime' : 'text-spy-orange';

    return (
        <div className="min-h-screen flex flex-col items-center p-6 pt-20 bg-spy-blue relative overflow-hidden">
            <SettingsGear onClick={onOpenSettings} />

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="z-10 w-full max-w-md animate-pop-in flex flex-col h-full">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-lg mb-2">
                        Victoire pour<br />
                        <span className={`${winningColor} text-5xl`}>{winningTeamText} !</span>
                    </h1>
                </div>

                {/* Scoreboard List */}
                <div className="bg-white/5 backdrop-blur-md rounded-3xl p-4 border border-white/10 shadow-xl flex-grow overflow-y-auto mb-6 custom-scrollbar">
                    <h2 className="text-white/60 font-bold uppercase tracking-widest text-xs text-center mb-4 sticky top-0 bg-spy-blue/80 backdrop-blur-sm p-2 rounded-lg z-10">
                        Classement Général
                    </h2>

                    <div className="space-y-3">
                        {sortedPlayers.map((player, index) => (
                            <div
                                key={player.id}
                                className="flex items-center justify-between bg-black/20 rounded-xl p-3 border border-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 flex items-center justify-center font-bold text-xl">
                                        {getMedal(index) || <span className="text-white/30 text-sm">#{index + 1}</span>}
                                    </div>
                                    <div className="text-2xl">{player.avatar.value}</div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-white text-sm">{player.name}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-white font-display">{player.score || 0}</span>
                                    <span className="text-[10px] text-white/40 font-bold uppercase">pts</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 gap-4 mt-auto">
                    <BouncyButton onClick={onReplay} className="w-full py-5 text-xl shadow-spy-lime/20 shadow-2xl">
                        REJOUER (Mêmes équipes)
                    </BouncyButton>
                    <BouncyButton onClick={onHome} variant="secondary" className="w-full py-4 text-sm">
                        RETOUR ACCUEIL
                    </BouncyButton>
                </div>
            </div>
        </div>
    );
};

export default Scoreboard;
