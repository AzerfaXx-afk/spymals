import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, RotateCcw, ArrowRight } from 'lucide-react';
import BouncyButton from './BouncyButton';
import BackArrow from './BackArrow';
import SettingsGear from './SettingsGear';
import { CartoonAvatar } from './CartoonAvatars';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
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
        <div className="min-h-screen flex flex-col items-center p-6 pt-20 bg-transparent relative overflow-hidden max-w-md mx-auto">
            <BackArrow onClick={onBack} />
            <SettingsGear onClick={onOpenSettings} />

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-spy-orange opacity-[0.05] rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] left-[-20%] w-[500px] h-[500px] bg-spy-blue-light opacity-[0.05] rounded-full blur-[100px] animate-pulse-slow delay-700"></div>
            </div>

            <div className="z-10 w-full animate-slide-up flex flex-col h-full">

                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-lg mb-2">
                        Historique
                    </h1>
                    <div className="w-16 h-1.5 bg-spy-orange mx-auto rounded-full border border-black shadow-[1px_1px_0_#000]"></div>
                </div>

                {/* History List */}
                <div className="card-cartoon p-4 flex-grow overflow-y-auto mb-6 no-scrollbar bg-black/45 text-white border-3 border-black min-h-[50dvh]">

                    {Object.keys(groupedHistory).length === 0 ? (
                        <div className="text-center text-white/30 py-20 font-black uppercase tracking-widest text-xs">
                            Aucune partie enregistrée
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedHistory).map(([dayLabel, sessions]) => (
                                <div key={dayLabel} className="space-y-3 relative">
                                    <div className="sticky top-0 bg-black/60 backdrop-blur-sm p-2.5 rounded-xl z-10 flex items-center justify-between border border-white/5">
                                        <h2 className="text-white/50 font-black uppercase tracking-widest text-[10px] ml-1">
                                            {dayLabel}
                                        </h2>
                                        {confirmDeleteDay === dayLabel ? (
                                            <div className="flex gap-2 mr-1 animate-pop-in">
                                                <button onClick={() => setConfirmDeleteDay(null)} className="text-[9px] text-white/50 px-2 py-1 uppercase font-black tracking-widest hover:text-white transition-colors cursor-pointer">Annuler</button>
                                                <button onClick={() => handleDeleteDay(sessions)} className="text-[9px] bg-rose-600 border-2 border-black text-white rounded-lg px-2 py-1 uppercase font-black tracking-widest transition-all shadow-[1px_1px_0_#000] active:scale-95 cursor-pointer">Confirmer</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setConfirmDeleteDay(dayLabel)} className="text-white/25 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer" title="Supprimer ce jour">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {sessions.map((session, index) => (
                                        <div key={session.id || index} className="bg-black/25 rounded-2xl p-4 border-2 border-black hover:border-white/20 transition-colors flex flex-col gap-3 relative group shadow-[2px_2px_0_#000]">

                                            <button
                                                onClick={() => handleDeleteEntry(session.id)}
                                                className="absolute top-2.5 right-2.5 text-white/15 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-white/5 z-10 cursor-pointer"
                                                title="Supprimer cette partie"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>

                                            {/* Player avatars */}
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {session.players.map(p => {
                                                    const rawAvatar = typeof p.avatar === 'object' ? p.avatar?.value : p.avatar;
                                                    return (
                                                        <div key={p.id} className="flex flex-col items-center gap-1">
                                                            <CartoonAvatar id={rawAvatar} className="w-10 h-10 border-none shadow-none" />
                                                            <span className="text-[8px] text-white/50 uppercase font-black tracking-wider max-w-[50px] truncate">
                                                                {p.name}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Replay Button */}
                                            <button
                                                onClick={() => onReplayTeam(session.players)}
                                                className="mt-1 w-full py-2.5 rounded-xl bg-spy-lime/10 hover:bg-spy-lime/20 active:scale-95 border-2 border-black text-white font-black uppercase text-[9px] tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[1px_1px_0_#000]"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5 text-spy-lime" />
                                                <span>Rejouer cette mission</span>
                                                <ArrowRight className="w-3.5 h-3.5 text-spy-lime/60" />
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
                    <BouncyButton onClick={onBack} variant="secondary" className="w-full py-4 text-xs font-black shadow-[3px_3px_0_#000]">
                        RETOUR ACCUEIL
                    </BouncyButton>

                    {history.length > 0 && (
                        confirmDeleteAll ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmDeleteAll(false)}
                                    className="flex-1 py-3 rounded-2xl border-2 border-black bg-white/5 text-white/50 font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center gap-1"
                                >
                                    <X className="w-3.5 h-3.5" /> Annuler
                                </button>
                                <button
                                    onClick={handleDeleteAll}
                                    className="flex-1 py-3 rounded-2xl bg-rose-600 border-2 border-black text-white font-black uppercase text-[10px] tracking-widest hover:bg-rose-700 active:scale-95 transition-all shadow-[2px_2px_0_#000] flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <AlertTriangle className="w-3.5 h-3.5" /> TOUT SUPPRIMER
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setConfirmDeleteAll(true)}
                                className="w-full py-3 rounded-2xl border-2 border-dashed border-rose-600/40 text-rose-500/70 font-black uppercase text-[9px] tracking-widest hover:border-rose-500/60 hover:text-rose-400 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Vider l'historique
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default History;
