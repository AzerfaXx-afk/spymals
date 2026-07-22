import React, { useEffect, useState } from 'react';
import { Trophy, Crown, Sparkles, Award, ShieldAlert } from 'lucide-react';
import { CartoonAvatar } from './CartoonAvatars';
import { supabase } from '../utils/supabaseClient';

const DEFAULT_AGENTS = [
  { username: 'FoxDetective_07', coins: 1450, wins: 42, games: 50, avatar_emoji: 'fox-detective', level: 12, title: 'Détective Légendaire' },
  { username: 'AgentCat_Secret', coins: 1120, wins: 34, games: 45, avatar_emoji: 'cat-spy', level: 9, title: 'Infiltré Élite' },
  { username: 'DogMaster_Pro', coins: 980, wins: 28, games: 38, avatar_emoji: 'dog-agent', level: 8, title: 'Inspecteur Chef' },
  { username: 'ChouetteHacker', coins: 850, wins: 22, games: 30, avatar_emoji: 'owl-hacker', level: 7, title: 'Cyber Spacialist' },
  { username: 'GrenouilleTactique', coins: 690, wins: 19, games: 25, avatar_emoji: 'ninja-frog', level: 5, title: 'Ninja Furtif' },
  { username: 'PandaMonocle', coins: 540, wins: 15, games: 20, avatar_emoji: 'panda-monocle', level: 4, title: 'Agent Spécial' },
  { username: 'TigreCovert', coins: 420, wins: 11, games: 16, avatar_emoji: 'tiger-agent', level: 3, title: 'Tigre Ombre' }
];

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    let combinedData = [];

    // 1. Fetch real Supabase profiles
    try {
      const { data: profiles, error } = await supabase
        .from('spymals_profiles')
        .select('*')
        .order('coins', { ascending: false })
        .limit(20);

      if (profiles && profiles.length > 0 && !error) {
        combinedData = profiles.map((p, idx) => ({
          username: p.username || `Agent #${p.id?.slice(0, 4)}`,
          coins: p.coins || 0,
          wins: p.games_won || 0,
          games: p.games_played || p.games_won || 0,
          avatar_emoji: p.avatar_emoji || 'fox-detective',
          level: Math.max(1, Math.floor((p.coins || 0) / 100) + 1),
          title: getTitleByCoins(p.coins || 0)
        }));
      }
    } catch (e) {
      console.warn("Could not fetch remote profiles, fallback to local/defaults", e);
    }

    // 2. Load LocalStorage player data
    try {
      const stored = localStorage.getItem('spyMals_leaderboard');
      if (stored) {
        const parsed = JSON.parse(stored);
        const localArray = Object.values(parsed).map(p => ({
          username: p.name,
          coins: p.score * 10 || p.wins * 25,
          wins: p.wins || 0,
          games: p.games || 0,
          avatar_emoji: typeof p.avatar === 'object' ? p.avatar?.value : p.avatar || 'fox-detective',
          level: Math.max(1, Math.floor((p.wins || 0) * 1.5) + 1),
          title: getTitleByCoins(p.score * 10 || p.wins * 25)
        }));

        // Merge local data with combined
        localArray.forEach(localP => {
          if (!combinedData.some(d => d.username.toLowerCase() === localP.username.toLowerCase())) {
            combinedData.push(localP);
          }
        });
      }
    } catch (e) {
      console.warn("Could not parse local leaderboard", e);
    }

    // 3. Fallback defaults to ensure full 3D Podium experience
    if (combinedData.length < 5) {
      DEFAULT_AGENTS.forEach(defP => {
        if (!combinedData.some(d => d.username.toLowerCase() === defP.username.toLowerCase())) {
          combinedData.push(defP);
        }
      });
    }

    // Sort by coins / points descending
    combinedData.sort((a, b) => b.coins - a.coins || b.wins - a.wins);

    setLeaderboardData(combinedData);
    setLoading(false);
  };

  const getTitleByCoins = (coins) => {
    if (coins >= 1200) return 'Légende Spymals';
    if (coins >= 800) return 'Détective En Chef';
    if (coins >= 500) return 'Infiltré Élite';
    if (coins >= 300) return 'Agent Spécial';
    return 'Recrue Furtive';
  };

  const top1 = leaderboardData[0];
  const top2 = leaderboardData[1];
  const top3 = leaderboardData[2];
  const restList = leaderboardData.slice(3);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 pt-18 pb-32 max-w-md mx-auto relative overflow-hidden select-none">
      
      {/* Glow Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-spy-lime opacity-10 rounded-full blur-[90px] animate-pulse"></div>
        <div className="absolute top-40 right-[-10%] w-60 h-60 bg-amber-500 opacity-10 rounded-full blur-[80px]"></div>
      </div>

      <div className="z-10 w-full flex flex-col items-center">
        
        {/* Title Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-spy-lime/10 border border-spy-lime/30 text-spy-lime text-[10px] font-black uppercase tracking-widest mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> AGENTS ÉLITES
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-md">
            CLASSEMENT
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-spy-lime to-transparent mx-auto rounded-full mt-1.5"></div>
        </div>

        {/* 3D PODIUM SECTION */}
        <div className="w-full grid grid-cols-3 gap-2 items-end mb-6 pt-6 px-1">
          
          {/* 2nd Place (Silver) */}
          {top2 && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-slate-300 border border-white flex items-center justify-center text-[11px] font-black text-slate-900 shadow-lg -mb-2 z-20">
                  2
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-300 p-0.5 shadow-[0_8px_20px_rgba(0,0,0,0.5)] overflow-hidden">
                  <CartoonAvatar id={top2.avatar_emoji} className="w-full h-full border-none shadow-none" />
                </div>
              </div>
              <span className="text-[11px] font-black text-white truncate max-w-[90px] text-center">{top2.username}</span>
              <span className="text-[9px] font-bold text-slate-300">{top2.coins} pts</span>
              
              {/* Podium Pillar 2 */}
              <div className="w-full h-20 mt-2 bg-gradient-to-b from-slate-800/90 to-slate-950/90 border-t-4 border-slate-300 rounded-t-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-black text-slate-400 opacity-60">2</span>
              </div>
            </div>
          )}

          {/* 1st Place (Gold Hero) */}
          {top1 && (
            <div className="flex flex-col items-center -translate-y-3">
              <div className="relative mb-2 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 border-2 border-white flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.6)] -mb-3 z-20">
                  <Crown className="w-4 h-4 fill-slate-950" />
                </div>
                <div className="w-18 h-18 rounded-3xl bg-gradient-to-b from-amber-500/30 to-slate-900 border-3 border-amber-400 p-1 shadow-[0_10px_25px_rgba(251,191,36,0.4)] overflow-hidden">
                  <CartoonAvatar id={top1.avatar_emoji} className="w-full h-full border-none shadow-none" />
                </div>
              </div>
              <span className="text-xs font-black text-amber-300 truncate max-w-[100px] text-center drop-shadow-sm">{top1.username}</span>
              <div className="flex items-center gap-1">
                <img src="/croquette_coin_3d.png" alt="coin" className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black text-spy-lime">{top1.coins} pts</span>
              </div>
              
              {/* Podium Pillar 1 */}
              <div className="w-full h-28 mt-2 bg-gradient-to-b from-amber-500/20 to-slate-950/95 border-t-4 border-amber-400 rounded-t-2xl flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-amber-400/5 animate-pulse"></div>
                <span className="text-3xl font-black text-amber-400 opacity-80 drop-shadow-md">1</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-amber-300/70 -mt-1">ÉLITE</span>
              </div>
            </div>
          )}

          {/* 3rd Place (Bronze) */}
          {top3 && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-amber-700 border border-white flex items-center justify-center text-[11px] font-black text-amber-100 shadow-lg -mb-2 z-20">
                  3
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-amber-900/60 to-slate-900 border-2 border-amber-600 p-0.5 shadow-[0_8px_20px_rgba(0,0,0,0.5)] overflow-hidden">
                  <CartoonAvatar id={top3.avatar_emoji} className="w-full h-full border-none shadow-none" />
                </div>
              </div>
              <span className="text-[11px] font-black text-white truncate max-w-[90px] text-center">{top3.username}</span>
              <span className="text-[9px] font-bold text-amber-400">{top3.coins} pts</span>
              
              {/* Podium Pillar 3 */}
              <div className="w-full h-16 mt-2 bg-gradient-to-b from-amber-950/80 to-slate-950/90 border-t-4 border-amber-700 rounded-t-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-black text-amber-600 opacity-60">3</span>
              </div>
            </div>
          )}

        </div>

        {/* FULL LEADERBOARD LIST CONTAINER */}
        <div className="w-full bg-slate-950/90 backdrop-blur-2xl border-2 border-white/15 rounded-3xl p-4 shadow-[0_16px_40px_rgba(0,0,0,0.85)] flex-1 min-h-[320px]">
          
          <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40">
            <span>RANG & AGENT</span>
            <span>SCORE & VICTOIRES</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-spy-lime gap-2">
              <div className="w-8 h-8 border-4 border-spy-lime border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-black uppercase tracking-wider">Chargement des scores...</span>
            </div>
          ) : restList.length === 0 && !top1 ? (
            <div className="text-center py-12 text-white/40 text-xs font-black uppercase tracking-widest">
              Aucune donnée de classement disponible
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 no-scrollbar">
              {restList.map((agent, index) => {
                const rankNumber = index + 4;
                return (
                  <div
                    key={agent.username + index}
                    className="flex items-center justify-between bg-slate-900/80 border border-white/10 hover:border-spy-lime/40 rounded-2xl p-2.5 transition-all duration-300 hover:translate-x-1"
                  >
                    {/* Left: Rank + Avatar + Name */}
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-white/70">
                        #{rankNumber}
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/20 overflow-hidden flex-shrink-0">
                        <CartoonAvatar id={agent.avatar_emoji} className="w-full h-full border-none shadow-none" />
                      </div>

                      <div className="flex flex-col text-left">
                        <span className="font-black text-xs text-white tracking-wide">
                          {agent.username}
                        </span>
                        <span className="text-[9px] text-spy-lime font-bold">
                          {agent.title} • Niv.{agent.level}
                        </span>
                      </div>
                    </div>

                    {/* Right: Coins + Wins */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1">
                        <img src="/croquette_coin_3d.png" alt="coin" className="w-4 h-4 object-contain" />
                        <span className="text-sm font-black text-white tracking-tight">{agent.coins}</span>
                      </div>
                      <span className="text-[8px] text-white/40 font-black uppercase">
                        {agent.wins} Victoires
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Leaderboard;
