import React, { useState } from 'react';
import { ShieldAlert, Search, HelpCircle, MessageCircle, MessageSquare, Inbox, Trophy, ChevronRight, ChevronLeft, Sparkles, CheckCircle2 } from 'lucide-react';

const HowToPlay = ({ onBack, onOpenSettings }) => {
    const [activeTab, setActiveTab] = useState('roles'); // 'roles', 'steps', 'win'

    const tabs = [
        { id: 'roles', label: '🎭 1. Rôles' },
        { id: 'steps', label: '⚡ 2. Déroulement' },
        { id: 'win', label: '🏆 3. Victoire' }
    ];

    const nextTab = () => {
        if (activeTab === 'roles') setActiveTab('steps');
        else if (activeTab === 'steps') setActiveTab('win');
        else setActiveTab('roles');
    };

    const prevTab = () => {
        if (activeTab === 'win') setActiveTab('steps');
        else if (activeTab === 'steps') setActiveTab('roles');
        else setActiveTab('win');
    };

    return (
        <div className="fixed inset-0 top-18 bottom-22 px-3.5 max-w-md mx-auto flex flex-col justify-between overflow-hidden pointer-events-auto select-none z-10">
            
            {/* Background Soft Neon Glow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-64 h-64 bg-spy-lime opacity-10 rounded-full blur-[90px]"></div>
                <div className="absolute bottom-4 right-4 w-48 h-48 bg-spy-orange opacity-10 rounded-full blur-[80px]"></div>
            </div>

            <div className="z-10 w-full flex flex-col h-full overflow-hidden justify-between">
                
                {/* Header Title */}
                <div className="text-center mb-1 flex-shrink-0">
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-spy-lime/10 border border-spy-lime/30 text-spy-lime text-[8.5px] font-black uppercase tracking-widest mb-0.5">
                        <Sparkles className="w-3 h-3" /> GUIDE COMPLET DE L'AGENT
                    </div>
                    <h1 className="text-xl font-black text-white uppercase tracking-tighter drop-shadow-md">
                        COMMENT JOUER ?
                    </h1>
                    <div className="w-12 h-1 bg-gradient-to-r from-transparent via-spy-lime to-transparent mx-auto rounded-full"></div>
                </div>

                {/* 3D Cartoon Tab Navigation Bar */}
                <div className="flex bg-slate-950/90 backdrop-blur-md p-1 rounded-2xl border-2 border-white/15 shadow-lg flex-shrink-0 my-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center ${
                                activeTab === tab.id
                                    ? 'bg-spy-lime text-slate-950 shadow-[0_3px_0_#88bb00] scale-105 font-extrabold border border-white'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* MAIN CARTOON CONTENT CARD (Fits 100% inside screen without scrolling!) */}
                <div className="w-full bg-slate-950/95 backdrop-blur-2xl border-2 border-white/15 rounded-[2.2rem] p-3 shadow-[0_16px_40px_rgba(0,0,0,0.85)] flex-1 flex flex-col justify-between overflow-hidden min-h-0 relative">
                    
                    {/* TAB 1: LES RÔLES */}
                    {activeTab === 'roles' && (
                        <div className="flex-1 flex flex-col justify-between py-1 gap-2 animate-pop-in">
                            {/* Civilian Card */}
                            <div className="bg-emerald-950/40 border-2 border-emerald-500/60 rounded-2xl p-2.5 flex items-center gap-3 shadow-md relative overflow-hidden group">
                                <div className="w-11 h-11 bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-black text-sm text-emerald-300 uppercase tracking-tight">INNOCENT</span>
                                        <span className="text-[7.5px] bg-emerald-400 text-slate-950 px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider">MAJORITÉ</span>
                                    </div>
                                    <p className="text-[10px] text-white/90 font-extrabold leading-tight">
                                        Vous avez le <span className="text-spy-lime font-black">Mot Secret</span>. Trouvez l'espion sans révéler votre rôle !
                                    </p>
                                </div>
                            </div>

                            {/* Spy Card */}
                            <div className="bg-rose-950/40 border-2 border-rose-500/60 rounded-2xl p-2.5 flex items-center gap-3 shadow-md relative overflow-hidden group">
                                <div className="w-11 h-11 bg-rose-500/20 border-2 border-rose-400 text-rose-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                                    <Search className="w-6 h-6" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-black text-sm text-rose-300 uppercase tracking-tight">ESPION</span>
                                        <span className="text-[7.5px] bg-rose-500 text-white px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider">INFILTRÉ</span>
                                    </div>
                                    <p className="text-[10px] text-white/90 font-extrabold leading-tight">
                                        Vous avez un <span className="text-rose-300 font-black">Mot Proche</span>. Bluffez pour passer inaperçu !
                                    </p>
                                </div>
                            </div>

                            {/* Mr. White Card */}
                            <div className="bg-purple-950/40 border-2 border-purple-400/60 rounded-2xl p-2.5 flex items-center gap-3 shadow-md relative overflow-hidden group">
                                <div className="w-11 h-11 bg-purple-500/20 border-2 border-purple-300 text-purple-300 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                                    <HelpCircle className="w-6 h-6" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-black text-sm text-purple-200 uppercase tracking-tight">MR. BLANC</span>
                                        <span className="text-[7.5px] bg-purple-400 text-slate-950 px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider">SOLITAIRE</span>
                                    </div>
                                    <p className="text-[10px] text-white/90 font-extrabold leading-tight">
                                        Vous n'avez <span className="text-purple-200 font-black">AUCUN Mot</span>. Écoutez les indices et devinez le mot !
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: DÉROULEMENT DU JEU */}
                    {activeTab === 'steps' && (
                        <div className="flex-1 flex flex-col justify-between py-1 gap-2 animate-pop-in">
                            {/* Step 1 */}
                            <div className="bg-slate-900/90 border-2 border-spy-lime/50 rounded-2xl p-2.5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-spy-lime/20 border border-spy-lime text-spy-lime flex items-center justify-center font-black text-sm flex-shrink-0">
                                    1
                                </div>
                                <div className="flex-1 text-left">
                                    <span className="font-black text-xs text-spy-lime uppercase tracking-wider block">L'INDICE</span>
                                    <p className="text-[9.5px] text-white/80 font-bold leading-tight mt-0.5">
                                        Chacun donne <span className="text-white font-black">UN seul mot</span> à son tour pour décrire son mot.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-slate-900/90 border-2 border-spy-orange/50 rounded-2xl p-2.5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-spy-orange/20 border border-spy-orange text-spy-orange flex items-center justify-center font-black text-sm flex-shrink-0">
                                    2
                                </div>
                                <div className="flex-1 text-left">
                                    <span className="font-black text-xs text-spy-orange uppercase tracking-wider block">LE DÉBAT</span>
                                    <p className="text-[9.5px] text-white/80 font-bold leading-tight mt-0.5">
                                        Discutez librement. Accusez les suspects aux indices louches !
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-slate-900/90 border-2 border-sky-400/50 rounded-2xl p-2.5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-sky-400/20 border border-sky-400 text-sky-300 flex items-center justify-center font-black text-sm flex-shrink-0">
                                    3
                                </div>
                                <div className="flex-1 text-left">
                                    <span className="font-black text-xs text-sky-300 uppercase tracking-wider block">LE VOTE</span>
                                    <p className="text-[9.5px] text-white/80 font-bold leading-tight mt-0.5">
                                        Votez à la majorité pour éliminer le joueur le plus suspect.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: CONDITIONS DE VICTOIRE */}
                    {activeTab === 'win' && (
                        <div className="flex-1 flex flex-col justify-between py-1 gap-2 animate-pop-in">
                            <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/50 rounded-2xl p-2.5 text-left">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    <span className="font-black text-xs text-emerald-300 uppercase tracking-wide">VICTOIRE DES INNOCENTS</span>
                                </div>
                                <p className="text-[9.5px] text-white/80 font-bold leading-tight">
                                    Éliminez tous les Espions et Mr. Blanc lors des votes.
                                </p>
                            </div>

                            <div className="bg-gradient-to-r from-rose-950/60 to-slate-900 border border-rose-500/50 rounded-2xl p-2.5 text-left">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <CheckCircle2 className="w-4 h-4 text-rose-400" />
                                    <span className="font-black text-xs text-rose-300 uppercase tracking-wide">VICTOIRE DES ESPIONS</span>
                                </div>
                                <p className="text-[9.5px] text-white/80 font-bold leading-tight">
                                    Survivez jusqu'à ce qu'il ne reste qu'un seul Innocent !
                                </p>
                            </div>

                            <div className="bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-400/50 rounded-2xl p-2.5 text-left">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Trophy className="w-4 h-4 text-purple-300" />
                                    <span className="font-black text-xs text-purple-200 uppercase tracking-wide">VICTOIRE DE MR. BLANC</span>
                                </div>
                                <p className="text-[9.5px] text-white/80 font-bold leading-tight">
                                    Devinez le mot exact des Innocents s'il est éliminé, ou survivez !
                                </p>
                            </div>
                        </div>
                    )}

                    {/* BOTTOM NAV / STEPPER CONTROLS */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between flex-shrink-0">
                        <button
                            onClick={prevTab}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/15 rounded-xl text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" /> Précédent
                        </button>

                        <div className="flex items-center gap-1.5">
                            {tabs.map((t) => (
                                <span
                                    key={t.id}
                                    onClick={() => setActiveTab(t.id)}
                                    className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${
                                        activeTab === t.id ? 'w-5 bg-spy-lime shadow-[0_0_8px_rgba(204,255,0,0.8)]' : 'bg-white/20 hover:bg-white/40'
                                    }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={nextTab}
                            className="px-3 py-1.5 bg-spy-lime hover:bg-[#bbe600] text-slate-950 border border-white rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-[0_3px_0_#77aa00]"
                        >
                            Suivant <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default HowToPlay;
