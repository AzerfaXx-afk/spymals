import React from 'react';

const PlayerCard = ({ player, onClick }) => {
    const { name, avatar } = player;

    return (
        <button
            onClick={onClick}
            className="w-full aspect-square flex flex-col items-center justify-center gap-3
                       bg-white/5 border border-white/10 rounded-3xl p-4
                       hover:bg-white/10 hover:border-spy-lime/40 hover:scale-[1.03]
                       active:scale-95 transition-all duration-200
                       shadow-lg group relative overflow-hidden"
        >
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 bg-spy-lime/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />

            {/* Edit hint */}
            <div className="absolute top-2 right-2 text-[10px] text-white/20 group-hover:text-spy-lime/60 transition-colors font-bold uppercase tracking-widest">
                ✏️
            </div>

            {/* Avatar */}
            <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden
                            bg-black/20 border-2 border-white/10 group-hover:border-spy-lime/50
                            shadow-[0_0_20px_rgba(0,0,0,0.4)] transition-all duration-200">
                {avatar?.type === 'image' ? (
                    <img src={avatar.value} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-4xl leading-none">{avatar?.value ?? '🕵️'}</span>
                )}
            </div>

            {/* Name */}
            <p className="text-white font-bold text-xs uppercase tracking-wider text-center
                          break-words w-full leading-tight group-hover:text-spy-lime transition-colors">
                {name}
            </p>
        </button>
    );
};

export default PlayerCard;
