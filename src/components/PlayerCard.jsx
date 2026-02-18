import React from 'react';

const PlayerCard = ({ player, onClick }) => {
    return (
        <div
            onClick={() => onClick(player)}
            className="flex flex-col items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg cursor-pointer transform transition-transform active:scale-95 hover:scale-105 hover:bg-white/20"
        >
            <div className="w-20 h-20 rounded-full bg-spy-blue/30 flex items-center justify-center text-4xl mb-3 shadow-inner overflow-hidden border-2 border-spy-lime/50">
                {player.avatar.type === 'image' ? (
                    <img src={player.avatar.value} alt={player.name} className="w-full h-full object-cover" />
                ) : (
                    <span>{player.avatar.value}</span>
                )}
            </div>
            <span className="font-bold text-lg text-white truncate max-w-full px-2">
                {player.name}
            </span>
        </div>
    );
};

export default PlayerCard;
