import React, { useState } from 'react';
import BouncyButton from './BouncyButton';
import BackArrow from './BackArrow';
import SettingsGear from './SettingsGear';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { fr } from 'date-fns/locale';

const History = ({ history, onUpdateHistory, onReplayTeam, onBack, onOpenSettings }) => {
    const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
    const [confirmDeleteDay, setConfirmDeleteDay] = useState(null);

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
        return acc;
    }, {});

    const handleDeleteEntry = (id) => {
        onUpdateHistory(history.filter(session => session.id !== id));
    };

    const handleDeleteDay = (daySessions) => {
        const idsToDelete = daySessions.map(s => s.id);
        onUpdateHistory(history.filter(session => !idsToDelete.includes(session.id)));
        setConfirmDeleteDay(null);
    };

    const handleDeleteAll = () => {
        onUpdateHistory([]);
        setConfirmDeleteAll(false);
    };


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
                                <div key={dayLabel} className="space-y-3 relative">
                                    <div className="sticky top-0 bg-spy-blue/90 backdrop-blur-sm p-2 rounded-lg z-10 flex items-center justify-between shadow-sm">
                                        <h2 className="text-white/60 font-bold uppercase tracking-widest text-xs ml-2">
                                            {dayLabel}
                                        </h2>
                                        {confirmDeleteDay === dayLabel ? (
                                            <div className="flex gap-2 mr-1 animate-fade-in">
                                                <button onClick={() => setConfirmDeleteDay(null)} className="text-[10px] text-white/50 px-2 py-1 uppercase font-bold tracking-widest hover:text-white transition-colors">Annuler</button>
                                                <button onClick={() => handleDeleteDay(sessions)} className="text-[10px] bg-red-500/80 hover:bg-red-500 border border-red-500 text-white rounded-lg px-2 py-1 uppercase font-black tracking-widest transition-all shadow-lg active:scale-95">Confirmer</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setConfirmDeleteDay(dayLabel)} className="text-white/30 hover:text-red-400 p-2 rounded-full hover:bg-white/5 transition-all text-sm flex items-center justify-center mr-1" title="Supprimer ce jour">🗑️</button>
                                        )}
                                    </div>

                                    {sessions.map((session, index) => (
                                        <div key={session.id || index} className="bg-black/20 rounded-xl p-4 border border-white/5 hover:border-white/20 transition-colors flex flex-col gap-3 relative group">

                                            <button
                                                onClick={() => handleDeleteEntry(session.id)}
                                                className="absolute top-2 right-2 text-white/20 hover:text-red-400 transition-colors p-1.5 rounded-full hover:bg-white/10 z-10"
                                                title="Supprimer cette partie"
                                            >
                                                ✕
                                            </button>

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
                <div className="mt-auto flex flex-col gap-3">
                    <BouncyButton onClick={onBack} variant="secondary" className="w-full py-4 text-sm">
                        RETOUR ACCUEIL
                    </BouncyButton>

                    {history.length > 0 && (
                        confirmDeleteAll ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmDeleteAll(false)}
                                    className="flex-1 py-3 rounded-2xl border border-white/20 text-white/50 font-bold uppercase text-xs tracking-widest hover:border-white/40 transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDeleteAll}
                                    className="flex-1 py-3 rounded-2xl bg-red-600/80 border border-red-500 text-white font-black uppercase text-xs tracking-widest hover:bg-red-600 active:scale-95 transition-all shadow-lg"
                                >
                                    ⚠️ TOUT SUPPRIMER
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setConfirmDeleteAll(true)}
                                className="w-full py-3 rounded-2xl border border-red-500/30 text-red-500/70 font-bold uppercase text-xs tracking-widest hover:border-red-500/60 hover:text-red-400 transition-all"
                            >
                                🗑 Vider l'historique
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default History;
