import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Difficulty stars ─── */
const Stars = ({ count }) => (
    <div style={{ display: 'flex', gap: 3 }}>
        {[1, 2, 3].map(n => (
            <span key={n} style={{
                fontSize: 14,
                opacity: n <= count ? 1 : 0.2,
                filter: n <= count ? 'drop-shadow(0 0 4px #fbbf24)' : 'none',
            }}>⭐</span>
        ))}
    </div>
);

/* ─── Main component ─── */
const AffaireGame = ({ affaire, onSolved, onGiveUp, onBack }) => {
    const [holding, setHolding] = useState(false);
    const [revealed, setRevealed] = useState(false);

    /* Hold mechanics — reveal only while holding */
    const handlePointerDown = useCallback((e) => {
        e.preventDefault();
        setHolding(true);
        setRevealed(true);
    }, []);

    const handlePointerUp = useCallback(() => {
        setHolding(false);
        setRevealed(false);
    }, []);

    return (
        <div
            style={{
                minHeight: '100dvh',
                background: 'linear-gradient(170deg, #080808 0%, #100510 50%, #150a0a 100%)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center',
                fontFamily: "'Nunito', sans-serif",
                position: 'relative', overflow: 'hidden',
                paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
            }}
        >
            <style>{`
        @keyframes scanlines {
          0%   { background-position: 0 0; }
          100% { background-position: 0 8px; }
        }
        @keyframes holdPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); }
          50%       { box-shadow: 0 0 0 8px rgba(220,38,38,0.2); }
        }
        .hold-btn { transition: transform 0.1s; }
        .hold-btn:active { transform: scale(0.97); }
      `}</style>

            {/* Scanlines overlay */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
                background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)',
            }} />

            {/* Red ambient */}
            <div style={{
                position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
                width: 500, height: 300, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(180,20,20,0.14) 0%, transparent 70%)',
                filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
            }} />

            {/* ── Header ── */}
            <div style={{
                zIndex: 10, width: '100%', maxWidth: 460,
                padding: 'max(1rem, env(safe-area-inset-top, 0px)) 20px 0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <button
                    onClick={onBack}
                    style={{
                        width: 42, height: 42, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                    }}
                    onPointerDown={e => e.currentTarget.style.transform = 'scale(0.88)'}
                    onPointerUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>

                {/* Case label */}
                <div style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                    color: 'rgba(220,38,38,0.7)',
                    padding: '4px 12px', borderRadius: 999,
                    border: '1px solid rgba(220,38,38,0.25)',
                    background: 'rgba(220,38,38,0.08)',
                }}>
                    DOSSIER #{String(affaire.id).padStart(3, '0')}
                </div>

                <Stars count={affaire.difficulty} />
            </div>

            {/* ════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════ */}
            <div style={{
                zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center',
                width: '100%', maxWidth: 460, padding: '0 20px', gap: 16, marginTop: 16, flex: 1,
            }}>

                {/* ── Case title ── */}
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                        fontFamily: "'Fredoka', sans-serif",
                        fontSize: 'clamp(26px, 7vw, 36px)',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        textAlign: 'center',
                        textShadow: '2px 2px 0 #7b0d1e',
                        width: '100%',
                    }}
                >
                    🗂 {affaire.title}
                </motion.h1>

                {/* ── Mystery file card ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    style={{
                        width: '100%',
                        borderRadius: 18,
                        background: 'linear-gradient(145deg, #1a1208 0%, #0f0b05 100%)',
                        border: '1.5px solid rgba(232,213,163,0.2)',
                        padding: '20px 22px',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(232,213,163,0.1)',
                    }}
                >
                    {/* Paper texture top strip */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                        background: 'linear-gradient(90deg, #991b1b, #dc2626, #991b1b)',
                    }} />

                    {/* TOP SECRET stamp */}
                    <div style={{
                        position: 'absolute', top: 14, right: 16,
                        border: '2px solid rgba(220,38,38,0.5)',
                        borderRadius: 4,
                        padding: '2px 8px',
                        color: 'rgba(220,38,38,0.55)',
                        fontFamily: "'Courier New', monospace",
                        fontSize: 8, fontWeight: 900,
                        letterSpacing: '0.25em', textTransform: 'uppercase',
                        transform: 'rotate(8deg)',
                    }}>
                        TOP SECRET
                    </div>

                    <div style={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: 10, letterSpacing: '0.15em',
                        color: 'rgba(232,213,163,0.5)',
                        textTransform: 'uppercase',
                        marginBottom: 10,
                    }}>
                        — Situation connue des enquêteurs —
                    </div>

                    <p style={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: 'clamp(14px, 3.8vw, 16px)',
                        color: '#e8d5a3',
                        lineHeight: 1.75,
                        margin: 0,
                    }}>
                        {affaire.mystery}
                    </p>
                </motion.div>

                {/* ── YES / NO / NO RAPPORT helper chips ── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{ display: 'flex', gap: 8, justifyContent: 'center' }}
                >
                    {[
                        { label: 'OUI', color: '#16a34a', bg: 'rgba(22,163,74,0.12)' },
                        { label: 'NON', color: '#dc2626', bg: 'rgba(220,38,38,0.12)' },
                        { label: 'SANS RAPPORT', color: '#ca8a04', bg: 'rgba(202,138,4,0.12)' },
                    ].map(c => (
                        <div key={c.label} style={{
                            padding: '4px 12px', borderRadius: 999,
                            border: `1px solid ${c.color}55`,
                            background: c.bg,
                            color: c.color,
                            fontFamily: "'Courier New', monospace",
                            fontSize: 10, fontWeight: 700,
                            letterSpacing: '0.1em',
                        }}>{c.label}</div>
                    ))}
                </motion.div>

                {/* ── Hold to reveal button ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{ width: '100%' }}
                >
                    <div
                        className="hold-btn"
                        onPointerDown={handlePointerDown}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        style={{
                            width: '100%',
                            borderRadius: 18,
                            border: `2px solid ${holding ? 'rgba(220,38,38,0.6)' : 'rgba(220,38,38,0.2)'}`,
                            background: holding
                                ? 'rgba(30,8,8,0.97)'
                                : 'rgba(20,5,5,0.6)',
                            backdropFilter: 'blur(10px)',
                            padding: '16px 20px',
                            cursor: 'pointer',
                            userSelect: 'none', WebkitUserSelect: 'none',
                            touchAction: 'none',
                            transition: 'border-color 0.2s, background 0.2s',
                            animation: holding ? 'none' : 'holdPulse 2.5s ease-in-out infinite',
                            boxShadow: holding ? '0 0 20px rgba(220,38,38,0.3)' : 'none',
                            minHeight: 100,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative', overflow: 'hidden',
                        }}
                    >
                        <AnimatePresence mode="wait">
                            {!revealed ? (
                                <motion.div
                                    key="placeholder"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    style={{ textAlign: 'center' }}
                                >
                                    <div style={{ fontSize: 28, marginBottom: 6 }}>🔒</div>
                                    <p style={{
                                        fontFamily: "'Fredoka', sans-serif",
                                        fontSize: 'clamp(14px, 4vw, 17px)',
                                        fontWeight: 700,
                                        color: 'rgba(220,38,38,0.75)',
                                        letterSpacing: '0.04em',
                                        margin: 0,
                                    }}>
                                        Maintenir pour révéler la solution
                                    </p>
                                    <p style={{
                                        fontFamily: "'Courier New', monospace",
                                        fontSize: 10,
                                        color: 'rgba(255,255,255,0.3)',
                                        marginTop: 4,
                                    }}>— MDJ uniquement —</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="solution"
                                    initial={{ opacity: 0, scale: 0.97 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    style={{ textAlign: 'left', width: '100%' }}
                                >
                                    <div style={{
                                        fontFamily: "'Courier New', monospace",
                                        fontSize: 9, letterSpacing: '0.2em',
                                        color: '#dc2626', textTransform: 'uppercase',
                                        marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
                                    }}>
                                        <span>🔓</span> SOLUTION SECRÈTE
                                    </div>
                                    <p style={{
                                        fontFamily: "'Courier New', monospace",
                                        fontSize: 'clamp(13px, 3.5vw, 15px)',
                                        color: '#fde68a',
                                        lineHeight: 1.7,
                                        margin: 0,
                                    }}>
                                        {affaire.solution}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* ── Action buttons ── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                    style={{ display: 'flex', gap: 12, width: '100%', marginTop: 4 }}
                >
                    {/* Give up */}
                    <button
                        onClick={onGiveUp}
                        style={{
                            flex: 1, padding: '14px 12px', borderRadius: 16,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1.5px solid rgba(255,255,255,0.12)',
                            color: 'rgba(255,255,255,0.55)',
                            fontFamily: "'Fredoka', sans-serif",
                            fontSize: 'clamp(13px, 3.8vw, 16px)', fontWeight: 700,
                            cursor: 'pointer', transition: 'transform 0.12s',
                        }}
                        onPointerDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                        onPointerUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        📁 Classer sans suite
                    </button>

                    {/* Solved */}
                    <button
                        onClick={onSolved}
                        style={{
                            flex: 1, padding: '14px 12px', borderRadius: 16,
                            background: 'linear-gradient(135deg, #15803d, #16a34a)',
                            border: '1.5px solid rgba(74,222,128,0.25)',
                            boxShadow: '0 6px 0 #14532d, 0 10px 20px rgba(21,128,61,0.35)',
                            color: '#fff',
                            fontFamily: "'Fredoka', sans-serif",
                            fontSize: 'clamp(13px, 3.8vw, 16px)', fontWeight: 700,
                            cursor: 'pointer', position: 'relative', overflow: 'hidden',
                            transition: 'transform 0.12s',
                        }}
                        onPointerDown={e => e.currentTarget.style.transform = 'scale(0.95) translateY(3px)'}
                        onPointerUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        ✅ Affaire Résolue
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default AffaireGame;
