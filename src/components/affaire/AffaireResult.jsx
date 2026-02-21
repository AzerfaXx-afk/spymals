import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

/* ─── Stamp component ─── */
const Stamp = ({ solved }) => (
    <motion.div
        initial={{ scale: 3, rotate: solved ? -30 : 30, opacity: 0 }}
        animate={{ scale: 1, rotate: solved ? -8 : 12, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20, delay: 0.2 }}
        style={{
            border: `5px solid ${solved ? '#16a34a' : '#dc2626'}`,
            borderRadius: 10,
            padding: '10px 24px',
            textAlign: 'center',
            boxShadow: `0 0 40px ${solved ? 'rgba(22,163,74,0.5)' : 'rgba(220,38,38,0.5)'}`,
            background: solved ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)',
            marginBottom: 24,
        }}
    >
        <div style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: 'clamp(32px, 9vw, 52px)',
            fontWeight: 700,
            color: solved ? '#4ade80' : '#f87171',
            letterSpacing: '0.12em',
            lineHeight: 1,
            textShadow: `0 0 20px ${solved ? '#16a34a' : '#dc2626'}`,
        }}>
            {solved ? 'RÉSOLUE' : 'NON RÉSOLUE'}
        </div>
        <div style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 10,
            color: solved ? 'rgba(74,222,128,0.6)' : 'rgba(248,113,113,0.6)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginTop: 2,
        }}>
            {solved ? '✓ Enquêteurs victorieux' : '✗ Le mystère demeure'}
        </div>
    </motion.div>
);

/* ─── Main component ─── */
const AffaireResult = ({ affaire, solved, onNext, onQuit }) => {
    /* Fire confetti if solved */
    useEffect(() => {
        if (solved) {
            const t = setTimeout(() => {
                confetti({
                    particleCount: 120,
                    spread: 80,
                    origin: { y: 0.4 },
                    colors: ['#16a34a', '#4ade80', '#fbbf24', '#FFFFFF'],
                });
            }, 400);
            return () => clearTimeout(t);
        }
    }, [solved]);

    return (
        <div
            style={{
                minHeight: '100dvh',
                background: solved
                    ? 'linear-gradient(170deg, #050e0a 0%, #0a1a0f 50%, #0a0a08 100%)'
                    : 'linear-gradient(170deg, #0a0404 0%, #150808 50%, #100505 100%)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center',
                fontFamily: "'Nunito', sans-serif",
                position: 'relative', overflow: 'hidden',
                paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
            }}
        >
            {/* Scanlines */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)',
                zIndex: 0,
            }} />

            {/* Glow blob */}
            <div style={{
                position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
                width: 400, height: 400, borderRadius: '50%',
                background: `radial-gradient(circle, ${solved ? 'rgba(22,163,74,0.14)' : 'rgba(185,28,28,0.18)'} 0%, transparent 70%)`,
                filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0,
            }} />

            {/* ═══ Content ═══ */}
            <div style={{
                zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center', width: '100%', maxWidth: 460, padding: '0 20px',
                paddingTop: 'max(4rem, calc(env(safe-area-inset-top, 0px) + 3rem))',
            }}>

                {/* Emoji result */}
                <motion.div
                    initial={{ scale: 0, rotate: -60 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
                    style={{ fontSize: 64, marginBottom: 12 }}
                >
                    {solved ? '🎉' : '💀'}
                </motion.div>

                {/* Stamp */}
                <Stamp solved={solved} />

                {/* Dossier number */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: 10, letterSpacing: '0.2em',
                        color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
                        marginBottom: 8,
                    }}
                >
                    Dossier #{String(affaire.id).padStart(3, '0')} — {affaire.category}
                </motion.div>

                {/* Case title */}
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    style={{
                        fontFamily: "'Fredoka', sans-serif",
                        fontSize: 'clamp(22px, 6vw, 28px)', fontWeight: 700,
                        color: '#FFFFFF', marginBottom: 20,
                    }}
                >
                    {affaire.title}
                </motion.h2>

                {/* Solution card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                    style={{
                        width: '100%', borderRadius: 18,
                        background: 'linear-gradient(145deg, #1a1208, #0f0b05)',
                        border: `1.5px solid ${solved ? 'rgba(74,222,128,0.25)' : 'rgba(232,213,163,0.18)'}`,
                        padding: '20px 22px', textAlign: 'left', marginBottom: 28,
                        boxShadow: solved ? '0 0 24px rgba(22,163,74,0.15)' : '0 8px 24px rgba(0,0,0,0.5)',
                    }}
                >
                    <div style={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: 9, letterSpacing: '0.2em',
                        color: solved ? '#4ade80' : '#fca5a5',
                        textTransform: 'uppercase', marginBottom: 10,
                    }}>
                        🔓 Solution complète
                    </div>
                    <p style={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: 'clamp(13px, 3.5vw, 15px)',
                        color: '#e8d5a3', lineHeight: 1.75, margin: 0,
                    }}>
                        {affaire.solution}
                    </p>
                </motion.div>

                {/* Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}
                >
                    {/* Next case */}
                    <button
                        onClick={onNext}
                        style={{
                            width: '100%', padding: '18px 24px', borderRadius: 18, border: 'none',
                            background: 'linear-gradient(135deg, #b91c1c, #dc2626, #b91c1c)',
                            boxShadow: '0 8px 0 #7f1d1d, 0 14px 28px rgba(185,28,28,0.35)',
                            color: '#fff',
                            fontFamily: "'Fredoka', sans-serif",
                            fontSize: 'clamp(17px, 5vw, 20px)', fontWeight: 700,
                            cursor: 'pointer', position: 'relative', overflow: 'hidden',
                            transition: 'transform 0.12s',
                        }}
                        onPointerDown={e => {
                            e.currentTarget.style.transform = 'scale(0.96) translateY(4px)';
                            e.currentTarget.style.boxShadow = '0 4px 0 #7f1d1d, 0 8px 16px rgba(185,28,28,0.3)';
                        }}
                        onPointerUp={e => {
                            e.currentTarget.style.transform = '';
                            e.currentTarget.style.boxShadow = '0 8px 0 #7f1d1d, 0 14px 28px rgba(185,28,28,0.35)';
                        }}
                    >
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
                            background: 'linear-gradient(to bottom, rgba(255,255,255,0.18), transparent)',
                            borderRadius: '18px 18px 0 0', pointerEvents: 'none',
                        }} />
                        📂 Prochaine Affaire
                    </button>

                    {/* Quit */}
                    <button
                        onClick={onQuit}
                        style={{
                            width: '100%', padding: '14px 24px', borderRadius: 18,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1.5px solid rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.45)',
                            fontFamily: "'Fredoka', sans-serif",
                            fontSize: 'clamp(14px, 4vw, 17px)', fontWeight: 700,
                            cursor: 'pointer', transition: 'transform 0.12s',
                        }}
                        onPointerDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
                        onPointerUp={e => e.currentTarget.style.transform = ''}
                    >
                        🚪 Quitter
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default AffaireResult;
