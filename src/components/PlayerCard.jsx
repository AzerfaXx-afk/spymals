import React from 'react';

const PlayerCard = ({ player, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col items-center justify-center p-4 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-lg cursor-pointer transform transition-all duration-200 active:scale-95 hover:scale-105 hover:bg-white/15 hover:shadow-spy-lime/20 hover:border-spy-lime/30"
        >
            <div className="w-20 h-20 rounded-full bg-black/20 flex items-center justify-center text-5xl mb-3 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] overflow-hidden border-2 border-white/10 group-hover:border-spy-lime transition-colors">
                {player.avatar.type === 'image' ? (
                    <img src={player.avatar.value} alt={player.name} className="w-full h-full object-cover" />
                ) : (
                    <span className="filter drop-shadow-md">{player.avatar.value}</span>
                )}
            </div>

            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs bg-white/20 rounded-full w-6 h-6 flex items-center justify-center">✎</span>
            </div>

            <span className="font-bold text-sm text-white truncate max-w-full px-2 uppercase tracking-wide group-hover:text-spy-lime transition-colors">
                {player.name}
            </span>
        </div>
    );
};

export default PlayerCard;
