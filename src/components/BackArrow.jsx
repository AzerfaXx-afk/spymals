import React from 'react';
import { useAudio } from '../contexts/AudioContext';

const BackArrow = ({ onClick, className = '' }) => {
    const { playSfx } = useAudio();

    const handleClick = () => {
        playSfx();
        if (onClick) onClick();
    };

    return (
        <button
            onClick={handleClick}
            className={`fixed top-4 left-4 z-50 group p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:shadow-xl active:scale-95 ${className}`}
            aria-label="Retour"
        >
            <div className="relative w-8 h-8 text-white/90 group-hover:text-white transition-colors">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-full h-full transition-transform duration-300 group-hover:-translate-x-1"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
            </div>
        </button>
    );
};

export default BackArrow;
