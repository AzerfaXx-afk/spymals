import React from 'react';
import { ArrowLeft } from 'lucide-react';
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
            className={`fixed top-4 left-4 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#14233e] text-white border-[2.5px] border-white/20 shadow-[0_4px_0_#000] active:translate-y-1 active:shadow-[0_0_0_#000] transition-all hover:border-spy-lime cursor-pointer font-black text-xs uppercase tracking-wider ${className}`}
            aria-label="Retour"
        >
            <ArrowLeft className="w-4 h-4 text-spy-lime stroke-[3]" />
            <span>Retour</span>
        </button>
    );
};

export default BackArrow;
