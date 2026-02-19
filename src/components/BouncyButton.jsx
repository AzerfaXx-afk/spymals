import React from 'react';
import { useAudio } from '../contexts/AudioContext';

const BouncyButton = ({ children, onClick, className = '', variant = 'primary', disabled = false, soundOptions = {} }) => {
  const { playSfx } = useAudio();
  // 3D Button Styles:
  // - High border-bottom for depth (border-b-8)
  // - Active state removes border and translates down to simulate press

  const baseStyles = `
    relative w-full
    font-black uppercase tracking-wider rounded-2xl 
    transition-all duration-100 ease-out
    active:scale-[0.98] 
    disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100
    select-none touch-manipulation
    flex items-center justify-center
  `;

  const variants = {
    primary: `
      bg-spy-lime text-spy-blue 
      border-b-[6px] border-b-[#8fb300]
      active:border-b-0 active:translate-y-[6px]
      shadow-[0_10px_0_0_rgba(0,0,0,0.2)]
      active:shadow-none
      hover:brightness-110
    `,
    secondary: `
      bg-white/10 text-white 
      border-b-[6px] border-b-white/5
      active:border-b-0 active:translate-y-[6px]
      backdrop-blur-md
      hover:bg-white/20
    `,
    danger: `
      bg-red-500 text-white 
      border-b-[6px] border-b-red-800
      active:border-b-0 active:translate-y-[6px]
      hover:bg-red-400
    `
  };

  const handleClick = (e) => {
    if (!disabled) {
      playSfx('/sons/button.mp3', soundOptions);
      if (onClick) onClick(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
    >
      {/* Glossy Reflection Overlay */}
      <span className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-2xl pointer-events-none"></span>

      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </button>
  );
};

export default BouncyButton;
