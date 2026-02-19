import React from 'react';
import BouncyButton from './BouncyButton';

const RoleStepper = ({ label, count, onIncrement, onDecrement, color = 'text-white', subLabel, soundOptions }) => {
    return (
        <div className="flex flex-col items-center w-full h-full justify-between">
            <div className="flex flex-col items-center justify-between w-full bg-black/20 rounded-2xl p-2 border border-white/5 shadow-inner flex-grow">

                {/* Controls Row */}
                <div className="flex items-center justify-between w-full">
                    <BouncyButton
                        onClick={onDecrement}
                        className="w-10 h-10 text-xl !rounded-xl bg-white/5 hover:bg-white/10"
                        variant="secondary"
                        disabled={count <= 0}
                        soundOptions={soundOptions}
                    >
                        -
                    </BouncyButton>

                    <div className="flex flex-col items-center px-1">
                        <span className="text-2xl font-black text-white leading-none drop-shadow-sm font-display">
                            {count}
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${color} opacity-90 whitespace-nowrap`}>
                            {label}
                        </span>
                    </div>

                    <BouncyButton
                        onClick={onIncrement}
                        className="w-10 h-10 text-xl !rounded-xl bg-white/5 hover:bg-white/10"
                        variant="secondary"
                        soundOptions={soundOptions}
                    >
                        +
                    </BouncyButton>
                </div>

                {/* SubLabel */}
                {subLabel && (
                    <div className="mt-2 w-full flex items-center justify-center min-h-[20px]">
                        <span className="text-[9px] text-white/40 leading-tight font-bold uppercase tracking-wide text-center">
                            {subLabel}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoleStepper;
