import React, { createContext, useState, useEffect, useRef, useContext } from 'react';

const AudioContext = createContext(null);

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};

export const AudioProvider = ({ children }) => {
    // State for volumes (default 50%)
    const [musicVolume, setMusicVolume] = useState(() => {
        const saved = localStorage.getItem('musicVolume');
        // Reduce base volume to 20% by default as requested
        return saved !== null ? parseFloat(saved) : 0.2;
    });

    const [sfxVolume, setSfxVolume] = useState(() => {
        const saved = localStorage.getItem('sfxVolume');
        return saved !== null ? parseFloat(saved) : 0.5;
    });

    const musicRef = useRef(null);

    // Initialize music
    useEffect(() => {
        // Create audio instance if it doesn't exist
        if (!musicRef.current) {
            musicRef.current = new Audio('/sons/music.mp3');
            musicRef.current.loop = true;
        }

        // Attempt to play (browser autoplay policies might block this initially)
        const playMusic = async () => {
            try {
                if (musicRef.current.paused) {
                    await musicRef.current.play();
                }
            } catch (err) {
                console.log("Audio autoplay blocked, waiting for interaction");
            }
        };

        // We try to play, but usually needs user interaction first
        playMusic();

        return () => {
            if (musicRef.current) {
                musicRef.current.pause();
                musicRef.current = null;
            }
        };
    }, []);

    // Update music volume when state changes
    useEffect(() => {
        if (musicRef.current) {
            musicRef.current.volume = musicVolume;
        }
        localStorage.setItem('musicVolume', musicVolume);
    }, [musicVolume]);

    // Save SFX volume preference
    useEffect(() => {
        localStorage.setItem('sfxVolume', sfxVolume);
    }, [sfxVolume]);

    // Global click listener to unlock audio context on first interaction
    useEffect(() => {
        const unlockAudio = () => {
            if (musicRef.current && musicRef.current.paused) {
                musicRef.current.play().catch(e => console.log("Still blocked", e));
            }
        };
        window.addEventListener('click', unlockAudio, { once: true });
        return () => window.removeEventListener('click', unlockAudio);
    }, []);


    const playSfx = (soundPath = '/sons/button.mp3', options = {}) => {
        const { pitch = 1.0, volumeMultiplier = 1.0 } = options;

        const sound = new Audio(soundPath);
        sound.volume = Math.max(0, Math.min(1, sfxVolume * volumeMultiplier));
        sound.playbackRate = pitch; // Changes pitch and speed

        // Setup for potentially overlapping sounds (clones) is handled by creating new Audio instance each time
        // ideally for high perf games we'd use Web Audio API, but for simple UI SFX this is fine.
        // However, `playbackRate` on HTML5 Audio element does change pitch.

        sound.play().catch(e => console.warn("SFX play failed", e));
    };

    const value = {
        musicVolume,
        setMusicVolume,
        sfxVolume,
        setSfxVolume,
        playSfx
    };

    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
};
