import React from 'react';
import BouncyButton from './BouncyButton';

const RoleStepper = ({ label, count, onIncrement, onDecrement, color = 'text-white', subLabel, soundOptions }) => {
    return (
        <div className="flex flex-col items-center w-full h-full justify-between overflow-hidden">
            <div className="flex flex-col items-center justify-between w-full bg-black/35 rounded-2xl p-2 border-2 border-white/10 shadow-inner flex-grow">

                {/* Controls Row */}
                <div className="flex items-center justify-between w-full gap-1 px-0.5">
                    <button
                        type="button"
                        onClick={onDecrement}
                        disabled={count <= 0}
                        className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-b from-slate-700 to-slate-800 border-2 border-white/20 text-white font-black text-lg shadow-[0_2px_0_#000] active:translate-y-0.5 active:shadow-[0_0_0_#000] flex-shrink-0 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:border-spy-lime transition-all"
                    >
                        -
                    </button>

                    <div className="flex flex-col items-center justify-center bg-black/60 border-2 border-white/10 shadow-inner rounded-xl w-full min-w-0 py-1.5 px-1 h-[72px] relative overflow-hidden">
                        <span className={`text-2xl md:text-3xl font-display font-black leading-none whitespace-nowrap text-shadow-md ${color === 'text-white' ? 'text-white' : color}`}>
                            {count.toString().padStart(2, '0')}
                        </span>

                        <span className={`text-[8.5px] md:text-[9.5px] font-black uppercase tracking-wider ${color} leading-tight text-center w-full mt-1 truncate px-0.5`}>
                            {label}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onIncrement}
                        className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-b from-spy-lime to-[#aadd00] border-2 border-black text-black font-black text-lg shadow-[0_2px_0_#000] active:translate-y-0.5 active:shadow-[0_0_0_#000] flex-shrink-0 flex items-center justify-center cursor-pointer transition-all"
                    >
                        +
                    </button>
                </div>

                {/* SubLabel */}
                {subLabel && (
                    <div className="mt-1.5 w-full flex items-center justify-center min-h-[16px]">
                        <span className="text-[8.5px] text-white/50 leading-tight font-black uppercase tracking-wider text-center">
                            {subLabel}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoleStepper;

