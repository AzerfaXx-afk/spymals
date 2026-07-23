import React from 'react';
import { Settings } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';

const SettingsGear = ({ onClick, className = '' }) => {
    const { playSfx } = useAudio();

    const handleClick = () => {
        playSfx();
        if (onClick) onClick();
    };

    return (
        <button
            onClick={handleClick}
            className={`fixed top-4 right-4 z-50 flex items-center justify-center p-2.5 rounded-2xl bg-[#14233e] text-white border-[2.5px] border-white/20 shadow-[0_4px_0_#000] active:translate-y-1 active:shadow-[0_0_0_#000] transition-all hover:border-spy-lime cursor-pointer group ${className}`}
            aria-label="Paramètres"
        >
            <Settings className="w-5 h-5 text-spy-lime stroke-[2.5] transition-transform duration-700 ease-out group-hover:rotate-180" />
        </button>
    );
};

export default SettingsGear;
