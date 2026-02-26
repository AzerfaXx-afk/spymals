import React from 'react';
import BouncyButton from './BouncyButton';
import BackArrow from './BackArrow';
import SettingsGear from './SettingsGear';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const History = ({ history, onReplayTeam, onBack, onOpenSettings }) => {

    // Group history by relative day
    const groupedHistory = history.reduce((acc, session) => {
        try {
            const date = parseISO(session.date);
            let dayLabel = '';
            if (isToday(date)) {
                dayLabel = "Aujourd'hui";
            } else if (isYesterday(date)) {
                dayLabel = "Hier";
            } else {
                dayLabel = format(date, "EEEE d MMMM", { locale: fr });
            }

            if (!acc[dayLabel]) {
                acc[dayLabel] = [];
            }
            acc[dayLabel].push(session);
        } catch (e) {
            console.error("Invalid date in history", session.date);
        }
        return acc;
    }, {});


    return (
        <div className="min-h-screen flex flex-col items-center p-6 pt-20 bg-spy-blue relative overflow-hidden">
            <BackArrow onClick={onBack} />
            <SettingsGear onClick={onOpenSettings} />

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-spy-orange opacity-[0.05] rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] left-[-20%] w-[500px] h-[500px] bg-spy-blue-light opacity-[0.05] rounded-full blur-[100px] animate-pulse-slow delay-700"></div>
            </div>

            <div className="z-10 w-full max-w-md animate-slide-up flex flex-col h-full">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-lg mb-2">
                        Historique
                    </h1>
                    <div className="w-16 h-1 bg-spy-orange mx-auto rounded-full"></div>
                </div>

                {/* History List */}
                <div className="bg-white/5 backdrop-blur-md rounded-3xl p-4 border border-white/10 shadow-xl flex-grow overflow-y-auto mb-6 custom-scrollbar">

                    {Object.keys(groupedHistory).length === 0 ? (
                        <div className="text-center text-white/40 py-10 font-bold uppercase tracking-widest text-sm">
                            Aucune partie passée
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedHistory).map(([dayLabel, sessions]) => (
                                <div key={dayLabel} className="space-y-3">
                                    <h2 className="text-white/60 font-bold uppercase tracking-widest text-xs sticky top-0 bg-spy-blue/90 backdrop-blur-sm p-2 rounded-lg z-10 text-center shadow-sm">
                                        {dayLabel}
                                    </h2>

                                    {sessions.map((session, index) => (
                                        <div key={session.id || index} className="bg-black/20 rounded-xl p-4 border border-white/5 hover:border-white/20 transition-colors flex flex-col gap-3">

                                            {/* Player avatars */}
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {session.players.map(p => (
                                                    <div key={p.id} className="flex flex-col items-center gap-1">
                                                        <div className="w-10 h-10 flex items-center justify-center text-2xl bg-white/5 rounded-full border border-white/10 shadow-sm overflow-hidden">
                                                            {typeof p.avatar === 'object' && p.avatar?.type === 'image' ? (
                                                                <img src={p.avatar.value} alt={p.name} className="w-full h-full object-cover" />
                                                            ) : typeof p.avatar === 'string' && p.avatar.startsWith('data:image/') ? (
                                                                <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                typeof p.avatar === 'object' ? p.avatar.value : (p.avatar || '🕵️‍♂️')
                                                            )}
                                                        </div>
                                                        <span className="text-[9px] text-white/60 uppercase font-black tracking-widest max-w-[50px] truncate">
                                                            {p.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Replay Button */}
                                            <button
                                                onClick={() => onReplayTeam(session.players)}
                                                className="mt-2 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/10 text-white font-bold uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2"
                                            >
                                                <span>Rejouer cette équipe</span>
                                                <span className="text-spy-lime opacity-80 text-sm">→</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="mt-auto">
                    <BouncyButton onClick={onBack} variant="secondary" className="w-full py-4 text-sm">
                        RETOUR ACCUEIL
                    </BouncyButton>
                </div>
            </div>
        </div>
    );
};

export default History;
