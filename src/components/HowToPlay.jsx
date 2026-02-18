import React from 'react';
import BouncyButton from './BouncyButton';

const HowToPlay = ({ onBack }) => {
    return (
        <div className="min-h-screen flex flex-col items-center p-6 bg-spy-blue overflow-y-auto">
            <div className="max-w-md w-full">

                {/* Header */}
                <div className="text-center mb-8 mt-6">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                        Comment Jouer ?
                    </h2>
                    <p className="text-white/60 text-sm font-bold">
                        Les règles de la mission
                    </p>
                </div>

                {/* Content Cards */}
                <div className="space-y-6">

                    <div className="bg-white/10 rounded-2xl p-6 border border-white/10">
                        <div className="text-4xl mb-4">🕵️</div>
                        <h3 className="text-xl font-bold text-spy-lime uppercase mb-2">1. Les Rôles</h3>
                        <ul className="text-white/80 space-y-4 text-sm font-medium text-left">
                            <li>
                                <strong className="text-white">Civils :</strong> Ils reçoivent tous le même mot secret. Ils doivent démasquer les imposteurs sans révéler leur mot trop vite.
                            </li>
                            <li>
                                <strong className="text-spy-orange">Undercovers :</strong> Ils reçoivent un mot légèrement différent. Ils doivent se fondre dans la masse.
                            </li>
                            <li>
                                <strong className="text-white">Mr. White :</strong> Il ne reçoit aucun mot ! Il doit deviner le mot des civils en écoutant les autres.
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white/10 rounded-2xl p-6 border border-white/10">
                        <div className="text-4xl mb-4">🗣️</div>
                        <h3 className="text-xl font-bold text-spy-lime uppercase mb-2">2. La Discussion</h3>
                        <p className="text-white/80 text-sm font-medium text-left">
                            Chaque joueur donne un indice sur son mot à tour de rôle. Écoutez bien les indices des autres pour repérer qui ne connait pas le vrai mot !
                        </p>
                    </div>

                    <div className="bg-white/10 rounded-2xl p-6 border border-white/10">
                        <div className="text-4xl mb-4">🗳️</div>
                        <h3 className="text-xl font-bold text-spy-lime uppercase mb-2">3. Le Vote</h3>
                        <p className="text-white/80 text-sm font-medium text-left">
                            Après la discussion, tout le monde vote pour éliminer un joueur. Si l'Undercover ou Mr. White est éliminé, les Civils gagnent (sauf si Mr. White devine le mot) !
                        </p>
                    </div>

                </div>

                {/* Back Button */}
                <div className="mt-8 mb-8">
                    <BouncyButton onClick={onBack} variant="secondary" className="w-full">
                        RETOUR AU MENU
                    </BouncyButton>
                </div>

            </div>
        </div>
    );
};

export default HowToPlay;
