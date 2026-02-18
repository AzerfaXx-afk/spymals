import React, { useState } from 'react';
import PlayerCard from './PlayerCard';
import EditPlayerModal from './EditPlayerModal';
import BouncyButton from './BouncyButton';

const IdentifyAgents = ({ players, onUpdatePlayers, onConfirm }) => {
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

            {/* Header */}
            <div className="flex-none p-6 text-center z-10">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                    Identifiez les Agents
                </h2>
                <p className="text-white/60 text-xs font-bold mt-1 uppercase">
                    Tapez sur une carte pour modifier
                </p>
            </div>

            {/* Grid - Scrollable area */}
            <div className="flex-grow overflow-y-auto px-4 pb-24 z-10">
                <div className="grid grid-cols-2 gap-4 auto-rows-min">
                    {players.map(player => (
                        <PlayerCard
                            key={player.id}
                            player={player}
                            onClick={() => handleEditPlayer(player.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom Action */}
            <div className="flex-none p-4 w-full flex justify-center bg-gradient-to-t from-spy-blue to-transparent z-20 absolute bottom-0">
                <BouncyButton
                    onClick={onConfirm}
                    className="w-full max-w-sm shadow-xl text-lg py-4"
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
