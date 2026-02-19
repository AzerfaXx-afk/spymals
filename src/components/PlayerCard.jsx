import React from 'react';

const PlayerCard = ({ player, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col items-center p-1 cursor-pointer transition-transform duration-200 active:scale-95 hover:scale-105"
        >
            {/* Spy ID Badge Container */}
            <div className="spy-badge w-full aspect-[3/4] rounded-xl flex flex-col items-center p-3 shadow-xl bg-white relative overflow-hidden">

                {/* Lanyard Hole */}
                <div className="w-16 h-2 bg-black/10 rounded-full mb-2 mx-auto inset-shadow-sm"></div>

                {/* Photo Area */}
                <div className="w-20 h-20 bg-gray-200 rounded-md border-2 border-dashed border-gray-400 flex items-center justify-center mb-2 overflow-hidden relative group-hover:border-spy-lime transition-colors bg-white">
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent pointer-events-none"></div>
                    <div className="text-5xl avatar-3d">
                        {player.avatar.type === 'image' ? (
                            <img src={player.avatar.value} alt={player.name} className="w-full h-full object-cover" />
                        ) : (
                            player.avatar.value
                        )}
                    </div>
                </div>

                {/* Identity Info */}
                <div className="w-full text-center space-y-1">
                    <div className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-1 mb-1">
                        Agent Identity
                    </div>
                    <h3 className="font-black text-gray-800 text-sm uppercase tracking-wider truncate px-1">
                        {player.name}
                    </h3>
                    <div className="text-[0.55rem] font-mono text-gray-500 bg-gray-100 rounded px-1 py-0.5 inline-block border border-gray-200">
                        ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}
                    </div>
                </div>

                {/* Stamp */}
                <div className="absolute bottom-2 right-2 transform -rotate-12 opacity-80 mix-blend-multiply pointer-events-none">
                    <span className="text-[0.6rem] font-black text-red-600 border-2 border-red-600 px-1 rounded-sm uppercase tracking-tighter">
                        CONFIDENTIAL
                    </span>
                </div>

                {/* Edit Icon */}
                <div className="absolute top-2 right-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm border border-gray-100 text-xs text-spy-blue font-bold">✎</span>
                </div>
            </div>
        </div>
    );
};

export default PlayerCard;
