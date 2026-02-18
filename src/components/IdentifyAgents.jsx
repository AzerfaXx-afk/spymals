import React, { useState } from 'react';
import PlayerCard from './PlayerCard';
import EditPlayerModal from './EditPlayerModal';

import BouncyButton from './BouncyButton';
import BackArrow from './BackArrow';

const IdentifyAgents = ({ players, onUpdatePlayers, onConfirm, onBack }) => {
    const [editingPlayerId, setEditingPlayerId] = useState(null);

    const handleEditPlayer = (id) => {
        setEditingPlayerId(id);
    };

    const handleSavePlayer = (updatedPlayer) => {
        const newPlayers = players.map(p =>
            p.id === updatedPlayer.id ? updatedPlayer : p
        );
        onUpdatePlayers(newPlayers);
        setEditingPlayerId(null);
    };

    const editingPlayer = players.find(p => p.id === editingPlayerId);

    return (
        <div className="flex flex-col h-screen bg-spy-blue relative overflow-hidden">
            <BackArrow onClick={onBack} />

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-20%] w-[600px] h-[600px] bg-spy-lime opacity-[0.05] rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-20%] w-[500px] h-[500px] bg-spy-orange opacity-[0.05] rounded-full blur-[100px] animate-pulse-slow delay-700"></div>
            </div>

            {/* Header */}
            <div className="flex-none p-6 text-center z-10 pt-24 pb-8">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-lg animate-slide-up">
                    Identifiez les Agents
                </h2>
                <p className="text-white/60 text-sm font-bold mt-2 uppercase tracking-wider animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    Tapez sur une carte pour modifier
                </p>
            </div>

            {/* Grid - Scrollable area */}
            <div className="flex-grow overflow-y-auto px-4 pb-32 z-10 no-scrollbar mask-image-b">
                <div className="grid grid-cols-2 gap-4 pb-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    {players.map((player, index) => (
                        <div key={player.id} className="animate-pop-in" style={{ animationDelay: `${index * 0.05}s` }}>
                            <PlayerCard
                                player={player}
                                onClick={() => handleEditPlayer(player.id)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Action - Glass Bar */}
            <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-spy-blue via-spy-blue/95 to-transparent z-20 backdrop-blur-[2px]">
                <BouncyButton
                    onClick={onConfirm}
                    className="w-full shadow-spy-lime/20 shadow-2xl text-xl py-5"
                >
                    CONFIRMER L'ÉQUIPE
                </BouncyButton>
            </div>

            {/* Modal */}
            {editingPlayer && (
                <EditPlayerModal
                    player={editingPlayer}
                    onSave={handleSavePlayer}
                    onCancel={() => setEditingPlayerId(null)}
                />
            )}

        </div>
    );
};

export default IdentifyAgents;
