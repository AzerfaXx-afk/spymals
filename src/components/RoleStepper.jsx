import React from 'react';
import BouncyButton from './BouncyButton';

const RoleStepper = ({ label, count, onIncrement, onDecrement, color = 'spy-lime', subLabel }) => {
    return (
        <div className="flex flex-col items-center w-full max-w-xs mb-6">
            <div className="flex items-center justify-between w-full bg-white/10 rounded-full p-2 pr-4 border border-white/10">

                {/* Decrement */}
                <BouncyButton
                    onClick={onDecrement}
                    className={`w-12 h-12 text-2xl rounded-full bg-spy-orange shadow-md flex-none`}
                    variant="secondary"
                >
                    -
                </BouncyButton>

                {/* Display */}
                <div className="flex flex-col items-center flex-grow">
                    <span className="text-2xl font-black text-white leading-none">
                        {count}
                    </span>
                    <span className={`text-xs font-bold uppercase tracking-wider text-${color}`}>
                        {label}
                    </span>
                </div>

                {/* Increment */}
                <BouncyButton
                    onClick={onIncrement}
                    className={`w-12 h-12 text-2xl rounded-full bg-${color} text-spy-blue shadow-md flex-none`}
                    variant="primary"
                >
                    +
                </BouncyButton>
            </div>
            {subLabel && <span className="text-xs text-white/40 mt-1 font-bold">{subLabel}</span>}
        </div>
    );
};

export default RoleStepper;
