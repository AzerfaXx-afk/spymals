import React from 'react';
import { motion } from 'framer-motion';

/* ─── Tiny reusable role badge ─── */
const RoleCard = ({ icon, label, desc }) => (
    <div style={{
        flex: 1,
        minWidth: 0,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(220,38,38,0.25)',
        borderRadius: 14,
        padding: '12px 10px',
        textAlign: 'center',
    }}>
        <div style={{ fontSize: 26, marginBottom: 4 }}>{icon}</div>
        <div style={{
            color: '#e8d5a3',
            fontWeight: 800,
            fontSize: 13,
            fontFamily: "'Fredoka', sans-serif",
            letterSpacing: '0.05em',
        }}>{label}</div>
        <div style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: 10,
            fontFamily: "'Courier New', monospace",
            marginTop: 2,
            lineHeight: 1.3,
        }}>{desc}</div>
    </div>
);

/* ─── Main component ─── */
const AffaireHome = ({ onStart, onBackToHub }) => {
    return (
        <div
            style={{
                minHeight: '100dvh',
                background: 'linear-gradient(170deg, #0a0a0a 0%, #12070f 40%, #1a0a0a 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                fontFamily: "'Nunito', sans-serif",
                position: 'relative',
                overflow: 'hidden',
                paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
            }}
        >
            {/* ── Keyframes ── */}
            <style>{`
        @keyframes scanLine {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes flickerIn {
          0%,18%,22%,25%,53%,57%,100% { opacity: 1; }
          20%,24%,55%             { opacity: 0; }
        }
        @keyframes redPulse {
          0%, 100% { box-shadow: 0 0 0px rgba(220,38,38,0); }
          50%       { box-shadow: 0 0 18px rgba(220,38,38,0.45); }
        }
        .stamp-home {
          animation: flickerIn 0.6s ease 0.3s both;
        }
      `}</style>

            {/* ── Scan line effect ── */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
                zIndex: 0,
            }} />

            {/* ── Red ambient blob ── */}
            <div style={{
                position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)',
                width: 400, height: 400, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(185,28,28,0.18) 0%, transparent 70%)',
                filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0,
            }} />

            {/* ── Back button ── */}
            <button
                onClick={onBackToHub}
                style={{
                    position: 'absolute', top: 'max(1rem, env(safe-area-inset-top, 0px))', left: 16,
                    zIndex: 20, width: 44, height: 44, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'transform 0.15s',
                }}
                onPointerDown={e => e.currentTarget.style.transform = 'scale(0.88)'}
                onPointerUp={e => e.currentTarget.style.transform = 'scale(1)'}
                aria-label="Retour au Hub"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </button>

            {/* ════════════════════════════════
          HERO SECTION
      ════════════════════════════════ */}
            <div style={{
                zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center', width: '100%', maxWidth: 420, padding: '0 20px',
                paddingTop: 'max(5rem, calc(env(safe-area-inset-top, 0px) + 4rem))',
            }}>

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 14px', borderRadius: 999, marginBottom: 20,
                        background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)',
                        color: '#ef4444', fontSize: 11, fontWeight: 800, letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                    }}
                >
                    🔴 Dossier Confidentiel
                </motion.div>

                {/* ── Title ── */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.2 }}
                    style={{ marginBottom: 6 }}
                >
                    <div style={{
                        fontFamily: "'Fredoka', sans-serif",
                        fontSize: 'clamp(14px, 4vw, 18px)',
                        fontWeight: 700, letterSpacing: '0.35em',
                        textTransform: 'uppercase',
                        color: 'rgba(232,213,163,0.6)',
                        marginBottom: 4,
                    }}>
                        AFFAIRE
                    </div>
                    <div style={{
                        fontFamily: "'Fredoka', sans-serif",
                        fontSize: 'clamp(56px, 15vw, 80px)',
                        fontWeight: 700, lineHeight: 0.9,
                        color: '#FFFFFF',
                        textShadow: `3px 3px 0 #7b0d1e, 7px 7px 0 rgba(123,13,30,0.35), 0 0 40px rgba(220,38,38,0.5)`,
                        letterSpacing: '-0.01em',
                    }}>
                        CLASSÉE
                    </div>
                </motion.div>

                {/* ── Tape strip decoration ── */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    style={{
                        width: '80%', maxWidth: 260, height: 6, margin: '16px auto',
                        background: 'linear-gradient(90deg, #991b1b, #dc2626, #991b1b)',
                        borderRadius: 3, boxShadow: '0 0 14px rgba(220,38,38,0.5)',
                    }}
                />

                {/* ── Instruction ── */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                    style={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: 'clamp(12px, 3.5vw, 14px)',
                        color: 'rgba(255,255,255,0.5)',
                        lineHeight: 1.65,
                        marginBottom: 28,
                        maxWidth: 320,
                    }}
                >
                    Un <span style={{ color: '#e8d5a3', fontWeight: 700 }}>Maître du Jeu</span> lit l'énigme à voix haute. Les <span style={{ color: '#e8d5a3', fontWeight: 700 }}>enquêteurs</span> posent des questions. Le MDJ répond uniquement par <span style={{ color: '#4ade80' }}>OUI</span>, <span style={{ color: '#f87171' }}>NON</span>, ou <span style={{ color: '#facc15' }}>SANS RAPPORT</span>. Trouvez la vérité.
                </motion.p>

                {/* ── Role cards ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                    style={{ display: 'flex', gap: 10, width: '100%', marginBottom: 32 }}
                >
                    <RoleCard icon="🕵️" label="Maître du Jeu" desc="Voit la solution. Répond aux questions." />
                    <RoleCard icon="🔍" label="Enquêteurs" desc="Posent des questions Oui/Non." />
                </motion.div>

                {/* ── Start button ── */}
                <motion.button
                    onClick={onStart}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.75 }}
                    whileHover={{ scale: 1.03, filter: 'brightness(1.1)' }}
                    whileTap={{ scale: 0.95, y: 3 }}
                    style={{
                        width: '100%', padding: '18px 24px',
                        borderRadius: 18, border: 'none',
                        background: 'linear-gradient(135deg, #b91c1c, #dc2626, #b91c1c)',
                        boxShadow: '0 8px 0 #7f1d1d, 0 14px 28px rgba(185,28,28,0.4)',
                        color: '#fff',
                        fontFamily: "'Fredoka', sans-serif",
                        fontSize: 'clamp(18px, 5vw, 22px)',
                        fontWeight: 700, letterSpacing: '0.05em',
                        cursor: 'pointer', position: 'relative', overflow: 'hidden',
                    }}
                >
                    {/* Gloss */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)',
                        borderRadius: '18px 18px 0 0', pointerEvents: 'none',
                    }} />
                    🔦 Démarrer l'Enquête
                </motion.button>
            </div>
        </div>
    );
};

export default AffaireHome;
