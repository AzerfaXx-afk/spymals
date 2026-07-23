import React from 'react';
import { Edit3 } from 'lucide-react';
import { CartoonAvatar } from './CartoonAvatars';

const PlayerCard = ({ player, onClick }) => {
    const { name, avatar } = player;

    return (
        <button
            onClick={onClick}
            className="w-full aspect-square flex flex-col items-center justify-between
                       bg-gradient-to-b from-[#182947]/90 to-[#0d172b]/95 
                       border-[3px] border-white/15 hover:border-spy-lime/70 rounded-3xl p-4
                       shadow-[0_8px_20px_rgba(0,0,0,0.6)] hover:shadow-[0_12px_25px_rgba(204,255,0,0.25)]
                       hover:scale-[1.03] active:scale-95 transition-all duration-200
                       group relative overflow-hidden text-left cursor-pointer"
        >
            {/* Holographic Hologram Shine Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-spy-lime/10 via-transparent to-spy-orange/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-3xl" />

            {/* Top Badge Info */}
            <div className="w-full flex items-center justify-between text-[9.5px] font-black uppercase tracking-widest z-10">
                <span className="text-white/40 group-hover:text-spy-lime transition-colors">ID BADGE</span>
                <span className="bg-spy-lime/20 border border-spy-lime/40 text-spy-lime px-2 py-0.5 rounded-full flex items-center gap-1 group-hover:bg-spy-lime group-hover:text-black transition-all">
                    <Edit3 className="w-2.5 h-2.5" /> EDIT
                </span>
            </div>

            {/* Avatar Ring */}
            <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden
                            bg-black/35 border-3 border-white/20 group-hover:border-spy-lime
                            shadow-[0_0_20px_rgba(0,0,0,0.6)] group-hover:shadow-[0_0_25px_rgba(204,255,0,0.4)]
                            transition-all duration-300 transform group-hover:scale-110 z-10">
                <CartoonAvatar id={avatar?.value} className="w-full h-full border-none shadow-none" />
            </div>

            {/* Code Name */}
            <p className={`${player.pseudoColor || 'text-white'} font-black text-xs uppercase tracking-wider text-center
                          break-words w-full leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-10 truncate`}>
                {name}
            </p>
        </button>
    );
};

export default PlayerCard;

