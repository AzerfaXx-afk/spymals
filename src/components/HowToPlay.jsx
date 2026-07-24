import React, { useState } from 'react';
import { ShieldAlert, Search, HelpCircle, ChevronRight, ChevronLeft, CheckCircle2, Award, Zap, Smile, Flame, Timer, Sparkles } from 'lucide-react';

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

            {/* Background Soft Ambient Radial Glow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-72 h-72 bg-spy-lime/10 rounded-full blur-3xl"></div>
            </div>

            {/* Main Glass Card */}
            <div className="w-full h-full bg-slate-950/90 border-[3.5px] border-white/20 rounded-[32px] p-4 sm:p-5 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-xl relative z-10 overflow-hidden">

                {/* Subheader Title */}
                <div className="text-center flex-none">
                    <div className="inline-block bg-spy-lime/20 border border-spy-lime/40 px-3 py-1 rounded-full mb-1 shadow-sm">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-spy-lime">MANUEL DE MISSION</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight text-shadow-md">
                        Règles du Jeu Spymals
                    </h2>
                </div>

                {/* Tab Navigation Ribbon */}
                <div className="flex items-center justify-between bg-slate-900/90 border-2 border-white/10 rounded-2xl p-1 gap-1 flex-none shadow-inner my-2">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`flex-1 py-2 text-[10.5px] font-black uppercase tracking-wider rounded-xl transition-all ${
                                activeTab === t.id
                                    ? 'bg-spy-lime text-slate-950 shadow-[0_3px_0_#000] scale-[1.02]'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Content Container per Tab */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 my-1">

                    {/* TAB 1: RÔLES */}
                    {activeTab === 'roles' && (
                        <div className="flex flex-col gap-2.5 py-1 animate-pop-in">
                            {/* Civilian Card */}
                            <div className="bg-slate-900/90 border-2 border-emerald-500/70 rounded-2xl p-3 flex items-center gap-3.5 shadow-md text-left">
                                <div className="w-10 h-10 bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                                    <ShieldAlert className="w-5 h-5" />
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
                                <div className="w-10 h-10 bg-rose-500/20 border-2 border-rose-400 text-rose-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                                    <Search className="w-5 h-5" />
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
                            <div className="bg-slate-900/90 border-2 border-cyan-400/70 rounded-2xl p-3 flex items-center gap-3.5 shadow-md text-left">
                                <div className="w-10 h-10 bg-cyan-500/20 border-2 border-cyan-300 text-cyan-300 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-black text-sm text-cyan-200 uppercase tracking-tight">MR. BLANC</span>
                                        <span className="text-[8px] bg-cyan-400 text-slate-950 px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider">DERNIÈRE CHANCE</span>
                                    </div>
                                    <p className="text-[10px] text-white/90 font-bold leading-snug">
                                        Vous n'avez <span className="text-cyan-200 font-black">AUCUN Mot</span>. Si éliminé, vous avez 1 essai pour deviner le mot exact des Civils !
                                    </p>
                                </div>
                            </div>

                            {/* Le Bouffon Card */}
                            <div className="bg-slate-900/90 border-2 border-purple-500/70 rounded-2xl p-3 flex items-center gap-3.5 shadow-md text-left">
                                <div className="w-10 h-10 bg-purple-500/20 border-2 border-purple-400 text-purple-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                                    <Smile className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-black text-sm text-purple-300 uppercase tracking-tight">LE BOUFFON 🃏</span>
                                        <span className="text-[8px] bg-purple-500 text-white px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider">PIÈGE SOLO</span>
                                    </div>
                                    <p className="text-[10px] text-white/90 font-bold leading-snug">
                                        Vous n'avez aucun mot. <span className="text-purple-300 font-black">Faites-vous VOTER DEHORS</span> pour remporter la victoire instantanée !
                                    </p>
                                </div>
                            </div>

                            {/* Le Caméléon Card */}
                            <div className="bg-slate-900/90 border-2 border-emerald-400/70 rounded-2xl p-3 flex items-center gap-3.5 shadow-md text-left">
                                <div className="w-10 h-10 bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-black text-sm text-emerald-300 uppercase tracking-tight">LE CAMÉLÉON 🦎</span>
                                        <span className="text-[8px] bg-emerald-400 text-slate-950 px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider">INFILTRATEUR</span>
                                    </div>
                                    <p className="text-[10px] text-white/90 font-bold leading-snug">
                                        Sans mot au départ, vous devez <span className="text-emerald-300 font-black">copier l'ambiance</span> et survivre jusqu'à la victoire.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: DÉROULEMENT DU JEU */}
                    {activeTab === 'steps' && (
                        <div className="flex flex-col gap-2.5 py-1 animate-pop-in">
                            {/* Step 1 */}
                            <div className="bg-slate-900/90 border-2 border-spy-lime/60 rounded-2xl p-3 flex items-center gap-3.5 text-left shadow-md">
                                <div className="w-10 h-10 rounded-xl bg-spy-lime/20 border-2 border-spy-lime text-spy-lime flex items-center justify-center font-black text-sm flex-shrink-0">
                                    1
                                </div>
                                <div className="flex-1">
                                    <span className="font-black text-xs text-spy-lime uppercase tracking-wider block flex items-center gap-1.5">
                                        <Timer className="w-3.5 h-3.5 text-spy-lime" /> CHRONO 30s PAR TOUR
                                    </span>
                                    <p className="text-[10px] text-white/90 font-bold leading-snug mt-0.5">
                                        Chaque joueur dispose de 30s (avec effets sonores Tic-Tac) pour donner <span className="text-white font-black">UN seul mot d'indice</span>.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-slate-900/90 border-2 border-spy-orange/60 rounded-2xl p-3 flex items-center gap-3.5 text-left shadow-md">
                                <div className="w-10 h-10 rounded-xl bg-spy-orange/20 border-2 border-spy-orange text-spy-orange flex items-center justify-center font-black text-sm flex-shrink-0">
                                    2
                                </div>
                                <div className="flex-1">
                                    <span className="font-black text-xs text-spy-orange uppercase tracking-wider block">DÉBAT & ACCUSATION</span>
                                    <p className="text-[10px] text-white/90 font-bold leading-snug mt-0.5">
                                        Débattez ensemble pour repérer qui semble hésiter ou donner un indice trop éloigné !
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-slate-900/90 border-2 border-purple-400/60 rounded-2xl p-3 flex items-center gap-3.5 text-left shadow-md">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border-2 border-purple-400 text-purple-400 flex items-center justify-center font-black text-sm flex-shrink-0">
                                    3
                                </div>
                                <div className="flex-1">
                                    <span className="font-black text-xs text-purple-300 uppercase tracking-wider block flex items-center gap-1.5">
                                        <Flame className="w-3.5 h-3.5 text-red-500" /> PACK SOIRÉE (+18)
                                    </span>
                                    <p className="text-[10px] text-white/90 font-bold leading-snug mt-0.5">
                                        Profitez du nouveau <span className="text-red-400 font-black">Pack Soirée (+18)</span> et du système de pioche sans aucune répétition de mot !
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: VICTOIRE */}
                    {activeTab === 'win' && (
                        <div className="flex flex-col gap-2.5 py-1 animate-pop-in">
                            <div className="bg-slate-900/90 border-2 border-emerald-500/70 rounded-2xl p-3 text-left shadow-md">
                                <div className="flex items-center gap-2 mb-1">
                                    <Award className="w-4 h-4 text-emerald-400" />
                                    <span className="font-black text-xs text-emerald-300 uppercase tracking-wider">Victoire des Innocents</span>
                                </div>
                                <p className="text-[10px] text-white/80 font-bold leading-relaxed">
                                    Tous les espions, Mr. Blanc et Bouffons ont été démasqués et éliminés au vote !
                                </p>
                            </div>

                            <div className="bg-slate-900/90 border-2 border-rose-500/70 rounded-2xl p-3 text-left shadow-md">
                                <div className="flex items-center gap-2 mb-1">
                                    <Award className="w-4 h-4 text-rose-400" />
                                    <span className="font-black text-xs text-rose-300 uppercase tracking-wider">Victoire des Espions</span>
                                </div>
                                <p className="text-[10px] text-white/80 font-bold leading-relaxed">
                                    Il ne reste plus qu'un seul innocent ou Mr. Blanc a deviné le mot secret des Civils !
                                </p>
                            </div>

                            <div className="bg-slate-900/90 border-2 border-purple-500/70 rounded-2xl p-3 text-left shadow-md">
                                <div className="flex items-center gap-2 mb-1">
                                    <Award className="w-4 h-4 text-purple-400" />
                                    <span className="font-black text-xs text-purple-300 uppercase tracking-wider">Victoire du Bouffon 🃏</span>
                                </div>
                                <p className="text-[10px] text-white/80 font-bold leading-relaxed">
                                    Le Bouffon a réussi à tromper tout le monde et s'est fait voter dehors !
                                </p>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Navigation Buttons */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10 flex-none">
                    <button
                        onClick={prevTab}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase px-4 py-2.5 rounded-xl border border-white/20 flex items-center gap-1 cursor-pointer transition-all shadow"
                    >
                        <ChevronLeft className="w-4 h-4" /> RETOUR
                    </button>

                    <button
                        onClick={nextTab}
                        className="btn-cartoon-primary py-2.5 px-5 text-xs font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer shadow-[0_4px_0_#000] active:translate-y-1 transition-all"
                    >
                        SUIVANT <ChevronRight className="w-4 h-4 stroke-[3]" />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default HowToPlay;
