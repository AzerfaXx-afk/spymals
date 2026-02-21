import React, { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────
   Game catalogue
───────────────────────────────────────── */
const games = [
    {
        id: 'spymals',
        icon: '🦊',
        title: 'SpyMals',
        sub: 'Bluff & Identités Secrètes',
        from: '#FF6B35',
        to: '#FFD93D',
        shadow: 'rgba(255,107,53,0.55)',
        available: true,
    },
    {
        id: 'affaire',
        icon: '🕵️',
        title: 'Affaire Classée',
        sub: 'Mystères et Enquêtes',
        from: '#7B0D1E',
        to: '#C62A3A',
        shadow: 'rgba(198,42,58,0.45)',
        available: true,
    },
    {
        id: 'macgyver',
        icon: '🪛',
        title: 'MacGyver',
        sub: 'Improvisation & Survie',
        from: '#0077B6',
        to: '#00B4D8',
        shadow: 'rgba(0,180,216,0.45)',
        available: false,
    },
    {
        id: 'coupable',
        icon: '⚖️',
        title: 'Coupable !',
        sub: 'Débats & Jugements',
        from: '#7209B7',
        to: '#F72585',
        shadow: 'rgba(247,37,133,0.45)',
        available: false,
    },
    {
        id: 'connexion',
        icon: '📡',
        title: 'Connexion',
        sub: 'Télépathie & Coopération',
        from: '#1B7B4A',
        to: '#38EF7D',
        shadow: 'rgba(56,239,125,0.45)',
        available: false,
    },
];

/* ─────────────────────────────────────────
   Floating confetti dot
───────────────────────────────────────── */
const Dot = ({ style, color }) => (
    <div
        className="absolute rounded-full pointer-events-none"
        style={{
            width: 10,
            height: 10,
            background: color,
            opacity: 0.35,
            animation: 'floatDot 6s ease-in-out infinite',
            ...style,
        }}
    />
);

/* ─────────────────────────────────────────
   Main component
───────────────────────────────────────── */
const PocketPartyHome = ({ onSelectGame }) => {
    const dots = useRef(
        Array.from({ length: 18 }, (_, i) => ({
            top: `${Math.random() * 90 + 5}%`,
            left: `${Math.random() * 90 + 5}%`,
            delay: `${(i * 0.4) % 6}s`,
            scale: 0.6 + Math.random() * 1.4,
            color: ['#FF6B35', '#FFD93D', '#F72585', '#00B4D8', '#38EF7D', '#A855F7'][i % 6],
        }))
    );

    return (
        <>
            {/* ── Keyframe injection ── */}
            <style>{`
        @keyframes floatDot {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-14px) rotate(60deg); }
          66%       { transform: translateY(6px) rotate(-40deg); }
        }
        @keyframes titlePop {
          0%   { transform: scale(0.7) rotate(-4deg); opacity: 0; }
          70%  { transform: scale(1.08) rotate(1deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes subtitleFade {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.06); }
        }
        .game-card {
          animation: cardSlideIn 0.5s ease both;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .game-card:active {
          transform: scale(0.95) !important;
        }
        .game-card.available:hover {
          transform: scale(1.025);
        }
      `}</style>

            <div
                className="relative min-h-[100dvh] flex flex-col items-center overflow-x-hidden overflow-y-auto"
                style={{
                    background: 'linear-gradient(170deg, #1a0533 0%, #0d1b3e 55%, #001f14 100%)',
                    fontFamily: "'Fredoka', 'Nunito', sans-serif",
                    paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
                }}
            >
                {/* ── Ambient background blobs ── */}
                <div style={{
                    position: 'absolute', top: '-10%', left: '-20%',
                    width: 420, height: 420, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(168,85,247,0.22) 0%, transparent 70%)',
                    filter: 'blur(50px)', pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-10%', right: '-20%',
                    width: 500, height: 500, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(56,239,125,0.14) 0%, transparent 70%)',
                    filter: 'blur(60px)', pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', top: '35%', right: '-10%',
                    width: 300, height: 300, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(247,37,133,0.12) 0%, transparent 70%)',
                    filter: 'blur(50px)', pointerEvents: 'none',
                }} />

                {/* ── Floating confetti dots ── */}
                {dots.current.map((d, i) => (
                    <Dot
                        key={i}
                        color={d.color}
                        style={{
                            top: d.top,
                            left: d.left,
                            animationDelay: d.delay,
                            transform: `scale(${d.scale})`,
                        }}
                    />
                ))}

                {/* ════════════════════════════════
            HEADER / TITLE ZONE
        ════════════════════════════════ */}
                <div
                    className="z-10 flex flex-col items-center text-center w-full px-5"
                    style={{ paddingTop: 'max(3rem, env(safe-area-inset-top, 1.5rem) + 1.5rem)' }}
                >
                    {/* Top pill */}
                    <div
                        style={{
                            marginBottom: 20,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '5px 16px',
                            borderRadius: 999,
                            background: 'rgba(255,255,255,0.09)',
                            border: '1.5px solid rgba(255,255,255,0.18)',
                            backdropFilter: 'blur(10px)',
                            color: 'rgba(255,255,255,0.65)',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            animation: 'badgePulse 3s ease-in-out infinite',
                        }}
                    >
                        <span>✨</span> Game Hub
                    </div>

                    {/* ── Main title block ── */}
                    <div
                        style={{
                            animation: 'titlePop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.1s both',
                            marginBottom: 8,
                        }}
                    >
                        {/* POCKET */}
                        <div
                            style={{
                                fontSize: 'clamp(52px, 14vw, 84px)',
                                fontWeight: 700,
                                lineHeight: 1,
                                color: '#FFFFFF',
                                /* layered cartoon shadow */
                                textShadow: `
                  4px 4px 0px #4a0e7a,
                  8px 8px 0px rgba(74,14,122,0.4),
                  0 0 40px rgba(168,85,247,0.6)
                `,
                                letterSpacing: '-0.01em',
                            }}
                        >
                            POCKET
                        </div>

                        {/* PARTY – coloured */}
                        <div
                            style={{
                                fontSize: 'clamp(58px, 16vw, 96px)',
                                fontWeight: 700,
                                lineHeight: 1,
                                letterSpacing: '-0.01em',
                                background: 'linear-gradient(90deg, #FF6B35 0%, #FFD93D 35%, #F72585 65%, #A855F7 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                textShadow: 'none',
                                filter: 'drop-shadow(0 6px 0px rgba(255,107,53,0.45)) drop-shadow(0 0 30px rgba(247,37,133,0.5))',
                            }}
                        >
                            PARTY 🎉
                        </div>
                    </div>

                    {/* Subtitle */}
                    <p
                        style={{
                            animation: 'subtitleFade 0.6s ease 0.5s both',
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: 'clamp(12px, 3.5vw, 15px)',
                            fontWeight: 600,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            marginBottom: 36,
                        }}
                    >
                        Choisis ton ambiance 👇
                    </p>
                </div>

                {/* ════════════════════════════════
            GAME CARDS
        ════════════════════════════════ */}
                <div
                    className="z-10 w-full flex flex-col gap-3.5"
                    style={{ maxWidth: 420, paddingLeft: 20, paddingRight: 20 }}
                >
                    {games.map((g, idx) => (
                        <button
                            key={g.id}
                            onClick={() => g.available && onSelectGame(g.id)}
                            className={`game-card ${g.available ? 'available' : ''}`}
                            style={{
                                animationDelay: `${0.15 + idx * 0.08}s`,
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                padding: '14px 18px',
                                borderRadius: 22,
                                textAlign: 'left',
                                cursor: g.available ? 'pointer' : 'default',
                                opacity: g.available ? 1 : 0.62,
                                /* frosted card */
                                background: 'rgba(255,255,255,0.055)',
                                border: '2px solid rgba(255,255,255,0.12)',
                                backdropFilter: 'blur(18px)',
                                WebkitBackdropFilter: 'blur(18px)',
                                boxShadow: g.available
                                    ? `0 8px 28px -6px ${g.shadow}, inset 0 1.5px 0 rgba(255,255,255,0.12)`
                                    : 'none',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Subtle gradient shine strip at top of card */}
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0,
                                height: 2,
                                background: `linear-gradient(90deg, ${g.from}, ${g.to})`,
                                borderRadius: '22px 22px 0 0',
                                opacity: g.available ? 0.9 : 0.4,
                            }} />

                            {/* Emoji icon bubble */}
                            <div
                                style={{
                                    flexShrink: 0,
                                    width: 62,
                                    height: 62,
                                    borderRadius: 18,
                                    background: `linear-gradient(135deg, ${g.from}, ${g.to})`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 30,
                                    boxShadow: `0 6px 20px -4px ${g.shadow}`,
                                    /* subtle inner highlight */
                                    border: '2px solid rgba(255,255,255,0.25)',
                                }}
                            >
                                {g.icon}
                            </div>

                            {/* Text */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                    <span style={{
                                        color: '#FFFFFF',
                                        fontSize: 'clamp(17px, 4.5vw, 21px)',
                                        fontWeight: 700,
                                        lineHeight: 1.1,
                                        fontFamily: "'Fredoka', sans-serif",
                                    }}>
                                        {g.title}
                                    </span>
                                    {!g.available && (
                                        <span style={{
                                            fontSize: 9,
                                            fontWeight: 800,
                                            letterSpacing: '0.12em',
                                            textTransform: 'uppercase',
                                            padding: '3px 8px',
                                            borderRadius: 999,
                                            background: 'rgba(255,255,255,0.1)',
                                            color: 'rgba(255,255,255,0.45)',
                                            border: '1px solid rgba(255,255,255,0.15)',
                                        }}>
                                            Bientôt
                                        </span>
                                    )}
                                </div>
                                <p style={{
                                    marginTop: 3,
                                    color: 'rgba(255,255,255,0.48)',
                                    fontSize: 'clamp(10px, 3vw, 12px)',
                                    fontWeight: 600,
                                    lineHeight: 1.3,
                                    fontFamily: "'Nunito', sans-serif",
                                }}>
                                    {g.sub}
                                </p>
                            </div>

                            {/* Arrow (available only) */}
                            {g.available && (
                                <div style={{
                                    flexShrink: 0,
                                    width: 34,
                                    height: 34,
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${g.from}88, ${g.to}55)`,
                                    border: '1.5px solid rgba(255,255,255,0.22)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                        stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Footer ── */}
                <p style={{
                    marginTop: 36,
                    color: 'rgba(255,255,255,0.2)',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    zIndex: 10,
                }}>
                    PocketParty © 2025
                </p>
            </div>
        </>
    );
};

export default PocketPartyHome;
