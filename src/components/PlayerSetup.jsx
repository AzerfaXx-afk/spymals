import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronRight, ArrowLeft } from 'lucide-react';
import BouncyButton from './BouncyButton';
import BackArrow from './BackArrow';
import SettingsGear from './SettingsGear';
import { CartoonAvatar, CARTOON_AVATARS_LIST } from './CartoonAvatars';

const PlayerSetup = ({ onNext, onBack, onOpenSettings }) => {
    const [count, setCount] = useState(3);

    const increment = () => {
        if (count < 20) setCount(count + 1);
    };

    const decrement = () => {
        if (count > 3) setCount(count - 1);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-20 pb-12 bg-spy-blue relative overflow-hidden">
            <BackArrow onClick={onBack} />
            <SettingsGear onClick={onOpenSettings} />

            {/* Background Ambient Glowing Orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-spy-lime/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-spy-orange/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Main Glass Card Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="w-full max-w-sm card-cartoon bg-gradient-to-b from-[#15233c]/95 via-[#0e192c]/95 to-[#091120]/95 p-7 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-[3.5px] border-white/20 flex flex-col items-center z-10 relative overflow-hidden"
            >
                {/* Header Badge */}
                <div className="bg-spy-lime/15 border-2 border-spy-lime/50 rounded-full px-4 py-1.5 flex items-center gap-2 mb-3 shadow-[0_0_15px_rgba(204,255,0,0.2)]">
                    <Users className="w-4 h-4 text-spy-lime" />
                    <span className="text-[10.5px] font-black uppercase tracking-[0.2em] text-spy-lime">
                        Accréditation Tactique
                    </span>
                </div>

                <h2 className="text-3xl font-black text-white text-center uppercase tracking-tight text-shadow-md">
                    Effectif de la Mission
                </h2>
                <p className="text-white/60 text-xs font-black mt-1 mb-6 text-center uppercase tracking-wider">
                    Combien d'agents participeront ?
                </p>

                {/* Animated Avatars Preview Ribbon */}
                <div className="w-full bg-black/40 border-2 border-white/10 rounded-2xl p-3 mb-6 flex items-center justify-center gap-1.5 overflow-hidden shadow-inner min-h-[64px]">
                    <AnimatePresence mode="popLayout">
                        {Array.from({ length: Math.min(count, 8) }).map((_, idx) => {
                            const avatarItem = CARTOON_AVATARS_LIST[idx % CARTOON_AVATARS_LIST.length];
                            return (
                                <motion.div
                                    key={`agent-preview-${idx}`}
                                    initial={{ scale: 0, opacity: 0, y: 15 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0, opacity: 0, y: -15 }}
                                    transition={{ type: 'spring', stiffness: 350, damping: 22, delay: idx * 0.03 }}
                                    className="relative"
                                >
                                    <CartoonAvatar id={avatarItem.id} className="w-9 h-9 border-2 border-spy-lime/60 shadow-md" />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    {count > 8 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-xs font-black text-spy-lime ml-1 bg-spy-lime/20 px-2 py-1 rounded-lg border border-spy-lime/40"
                        >
                            +{count - 8}
                        </motion.span>
                    )}
                </div>

                {/* Counter Stepper Control */}
                <div className="flex items-center justify-between w-full mb-8 bg-black/35 rounded-2xl p-2.5 border-2 border-white/10 shadow-inner">
                    <BouncyButton
                        onClick={decrement}
                        variant="secondary"
                        className="w-16 h-16 text-3xl font-black rounded-xl border-3 border-black shadow-[0_4px_0_#000] active:translate-y-1"
                        disabled={count <= 3}
                        soundOptions={{ pitch: Math.max(0.5, 0.8 + ((count - 1 - 3) * 0.1)) }}
                    >
                        -
                    </BouncyButton>

                    <motion.div
                        key={count}
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="flex flex-col items-center"
                    >
                        <span className="text-6xl font-black text-white px-2 font-display text-shadow-lg leading-none tracking-tight">
                            {count}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-spy-lime mt-1">
                            AGENTS
                        </span>
                    </motion.div>

                    <BouncyButton
                        onClick={increment}
                        variant="primary"
                        className="w-16 h-16 text-3xl font-black rounded-xl border-3 border-black shadow-[0_4px_0_#000] active:translate-y-1"
                        disabled={count >= 20}
                        soundOptions={{ pitch: Math.min(3.0, 0.8 + ((count + 1 - 3) * 0.1)) }}
                    >
                        +
                    </BouncyButton>
                </div>

                {/* Action Buttons */}
                <div className="w-full space-y-3">
                    <button
                        onClick={() => onNext(count)}
                        className="btn-cartoon-primary w-full py-4 text-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_6px_0_#000] active:translate-y-1.5 active:shadow-[0_0_0_#000] transition-all"
                    >
                        CONTINUER <ChevronRight className="w-6 h-6 stroke-[3]" />
                    </button>

                    <button
                        onClick={onBack}
                        className="btn-cartoon-secondary w-full py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_0_#000] active:translate-y-1 active:shadow-[0_0_0_#000] transition-all"
                    >
                        <ArrowLeft className="w-4 h-4 stroke-[3]" /> RETOUR
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default PlayerSetup;

