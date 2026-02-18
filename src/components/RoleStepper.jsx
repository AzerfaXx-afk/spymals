import React from 'react';
import BouncyButton from './BouncyButton';

const RoleStepper = ({ label, count, onIncrement, onDecrement, color = 'text-white', subLabel }) => {
    return (
        <div className="flex flex-col items-center w-full mb-6">
            <div className="flex items-center justify-between w-full bg-black/20 rounded-2xl p-2 border border-white/5 shadow-inner">
                <BouncyButton
                    onClick={onDecrement}
                    className="w-12 h-12 text-2xl !rounded-xl bg-white/5 hover:bg-white/10"
                    variant="secondary"
                    disabled={count <= 0}
                >
                    -
                </BouncyButton>

                <div className="flex flex-col items-center flex-grow px-2">
                    <span className="text-3xl font-black text-white leading-none drop-shadow-sm font-display">
                        {count}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${color} opacity-90`}>
                        {label}
                    </span>
                </div>

                <BouncyButton
                    onClick={onIncrement}
                    className="w-12 h-12 text-2xl !rounded-xl bg-white/5 hover:bg-white/10"
                    variant="secondary"
                >
                    +
                </BouncyButton>
            </div>
            {subLabel && (
                <span className="text-[10px] text-white/40 mt-1 font-bold uppercase tracking-wide text-center">
                    {subLabel}
                </span>
            )}
        </div>
    );
};

export default RoleStepper;
