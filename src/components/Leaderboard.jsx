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
  { username: 'ShadowLynx', coins: 290, wins: 7, games: 12, avatar_emoji: 'cat-spy', level: 2, title: 'Ombre Furtive' },
  { username: 'ViperTactical', coins: 270, wins: 6, games: 11, avatar_emoji: 'ninja-frog', level: 2, title: 'Recrue Tactique' },
  { username: 'EagleEye_007', coins: 250, wins: 6, games: 12, avatar_emoji: 'owl-hacker', level: 2, title: 'Sniper Volant' },
  { username: 'PantherGhost', coins: 230, wins: 5, games: 10, avatar_emoji: 'tiger-agent', level: 2, title: 'Fantôme Feline' },
  { username: 'BearBouncer', coins: 210, wins: 5, games: 11, avatar_emoji: 'panda-monocle', level: 2, title: 'Garde du Corps' },
  { username: 'WolfHunter', coins: 190, wins: 4, games: 9, avatar_emoji: 'dog-agent', level: 1, title: 'Chasseur de Nuit' },
  { username: 'FoxJunior', coins: 170, wins: 4, games: 10, avatar_emoji: 'fox-detective', level: 1, title: 'Cadet Renard' },
  { username: 'AgentKoala_99', coins: 150, wins: 3, games: 8, avatar_emoji: 'koala-agent', level: 1, title: 'Recrue Discrète' },
  { username: 'PandaNinja', coins: 130, wins: 3, games: 9, avatar_emoji: 'panda-monocle', level: 1, title: 'Apprenti Ninja' },
  { username: 'CatShadow_X', coins: 110, wins: 2, games: 7, avatar_emoji: 'cat-spy', level: 1, title: 'Chat de Nuit' },
  { username: 'FrogLeaper', coins: 90, wins: 2, games: 8, avatar_emoji: 'ninja-frog', level: 1, title: 'Sauteur Furtif' },
  { username: 'OwlWatcher', coins: 70, wins: 1, games: 5, avatar_emoji: 'owl-hacker', level: 1, title: 'Observateur' },
  { username: 'LionRoar', coins: 50, wins: 1, games: 6, avatar_emoji: 'lion-detective', level: 1, title: 'Lionceau' },
  { username: 'PenguinIce', coins: 30, wins: 1, games: 7, avatar_emoji: 'penguin-secret', level: 1, title: 'Recrue Givrée' },
  { username: 'TigerCub', coins: 10, wins: 0, games: 4, avatar_emoji: 'tiger-agent', level: 1, title: 'Nouvelle Recrue' }
];

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [visibleCount, setVisibleCount] = useState(13); // Top 3 on podium + 10 in list
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

    // 3. Populate default agents so list is ALWAYS rich with 25+ agents
    DEFAULT_AGENTS.forEach(defP => {
      if (!rawList.some(r => r.username.toLowerCase() === defP.username.toLowerCase())) {
        rawList.push(calculateStats(defP));
      }
    });

    // Sort primarily by Win Rate % (Réussite), tie-breaker by total wins, then coins
    rawList.sort((a, b) => b.winRate - a.winRate || b.wins - a.wins || b.coins - a.coins);

    setLeaderboardData(rawList.slice(0, 100));
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
    <div className="fixed inset-0 top-16 bottom-28 px-3.5 max-w-md mx-auto flex flex-col justify-between overflow-hidden pointer-events-auto select-none z-10">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-64 h-64 bg-spy-lime opacity-10 rounded-full blur-[80px]"></div>
      </div>

      <div className="z-10 w-full flex flex-col h-full overflow-hidden justify-between">
        
        {/* Title Header */}
        <div className="text-center mb-1 flex-shrink-0">
          <div className="inline-flex items-center px-3 py-0.5 rounded-full bg-spy-lime/10 border border-spy-lime/30 text-spy-lime text-[8.5px] font-black uppercase tracking-widest mb-0.5">
            AGENTS ÉLITES
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-tighter drop-shadow-md">
            CLASSEMENT
          </h1>
          <div className="w-12 h-1 bg-gradient-to-r from-transparent via-spy-lime to-transparent mx-auto rounded-full"></div>
        </div>

        {/* 3D CARTOON PODIUM SECTION */}
        <div className="w-full grid grid-cols-3 gap-1.5 items-end mb-2 px-0.5 flex-shrink-0">
          
          {/* 2nd Place (Silver) */}
          {top2 && (
            <div className="flex flex-col items-center">
              <div className="relative mb-0.5 flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-[9px] font-black text-slate-900 shadow-md -mb-2 z-20">
                  2
                </div>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-300 p-0.5 shadow-md overflow-hidden">
                  <CartoonAvatar id={top2.avatar_emoji} className="w-full h-full border-none shadow-none" />
                </div>
              </div>
              <span className="text-[9.5px] font-black text-white truncate max-w-[75px] text-center leading-tight mt-1">{top2.username}</span>
              <span className="text-[8px] font-black text-spy-lime">{top2.winRate}% Réussite</span>
              
              {/* Podium Pillar 2 */}
              <div className="w-full h-11 mt-1 bg-gradient-to-b from-slate-800/90 to-slate-950/95 border-2 border-slate-300 rounded-2xl flex flex-col items-center justify-center shadow-lg p-0.5">
                <span className="text-sm font-black text-slate-300 opacity-90">#2</span>
                <span className="text-[6.5px] text-white/70 font-bold">{top2.wins}V • {top2.losses}D</span>
              </div>
            </div>
          )}

          {/* 1st Place (Gold Hero) */}
          {top1 && (
            <div className="flex flex-col items-center -translate-y-1">
              <div className="relative mb-0.5 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 border-2 border-white flex items-center justify-center text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.6)] -mb-2.5 z-20">
                  <Crown className="w-3.5 h-3.5 fill-slate-950" />
                </div>
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-amber-500/30 to-slate-900 border-3 border-amber-400 p-0.5 shadow-[0_6px_18px_rgba(251,191,36,0.4)] overflow-hidden">
                  <CartoonAvatar id={top1.avatar_emoji} className="w-full h-full border-none shadow-none" />
                </div>
              </div>
              <span className="text-[10px] font-black text-amber-300 truncate max-w-[85px] text-center drop-shadow-sm leading-tight mt-1">{top1.username}</span>
              <span className="text-[8.5px] font-black text-spy-lime">{top1.winRate}% Réussite</span>
              
              {/* Podium Pillar 1 */}
              <div className="w-full h-15 mt-1 bg-gradient-to-b from-amber-500/20 to-slate-950/95 border-2 border-amber-400 rounded-2xl flex flex-col items-center justify-center shadow-2xl relative overflow-hidden p-0.5">
                <span className="text-base font-black text-amber-400 opacity-95">#1 ÉLITE</span>
                <span className="text-[7px] font-black text-amber-200">{top1.wins}V • {top1.losses}D</span>
                <div className="flex items-center gap-0.5 mt-0.5">
                  <img src="/croquette_coin_3d.png" alt="coin" className="w-2.5 h-2.5 object-contain" />
                  <span className="text-[7px] font-black text-spy-lime">{top1.coins} Croquettes</span>
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
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-amber-900/60 to-slate-900 border-2 border-amber-600 p-0.5 shadow-md overflow-hidden">
                  <CartoonAvatar id={top3.avatar_emoji} className="w-full h-full border-none shadow-none" />
                </div>
              </div>
              <span className="text-[9.5px] font-black text-white truncate max-w-[75px] text-center leading-tight mt-1">{top3.username}</span>
              <span className="text-[8px] font-black text-spy-lime">{top3.winRate}% Réussite</span>
              
              {/* Podium Pillar 3 */}
              <div className="w-full h-10 mt-1 bg-gradient-to-b from-amber-950/80 to-slate-950/95 border-2 border-amber-700 rounded-2xl flex flex-col items-center justify-center shadow-lg p-0.5">
                <span className="text-sm font-black text-amber-600 opacity-90">#3</span>
                <span className="text-[6.5px] text-white/70 font-bold">{top3.wins}V • {top3.losses}D</span>
              </div>
            </div>
          )}

        </div>

        {/* FULLY FILLED ROUNDED RANK LIST CONTAINER */}
        <div className="w-full bg-slate-950/95 backdrop-blur-2xl border-2 border-white/15 rounded-[2.2rem] p-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.85)] flex-1 flex flex-col overflow-hidden min-h-0">
          
          <div className="flex items-center justify-between px-2.5 pb-1.5 mb-1 border-b border-white/10 text-[8px] font-black uppercase tracking-widest text-white/40 flex-shrink-0">
            <span>RANG & AGENT</span>
            <span>RÉUSSITE & STATS</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-6 text-spy-lime gap-2 flex-1">
              <div className="w-5 h-5 border-2 border-spy-lime border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[8.5px] font-black uppercase tracking-wider">Chargement des stats...</span>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              
              {/* Scrollable list items ONLY */}
              <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-1.5">
                {paginatedList.map((agent, index) => {
                  const rankNumber = index + 4;
                  return (
                    <div
                      key={agent.username + index}
                      className="flex items-center justify-between bg-slate-900/80 border border-white/10 hover:border-spy-lime/40 rounded-2xl p-1.5 transition-all duration-300"
                    >
                      {/* Left: Rank + Avatar + Name */}
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[8.5px] font-black text-white/70">
                          #{rankNumber}
                        </div>

                        <div className="w-7.5 h-7.5 rounded-xl bg-slate-800 border border-white/20 overflow-hidden flex-shrink-0">
                          <CartoonAvatar id={agent.avatar_emoji} className="w-full h-full border-none shadow-none" />
                        </div>

                        <div className="flex flex-col text-left">
                          <span className="font-black text-[10.5px] text-white tracking-wide truncate max-w-[100px]">
                            {agent.username}
                          </span>
                          <span className="text-[7.5px] text-spy-lime font-bold">
                            {agent.title} • Niv.{agent.level}
                          </span>
                        </div>
                      </div>

                      {/* Right: Win Rate % + Victoires / Défaites */}
                      <div className="flex flex-col items-end">
                        <span className="text-[10.5px] font-black text-spy-lime tracking-tight">
                          {agent.winRate}% Réussite
                        </span>
                        <span className="text-[7.5px] text-white/70 font-bold">
                          {agent.wins} Victoires • {agent.losses} Défaites
                        </span>
                        <div className="flex items-center gap-1">
                          <img src="/croquette_coin_3d.png" alt="coin" className="w-2.5 h-2.5 object-contain" />
                          <span className="text-[7px] text-white/40 font-black">{agent.coins} Croquettes</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ALWAYS VISIBLE PINNED BUTTON AT BOTTOM OF CARD */}
              <div className="pt-1.5 flex-shrink-0">
                {hasMore ? (
                  <button
                    onClick={handleLoadMore}
                    className="w-full py-1.5 bg-gradient-to-r from-spy-lime/25 via-spy-lime/35 to-spy-lime/25 hover:from-spy-lime/35 hover:to-spy-lime/35 border-2 border-spy-lime rounded-2xl text-spy-lime font-black uppercase text-[9px] tracking-widest transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-[0_4px_15px_rgba(204,255,0,0.3)]"
                  >
                    <span>VOIR PLUS DE JOUEURS (+10)</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="w-full py-1 bg-white/5 border border-white/10 rounded-2xl text-white/40 font-black uppercase text-[8px] tracking-widest text-center">
                    FIN DU CLASSEMENT
                  </div>
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
