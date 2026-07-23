import React, { useState } from 'react';
import { ShieldAlert, Search, HelpCircle, ChevronRight, ChevronLeft, CheckCircle2, Award, Zap } from 'lucide-react';

const HowToPlay = ({ onBack, onOpenSettings }) => {
    const [activeTab, setActiveTab] = useState('roles'); // 'roles', 'steps', 'win'

    const tabs = [
        { id: 'roles', label: '1. RÔLES' },
        { id: 'steps', label: '2. DÉROULEMENT' },
        { id: 'win', label: '3. VICTOIRE' }
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
        <div className="fixed inset-0 top-[70px] sm:top-[78px] bottom-24 px-4 max-w-md mx-auto flex flex-col items-center justify-start overflow-hidden pointer-events-auto select-none z-10">

            {/* Background Soft Ambient Radial Glow - Seamless Blend */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-72 h-72 bg-spy-lime/10 rounded-full blur-3xl"></div>
            </div>

            <div className="z-10 w-full flex flex-col items-center">

                {/* Header Title */}
                <div className="text-center mb-2.5 sm:mb-3 flex-shrink-0 w-full">
                    <div className="inline-flex items-center px-3 py-0.5 rounded-full bg-spy-lime/8 border border-spy-lime/25 text-spy-lime text-[7.5px] sm:text-[9px] font-black uppercase tracking-[0.15em] mb-0.5"
                        style={{ boxShadow: '0 2px 12px rgba(204,255,0,0.08)' }}
                    >
                        MANUEL TECHNIQUE
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight"
                        style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
                    >
                        GUIDE DU JEU
                    </h1>
                    <div className="w-14 sm:w-16 h-[2px] bg-gradient-to-r from-transparent via-spy-lime to-transparent mx-auto rounded-full mt-0.5 opacity-80"></div>
                </div>

                {/* 3D Cartoon Tab Navigation Bar */}
                <div className="flex bg-slate-950/90 backdrop-blur-md p-1.5 rounded-2xl border-2 border-white/15 shadow-md flex-shrink-0 w-full mb-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-2 rounded-xl text-[10.5px] font-black uppercase tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center ${activeTab === tab.id
                                    ? 'bg-spy-lime text-slate-950 shadow-[0_3px_0_#88bb00] font-extrabold border border-white scale-[1.02]'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* MAIN CARTOON CONTENT CARD - Fixed height & clean rounded corners without square background cutoffs */}
                <div className="w-full bg-slate-950/90 backdrop-blur-xl border-2 border-white/15 rounded-3xl p-4 shadow-[0_12px_30px_rgba(0,0,0,0.6)] flex flex-col justify-between overflow-hidden relative min-h-[380px]">

                    {/* TAB 1: LES RÔLES */}
                    {activeTab === 'roles' && (
                        <div className="flex-1 flex flex-col justify-between gap-2.5 py-1 animate-pop-in">
                            {/* Civilian Card */}
                            <div className="bg-slate-900/90 border-2 border-emerald-500/70 rounded-2xl p-3 flex items-center gap-3.5 shadow-md text-left">
                                <div className="w-11 h-11 bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-black text-sm text-emerald-300 uppercase tracking-tight">INNOCENT</span>
                                        <span className="text-[8px] bg-emerald-400 text-slate-950 px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider">MAJORITÉ</span>
                                    </div>
                                    <p className="text-[10px] text-white/90 font-bold leading-snug">
                                        Vous avez le <span className="text-spy-lime font-black">Mot Secret</span>. Démasquez les espions sans révéler votre mot !
                                    </p>
                                </div>
                            </div>

                            {/* Spy Card */}
                            <div className="bg-slate-900/90 border-2 border-rose-500/70 rounded-2xl p-3 flex items-center gap-3.5 shadow-md text-left">
                                <div className="w-11 h-11 bg-rose-500/20 border-2 border-rose-400 text-rose-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                                    <Search className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-black text-sm text-rose-300 uppercase tracking-tight">ESPION</span>
                                        <span className="text-[8px] bg-rose-500 text-white px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider">INFILTRÉ</span>
                                    </div>
                                    <p className="text-[10px] text-white/90 font-bold leading-snug">
                                        Vous avez un <span className="text-rose-300 font-black">Mot Proche</span>. Écoutez bien et fondez-vous dans la masse !
                                    </p>
                                </div>
                            </div>

                            {/* Mr. White Card */}
                            <div className="bg-slate-900/90 border-2 border-purple-400/70 rounded-2xl p-3 flex items-center gap-3.5 shadow-md text-left">
                                <div className="w-11 h-11 bg-purple-500/20 border-2 border-purple-300 text-purple-300 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                                    <HelpCircle className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-black text-sm text-purple-200 uppercase tracking-tight">MR. BLANC</span>
                                        <span className="text-[8px] bg-purple-400 text-slate-950 px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider">SOLITAIRE</span>
                                    </div>
                                    <p className="text-[10px] text-white/90 font-bold leading-snug">
                                        Vous n'avez <span className="text-purple-200 font-black">AUCUN Mot</span>. Bluffez et devinez le mot des Innocents !
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: DÉROULEMENT DU JEU */}
                    {activeTab === 'steps' && (
                        <div className="flex-1 flex flex-col justify-between gap-2.5 py-1 animate-pop-in">
                            {/* Step 1 */}
                            <div className="bg-slate-900/90 border-2 border-spy-lime/60 rounded-2xl p-3 flex items-center gap-3.5 text-left shadow-md">
                                <div className="w-10 h-10 rounded-xl bg-spy-lime/20 border-2 border-spy-lime text-spy-lime flex items-center justify-center font-black text-sm flex-shrink-0">
                                    1
                                </div>
                                <div className="flex-1">
                                    <span className="font-black text-xs text-spy-lime uppercase tracking-wider block">L'INDICE</span>
                                    <p className="text-[10px] text-white/90 font-bold leading-snug mt-0.5">
                                        Chacun donne <span className="text-white font-black">UN seul mot d'indice</span> lié à son mot secret.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-slate-900/90 border-2 border-spy-orange/60 rounded-2xl p-3 flex items-center gap-3.5 text-left shadow-md">
                                <div className="w-10 h-10 rounded-xl bg-spy-orange/20 border-2 border-spy-orange text-spy-orange flex items-center justify-center font-black text-sm flex-shrink-0">
                                    2
                                </div>
                                <div className="flex-1">
                                    <span className="font-black text-xs text-spy-orange uppercase tracking-wider block">LE DÉBAT</span>
                                    <p className="text-[10px] text-white/90 font-bold leading-snug mt-0.5">
                                        Discutez librement. Accusez les suspects aux indices louches et défendez-vous !
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-slate-900/90 border-2 border-sky-400/60 rounded-2xl p-3 flex items-center gap-3.5 text-left shadow-md">
                                <div className="w-10 h-10 rounded-xl bg-sky-400/20 border-2 border-sky-400 text-sky-300 flex items-center justify-center font-black text-sm flex-shrink-0">
                                    3
                                </div>
                                <div className="flex-1">
                                    <span className="font-black text-xs text-sky-300 uppercase tracking-wider block">LE VOTE</span>
                                    <p className="text-[10px] text-white/90 font-bold leading-snug mt-0.5">
                                        Votez à la majorité pour éliminer le joueur le plus suspect de la table.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: CONDITIONS DE VICTOIRE */}
                    {activeTab === 'win' && (
                        <div className="flex-1 flex flex-col justify-between gap-2.5 py-1 animate-pop-in">
                            <div className="bg-slate-900/90 border-2 border-emerald-500/60 rounded-2xl p-3 text-left shadow-md">
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
                                    <span className="font-black text-xs text-emerald-300 uppercase tracking-wide">VICTOIRE DES INNOCENTS</span>
                                </div>
                                <p className="text-[10px] text-white/90 font-bold leading-snug">
                                    Éliminez tous les Espions et Mr. Blanc lors des votes.
                                </p>
                            </div>

                            <div className="bg-slate-900/90 border-2 border-rose-500/60 rounded-2xl p-3 text-left shadow-md">
                                <div className="flex items-center gap-2 mb-1">
                                    <Zap className="w-4.5 h-4.5 text-rose-400 flex-shrink-0" />
                                    <span className="font-black text-xs text-rose-300 uppercase tracking-wide">VICTOIRE DES ESPIONS</span>
                                </div>
                                <p className="text-[10px] text-white/90 font-bold leading-snug">
                                    Survivez jusqu'à ce qu'il ne reste qu'un seul Innocent en jeu !
                                </p>
                            </div>

                            <div className="bg-slate-900/90 border-2 border-purple-400/60 rounded-2xl p-3 text-left shadow-md">
                                <div className="flex items-center gap-2 mb-1">
                                    <Award className="w-4.5 h-4.5 text-purple-300 flex-shrink-0" />
                                    <span className="font-black text-xs text-purple-200 uppercase tracking-wide">VICTOIRE DE MR. BLANC</span>
                                </div>
                                <p className="text-[10px] text-white/90 font-bold leading-snug">
                                    Devinez le mot exact des Innocents s'il est éliminé, ou survivez jusqu'à la fin.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* BOTTOM NAV CONTROLS */}
                    <div className="pt-2.5 border-t border-white/10 flex items-center justify-between flex-shrink-0 mt-1">
                        <button
                            onClick={prevTab}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/15 rounded-xl text-white font-black text-[10.5px] uppercase tracking-wider flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" /> Précédent
                        </button>

                        <div className="flex items-center gap-1.5">
                            {tabs.map((t) => (
                                <span
                                    key={t.id}
                                    onClick={() => setActiveTab(t.id)}
                                    className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${activeTab === t.id ? 'w-5 bg-spy-lime shadow-[0_0_8px_rgba(204,255,0,0.8)]' : 'bg-white/20 hover:bg-white/40'
                                        }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={nextTab}
                            className="px-4 py-2 bg-spy-lime hover:bg-[#bbe600] text-slate-950 border border-white rounded-xl font-black text-[10.5px] uppercase tracking-wider flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-[0_3px_0_#77aa00]"
                        >
                            Suivant <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default HowToPlay;
