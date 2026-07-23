import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import PlayerCard from './PlayerCard';
import EditPlayerModal from './EditPlayerModal';
import BackArrow from './BackArrow';
import SettingsGear from './SettingsGear';

const IdentifyAgents = ({ players, onUpdatePlayers, onConfirm, onBack, onOpenSettings }) => {
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
            <SettingsGear onClick={onOpenSettings} />

            {/* Background Ambient Lights */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-20%] w-[600px] h-[600px] bg-spy-lime opacity-[0.08] rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-20%] w-[500px] h-[500px] bg-spy-orange opacity-[0.08] rounded-full blur-[120px] animate-pulse-slow delay-700"></div>
            </div>

            {/* Header */}
            <div className="flex-none p-6 text-center z-10 pt-20 pb-4 max-w-md w-full mx-auto flex flex-col items-center">
                <div className="bg-spy-lime/15 border-2 border-spy-lime/50 rounded-full px-4 py-1.5 flex items-center gap-2 mb-3 shadow-[0_0_15px_rgba(204,255,0,0.2)]">
                    <ShieldCheck className="w-4 h-4 text-spy-lime" />
                    <span className="text-[10.5px] font-black uppercase tracking-[0.2em] text-spy-lime">
                        Accréditation des Agents
                    </span>
                </div>

                <h2 className="text-3xl font-black text-white uppercase tracking-tight drop-shadow-lg animate-slide-up">
                    Identifiez les Agents
                </h2>
                <p className="text-white/60 text-xs font-black mt-1 uppercase tracking-wider animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    Tapez sur un badge pour le personnaliser
                </p>
            </div>

            {/* Grid - Scrollable area */}
            <div className="flex-grow overflow-y-auto px-4 pb-36 z-10 custom-scrollbar max-w-md w-full mx-auto" style={{ paddingBottom: 'calc(9rem + env(safe-area-inset-bottom))' }}>
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

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 w-full p-4 pb-6 bg-gradient-to-t from-[#051021] via-[#051021]/95 to-transparent z-20 backdrop-blur-md" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
                <div className="w-full max-w-md mx-auto px-2">
                    <button
                        onClick={onConfirm}
                        className="btn-cartoon-primary w-full py-4 text-lg font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_6px_0_#000] active:translate-y-1.5 active:shadow-[0_0_0_#000] transition-all"
                    >
                        <CheckCircle2 className="w-6 h-6 stroke-[3]" /> CONFIRMER L'ÉQUIPE
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
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

