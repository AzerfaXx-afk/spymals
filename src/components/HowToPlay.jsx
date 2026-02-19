import React, { useState } from 'react';
import BouncyButton from './BouncyButton';
import BackArrow from './BackArrow';
import SettingsGear from './SettingsGear';

const HowToPlay = ({ onBack, onOpenSettings }) => {
    const [activeTab, setActiveTab] = useState('roles'); // 'roles' or 'rules'

    return (
        <div className="min-h-screen flex flex-col items-center p-0 pt-20 bg-spy-blue relative overflow-hidden">
            <BackArrow onClick={onBack} />
            <SettingsGear onClick={onOpenSettings} />

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-spy-lime opacity-[0.05] rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-spy-orange opacity-[0.05] rounded-full blur-[100px] animate-pulse-slow delay-700"></div>
            </div>

            <div className="w-full max-w-md flex flex-col h-full z-10 px-6">

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-lg mb-2">
                        Guide <span className="text-spy-lime">Agent</span>
                    </h2>
                    <div className="flex bg-black/20 p-1 rounded-xl mx-auto w-fit backdrop-blur-sm border border-white/5">
                        <button
                            onClick={() => setActiveTab('roles')}
                            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'roles' ? 'bg-spy-lime text-spy-blue shadow-lg scale-105' : 'text-white/50 hover:text-white'}`}
                        >
                            Rôles
                        </button>
                        <button
                            onClick={() => setActiveTab('rules')}
                            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'rules' ? 'bg-spy-orange text-white shadow-lg scale-105' : 'text-white/50 hover:text-white'}`}
                        >
                            Règles
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-grow overflow-y-auto pb-40 no-scrollbar mask-image-b" style={{ paddingBottom: 'calc(10rem + env(safe-area-inset-bottom))' }}>

                    {activeTab === 'roles' && (
                        <div className="space-y-4">
                            {/* Civilian Card */}
                            <div className="relative bg-gradient-to-br from-spy-lime/20 to-spy-blue/40 border border-spy-lime/30 rounded-3xl p-5 overflow-hidden group">
                                <div className="absolute right-[-20px] top-[-20px] text-9xl opacity-10 group-hover:scale-110 transition-transform">🕵️‍♂️</div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-4xl bg-spy-lime/20 p-2 rounded-2xl border border-spy-lime/20 shadow-[0_0_15px_rgba(164,246,0,0.2)]">🕵️‍♂️</span>
                                        <div>
                                            <h3 className="font-black text-2xl text-white uppercase tracking-tight">Innocent</h3>
                                            <span className="text-[10px] bg-spy-lime text-spy-blue px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Majorité</span>
                                        </div>
                                    </div>
                                    <p className="text-white/80 text-sm font-medium leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                                        Vous connaissez le mot secret. <br />
                                        <span className="text-spy-lime font-bold">Objectif :</span> Démasquer les espions sans vous faire accuser.
                                    </p>
                                </div>
                            </div>

                            {/* Spy Card */}
                            <div className="relative bg-gradient-to-br from-spy-orange/20 to-red-900/40 border border-spy-orange/30 rounded-3xl p-5 overflow-hidden group">
                                <div className="absolute right-[-20px] top-[-20px] text-9xl opacity-10 group-hover:scale-110 transition-transform">🦊</div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-4xl bg-spy-orange/20 p-2 rounded-2xl border border-spy-orange/20 shadow-[0_0_15px_rgba(255,87,34,0.2)]">🦊</span>
                                        <div>
                                            <h3 className="font-black text-2xl text-white uppercase tracking-tight">Espion</h3>
                                            <span className="text-[10px] bg-spy-orange text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Infiltré</span>
                                        </div>
                                    </div>
                                    <p className="text-white/80 text-sm font-medium leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                                        Vous avez un mot <span className="italic text-spy-orange">différent</span> (mais proche). <br />
                                        <span className="text-spy-orange font-bold">Objectif :</span> Vous fondre dans la masse et ne pas être repéré.
                                    </p>
                                </div>
                            </div>

                            {/* Mr White Card */}
                            <div className="relative bg-gradient-to-br from-white/10 to-gray-900/40 border border-white/30 rounded-3xl p-5 overflow-hidden group">
                                <div className="absolute right-[-20px] top-[-20px] text-9xl opacity-10 group-hover:scale-110 transition-transform">🐻‍❄️</div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-4xl bg-white/10 p-2 rounded-2xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)]">🐻‍❄️</span>
                                        <div>
                                            <h3 className="font-black text-2xl text-white uppercase tracking-tight">Mr. Blanc</h3>
                                            <span className="text-[10px] bg-white text-spy-blue px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Solo</span>
                                        </div>
                                    </div>
                                    <p className="text-white/80 text-sm font-medium leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                                        Vous n'avez <span className="font-bold text-white uppercase">AUCUN MOT</span>. <br />
                                        <span className="text-white font-bold">Objectif :</span> Bluffez et devinez le mot des Innocents en écoutant.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'rules' && (
                        <div className="space-y-6 px-2">
                            {/* Step 1 */}
                            <div className="flex gap-4 items-start relative">
                                <div className="flex flex-col items-center">
                                    {/* Updated to match Roles style */}
                                    <span className="text-4xl bg-spy-lime/20 p-2 rounded-2xl border border-spy-lime/20 shadow-[0_0_15px_rgba(164,246,0,0.2)] z-10 bg-spy-blue">🗣️</span>
                                    <div className="w-1 h-24 bg-white/10 my-2 rounded-full absolute top-14 left-[1.65rem]"></div>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex-1 backdrop-blur-sm mt-1">
                                    <h4 className="font-black text-white uppercase tracking-wide mb-1">1. L'Indice</h4>
                                    <p className="text-white/70 text-sm">
                                        À tour de rôle, dites <span className="text-white font-bold">UN seul mot</span> pour décrire votre mot secret.
                                        <br /><em className="text-xs opacity-50 block mt-2">"Attention : Trop précis, Mr. Blanc devine. Trop vague, on vous suspecte !"</em>
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex gap-4 items-start relative">
                                <div className="flex flex-col items-center">
                                    {/* Updated to match Roles style */}
                                    <span className="text-4xl bg-spy-orange/20 p-2 rounded-2xl border border-spy-orange/20 shadow-[0_0_15px_rgba(255,87,34,0.2)] z-10 bg-spy-blue">🤔</span>
                                    <div className="w-1 h-24 bg-white/10 my-2 rounded-full absolute top-14 left-[1.65rem]"></div>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex-1 backdrop-blur-sm mt-1">
                                    <h4 className="font-black text-white uppercase tracking-wide mb-1">2. Le Débat</h4>
                                    <p className="text-white/70 text-sm">
                                        Discutez librement. Accusez les joueurs aux indices bizarres. Défendez-vous !
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex gap-4 items-start relative">
                                <div className="flex flex-col items-center">
                                    {/* Updated to match Roles style */}
                                    <span className="text-4xl bg-white/10 p-2 rounded-2xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)] z-10 bg-spy-blue">🗳️</span>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex-1 backdrop-blur-sm mt-1">
                                    <h4 className="font-black text-white uppercase tracking-wide mb-1">3. Le Vote</h4>
                                    <p className="text-white/70 text-sm">
                                        Désignez l'intrus à la majorité.
                                        <br />
                                        <span className="text-spy-lime block mt-2 font-bold text-xs uppercase">🏆 Innocents gagnent si l'espion sort.</span>
                                        <span className="text-spy-orange block mt-1 font-bold text-xs uppercase">🏆 Espions gagnent s'ils survivent.</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Floating Back Button */}
            <div className="fixed bottom-0 left-0 w-full p-6 pb-8 bg-gradient-to-t from-spy-blue via-spy-blue/95 to-transparent z-20 backdrop-blur-[2px]" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
                <BouncyButton onClick={onBack} variant="secondary" className="w-full shadow-xl py-4 active:scale-95 transition-transform">
                    RETOUR
                </BouncyButton>
            </div>
        </div>
    );
};

export default HowToPlay;
