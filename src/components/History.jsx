import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, X, RotateCcw, ArrowRight, FolderKanban, ShieldCheck, Trophy, Sparkles, Rocket, Calendar } from 'lucide-react';
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
    const groupedHistory = (history || []).reduce((acc, session) => {
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

    const hasHistory = Object.keys(groupedHistory).length > 0;

    return (
        <div className="min-h-screen flex flex-col items-center p-4 pt-16 bg-transparent relative overflow-hidden max-w-md mx-auto">
            <BackArrow onClick={onBack} />
            <SettingsGear onClick={onOpenSettings} />

            {/* Background Ambient Lights */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-20%] w-[600px] h-[600px] bg-spy-lime opacity-[0.12] rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-20%] w-[500px] h-[500px] bg-spy-orange opacity-[0.12] rounded-full blur-[120px] animate-pulse-slow delay-700"></div>
            </div>

            <div className="z-10 w-full animate-slide-up flex flex-col h-[calc(100vh-90px)]">

                {/* Top Status Header */}
                <div className="text-center mb-3 flex-none">
                    <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-black/40 border border-spy-lime/40 text-spy-lime text-[9.5px] font-black uppercase tracking-[0.2em] shadow-lg backdrop-blur-md mb-1">
                        <FolderKanban className="w-3.5 h-3.5" /> RAPPORTS DE MISSIONS
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight text-shadow-md">
                        HISTORIQUE
                    </h1>
                </div>

                {/* Main Glass Card Container */}
                <div className="card-cartoon bg-gradient-to-b from-[#14233e]/95 via-[#0d182b]/95 to-[#0a1426]/95 border-[3.5px] border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-xl rounded-[32px] p-4 flex-1 flex flex-col overflow-hidden relative">

                    {!hasHistory ? (
                        /* EMPTY STATE - Awwwards Cartoon Design */
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
                            <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                className="relative mb-4 flex items-center justify-center"
                            >
                                <div className="w-24 h-24 rounded-full bg-spy-lime/15 border-2 border-spy-lime/40 flex items-center justify-center shadow-[0_0_40px_rgba(204,255,0,0.25)]">
                                    <FolderKanban className="w-12 h-12 text-spy-lime stroke-[2]" />
                                </div>
                            </motion.div>

                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 text-shadow-md">
                                Archives de Mission Vides
                            </h3>

                            <p className="text-white/60 text-xs font-bold leading-relaxed max-w-xs mb-6">
                                Aucune partie enregistrée pour le moment. Lance une mission avec tes agents pour accumuler des rapports de combat, de l'XP et des croquettes !
                            </p>

                            <button
                                onClick={onBack}
                                className="btn-cartoon-primary px-6 py-3.5 text-sm font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_5px_0_#000] active:translate-y-1 transition-all"
                            >
                                <Rocket className="w-4 h-4 stroke-[3]" /> LANCER UNE MISSION
                            </button>
                        </div>
                    ) : (
                        /* POPULATED STATE - Session Cards */
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-4">
                            {Object.entries(groupedHistory).map(([dayLabel, sessions]) => (
                                <div key={dayLabel} className="space-y-3">
                                    {/* Sticky Day Label */}
                                    <div className="sticky top-0 bg-[#091325]/95 backdrop-blur-md py-1.5 px-3 rounded-xl z-20 flex items-center justify-between border border-white/10 shadow-md">
                                        <div className="flex items-center gap-1.5 text-white/50 text-[10px] font-black uppercase tracking-widest">
                                            <Calendar className="w-3.5 h-3.5 text-spy-lime" /> {dayLabel}
                                        </div>

                                        {confirmDeleteDay === dayLabel ? (
                                            <div className="flex items-center gap-2 animate-pop-in">
                                                <button 
                                                    onClick={() => setConfirmDeleteDay(null)}
                                                    className="text-[9px] text-white/50 font-black uppercase tracking-wider hover:text-white transition-colors"
                                                >
                                                    Annuler
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteDay(sessions)}
                                                    className="text-[9px] bg-rose-600 border border-black text-white px-2 py-0.5 rounded-lg font-black uppercase tracking-wider shadow active:scale-95"
                                                >
                                                    Confirmer
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => setConfirmDeleteDay(dayLabel)}
                                                className="text-white/30 hover:text-rose-400 p-1 rounded-lg hover:bg-white/5 transition-colors"
                                                title="Supprimer ce jour"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Sessions in day */}
                                    {sessions.map((session, index) => {
                                        const isCivilianWin = session.winner === 'Civilian';
                                        const isBouffonWin = session.winner === 'Bouffon';
                                        
                                        return (
                                            <div 
                                                key={session.id || index}
                                                className="bg-black/40 border-2 border-white/10 hover:border-white/30 rounded-2xl p-4 transition-all relative overflow-hidden shadow-inner flex flex-col gap-3 group"
                                            >
                                                {/* Card Header: Winner Badge + Time */}
                                                <div className="flex items-center justify-between">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9.5px] font-black uppercase tracking-wider ${
                                                        isBouffonWin 
                                                            ? 'bg-purple-500/20 border-purple-400/50 text-purple-300'
                                                            : isCivilianWin 
                                                                ? 'bg-spy-lime/20 border-spy-lime/50 text-spy-lime'
                                                                : 'bg-spy-orange/20 border-spy-orange/50 text-spy-orange'
                                                    }`}>
                                                        <Trophy className="w-3 h-3 stroke-[2.5]" />
                                                        <span>
                                                            {isBouffonWin ? 'Victoire Bouffon 🃏' : isCivilianWin ? 'Victoire Civils' : 'Victoire Imposteurs'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {session.date && (
                                                            <span className="text-[9px] text-white/40 font-black tracking-widest uppercase">
                                                                {format(parseISO(session.date), "HH:mm")}
                                                            </span>
                                                        )}

                                                        <button
                                                            onClick={() => handleDeleteEntry(session.id)}
                                                            className="text-white/20 hover:text-rose-400 p-1 rounded-lg hover:bg-white/10 transition-colors"
                                                            title="Supprimer la session"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Target Words display if available */}
                                                {session.words && (
                                                    <div className="bg-black/50 rounded-xl p-2 border border-white/5 flex items-center justify-around text-[10px] font-black uppercase tracking-wider text-center">
                                                        <span className="text-spy-lime">Civil : <span className="text-white font-bold">{session.words.civilian}</span></span>
                                                        <span className="text-white/20">|</span>
                                                        <span className="text-spy-orange">Espion : <span className="text-white font-bold">{session.words.undercover}</span></span>
                                                    </div>
                                                )}

                                                {/* Player Avatars Ribbon */}
                                                <div className="flex flex-wrap items-center justify-center gap-2 py-1">
                                                    {session.players.map((p, pIdx) => {
                                                        const rawAvatar = typeof p.avatar === 'object' ? p.avatar?.value : p.avatar;
                                                        return (
                                                            <div key={p.id || pIdx} className="flex flex-col items-center gap-0.5">
                                                                <div className="w-9 h-9 rounded-full border border-white/20 bg-slate-900 overflow-hidden shadow">
                                                                    <CartoonAvatar id={rawAvatar} className="w-full h-full border-none shadow-none" />
                                                                </div>
                                                                <span className={`text-[8.5px] font-black uppercase tracking-wider max-w-[50px] truncate ${p.pseudoColor || 'text-white/70'}`}>
                                                                    {p.name}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Replay Mission Button */}
                                                <button
                                                    onClick={() => onReplayTeam(session.players)}
                                                    className="w-full py-2.5 rounded-xl bg-spy-lime/10 hover:bg-spy-lime/20 border border-spy-lime/40 text-spy-lime font-black uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                                                    <span>Rejouer avec cette équipe</span>
                                                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    )}

                </div>

                {/* Footer Buttons */}
                <div className="mt-3 flex flex-col gap-2 flex-none">
                    <button
                        onClick={onBack}
                        className="btn-cartoon-secondary w-full py-3.5 text-xs font-black uppercase tracking-wider cursor-pointer shadow-[0_4px_0_#000] active:translate-y-1 transition-all"
                    >
                        RETOUR ACCUEIL
                    </button>

                    {hasHistory && (
                        confirmDeleteAll ? (
                            <div className="flex items-center gap-2 animate-pop-in">
                                <button
                                    onClick={() => setConfirmDeleteAll(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-white/20 bg-white/5 text-white/60 font-black uppercase text-[10px] tracking-wider hover:bg-white/10 cursor-pointer"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDeleteAll}
                                    className="flex-1 py-2.5 rounded-xl bg-rose-600 border border-black text-white font-black uppercase text-[10px] tracking-wider shadow-md hover:bg-rose-500 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <AlertTriangle className="w-3.5 h-3.5" /> TOUT SUPPRIMER
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setConfirmDeleteAll(true)}
                                className="w-full py-2 text-rose-400/60 hover:text-rose-400 font-black uppercase text-[9px] tracking-widest transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Vider tout l'historique
                            </button>
                        )
                    )}
                </div>

            </div>
        </div>
    );
};

export default History;
