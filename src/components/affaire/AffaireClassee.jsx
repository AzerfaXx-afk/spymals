import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { affaires } from '../../data/affaireData';
import AffaireHome from './AffaireHome';
import AffaireGame from './AffaireGame';
import AffaireResult from './AffaireResult';

/* Pick a random case, optionally excluding one id */
const pickRandom = (excludeId = null) => {
    const pool = excludeId ? affaires.filter(a => a.id !== excludeId) : affaires;
    return pool[Math.floor(Math.random() * pool.length)];
};

/* Slide transition */
const slideVariants = {
    enter: (dir) => ({ x: dir * 60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: -dir * 60, opacity: 0 }),
};

const AffaireClassee = ({ onBackToHub }) => {
    const [screen, setScreen] = useState('home');   // 'home' | 'game' | 'result'
    const [currentAffaire, setCurrentAffaire] = useState(null);
    const [solved, setSolved] = useState(false);
    const [dir, setDir] = useState(1);              // slide direction

    const go = useCallback((next, direction = 1) => {
        setDir(direction);
        setScreen(next);
    }, []);

    const handleStart = () => {
        setCurrentAffaire(pickRandom());
        go('game', 1);
    };

    const handleSolved = () => {
        setSolved(true);
        go('result', 1);
    };

    const handleGiveUp = () => {
        setSolved(false);
        go('result', 1);
    };

    const handleNext = () => {
        setCurrentAffaire(pickRandom(currentAffaire?.id));
        setSolved(false);
        go('game', 1);
    };

    const handleQuit = () => {
        go('home', -1);
    };

    return (
        <div style={{ width: '100%', minHeight: '100dvh', position: 'relative', overflow: 'hidden' }}>
            <AnimatePresence mode="wait" custom={dir}>
                {/* ── Home ── */}
                {screen === 'home' && (
                    <motion.div
                        key="home"
                        custom={dir}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.28, ease: 'easeInOut' }}
                        style={{ position: 'absolute', inset: 0 }}
                    >
                        <AffaireHome
                            onStart={handleStart}
                            onBackToHub={onBackToHub}
                        />
                    </motion.div>
                )}

                {/* ── Game ── */}
                {screen === 'game' && currentAffaire && (
                    <motion.div
                        key={`game-${currentAffaire.id}`}
                        custom={dir}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.28, ease: 'easeInOut' }}
                        style={{ position: 'absolute', inset: 0 }}
                    >
                        <AffaireGame
                            affaire={currentAffaire}
                            onSolved={handleSolved}
                            onGiveUp={handleGiveUp}
                            onBack={() => go('home', -1)}
                        />
                    </motion.div>
                )}

                {/* ── Result ── */}
                {screen === 'result' && currentAffaire && (
                    <motion.div
                        key={`result-${currentAffaire.id}-${solved}`}
                        custom={dir}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.28, ease: 'easeInOut' }}
                        style={{ position: 'absolute', inset: 0 }}
                    >
                        <AffaireResult
                            affaire={currentAffaire}
                            solved={solved}
                            onNext={handleNext}
                            onQuit={handleQuit}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AffaireClassee;
