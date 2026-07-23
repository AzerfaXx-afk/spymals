import React, { useEffect, useState } from 'react';
import { Crown, ChevronDown, ChevronUp } from 'lucide-react';
import { CartoonAvatar } from './CartoonAvatars';
import { supabase } from '../utils/supabaseClient';

const ANIMAL_AVATARS = ['fox-detective', 'cat-spy', 'dog-agent', 'owl-hacker', 'ninja-frog', 'panda-monocle', 'tiger-agent', 'koala-agent', 'lion-detective', 'penguin-secret'];
const PREFIXES = ['Agent', 'Shadow', 'Cyber', 'Master', 'Ninja', 'Spectre', 'Ghost', 'Viper', 'Eagle', 'Falcon', 'Panther', 'Hunter', 'Alpha', 'Delta', 'Omega', 'Vortex', 'Apex', 'Titan', 'Zenith', 'Kestrel'];
const SUFFIXES = ['Pro', 'Elite', 'Spy', 'Tactical', 'X', 'Zero', 'Prime', '007', 'V', 'Matrix', 'Volt', 'Storm', 'Shadow', 'Blaze', 'Cipher', 'Stealth', 'Phantom', 'Fury', 'Rogue', 'Venom'];

const BASE_10_AGENTS = [
  { username: 'FoxDetective_07', coins: 1450, wins: 42, games: 50, avatar_emoji: 'fox-detective' },
  { username: 'AgentCat_Secret', coins: 1120, wins: 38, games: 45, avatar_emoji: 'cat-spy' },
  { username: 'DogMaster_Pro', coins: 980, wins: 28, games: 38, avatar_emoji: 'dog-agent' },
  { username: 'ChouetteHacker', coins: 850, wins: 24, games: 30, avatar_emoji: 'owl-hacker' },
  { username: 'GrenouilleTactique', coins: 690, wins: 19, games: 25, avatar_emoji: 'ninja-frog' },
  { username: 'PandaMonocle', coins: 540, wins: 15, games: 20, avatar_emoji: 'panda-monocle' },
  { username: 'TigreCovert', coins: 420, wins: 12, games: 16, avatar_emoji: 'tiger-agent' },
  { username: 'KoalaInfiltrator', coins: 380, wins: 10, games: 15, avatar_emoji: 'koala-agent' },
  { username: 'LionLeader', coins: 350, wins: 9, games: 14, avatar_emoji: 'lion-detective' },
  { username: 'PenguinSecret', coins: 310, wins: 8, games: 13, avatar_emoji: 'penguin-secret' }
];

const generate100Agents = () => {
  const list = [...BASE_10_AGENTS];
  for (let i = 11; i <= 100; i++) {
    const prefix = PREFIXES[(i * 3) % PREFIXES.length];
    const suffix = SUFFIXES[(i * 7) % SUFFIXES.length];
    const avatar = ANIMAL_AVATARS[i % ANIMAL_AVATARS.length];
    const wins = Math.max(1, 40 - Math.floor(i * 0.35));
    const games = wins + Math.floor(i * 0.2) + 2;
    const coins = Math.max(10, 1500 - (i * 14));
    list.push({
      username: `${prefix}_${suffix}_${i}`,
      coins,
      wins,
      games,
      avatar_emoji: avatar
    });
  }
  return list;
};

const DEFAULT_AGENTS = generate100Agents();

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10); // Podium (3) + 7 in list = 10 total (Top 10)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getTitleByCoins = (coins) => {
    if (coins >= 1200) return 'Légende Spymals';
    if (coins >= 800) return 'Détective En Chef';
    if (coins >= 500) return 'Infiltré Élite';
    if (coins >= 300) return 'Agent Spécial';
    return 'Recrue Furtive';
  };

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

    // 3. Populate default agents up to 100 players
    DEFAULT_AGENTS.forEach(defP => {
      if (!rawList.some(r => r.username.toLowerCase() === defP.username.toLowerCase())) {
        rawList.push(calculateStats(defP));
      }
    });

    // Sort primarily by Win Rate % (Réussite), tie-breaker by total wins, then coins
    rawList.sort((a, b) => b.winRate - a.winRate || b.wins - a.wins || b.coins - a.coins);

    setLeaderboardData(rawList.slice(0, 100)); // Exactly TOP 100
    setLoading(false);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(100, prev + 10));
  };

  const handleShowLess = () => {
    setVisibleCount(10);
  };

  const top1 = leaderboardData[0];
  const top2 = leaderboardData[1];
  const top3 = leaderboardData[2];

  // List below podium (starts from rank 4 up to visibleCount)
  const paginatedList = leaderboardData.slice(3, visibleCount);
  const hasMore = visibleCount < Math.min(100, leaderboardData.length);

  return (
    /* LEVER 1: Outer Positioning Container (Responsive for Mobile & Desktop PC) */
    <div className="fixed inset-0 top-16 bottom-24 px-3.5 sm:px-5 max-w-md mx-auto flex flex-col items-center justify-start pt-1 overflow-hidden pointer-events-auto select-none z-10">
      
      {/* Background Seamless Ambient Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-spy-lime/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-[90px]"></div>
      </div>

      <div className="z-10 w-full flex flex-col items-center overflow-hidden flex-1">
        
        {/* Header Title */}
        <div className="text-center mb-1 flex-shrink-0">
          <div className="inline-flex items-center px-3.5 py-0.5 rounded-full bg-spy-lime/10 border border-spy-lime/30 text-spy-lime text-[8.5px] sm:text-[9px] font-black uppercase tracking-widest mb-0.5 shadow-[0_2px_8px_rgba(204,255,0,0.15)]">
            {visibleCount <= 10 ? 'TOP 10 AGENTS ÉLITES' : `TOP ${visibleCount} AGENTS ÉLITES`}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter drop-shadow-md">
            CLASSEMENT
          </h1>
          <div className="w-14 h-1 bg-gradient-to-r from-transparent via-spy-lime to-transparent mx-auto rounded-full mt-0.5"></div>
        </div>

        {/* 3D CARTOON PODIUM SECTION */}
        <div className="w-full grid grid-cols-3 gap-1.5 sm:gap-2 items-end mb-1.5 px-0.5 flex-shrink-0">
          
          {/* 2nd Place (Silver) */}
          {top2 && (
            <div className="flex flex-col items-center">
              <div className="relative mb-0.5 flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-[9px] font-black text-slate-900 shadow-md -mb-2 z-20">
                  2
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-300 p-0.5 shadow-lg overflow-hidden">
                  <CartoonAvatar id={top2.avatar_emoji} className="w-full h-full border-none shadow-none" />
                </div>
              </div>
              <span className="text-[9px] sm:text-[10px] font-black text-white truncate max-w-[75px] sm:max-w-[85px] text-center leading-tight mt-0.5">{top2.username}</span>
              <span className="text-[7.5px] sm:text-[8px] font-black text-spy-lime">{top2.winRate}% Réussite</span>
              
              {/* Podium Pillar 2 */}
              <div className="w-full h-8.5 sm:h-9 mt-0.5 bg-gradient-to-b from-slate-800/95 to-slate-950/95 border-2 border-slate-300 rounded-2xl flex flex-col items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.5)] p-0.5">
                <span className="text-xs font-black text-slate-300 opacity-90">#2</span>
                <span className="text-[6px] sm:text-[7px] text-white/70 font-bold">{top2.wins}V • {top2.losses}D</span>
              </div>
            </div>
          )}

          {/* 1st Place (Gold Hero) */}
          {top1 && (
            <div className="flex flex-col items-center -translate-y-0.5">
              <div className="relative mb-0.5 flex flex-col items-center">
                <div className="w-5.5 h-5.5 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 border-2 border-white flex items-center justify-center text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.6)] -mb-2 z-20">
                  <Crown className="w-3 h-3 fill-slate-950" />
                </div>
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-b from-amber-500/30 to-slate-900 border-3 border-amber-400 p-0.5 shadow-[0_6px_20px_rgba(251,191,36,0.4)] overflow-hidden">
                  <CartoonAvatar id={top1.avatar_emoji} className="w-full h-full border-none shadow-none" />
                </div>
              </div>
              <span className="text-[9.5px] sm:text-[10.5px] font-black text-amber-300 truncate max-w-[85px] sm:max-w-[95px] text-center drop-shadow-sm leading-tight mt-0.5">{top1.username}</span>
              <span className="text-[8px] sm:text-[8.5px] font-black text-spy-lime">{top1.winRate}% Réussite</span>
              
              {/* Podium Pillar 1 */}
              <div className="w-full h-12 sm:h-13 mt-0.5 bg-gradient-to-b from-amber-500/20 to-slate-950/95 border-2 border-amber-400 rounded-2xl flex flex-col items-center justify-center shadow-[0_6px_20px_rgba(251,191,36,0.25)] relative overflow-hidden p-0.5">
                <span className="text-xs font-black text-amber-400 opacity-95">#1 ÉLITE</span>
                <span className="text-[6.5px] sm:text-[7.5px] font-black text-amber-200">{top1.wins}V • {top1.losses}D</span>
                <div className="flex items-center gap-0.5 mt-0.5">
                  <img src="/croquette_coin_3d.png" alt="coin" className="w-2.5 h-2.5 object-contain" />
                  <span className="text-[6.5px] sm:text-[7.5px] font-black text-spy-lime">{top1.coins} Croquettes</span>
                </div>
              </div>
            </div>
          )}

          {/* 3rd Place (Bronze) */}
          {top3 && (
            <div className="flex flex-col items-center">
              <div className="relative mb-0.5 flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-amber-700 border-2 border-white flex items-center justify-center text-[9px] font-black text-amber-100 shadow-md -mb-2 z-20">
                  3
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-b from-amber-900/60 to-slate-900 border-2 border-amber-600 p-0.5 shadow-lg overflow-hidden">
                  <CartoonAvatar id={top3.avatar_emoji} className="w-full h-full border-none shadow-none" />
                </div>
              </div>
              <span className="text-[9px] sm:text-[10px] font-black text-white truncate max-w-[75px] sm:max-w-[85px] text-center leading-tight mt-0.5">{top3.username}</span>
              <span className="text-[7.5px] sm:text-[8px] font-black text-spy-lime">{top3.winRate}% Réussite</span>
              
              {/* Podium Pillar 3 */}
              <div className="w-full h-8 sm:h-8.5 mt-0.5 bg-gradient-to-b from-amber-950/80 to-slate-950/95 border-2 border-amber-700 rounded-2xl flex flex-col items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.5)] p-0.5">
                <span className="text-xs font-black text-amber-600 opacity-90">#3</span>
                <span className="text-[6px] sm:text-[7px] text-white/70 font-bold">{top3.wins}V • {top3.losses}D</span>
              </div>
            </div>
          )}

        </div>

        {/* LEVER 2: ROUNDED RANK LIST CONTAINER - Premium Cartoon 3D Glass Card */}
        <div className={`w-full bg-slate-950/90 backdrop-blur-2xl border-2 border-white/15 rounded-3xl p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(204,255,0,0.04)] flex flex-col overflow-hidden transition-all duration-300 ${visibleCount > 10 ? 'flex-1 min-h-0' : 'flex-shrink-0'}`}>
          
          <div className="flex items-center justify-between px-2 pb-1 mb-1 border-b border-white/10 text-[8px] sm:text-[8.5px] font-black uppercase tracking-widest text-white/40 flex-shrink-0">
            <span>RANG & AGENT</span>
            <span>RÉUSSITE & STATS</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-6 text-spy-lime gap-2 flex-1">
              <div className="w-5 h-5 border-2 border-spy-lime border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[8.5px] font-black uppercase tracking-wider">Chargement des agents...</span>
            </div>
          ) : (
            <div className={`flex flex-col overflow-hidden ${visibleCount > 10 ? 'flex-1 min-h-0 justify-between' : 'flex-shrink-0'}`}>
              
              {/* LEVER 3: Scrollable Player List Height - max-h-[380px] fits all 7 items (#4 to #10) 100% cleanly */}
              <div className={`overflow-y-auto pr-0.5 no-scrollbar space-y-1 ${visibleCount > 10 ? 'flex-1' : 'max-h-[380px]'}`}>
                {paginatedList.map((agent, index) => {
                  const rankNumber = index + 4;
                  return (
                    <div
                      key={agent.username + index}
                      className="flex items-center justify-between bg-slate-900/90 border border-white/10 hover:border-spy-lime/50 rounded-xl p-1.5 transition-all duration-200 shadow-sm"
                    >
                      {/* Left: Rank + Avatar + Name */}
                      <div className="flex items-center gap-2">
                        <div className="w-5.5 h-5.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[8.5px] sm:text-[9px] font-black text-white/70">
                          #{rankNumber}
                        </div>

                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-800 border border-white/20 overflow-hidden flex-shrink-0">
                          <CartoonAvatar id={agent.avatar_emoji} className="w-full h-full border-none shadow-none" />
                        </div>

                        <div className="flex flex-col text-left">
                          <span className="font-black text-[10px] sm:text-[11px] text-white tracking-wide truncate max-w-[100px] sm:max-w-[120px]">
                            {agent.username}
                          </span>
                          <span className="text-[7.5px] sm:text-[8px] text-spy-lime font-bold">
                            {agent.title} • Niv.{agent.level}
                          </span>
                        </div>
                      </div>

                      {/* Right: Win Rate % + Victoires / Défaites */}
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] sm:text-[11px] font-black text-spy-lime tracking-tight">
                          {agent.winRate}% Réussite
                        </span>
                        <span className="text-[7.5px] sm:text-[8px] text-white/70 font-bold">
                          {agent.wins}V • {agent.losses}D
                        </span>
                        <div className="flex items-center gap-0.5">
                          <img src="/croquette_coin_3d.png" alt="coin" className="w-2.5 h-2.5 object-contain" />
                          <span className="text-[7px] sm:text-[7.5px] text-white/40 font-black">{agent.coins}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ALWAYS VISIBLE PINNED CONTROLS AT BOTTOM (+10 AND REPLIER) */}
              <div className="pt-1.5 flex items-center gap-2 flex-shrink-0">
                {hasMore && (
                  <button
                    onClick={handleLoadMore}
                    className="flex-1 py-1.5 bg-gradient-to-r from-spy-lime via-[#bbe600] to-spy-lime hover:brightness-110 border border-white rounded-2xl text-slate-950 font-black uppercase text-[9.5px] sm:text-[10px] tracking-widest transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-[0_4px_14px_rgba(204,255,0,0.35),0_2px_0_#77aa00]"
                  >
                    <span>VOIR PLUS (+10)</span>
                    <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                )}

                {visibleCount > 10 && (
                  <button
                    onClick={handleShowLess}
                    className="py-1.5 px-3.5 bg-white/10 hover:bg-white/20 border border-white/25 rounded-2xl text-white font-black uppercase text-[9.5px] sm:text-[10px] tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 active:scale-95 flex-shrink-0 shadow-md"
                  >
                    <span>REPLIER</span>
                    <ChevronUp className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Leaderboard;
