import React, { useState } from 'react';
import { ShieldAlert, Search, HelpCircle, MessageCircle, MessageSquare, Inbox, ArrowLeft, Settings } from 'lucide-react';
import BouncyButton from './BouncyButton';

const HowToPlay = ({ onBack, onOpenSettings }) => {
    const [activeTab, setActiveTab] = useState('roles'); // 'roles' or 'rules'

    return (
        <div className="min-h-screen flex flex-col items-center p-0 pt-20 bg-transparent relative overflow-hidden">
            
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-spy-lime opacity-[0.05] rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-spy-orange opacity-[0.05] rounded-full blur-[100px] animate-pulse-slow delay-700"></div>
            </div>

            <div className="w-full max-w-md flex flex-col h-full z-10 px-6">

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-lg mb-4">
                        Guide <span className="text-spy-lime">Agent</span>
                    </h2>
                    <div className="flex bg-black/25 p-1 rounded-2xl mx-auto w-fit border-2 border-black shadow-[3px_3px_0_#000] overflow-hidden">
                        <button
                            onClick={() => setActiveTab('roles')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'roles' ? 'bg-spy-lime text-spy-blue shadow-md scale-105 border border-black' : 'text-white/60 hover:text-white'}`}
                        >
                            Rôles
                        </button>
                        <button
                            onClick={() => setActiveTab('rules')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'rules' ? 'bg-spy-orange text-white shadow-md scale-105 border border-black' : 'text-white/60 hover:text-white'}`}
                        >
                            Règles
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-grow overflow-y-auto pb-44 no-scrollbar">

                    {activeTab === 'roles' && (
                        <div className="space-y-6">
                            {/* Civilian Card */}
                            <div className="card-cartoon p-5 relative overflow-hidden bg-emerald-950/20 border-emerald-500 shadow-emerald-500/20 text-white">
                                <div className="absolute right-[-25px] top-[-25px] opacity-[0.07] text-white">
                                    <ShieldAlert className="w-40 h-40" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="w-12 h-12 bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 rounded-2xl flex items-center justify-center">
                                            <ShieldAlert className="w-6 h-6" />
                                        </span>
                                        <div>
                                            <h3 className="font-black text-xl uppercase tracking-tight">Innocent</h3>
                                            <span className="text-[9px] bg-emerald-500 text-black px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-black shadow-[1px_1px_0_#000]">Majorité</span>
                                        </div>
                                    </div>
                                    <p className="text-white/80 text-xs font-bold leading-relaxed bg-black/45 p-3 rounded-2xl border-2 border-black">
                                        Vous connaissez le mot secret. <br />
                                        <span className="text-spy-lime font-black">Objectif :</span> Démasquer les espions sans vous faire accuser.
                                    </p>
                                </div>
                            </div>

                            {/* Spy Card */}
                            <div className="card-cartoon p-5 relative overflow-hidden bg-rose-950/20 border-rose-500 shadow-rose-500/20 text-white">
                                <div className="absolute right-[-25px] top-[-25px] opacity-[0.07] text-white">
                                    <Search className="w-40 h-40" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="w-12 h-12 bg-rose-500/20 border-2 border-rose-500 text-rose-400 rounded-2xl flex items-center justify-center">
                                            <Search className="w-6 h-6" />
                                        </span>
                                        <div>
                                            <h3 className="font-black text-xl uppercase tracking-tight">Espion</h3>
                                            <span className="text-[9px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-black shadow-[1px_1px_0_#000]">Infiltré</span>
                                        </div>
                                    </div>
                                    <p className="text-white/80 text-xs font-bold leading-relaxed bg-black/45 p-3 rounded-2xl border-2 border-black">
                                        Vous avez un mot <span className="italic text-rose-400">différent</span> (mais proche). <br />
                                        <span className="text-rose-400 font-black">Objectif :</span> Vous fondre dans la masse et ne pas être repéré.
                                    </p>
                                </div>
                            </div>

                            {/* Mr White Card */}
                            <div className="card-cartoon p-5 relative overflow-hidden bg-slate-900/40 border-slate-400 shadow-slate-400/20 text-white">
                                <div className="absolute right-[-25px] top-[-25px] opacity-[0.07] text-white">
                                    <HelpCircle className="w-40 h-40" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="w-12 h-12 bg-slate-500/20 border-2 border-slate-400 text-slate-300 rounded-2xl flex items-center justify-center">
                                            <HelpCircle className="w-6 h-6" />
                                        </span>
                                        <div>
                                            <h3 className="font-black text-xl uppercase tracking-tight">Mr. Blanc</h3>
                                            <span className="text-[9px] bg-slate-400 text-black px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-black shadow-[1px_1px_0_#000]">Solitaire</span>
                                        </div>
                                    </div>
                                    <p className="text-white/80 text-xs font-bold leading-relaxed bg-black/45 p-3 rounded-2xl border-2 border-black">
                                        Vous n'avez <span className="font-black text-white uppercase">aucun mot</span>. <br />
                                        <span className="text-white font-black">Objectif :</span> Bluffez et devinez le mot des Innocents en écoutant leurs indices.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'rules' && (
                        <div className="space-y-6 px-1">
                            {/* Step 1 */}
                            <div className="flex gap-4 items-start relative">
                                <div className="flex flex-col items-center">
                                    <span className="w-12 h-12 bg-spy-lime/20 border-2 border-spy-lime text-spy-lime rounded-2xl flex items-center justify-center z-10">
                                        <MessageCircle className="w-6 h-6" />
                                    </span>
                                    <div className="w-1 h-24 bg-white/10 my-2 rounded-full absolute top-12 left-[1.4rem]"></div>
                                </div>
                                <div className="card-cartoon p-4 flex-1 text-white bg-black/35">
                                    <h4 className="font-black text-sm uppercase tracking-wider mb-1 text-spy-lime">1. L'Indice</h4>
                                    <p className="text-white/70 text-xs font-bold leading-relaxed">
                                        À tour de rôle, dites <span className="text-white font-black">UN seul mot</span> pour décrire votre mot secret.
                                        <br /><em className="text-[10px] text-spy-orange block mt-2 font-bold">"Attention : Trop précis, Mr. Blanc devine. Trop vague, on vous suspecte !"</em>
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex gap-4 items-start relative">
                                <div className="flex flex-col items-center">
                                    <span className="w-12 h-12 bg-spy-orange/20 border-2 border-spy-orange text-spy-orange rounded-2xl flex items-center justify-center z-10">
                                        <MessageSquare className="w-6 h-6" />
                                    </span>
                                    <div className="w-1 h-24 bg-white/10 my-2 rounded-full absolute top-12 left-[1.4rem]"></div>
                                </div>
                                <div className="card-cartoon p-4 flex-1 text-white bg-black/35">
                                    <h4 className="font-black text-sm uppercase tracking-wider mb-1 text-spy-orange">2. Le Débat</h4>
                                    <p className="text-white/70 text-xs font-bold leading-relaxed">
                                        Discutez librement. Accusez les joueurs aux indices bizarres et défendez votre innocence !
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex gap-4 items-start relative">
                                <div className="flex flex-col items-center">
                                    <span className="w-12 h-12 bg-white/10 border-2 border-white text-white rounded-2xl flex items-center justify-center z-10">
                                        <Inbox className="w-6 h-6" />
                                    </span>
                                </div>
                                <div className="card-cartoon p-4 flex-1 text-white bg-black/35">
                                    <h4 className="font-black text-sm uppercase tracking-wider mb-1 text-white">3. Le Vote</h4>
                                    <p className="text-white/70 text-xs font-bold leading-relaxed">
                                        Désignez l'intrus à la majorité.
                                        <br />
                                        <span className="text-spy-lime block mt-2.5 font-black text-[10px] uppercase tracking-wider">✓ Innocents gagnent si l'espion sort.</span>
                                        <span className="text-spy-orange block mt-1 font-black text-[10px] uppercase tracking-wider">✓ Espions gagnent s'ils survivent.</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Floating Back Button */}
            <div className="fixed bottom-0 left-0 w-full p-6 pb-8 bg-gradient-to-t from-spy-blue via-spy-blue/95 to-transparent z-20 backdrop-blur-[2px]" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
                <BouncyButton onClick={onBack} variant="secondary" className="w-full shadow-[4px_4px_0_#000] py-4 active:scale-95 transition-transform">
                    RETOUR
                </BouncyButton>
            </div>
        </div>
    );
};

export default HowToPlay;
