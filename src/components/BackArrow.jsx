import React from 'react';

const BackArrow = ({ onClick, className = '' }) => {
    return (
        <button
            onClick={onClick}
            className={`
                fixed top-4 left-4 z-50
                w-14 h-14 flex items-center justify-center
                bg-white text-spy-blue rounded-full
                border-4 border-spy-blue
                shadow-[4px_4px_0px_0px_rgba(10,31,61,1)]
                active:shadow-none active:translate-x-[2px] active:translate-y-[2px]
                hover:scale-105 active:scale-95 transition-all duration-150
                touch-manipulation
                ${className}
            `}
            aria-label="Retour"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={4}
                stroke="currentColor"
                className="w-8 h-8 font-black"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
        </button>
    );
};

export default BackArrow;
