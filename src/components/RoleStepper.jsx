import React from 'react';
import BouncyButton from './BouncyButton';

const RoleStepper = ({ label, count, onIncrement, onDecrement, color = 'text-white', subLabel, soundOptions }) => {
    return (
        <div className="flex flex-col items-center w-full h-full justify-between">
            <div className="flex flex-col items-center justify-between w-full bg-black/35 rounded-2xl p-2.5 border-2 border-white/10 shadow-inner flex-grow">

                {/* Controls Row */}
                <div className="flex items-center justify-between w-full gap-2 px-1">
                    <BouncyButton
                        onClick={onDecrement}
                        className="w-11 h-11 text-xl font-black rounded-xl border-2 border-black shadow-[0_3px_0_#000] active:translate-y-0.5"
                        variant="secondary"
                        disabled={count <= 0}
                        soundOptions={soundOptions}
                    >
                        -
                    </BouncyButton>

                    <div className="flex flex-col items-center justify-center bg-black/60 border-2 border-white/10 shadow-inner rounded-xl w-full max-w-[7.5rem] py-2 px-1 h-[84px] relative">
                        <span className={`text-[36px] font-display font-black leading-none whitespace-nowrap text-shadow-md ${color === 'text-white' ? 'text-white' : color}`}>
                            {count.toString().padStart(2, '0')}
                        </span>

                        <span className={`text-[10px] font-black uppercase tracking-wider ${color} leading-tight text-center w-full mt-1`}>
                            {label}
                        </span>
                    </div>

                    <BouncyButton
                        onClick={onIncrement}
                        className="w-11 h-11 text-xl font-black rounded-xl border-2 border-black shadow-[0_3px_0_#000] active:translate-y-0.5"
                        variant="secondary"
                        soundOptions={soundOptions}
                    >
                        +
                    </BouncyButton>
                </div>

                {/* SubLabel */}
                {subLabel && (
                    <div className="mt-2 w-full flex items-center justify-center min-h-[18px]">
                        <span className="text-[9px] text-white/50 leading-tight font-black uppercase tracking-wider text-center">
                            {subLabel}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoleStepper;

