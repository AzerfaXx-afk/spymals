import React, { useEffect, useState } from 'react';
import { Crown, ChevronDown } from 'lucide-react';
import { CartoonAvatar } from './CartoonAvatars';
import { supabase } from '../utils/supabaseClient';

const DEFAULT_AGENTS = [
  { username: 'FoxDetective_07', coins: 1450, wins: 42, games: 50, avatar_emoji: 'fox-detective', level: 12, title: 'Détective Légendaire' },
  { username: 'AgentCat_Secret', coins: 1120, wins: 38, games: 45, avatar_emoji: 'cat-spy', level: 9, title: 'Infiltré Élite' },
  { username: 'DogMaster_Pro', coins: 980, wins: 28, games: 38, avatar_emoji: 'dog-agent', level: 8, title: 'Inspecteur Chef' },
  { username: 'ChouetteHacker', coins: 850, wins: 24, games: 30, avatar_emoji: 'owl-hacker', level: 7, title: 'Cyber Spacialist' },
  { username: 'GrenouilleTactique', coins: 690, wins: 19, games: 25, avatar_emoji: 'ninja-frog', level: 5, title: 'Ninja Furtif' },
  { username: 'PandaMonocle', coins: 540, wins: 15, games: 20, avatar_emoji: 'panda-monocle', level: 4, title: 'Agent Spécial' },
  { username: 'TigreCovert', coins: 420, wins: 12, games: 16, avatar_emoji: 'tiger-agent', level: 3, title: 'Tigre Ombre' },
  { username: 'KoalaInfiltrator', coins: 380, wins: 10, games: 15, avatar_emoji: 'koala-agent', level: 3, title: 'Koala Silencieux' },
  { username: 'LionLeader', coins: 350, wins: 9, games: 14, avatar_emoji: 'lion-detective', level: 2, title: 'Lion Stratège' },
  { username: 'PenguinSecret', coins: 310, wins: 8, games: 13, avatar_emoji: 'penguin-secret', level: 2, title: 'Agent Arctique' },
  { username: 'ShadowLynx', coins: 280, wins: 7, games: 12, avatar_emoji: 'cat-spy', level: 2, title: 'Ombre Furtive' },
  { username: 'ViperTactical', coins: 250, wins: 6, games: 11, avatar_emoji: 'ninja-frog', level: 1, title: 'Recrue Tactique' }
];

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const calculateStats = (item) => {
    const wins = item.wins || item.games_won || 0;
    const games = item.games || item.games_played || wins;
    const losses = Math.max(0, games - wins);
    const winRate = games > 0 ? Math.round((wins / games) * 100) : 0;
    const coins = item.coins || 0;
    const username = item.username || item.name || `Agent #${item.id?.slice(0, 4) || 'X'}`;
    const avatar_emoji = item.avatar_emoji || (typeof item.avatar === 'object' ? item.avatar?.value : item.avatar) || 'fox-detective';
    const level = Math.max(1, Math.floor((coins / 100) + 1));
    
    return {
      username,
      coins,
      wins,
      losses,
      games,
      winRate,
      avatar_emoji,
      level,
      title: getTitleByCoins(coins)
    };
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    let rawList = [];

    // 1. Fetch remote profiles from Supabase
    try {
      const { data: profiles, error } = await supabase
        .from('spymals_profiles')
        .select('*')
        .limit(100);

      if (profiles && profiles.length > 0 && !error) {
        rawList = profiles.map(calculateStats);
      }
    } catch (e) {
      console.warn("Could not fetch remote profiles", e);
    }

    // 2. Load LocalStorage player data
    try {
      const stored = localStorage.getItem('spyMals_leaderboard');
      if (stored) {
        const parsed = JSON.parse(stored);
        const localList = Object.values(parsed).map(p => calculateStats({
          username: p.name,
          coins: p.score * 10 || p.wins * 25,
          wins: p.wins || 0,
          games: p.games || 0,
          avatar: p.avatar
        }));

        localList.forEach(localP => {
          if (!rawList.some(r => r.username.toLowerCase() === localP.username.toLowerCase())) {
            rawList.push(localP);
          }
        });
      }
    } catch (e) {
      console.warn("Could not parse local leaderboard", e);
    }

    // 3. Fallback default agents to ensure full rich list
    DEFAULT_AGENTS.forEach(defP => {
      if (!rawList.some(r => r.username.toLowerCase() === defP.username.toLowerCase())) {
        rawList.push(calculateStats(defP));
      }
    });

    // Sort primarily by Win Rate % (Ratio Win/Loss), tie-breaker by total wins, then coins
    rawList.sort((a, b) => b.winRate - a.winRate || b.wins - a.wins || b.coins - a.coins);

    setLeaderboardData(rawList.slice(0, 100)); // Max top 100
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

  // List below podium (starts from index 3 up to visibleCount)
  const paginatedList = leaderboardData.slice(3, visibleCount);
  const hasMore = visibleCount < Math.min(100, leaderboardData.length);

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(100, prev + 10));
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col justify-between p-4 pt-18 pb-24 max-w-md mx-auto relative select-none">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-spy-lime opacity-10 rounded-full blur-[90px]"></div>
      </div>

      <div className="z-10 w-full flex flex-col h-full overflow-hidden">
        
        {/* Title Header (Clean, no stars) */}
        <div className="text-center mb-3 flex-shrink-0">
          <div className="inline-flex items-center px-4 py-1 rounded-full bg-spy-lime/10 border border-spy-lime/30 text-spy-lime text-[10px] font-black uppercase tracking-widest mb-1.5 shadow-sm">
            AGENTS ÉLITES
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter drop-shadow-md">
            CLASSEMENT RATIO
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-spy-lime to-transparent mx-auto rounded-full mt-1"></div>
        </div>

        {/* 3D PODIUM SECTION (Fixed, Non-Scrollable) */}
        <div className="w-full grid grid-cols-3 gap-2 items-end mb-3 px-1 flex-shrink-0">
          
          {/* 2nd Place (Silver) */}
          {top2 && (
            <div className="flex flex-col items-center">
              <div className="relative mb-1 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-slate-300 border border-white flex items-center justify-center text-[11px] font-black text-slate-900 shadow-lg -mb-2 z-20">
                  2
                </div>
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-300 p-0.5 shadow-[0_6px_16px_rgba(0,0,0,0.5)] overflow-hidden">
                  <CartoonAvatar id={top2.avatar_emoji} className="w-full h-full border-none shadow-none" />
                </div>
              </div>
              <span className="text-[10px] font-black text-white truncate max-w-[85px] text-center">{top2.username}</span>
              <span className="text-[9px] font-black text-spy-lime">{top2.winRate}% Ratio</span>
              
              {/* Podium Pillar 2 */}
              <div className="w-full h-16 mt-1 bg-gradient-to-b from-slate-800/90 to-slate-950/90 border-t-4 border-slate-300 rounded-t-2xl flex flex-col items-center justify-center shadow-lg">
                <span className="text-xl font-black text-slate-400 opacity-60">2</span>
                <span className="text-[7px] text-white/50 font-bold">{top2.wins}V - {top2.losses}D</span>
              </div>
            </div>
          )}

          {/* 1st Place (Gold Hero) */}
          {top1 && (
            <div className="flex flex-col items-center -translate-y-2">
              <div className="relative mb-1 flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 border-2 border-white flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.6)] -mb-2.5 z-20">
                  <Crown className="w-4 h-4 fill-slate-950" />
                </div>
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-b from-amber-500/30 to-slate-900 border-3 border-amber-400 p-1 shadow-[0_8px_22px_rgba(251,191,36,0.4)] overflow-hidden">
                  <CartoonAvatar id={top1.avatar_emoji} className="w-full h-full border-none shadow-none" />
                </div>
              </div>
              <span className="text-[11px] font-black text-amber-300 truncate max-w-[95px] text-center drop-shadow-sm">{top1.username}</span>
              <span className="text-[10px] font-black text-spy-lime">{top1.winRate}% Ratio</span>
              
              {/* Podium Pillar 1 */}
              <div className="w-full h-22 mt-1 bg-gradient-to-b from-amber-500/20 to-slate-950/95 border-t-4 border-amber-400 rounded-t-2xl flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-amber-400/5 animate-pulse"></div>
                <span className="text-2xl font-black text-amber-400 opacity-90">1</span>
                <span className="text-[7.5px] font-black uppercase tracking-wider text-amber-300">{top1.wins}V - {top1.losses}D</span>
              </div>
            </div>
          )}

          {/* 3rd Place (Bronze) */}
          {top3 && (
            <div className="flex flex-col items-center">
              <div className="relative mb-1 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-amber-700 border border-white flex items-center justify-center text-[11px] font-black text-amber-100 shadow-lg -mb-2 z-20">
                  3
                </div>
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-amber-900/60 to-slate-900 border-2 border-amber-600 p-0.5 shadow-[0_6px_16px_rgba(0,0,0,0.5)] overflow-hidden">
                  <CartoonAvatar id={top3.avatar_emoji} className="w-full h-full border-none shadow-none" />
                </div>
              </div>
              <span className="text-[10px] font-black text-white truncate max-w-[85px] text-center">{top3.username}</span>
              <span className="text-[9px] font-black text-spy-lime">{top3.winRate}% Ratio</span>
              
              {/* Podium Pillar 3 */}
              <div className="w-full h-14 mt-1 bg-gradient-to-b from-amber-950/80 to-slate-950/90 border-t-4 border-amber-700 rounded-t-2xl flex flex-col items-center justify-center shadow-lg">
                <span className="text-xl font-black text-amber-600 opacity-60">3</span>
                <span className="text-[7px] text-white/50 font-bold">{top3.wins}V - {top3.losses}D</span>
              </div>
            </div>
          )}

        </div>

        {/* INNER SCROLLABLE RANK LIST CONTAINER */}
        <div className="w-full bg-slate-950/90 backdrop-blur-2xl border-2 border-white/15 rounded-3xl p-3 shadow-[0_16px_40px_rgba(0,0,0,0.85)] flex-1 flex flex-col overflow-hidden min-h-0">
          
          <div className="flex items-center justify-between px-2 pb-2 mb-1.5 border-b border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40 flex-shrink-0">
            <span>RANG & AGENT</span>
            <span>RATIO & STATS</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-spy-lime gap-2 flex-1">
              <div className="w-7 h-7 border-3 border-spy-lime border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[10px] font-black uppercase tracking-wider">Chargement des stats...</span>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-2">
              {paginatedList.map((agent, index) => {
                const rankNumber = index + 4;
                return (
                  <div
                    key={agent.username + index}
                    className="flex items-center justify-between bg-slate-900/80 border border-white/10 hover:border-spy-lime/40 rounded-2xl p-2 transition-all duration-300"
                  >
                    {/* Left: Rank + Avatar + Name */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/70">
                        #{rankNumber}
                      </div>

                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-white/20 overflow-hidden flex-shrink-0">
                        <CartoonAvatar id={agent.avatar_emoji} className="w-full h-full border-none shadow-none" />
                      </div>

                      <div className="flex flex-col text-left">
                        <span className="font-black text-xs text-white tracking-wide truncate max-w-[110px]">
                          {agent.username}
                        </span>
                        <span className="text-[8px] text-spy-lime font-bold">
                          {agent.title} • Niv.{agent.level}
                        </span>
                      </div>
                    </div>

                    {/* Right: Win Rate % + Victories/Defeats */}
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-black text-spy-lime tracking-tight">
                        {agent.winRate}% Ratio
                      </span>
                      <span className="text-[8px] text-white/50 font-black uppercase">
                        {agent.wins}V - {agent.losses}D ({agent.coins} pts)
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* VOIR PLUS BUTTON (Max Top 100) */}
              {hasMore && (
                <div className="pt-1 pb-1 text-center">
                  <button
                    onClick={handleLoadMore}
                    className="w-full py-2 bg-spy-lime/10 hover:bg-spy-lime/20 border border-spy-lime/40 rounded-xl text-spy-lime font-black uppercase text-[10px] tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-1 active:scale-95 shadow-md"
                  >
                    <span>VOIR PLUS (+10)</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Leaderboard;
