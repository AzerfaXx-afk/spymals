import React from 'react';
import BouncyButton from './BouncyButton';

const RoleStepper = ({ label, count, onIncrement, onDecrement, color = 'text-white', subLabel, soundOptions }) => {
    return (
        <div className="flex flex-col items-center w-full h-full justify-between">
            <div className="flex flex-col items-center justify-between w-full bg-black/20 rounded-2xl p-2 border border-white/5 shadow-inner flex-grow">

                {/* Controls Row */}
                <div className="flex items-center justify-between w-full gap-2 px-2">
                    <BouncyButton
                        onClick={onDecrement}
                        className="w-10 h-10 text-xl font-bold !rounded-full"
                        variant="secondary"
                        disabled={count <= 0}
                        soundOptions={soundOptions}
                    >
                        -
                    </BouncyButton>

                    <div className="flex flex-col items-center justify-center digital-counter rounded px-4 py-2 min-w-[4rem]">
                        <span className="text-3xl font-display leading-none tracking-widest">
                            {count.toString().padStart(2, '0')}
                        </span>
                        <span className={`text-[8px] font-bold uppercase tracking-wider ${color} opacity-80 mt-1`}>
                            {label}
                        </span>
                    </div>

                    <BouncyButton
                        onClick={onIncrement}
                        className="w-10 h-10 text-xl font-bold !rounded-full"
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
