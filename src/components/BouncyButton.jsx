import React from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '../contexts/AudioContext';

const BouncyButton = ({ children, onClick, className = '', variant = 'primary', disabled = false, soundOptions = {} }) => {
  const { playSfx } = useAudio();

  const baseStyles = `
    relative w-full
    font-black uppercase tracking-wider rounded-2xl 
    select-none touch-manipulation
    flex items-center justify-center
    cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  // Framer Motion variants for "squash and stretch"
  const buttonVariants = {
    initial: { scale: 1, y: 0 },
    hover: {
      scale: 1.02,
      filter: "brightness(1.1)",
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: {
      scale: 0.95,
      y: 4,
      transition: { type: "spring", stiffness: 400, damping: 15 } // Snappy squash
    },
    disabled: { opacity: 0.5, scale: 1, y: 0 }
  };

  const styleVariants = {
    primary: `
      bg-gradient-to-br from-spy-lime/90 to-[#aadd00]/90 
      backdrop-blur-md border border-white/30
      text-spy-blue
      shadow-[0_8px_0_#8fb300,0_15px_20px_rgba(0,0,0,0.2)]
    `,
    secondary: `
      bg-white/10 text-white 
      backdrop-blur-md border border-white/20
      shadow-[0_6px_0_rgba(0,0,0,0.2),0_10px_10px_rgba(0,0,0,0.1)]
    `,
    danger: `
      bg-red-500/90 text-white 
      backdrop-blur-md border border-red-400/30
      shadow-[0_6px_0_#991b1b,0_10px_10px_rgba(0,0,0,0.2)]
    `,
    custom: `
        /* Let className handle everything, but we still apply motion */
        bg-transparent
    `
  };

  // We handle click sound manually to ensure it plays on interaction start
  const handleTapStart = () => {
    if (!disabled) {
      playSfx('/sons/button.mp3', soundOptions);
    }
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${styleVariants[variant] || styleVariants.primary} ${className}`}
      variants={buttonVariants}
      initial="initial"
      whileHover={!disabled ? "hover" : "disabled"}
      whileTap={!disabled ? "tap" : "disabled"}
      onTapStart={handleTapStart}
      layout
    >
      {/* Glossy Reflection Overlay */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl pointer-events-none"></div>

      <span className="relative z-10 flex items-center justify-center gap-2 pointer-events-none">
        {children}
      </span>
    </motion.button>
  );
};

export default BouncyButton;
