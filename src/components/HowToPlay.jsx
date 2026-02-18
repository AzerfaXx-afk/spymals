import React from 'react';
import BouncyButton from './BouncyButton';
import BackArrow from './BackArrow';

const HowToPlay = ({ onBack }) => {
    return (
        <div className="min-h-screen flex flex-col items-center p-6 pt-24 bg-spy-blue overflow-y-auto relative no-scrollbar">
            <BackArrow onClick={onBack} />

            {/* Background Decor */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[-20%] w-[500px] h-[500px] bg-spy-lime opacity-[0.05] rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[10%] right-[-20%] w-[500px] h-[500px] bg-spy-orange opacity-[0.05] rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-md w-full z-10 animate-slide-up">

                {/* Header */}
                <div className="text-center mb-8 mt-6">
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-lg">
                        Comment<br /><span className="text-spy-lime">Jouer ?</span>
                    </h2>
                    <p className="text-white/60 text-xs font-bold mt-2 uppercase tracking-widest border-b border-white/10 pb-4 inline-block">
                        Briefing Mission
                    </p>
                </div>

                {/* Content Cards */}
                <div className="space-y-6 pb-24">

                    <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl relative overflow-hidden group hover:bg-white/10 transition-colors">
                        <div className="absolute -right-4 -top-4 text-8xl opacity-5 group-hover:scale-110 transition-transform">🕵️</div>
                        <h3 className="text-xl font-black text-white uppercase mb-4 flex items-center">
                            <span className="bg-spy-lime text-spy-blue w-8 h-8 rounded-full flex items-center justify-center mr-3 text-lg">1</span>
                            Les Rôles
                        </h3>
                        <ul className="space-y-4 text-sm font-medium text-white/80">
                            <li className="flex items-start">
                                <span className="mr-2 mt-1">🔵</span>
                                <div>
                                    <strong className="text-white block uppercase text-xs tracking-wider mb-1">Innocents</strong>
                                    Ils ont le <span className="text-spy-lime font-bold">MÊME mot</span>. Démasquez les intrus !
                                </div>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2 mt-1">🟠</span>
                                <div>
                                    <strong className="text-spy-orange block uppercase text-xs tracking-wider mb-1">Espions</strong>
                                    Ils ont un mot <span className="text-spy-orange font-bold">DIFFÉRENT</span>. Fondez-vous dans la masse.
                                </div>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2 mt-1">⚪</span>
                                <div>
                                    <strong className="text-white block uppercase text-xs tracking-wider mb-1">Mr. Blanc</strong>
                                    Il n'a <span className="text-white font-bold bg-white/20 px-1 rounded">AUCUN mot</span>. Devinez celui des autres !
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl relative overflow-hidden group hover:bg-white/10 transition-colors">
                        <div className="absolute -right-4 -top-4 text-8xl opacity-5 group-hover:scale-110 transition-transform">🗣️</div>
                        <h3 className="text-xl font-black text-white uppercase mb-4 flex items-center">
                            <span className="bg-spy-orange text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-lg">2</span>
                            Discussion
                        </h3>
                        <p className="text-white/80 text-sm font-medium leading-relaxed">
                            Donnez un indice sur votre mot à tour de rôle. <br />
                            <em className="text-white/60 text-xs mt-2 block">Exemple : Pour "Chat", dites "Moustaches" ou "Lait". Pas trop facile, sinon Mr. White trouvera !</em>
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl relative overflow-hidden group hover:bg-white/10 transition-colors">
                        <div className="absolute -right-4 -top-4 text-8xl opacity-5 group-hover:scale-110 transition-transform">🗳️</div>
                        <h3 className="text-xl font-black text-white uppercase mb-4 flex items-center">
                            <span className="bg-white text-spy-blue w-8 h-8 rounded-full flex items-center justify-center mr-3 text-lg">3</span>
                            Vote
                        </h3>
                        <p className="text-white/80 text-sm font-medium leading-relaxed">
                            Au timer, votez pour éliminer l'intrus.
                            <span className="block mt-2 text-spy-lime font-bold">
                                Civils gagnent si l'intrus est éliminé.
                            </span>
                        </p>
                    </div>

                </div>

            </div>

            {/* Floating Back Button */}
            <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-spy-blue via-spy-blue/95 to-transparent z-20 backdrop-blur-[2px]">
                <BouncyButton onClick={onBack} variant="secondary" className="w-full shadow-xl py-5">
                    RETOUR AU MENU
                </BouncyButton>
            </div>
        </div>
    );
};

export default HowToPlay;
