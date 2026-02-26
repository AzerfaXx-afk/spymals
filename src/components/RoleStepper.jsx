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

                    <div className="flex flex-col items-center justify-center bg-black/60 border border-white/5 shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)] rounded-2xl w-full max-w-[8rem] py-3 px-1 overflow-visible h-[90px] relative">
                        {/* Inner glass highlight */}
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white-5 to-transparent pointer-events-none rounded-t-2xl" />

                        <span className={`text-[40px] font-display font-black leading-none whitespace-nowrap drop-shadow-md ${color === 'text-white' ? 'text-white' : color}`}>
                            {count.toString().padStart(2, '0')}
                        </span>

                        <span className={`text-[10px] font-black uppercase tracking-wide ${color} opacity-100 leading-tight text-center w-full mt-1 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]`}>
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
