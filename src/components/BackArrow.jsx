import React from 'react';

const BackArrow = ({ onClick, className = '' }) => {
    return (
        <button
            onClick={onClick}
            className={`
                absolute top-6 left-6 z-50
                w-12 h-12 flex items-center justify-center
                bg-white/10 backdrop-blur-md border border-white/20 rounded-full
                text-white text-2xl shadow-lg
                active:scale-90 hover:bg-white/20 transition-all duration-200
                touch-manipulation
                ${className}
            `}
            aria-label="Retour"
        >
            ←
        </button>
    );
};

export default BackArrow;
