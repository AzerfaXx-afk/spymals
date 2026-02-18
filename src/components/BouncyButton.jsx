import React from 'react';

const BouncyButton = ({ children, onClick, variant = 'primary', className = '' }) => {
    const baseClasses = variant === 'primary' ? 'btn-primary' : 'btn-secondary';

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${className}`}
        >
            {children}
        </button>
    );
};

export default BouncyButton;
