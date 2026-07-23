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
        <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-20 pb-12 bg-transparent relative overflow-hidden">
            <BackArrow onClick={onBack} />
            <SettingsGear onClick={onOpenSettings} />

            {/* Background Ambient Glowing Orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-spy-lime/15 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] bg-spy-orange/15 rounded-full blur-[110px] pointer-events-none" />

            {/* Main Glass Card Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="w-full max-w-sm card-cartoon bg-gradient-to-b from-[#15233c]/95 via-[#0e192c]/95 to-[#091120]/95 p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-[3.5px] border-white/20 flex flex-col items-center z-10 relative overflow-hidden"
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
                <p className="text-white/60 text-xs font-black mt-1 mb-5 text-center uppercase tracking-wider">
                    Combien d'agents participeront ?
                </p>

                {/* Animated Avatars Preview Ribbon - Fits all agents cleanly */}
                <div className="w-full bg-black/40 border-2 border-white/10 rounded-2xl p-3 mb-5 flex flex-wrap items-center justify-center gap-1.5 shadow-inner min-h-[68px] max-h-[130px] overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="popLayout">
                        {Array.from({ length: count }).map((_, idx) => {
                            const avatarItem = CARTOON_AVATARS_LIST[idx % CARTOON_AVATARS_LIST.length];
                            const avatarSizeClass = count > 10 ? "w-7 h-7" : count > 6 ? "w-8 h-8" : "w-9 h-9";
                            return (
                                <motion.div
                                    key={`agent-preview-${idx}`}
                                    initial={{ scale: 0, opacity: 0, y: 15 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0, opacity: 0, y: -15 }}
                                    transition={{ type: 'spring', stiffness: 350, damping: 22, delay: idx * 0.02 }}
                                    className="relative flex-shrink-0"
                                >
                                    <CartoonAvatar id={avatarItem.id} className={`${avatarSizeClass} border-2 border-spy-lime/60 shadow-md`} />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Counter Stepper Control - Fixed dimensions, perfectly centered */}
                <div className="flex items-center justify-between w-full mb-6 bg-black/40 rounded-2xl p-3 border-2 border-white/10 shadow-inner">
                    <button
                        type="button"
                        onClick={decrement}
                        disabled={count <= 3}
                        className="w-12 h-12 rounded-xl bg-gradient-to-b from-slate-700 to-slate-800 border-2 border-white/20 text-white font-black text-2xl shadow-[0_4px_0_#000] active:translate-y-1 active:shadow-[0_0_0_#000] flex-shrink-0 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:border-spy-lime transition-all"
                    >
                        -
                    </button>

                    <motion.div
                        key={count}
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="flex flex-col items-center justify-center flex-1 px-2 text-center"
                    >
                        <span className="text-5xl sm:text-6xl font-black text-white font-display text-shadow-lg leading-none tracking-tight">
                            {count}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-spy-lime mt-1">
                            AGENTS
                        </span>
                    </motion.div>

                    <button
                        type="button"
                        onClick={increment}
                        disabled={count >= 20}
                        className="w-12 h-12 rounded-xl bg-gradient-to-b from-spy-lime to-[#aadd00] border-2 border-black text-black font-black text-2xl shadow-[0_4px_0_#000] active:translate-y-1 active:shadow-[0_0_0_#000] flex-shrink-0 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        +
                    </button>
                </div>

                {/* Action Button */}
                <div className="w-full pt-2">
                    <button
                        onClick={() => onNext(count)}
                        className="btn-cartoon-primary w-full py-4 text-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_6px_0_#000] active:translate-y-1.5 active:shadow-[0_0_0_#000] transition-all"
                    >
                        <span>CONTINUER</span>
                        <ChevronRight className="w-6 h-6 stroke-[3]" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default PlayerSetup;

