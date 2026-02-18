import React from 'react';

const BouncyButton = ({ children, onClick, className = '', variant = 'primary', disabled = false }) => {
    const baseStyles = "relative font-black uppercase rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none touch-manipulation";

    const variants = {
        primary: "bg-spy-lime text-spy-blue hover:bg-white border-b-4 border-b-green-700 active:border-b-0 active:translate-y-1",
        secondary: "bg-white/10 text-white hover:bg-white/20 border-b-4 border-b-white/10 active:border-b-0 active:translate-y-1 backdrop-blur-sm",
        danger: "bg-red-500 text-white hover:bg-red-400 border-b-4 border-b-red-700 active:border-b-0 active:translate-y-1"
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
        >
            {children}
        </button>
    );
};

export default BouncyButton;
