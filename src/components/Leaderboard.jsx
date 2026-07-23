import React, { useEffect, useState, useRef } from 'react';
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
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

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

    DEFAULT_AGENTS.forEach(defP => {
      if (!rawList.some(r => r.username.toLowerCase() === defP.username.toLowerCase())) {
        rawList.push(calculateStats(defP));
      }
    });

    rawList.sort((a, b) => b.winRate - a.winRate || b.wins - a.wins || b.coins - a.coins);

    setLeaderboardData(rawList.slice(0, 100));
    setLoading(false);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(100, prev + 10));
  };

  const handleShowLess = () => {
    setVisibleCount(10);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const top1 = leaderboardData[0];
  const top2 = leaderboardData[1];
  const top3 = leaderboardData[2];

  const paginatedList = leaderboardData.slice(3, visibleCount);
  const hasMore = visibleCount < Math.min(100, leaderboardData.length);

  return (
    /* Fixed full-screen container — NO page scroll. Clears top bar and navbar */
    <div className="fixed top-16 left-0 right-0 px-3 sm:px-5 max-w-md mx-auto flex flex-col items-center overflow-hidden pointer-events-auto select-none z-10"
      style={{ bottom: 'calc(115px + env(safe-area-inset-bottom, 0px))' }}
    >
      
      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(204,255,0,0.10) 0%, rgba(204,255,0,0.03) 50%, transparent 80%)' }}
        ></div>
      </div>

      {/* All content in a flex column — header & podium are fixed, card stretches */}
      <div className="z-10 w-full flex flex-col items-center overflow-hidden flex-1 min-h-0">
        
        {/* ═══════════ HEADER (never scrolls) ═══════════ */}
        <div className="text-center mb-0.5 sm:mb-1 flex-shrink-0">
          <div className="inline-flex items-center px-3 py-0.5 rounded-full bg-spy-lime/8 border border-spy-lime/25 text-spy-lime text-[7.5px] sm:text-[9px] font-black uppercase tracking-[0.15em] mb-0.5"
            style={{ boxShadow: '0 2px 12px rgba(204,255,0,0.08)' }}
          >
            {visibleCount <= 10 ? 'TOP 10 AGENTS ÉLITES' : `TOP ${visibleCount} AGENTS ÉLITES`}
          </div>
          <h1 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
          >
            CLASSEMENT
          </h1>
          <div className="w-12 sm:w-14 h-[2px] bg-gradient-to-r from-transparent via-spy-lime to-transparent mx-auto rounded-full mt-0.5 opacity-80"></div>
        </div>

        {/* ═══════════ 3D PODIUM (never scrolls) ═══════════ */}
        <div className="w-full grid grid-cols-3 gap-1 sm:gap-2 items-end mb-1 sm:mb-1.5 px-0.5 flex-shrink-0">
          
          {/* ── 2ND PLACE (Silver) ── */}
          {top2 && (
            <div className="flex flex-col items-center">
              <div className="relative mb-0.5 flex flex-col items-center">
                <div className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 rounded-full bg-gradient-to-b from-slate-200 to-slate-400 border-2 border-white/90 flex items-center justify-center text-[8px] sm:text-[10px] font-black text-slate-800 -mb-2 z-20"
                  style={{ boxShadow: '0 2px 8px rgba(148,163,184,0.5)' }}
                >
                  2
                </div>
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-b from-slate-600 to-slate-900 border-2 border-slate-300/60 p-0.5 overflow-hidden"
                  style={{ boxShadow: '0 6px 20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1)' }}
                >
                  <CartoonAvatar id={top2.avatar_emoji} className="w-full h-full border-none shadow-none" />
                </div>
              </div>
              <span className="text-[8px] sm:text-[10.5px] font-black text-white truncate max-w-[70px] sm:max-w-[90px] text-center leading-tight mt-0.5">{top2.username}</span>
              <span className="text-[6.5px] sm:text-[8px] font-bold text-spy-lime/90">{top2.winRate}% Réussite</span>
              
              <div className="w-full h-9 sm:h-12 mt-0.5 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center p-0.5"
                style={{
                  background: 'linear-gradient(180deg, rgba(100,116,139,0.4) 0%, rgba(15,23,42,0.95) 100%)',
                  border: '1.5px solid rgba(148,163,184,0.3)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)'
                }}
              >
                <span className="text-[10px] sm:text-xs font-black text-slate-300/90">#2</span>
                <span className="text-[5px] sm:text-[7px] text-white/50 font-bold">{top2.wins} Vic. • {top2.losses} Déf.</span>
                <div className="flex items-center gap-0.5 mt-0.5">
                  <img src="/croquette_coin_3d.png" alt="coin" className="w-2 h-2 sm:w-3 sm:h-3 object-contain" />
                  <span className="text-[6px] sm:text-[8px] font-black text-spy-lime">{top2.coins}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── 1ST PLACE (Gold Hero) ── */}
          {top1 && (
            <div className="flex flex-col items-center -translate-y-0.5">
              <div className="relative mb-0.5 flex flex-col items-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 border-2 border-white/90 flex items-center justify-center text-slate-950 -mb-2.5 z-20"
                  style={{ boxShadow: '0 0 18px rgba(251,191,36,0.6), 0 3px 8px rgba(0,0,0,0.3)' }}
                >
                  <Crown className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-slate-950" />
                </div>
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-b from-amber-500/30 to-slate-900 border-[2.5px] border-amber-400/80 p-0.5 overflow-hidden"
                  style={{ boxShadow: '0 8px 28px rgba(251,191,36,0.3), inset 0 1px 0 rgba(255,255,255,0.15)' }}
                >
                  <CartoonAvatar id={top1.avatar_emoji} className="w-full h-full border-none shadow-none" />
                </div>
              </div>
              <span className="text-[9px] sm:text-[11px] font-black text-amber-300 truncate max-w-[80px] sm:max-w-[100px] text-center leading-tight mt-0.5"
                style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}
              >{top1.username}</span>
              <span className="text-[7px] sm:text-[8.5px] font-bold text-spy-lime/90">{top1.winRate}% Réussite</span>
              
              <div className="w-full h-10 sm:h-13 mt-0.5 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center p-0.5 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, rgba(245,158,11,0.2) 0%, rgba(120,53,15,0.1) 40%, rgba(15,23,42,0.95) 100%)',
                  border: '1.5px solid rgba(251,191,36,0.4)',
                  boxShadow: '0 8px 28px rgba(251,191,36,0.15), inset 0 1px 0 rgba(251,191,36,0.12)'
                }}
              >
                <span className="text-[10px] sm:text-xs font-black text-amber-400">#1 ÉLITE</span>
                <span className="text-[5px] sm:text-[7px] font-bold text-amber-200/80">{top1.wins} Vic. • {top1.losses} Déf.</span>
                <div className="flex items-center gap-0.5 mt-0.5">
                  <img src="/croquette_coin_3d.png" alt="coin" className="w-2 h-2 sm:w-3 sm:h-3 object-contain" />
                  <span className="text-[6px] sm:text-[8px] font-black text-spy-lime">{top1.coins}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── 3RD PLACE (Bronze) ── */}
          {top3 && (
            <div className="flex flex-col items-center">
              <div className="relative mb-0.5 flex flex-col items-center">
                <div className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 rounded-full bg-gradient-to-b from-amber-600 to-amber-800 border-2 border-white/80 flex items-center justify-center text-[8px] sm:text-[10px] font-black text-amber-100 -mb-2 z-20"
                  style={{ boxShadow: '0 2px 8px rgba(180,83,9,0.5)' }}
                >
                  3
                </div>
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-b from-amber-900/50 to-slate-900 border-2 border-amber-600/50 p-0.5 overflow-hidden"
                  style={{ boxShadow: '0 6px 20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                >
                  <CartoonAvatar id={top3.avatar_emoji} className="w-full h-full border-none shadow-none" />
                </div>
              </div>
              <span className="text-[8px] sm:text-[10.5px] font-black text-white truncate max-w-[70px] sm:max-w-[90px] text-center leading-tight mt-0.5">{top3.username}</span>
              <span className="text-[6.5px] sm:text-[8px] font-bold text-spy-lime/90">{top3.winRate}% Réussite</span>
              
              <div className="w-full h-8 sm:h-11 mt-0.5 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center p-0.5"
                style={{
                  background: 'linear-gradient(180deg, rgba(120,53,15,0.3) 0%, rgba(15,23,42,0.95) 100%)',
                  border: '1.5px solid rgba(180,83,9,0.3)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)'
                }}
              >
                <span className="text-[10px] sm:text-xs font-black text-amber-600/90">#3</span>
                <span className="text-[5px] sm:text-[7px] text-white/50 font-bold">{top3.wins} Vic. • {top3.losses} Déf.</span>
                <div className="flex items-center gap-0.5 mt-0.5">
                  <img src="/croquette_coin_3d.png" alt="coin" className="w-2 h-2 sm:w-3 sm:h-3 object-contain" />
                  <span className="text-[6px] sm:text-[8px] font-black text-spy-lime">{top3.coins}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ═══════════ RANK LIST CARD ═══════════
            Always fills remaining space between podium and navbar.
            The list scrolls internally — the card itself never moves or resizes.
        */}
        <div className="w-full rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 flex flex-col overflow-hidden flex-1 min-h-0"
          style={{
            background: 'linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(2,6,23,0.96) 50%, rgba(15,23,42,0.90) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 -1px 0 rgba(255,255,255,0.04) inset, 0 12px 40px rgba(0,0,0,0.5)'
          }}
        >
          
          {/* Column headers */}
          <div className="flex items-center justify-between px-1.5 sm:px-2 pb-1 mb-1 text-[7px] sm:text-[8.5px] font-black uppercase tracking-[0.12em] text-white/30 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span>RANG & AGENT</span>
            <span>RÉUSSITE & STATS</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-6 text-spy-lime gap-2 flex-1">
              <div className="w-5 h-5 border-2 border-spy-lime border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[8.5px] font-black uppercase tracking-wider">Chargement des agents...</span>
            </div>
          ) : (
            <div className="flex flex-col overflow-hidden flex-1 min-h-0">
              
              {/* Scrollable player rows — ONLY this part scrolls */}
              <div ref={scrollRef} className="overflow-y-auto no-scrollbar space-y-[3px] sm:space-y-1 flex-1 min-h-0 pr-0.5">
                {paginatedList.map((agent, index) => {
                  const rankNumber = index + 4;
                  return (
                    <div
                      key={agent.username + index}
                      className="flex items-center justify-between rounded-xl p-1.5 sm:p-2 transition-all duration-200"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.02)'
                      }}
                    >
                      {/* Left: Rank + Avatar + Name */}
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center text-[8px] sm:text-[9.5px] font-black text-white/50 flex-shrink-0"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.06)'
                          }}
                        >
                          #{rankNumber}
                        </div>

                        <div className="w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-xl overflow-hidden flex-shrink-0"
                          style={{
                            background: 'linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9))',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                          }}
                        >
                          <CartoonAvatar id={agent.avatar_emoji} className="w-full h-full border-none shadow-none" />
                        </div>

                        <div className="flex flex-col text-left min-w-0">
                          <span className="font-black text-[9px] sm:text-[11px] text-white tracking-wide truncate max-w-[80px] sm:max-w-[130px]">
                            {agent.username}
                          </span>
                          <span className="text-[6px] sm:text-[8px] text-spy-lime/70 font-bold">
                            {agent.title} • Niv.{agent.level}
                          </span>
                        </div>
                      </div>

                      {/* Right: Win Rate + Stats */}
                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className="text-[9.5px] sm:text-[11.5px] font-black text-spy-lime tracking-tight">
                          {agent.winRate}%
                        </span>
                        <span className="text-[5.5px] sm:text-[7.5px] text-white/45 font-bold whitespace-nowrap">
                          {agent.wins} Vic. • {agent.losses} Déf.
                        </span>
                        <div className="flex items-center gap-0.5">
                          <img src="/croquette_coin_3d.png" alt="coin" className="w-2 h-2 sm:w-2.5 sm:h-2.5 object-contain" />
                          <span className="text-[5.5px] sm:text-[7px] text-white/30 font-black">{agent.coins}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Buttons pinned at bottom of card */}
              <div className="pt-1.5 flex items-center gap-2 flex-shrink-0">
                {hasMore && (
                  <button
                    onClick={handleLoadMore}
                    className="flex-1 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-slate-950 font-black uppercase text-[9px] sm:text-[10.5px] tracking-[0.12em] transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.97]"
                    style={{
                      background: 'linear-gradient(90deg, #ccff00, #d8ff33, #ccff00)',
                      border: '1.5px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 4px 16px rgba(204,255,0,0.3), 0 2px 0 #7a9900, inset 0 1px 0 rgba(255,255,255,0.5)'
                    }}
                  >
                    <span>VOIR PLUS (+10)</span>
                    <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                )}

                {visibleCount > 10 && (
                  <button
                    onClick={handleShowLess}
                    className="py-1.5 sm:py-2 px-3.5 rounded-xl sm:rounded-2xl text-white font-black uppercase text-[9px] sm:text-[10.5px] tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 active:scale-[0.97] flex-shrink-0"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
                    }}
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
